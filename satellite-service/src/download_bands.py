"""
Script to download Sentinel-2 bands using Sentinel-Hub API.
"""
import os
import sys

# Fix for pyproj PROJ database path issue on Windows
# This must be done BEFORE any imports that use pyproj (like sentinelhub)
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

# Import pyproj early and configure it before sentinelhub imports it
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

from datetime import datetime, timedelta
from sentinelhub import (
    SHConfig,
    BBox,
    CRS,
    DataCollection,
    MimeType,
    MosaickingOrder,
    SentinelHubRequest,
    bbox_to_dimensions,
)
from dotenv import load_dotenv
import geopandas as gpd

load_dotenv()

# Configuration Sentinel-Hub
config = SHConfig()
config.sh_client_id = os.getenv("SENTINELHUB_CLIENT_ID", "")
config.sh_client_secret = os.getenv("SENTINELHUB_CLIENT_SECRET", "")

# Bands Sentinel-2 nécessaires
BANDS = {
    "B03": "B03",  # Green (560nm)
    "B08": "B08",  # NIR (842nm)
    "B05": "B05",  # Red Edge 1 (705nm)
    "B06": "B06",  # Red Edge 2 (740nm)
    "B04": "B04",  # Red (665nm)
    "B8A": "B8A",  # Red Edge 4 (865nm)
}

OUTPUT_DIR = "data/samples/"


def get_bbox_from_geojson(geojson_path):
    """Extract bounding box from GeoJSON file."""
    gdf = gpd.read_file(geojson_path)
    bounds = gdf.total_bounds
    return BBox(bbox=[bounds[0], bounds[1], bounds[2], bounds[3]], crs=CRS.WGS84)


def download_band(band_name, bbox, time_interval, output_path, resolution=10):
    """Download a single Sentinel-2 band."""
    print(f"[DOWNLOAD] Téléchargement de {band_name}...")

    evalscript = f"""
    //VERSION=3
    function setup() {{
        return {{
            input: [{{
                bands: ["{band_name}"],
                units: "DN"
            }}],
            output: {{
                id: "default",
                bands: 1,
                sampleType: SampleType.UINT16
            }}
        }};
    }}

    function evaluatePixel(sample) {{
        return [sample.{band_name}];
    }}
    """

    # Calculate dimensions and ensure they don't exceed Sentinel-Hub's limit (2500x2500)
    dimensions = bbox_to_dimensions(bbox, resolution=resolution)
    max_size = 2500
    
    # If dimensions exceed limit, adjust resolution to fit
    if dimensions[0] > max_size or dimensions[1] > max_size:
        scale_factor = max(dimensions[0] / max_size, dimensions[1] / max_size)
        adjusted_resolution = resolution * scale_factor
        dimensions = bbox_to_dimensions(bbox, resolution=adjusted_resolution)
        print(f"[INFO] Dimensions ajustées: {dimensions[0]}x{dimensions[1]} (résolution: {adjusted_resolution:.1f}m)")
    
    request = SentinelHubRequest(
        evalscript=evalscript,
        input_data=[
            SentinelHubRequest.input_data(
                data_collection=DataCollection.SENTINEL2_L2A,
                time_interval=time_interval,
                mosaicking_order=MosaickingOrder.MOST_RECENT,
            )
        ],
        responses=[SentinelHubRequest.output_response("default", MimeType.TIFF)],
        bbox=bbox,
        size=dimensions,
        config=config,
    )

    # Download and save
    data = request.get_data()[0]
    
    # Save as GeoTIFF using rasterio
    import rasterio
    from rasterio.transform import from_bounds
    
    transform = from_bounds(bbox.min_x, bbox.min_y, bbox.max_x, bbox.max_y, 
                          data.shape[1], data.shape[0])
    
    profile = {
        'driver': 'GTiff',
        'dtype': 'uint16',
        'nodata': 0,
        'width': data.shape[1],
        'height': data.shape[0],
        'count': 1,
        'crs': CRS.WGS84.pyproj_crs(),
        'transform': transform,
        'compress': 'lzw'
    }
    
    with rasterio.open(output_path, 'w', **profile) as dst:
        dst.write(data, 1)
    
    print(f"[DOWNLOAD] OK {band_name} sauvegarde dans {output_path}")


def download_all_bands(geojson_path=None, bbox=None, time_interval=None, resolution=10):
    """
    Download all required Sentinel-2 bands.
    
    Args:
        geojson_path: Path to GeoJSON file to extract bbox (optional if bbox provided)
        bbox: BBox object (optional if geojson_path provided)
        time_interval: Time interval tuple (start_date, end_date) or None for last 30 days
        resolution: Resolution in meters (default: 10m)
    """
    # Get bounding box
    if bbox is None:
        if geojson_path is None:
            # Default: Morocco (couvre lacs, barrages, mer)
            bbox = BBox(bbox=[-13.0, 21.0, -1.0, 36.0], crs=CRS.WGS84)
            print("[INFO] Utilisation d'une bbox par défaut (Maroc)")
        else:
            bbox = get_bbox_from_geojson(geojson_path)
            print(f"[INFO] Bbox extraite de {geojson_path}")
    
    # Set time interval (last 30 days if not provided)
    if time_interval is None:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        time_interval = (start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d"))
    
    print(f"[INFO] Période: {time_interval[0]} à {time_interval[1]}")
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Download each band
    for band_key, band_name in BANDS.items():
        output_path = os.path.join(OUTPUT_DIR, f"{band_key}.tif")
        
        # Skip if file already exists
        if os.path.exists(output_path):
            print(f"[SKIP] {band_key}.tif existe déjà")
            continue
        
        try:
            download_band(band_name, bbox, time_interval, output_path, resolution)
        except Exception as e:
            print(f"[ERROR] Erreur lors du téléchargement de {band_key}: {e}")
            continue
    
    print("\n[COMPLETE] Téléchargement terminé!")


if __name__ == "__main__":
    import sys
    
    # Example usage
    if len(sys.argv) > 1:
        geojson_path = sys.argv[1]
        download_all_bands(geojson_path=geojson_path)
    else:
        # Use default or zone from pipeline
        zone_path = "data/zones/zone1.geojson"
        if os.path.exists(zone_path):
            download_all_bands(geojson_path=zone_path)
        else:
            print("[INFO] Aucun fichier GeoJSON trouvé, utilisation d'une bbox par défaut")
            download_all_bands()

