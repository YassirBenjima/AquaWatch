import os
import pandas as pd
import numpy as np
from scipy.interpolate import griddata
from sqlalchemy import create_engine

class DataLoader:
    def __init__(self):
        self.engine = None
        self.connect()
        # Define Grid Bounds (Example: Morocco/Target Zone)
        # Should ideally match the zone in satellite-service, but fixed for now
        self.lat_min, self.lat_max = 33.0, 36.0 
        self.lon_min, self.lon_max = -8.0, -5.0
        self.grid_size = 64

    def connect(self):
        try:
            # Construct SQLAlchemy connection string
            # postgresql://user:password@host:port/dbname
            user = os.getenv("PG_USER", "postgres")
            password = os.getenv("PG_PASSWORD", "1234")
            host = os.getenv("PG_HOST", "localhost")
            port = os.getenv("PG_PORT", "5432")
            db = os.getenv("PG_DB", "aquawatch")
            
            db_url = f"postgresql://{user}:{password}@{host}:{port}/{db}"
            self.engine = create_engine(db_url)
            print("[STModel] Connected to Database via SQLAlchemy")
        except Exception as e:
            print(f"[STModel] DB Connection Error: {e}")

    def fetch_recent_data(self, hours=24):
        """Fetch last N hours of sensor data with CORRECT SCHEMA."""
        if self.engine is None:
            self.connect()
            if self.engine is None:
                return None
        
        # Schema matching mqtt-gateway: sensor_id, timestamp, turbidity, latitude, longitude
        query = f"""
            SELECT timestamp, latitude, longitude, turbidity, pH as ph
            FROM sensor_data 
            WHERE timestamp > NOW() - INTERVAL '{hours} hours'
            ORDER BY timestamp ASC;
        """
        try:
            # SQLAlchemy connection usage
            with self.engine.connect() as connection:
                df = pd.read_sql(query, connection)
            
            # Ensure types
            if not df.empty:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
            return df
        except Exception as e:
            print(f"[STModel] Error fetching data: {e}")
            return None

    def interpolate_to_grid(self, df_slice):
        """
        Convert scattered points (lat, lon, val) to a 64x64 grid using Cubic Interpolation.
        """
        if df_slice.empty:
            return np.zeros((self.grid_size, self.grid_size), dtype=np.float32)

        # Create target grid
        grid_x, grid_y = np.mgrid[
            self.lon_min:self.lon_max:complex(0, self.grid_size),
            self.lat_min:self.lat_max:complex(0, self.grid_size)
        ]

        points = df_slice[['longitude', 'latitude']].values
        values = df_slice['turbidity'].values

        if len(points) < 4:
             # Not enough points for cubic, fallback to mean or nearest
             # print("[STModel] Warning: Not enough points for cubic interpolation. Using mean.")
             mean_val = np.mean(values) if len(values) > 0 else 0
             return np.full((self.grid_size, self.grid_size), mean_val, dtype=np.float32)

        try:
            # INTERPOLATION (Cubic for smoothness)
            grid_z = griddata(points, values, (grid_x, grid_y), method='cubic', fill_value=0)
            
            # Fill NaNs (outside convex hull) with nearest or 0 to avoid holes
            # For simplicity, filling remaining NaNs with 0 (or could use nearest)
            grid_z = np.nan_to_num(grid_z, nan=0.0)
            
            return grid_z.astype(np.float32)
        except Exception as e:
            print(f"[STModel] Interpolation error: {e}")
            return np.zeros((self.grid_size, self.grid_size), dtype=np.float32)

    def prepare_tensor_sequence(self, df, time_steps=5):
        """
        Aggregates data into `time_steps` bins and creates a tensor.
        Output: [1, Time, 1, H, W]
        """
        if df is None or df.empty:
            return None

        # Sort by time
        df = df.sort_values('timestamp')
        
        # Creates bins
        # We want to divide the available range into `time_steps` chunks
        # This is a simplification. In real world, we'd resample strictly by hour.
        
        # For simplicity: just take the last N hours? or split dataset?
        # Let's simple split the dataframe into N chunks based on time
        
        grids = []
        
        # Determine time range
        min_time = df['timestamp'].min()
        max_time = df['timestamp'].max()
        if min_time == max_time:
            # Only one data point... replicate
            grid = self.interpolate_to_grid(df)
            grids = [grid] * time_steps
        else:
            time_delta = (max_time - min_time) / time_steps
            
            for i in range(time_steps):
                start = min_time + i * time_delta
                end = start + time_delta
                
                # Filter slice
                mask = (df['timestamp'] >= start) & (df['timestamp'] <= end)
                slice_df = df.loc[mask]
                
                grid = self.interpolate_to_grid(slice_df)
                grids.append(grid)

        # Stack into [Time, H, W]
        tensor_np = np.stack(grids, axis=0) # [5, 64, 64]
        
        # Add Channel and Batch dimensions -> [1, 5, 1, 64, 64]
        tensor_np = tensor_np[np.newaxis, :, np.newaxis, :, :] 
        
        return tensor_np


    def save_forecast(self, predicted_val, model_name="convlstm"):
        """Save the maximum predicted turbidity to the database."""
        if self.engine is None:
            self.connect()
            
        try:
            from sqlalchemy import text
            query = text("INSERT INTO forecasts (timestamp, predicted_turbidity, model_name) VALUES (NOW(), :val, :model)")
            with self.engine.begin() as connection:
                connection.execute(query, {"val": float(predicted_val), "model": model_name})
            print(f"[STModel] ✅ Saved forecast ({model_name}) to DB: {predicted_val:.2f}")
        except Exception as e:
            print(f"[STModel] Error saving forecast: {e}")

    def close(self):
        if self.engine:
            self.engine.dispose()
