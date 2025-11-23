import geopandas as gpd
from shapely.geometry import mapping
import rioxarray as rxr


def clip_band(band_path, zone_path):
    zone = gpd.read_file(zone_path)
    geom = [mapping(zone.geometry[0])]

    raster = rxr.open_rasterio(band_path, masked=True)
    clipped = raster.rio.clip(geom, zone.crs)

    return clipped

