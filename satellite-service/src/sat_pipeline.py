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

    # 2️⃣ INDICES
    ndwi_map = ndwi(b3.values[0], b8.values[0])
    chl_map = chlorophyll(b5.values[0], b6.values[0])
    turb_map = turbidity(b4.values[0], b8a.values[0])

    # 3️⃣ SAUVEGARDE LOCALE
    save_raster(OUT + "ndwi.tif", ndwi_map, load_band("B03.tif"))
    save_raster(OUT + "chlorophyll.tif", chl_map, load_band("B05.tif"))
    save_raster(OUT + "turbidity.tif", turb_map, load_band("B04.tif"))

    print("[LOCAL] OK fichiers generes")

    # 4️⃣ UPLOAD MINIO
    upload_to_minio(OUT + "ndwi.tif", "ndwi.tif", "satellite-indices")
    upload_to_minio(OUT + "chlorophyll.tif", "chlorophyll.tif", "satellite-indices")
    upload_to_minio(OUT + "turbidity.tif", "turbidity.tif", "satellite-indices")

    print("[DONE] OK Pipeline termine")


if __name__ == "__main__":
    main()
