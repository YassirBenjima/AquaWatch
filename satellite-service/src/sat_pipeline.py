"""
Satellite data processing pipeline for AquaWatch.
"""
import os
import sys

# Fix for pyproj PROJ database path issue on Windows
# This must be done BEFORE any imports that use pyproj (like geopandas, rasterio)
if sys.platform == 'win32':
    import pathlib
    # Try to find PROJ data in conda environment
    env_path = pathlib.Path(sys.prefix)
    proj_paths = [
        env_path / 'Library' / 'share' / 'proj',
        env_path / 'share' / 'proj',
    ]
    for proj_path in proj_paths:
        if proj_path.exists():
            proj_lib = str(proj_path)
            # Set environment variable
            os.environ['PROJ_LIB'] = proj_lib
            # Also set PROJ_DATA (some versions use this)
            os.environ['PROJ_DATA'] = proj_lib
            break

# Import pyproj early and configure it before other libraries import it
try:
    import pyproj
    # Set data directory if not already set
    if sys.platform == 'win32' and 'PROJ_LIB' in os.environ:
        try:
            pyproj.datadir.set_data_dir(os.environ['PROJ_LIB'])
        except (AttributeError, Exception):
            # Fallback: try to set via _datadir if available
            pass
except ImportError:
    pass

import rasterio
from utils.indices import ndwi, chlorophyll, turbidity
from utils.clipper import clip_band
from utils.minio_client import upload_to_minio
import numpy as np

ZONE = "data/zones/zone1.geojson"
DATA = "data/samples/"
OUT = "outputs/"


def load_band(name):
    return DATA + name


def save_raster(output_path, array, ref_path):
    with rasterio.open(ref_path) as src:
        profile = src.profile

    profile.update(dtype=rasterio.float32, count=1)

    with rasterio.open(output_path, "w", **profile) as dst:
        dst.write(array.astype(np.float32), 1)


def main():
    print("===== AQUAWATCH SATELLITE PROCESSOR =====")

    # Check if zone file exists
    if not os.path.exists(ZONE):
        print(f"[WARNING] Fichier de zone {ZONE} introuvable!")
        print("[INFO] Le pipeline va traiter les images complètes (sans découpage)")
        print("[INFO] Pour utiliser une zone, créez un fichier GeoJSON dans data/zones/")
        zone_path = None
    else:
        zone_path = ZONE
        print(f"[INFO] Utilisation de la zone: {ZONE}")

    import json
    from datetime import datetime
    
    # 0️⃣ LOAD SCL (Scene Classification Layer)
    try:
        if zone_path:
            scl = clip_band(load_band("SCL.tif"), zone_path)
        else:
            # Need rioxarray as fallback for direct load + mask if not clipped
            import rioxarray as rxr
            scl = rxr.open_rasterio(load_band("SCL.tif"), masked=True)
            
        # Create mask: SCL classes 8 (Cloud medium), 9 (Cloud high), 10 (Thin cirrus), 3 (Cloud shadows)
        # Note: Depending on SCL processing, values might be different. 
        # Standard L2A: 3=Shadow, 8=Medium, 9=High, 10=Cirrus
        cloud_mask = np.isin(scl.values[0], [3, 8, 9, 10])
        print(f"[INFO] Masque nuageux généré: {np.sum(cloud_mask)} pixels masqués")
    except Exception as e:
        print(f"[WARNING] Impossible de charger SCL.tif pour le masquage nuageux: {e}")
        cloud_mask = None

    # Helper function to apply mask
    def apply_mask(data_array, mask):
        if mask is None:
            return data_array
        # Create valid data mask only where NOT cloud
        # Use NaN for float arrays
        masked_data = data_array.copy()
        masked_data[mask] = np.nan
        return masked_data

    # 1️⃣ CLIP (or load full bands if no zone)
    if zone_path:
        b3 = clip_band(load_band("B03.tif"), zone_path)
        b8 = clip_band(load_band("B08.tif"), zone_path)
        b5 = clip_band(load_band("B05.tif"), zone_path)
        b6 = clip_band(load_band("B06.tif"), zone_path)
        b4 = clip_band(load_band("B04.tif"), zone_path)
        b8a = clip_band(load_band("B8A.tif"), zone_path)
    else:
        # Load full bands without clipping
        import rioxarray as rxr
        print("[INFO] Chargement des bandes complètes...")
        b3 = rxr.open_rasterio(load_band("B03.tif"), masked=True)
        b8 = rxr.open_rasterio(load_band("B08.tif"), masked=True)
        b5 = rxr.open_rasterio(load_band("B05.tif"), masked=True)
        b6 = rxr.open_rasterio(load_band("B06.tif"), masked=True)
        b4 = rxr.open_rasterio(load_band("B04.tif"), masked=True)
        b8a = rxr.open_rasterio(load_band("B8A.tif"), masked=True)

    # 2️⃣ INDICES CALCULATION
    ndwi_raw = ndwi(b3.values[0], b8.values[0])
    chl_raw = chlorophyll(b5.values[0], b6.values[0])
    turb_raw = turbidity(b4.values[0], b8a.values[0])
    
    # 2.5 APPLY MASK
    ndwi_map = apply_mask(ndwi_raw, cloud_mask)
    chl_map = apply_mask(chl_raw, cloud_mask)
    turb_map = apply_mask(turb_raw, cloud_mask)

    # 3️⃣ SAUVEGARDE LOCALE
    save_raster(OUT + "ndwi.tif", ndwi_map, load_band("B03.tif"))
    save_raster(OUT + "chlorophyll.tif", chl_map, load_band("B05.tif"))
    save_raster(OUT + "turbidity.tif", turb_map, load_band("B04.tif"))
    
    # 3.5 METADATA GENERATION
    metadata = {
        "processed_at": datetime.utcnow().isoformat(),
        "zone": zone_path if zone_path else "full_scene",
        "cloud_mask_applied": cloud_mask is not None,
        "masked_pixels_count": int(np.sum(cloud_mask)) if cloud_mask is not None else 0,
        "files": ["ndwi.tif", "chlorophyll.tif", "turbidity.tif"]
    }
    with open(OUT + "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print("[LOCAL] OK fichiers generes avec metadonnees")

    # 4️⃣ UPLOAD MINIO
    upload_to_minio(OUT + "ndwi.tif", "ndwi.tif", "satellite-indices")
    upload_to_minio(OUT + "chlorophyll.tif", "chlorophyll.tif", "satellite-indices")
    upload_to_minio(OUT + "turbidity.tif", "turbidity.tif", "satellite-indices")
    upload_to_minio(OUT + "metadata.json", "metadata.json", "satellite-indices")

    print("[DONE] OK Pipeline termine")


if __name__ == "__main__":
    main()
