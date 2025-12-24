import numpy as np
from sklearn.ensemble import RandomForestRegressor
from src.data_loader import DataLoader
import pandas as pd

class RFModel:
    def __init__(self):
        print("[RFModel] Initializing Random Forest...")
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False

    def train_and_predict(self, df):
        """
        Trains on both Live Data (from DB) AND Static Data (from CSV).
        """
        print("[RFModel] Training on Live Data + CSV Dataset...")
        
        # --- 1. Prepare Live Data ---
        live_X = []
        live_y = []
        
        if df is not None and not df.empty and len(df) > 10:
            df = df.sort_values('timestamp')
            # Create targets (Next prediction)
            df['target'] = df['turbidity'].shift(-1)
            # Ensure pH is present (if missing or null, fill mean)
            if 'ph' not in df.columns:
                 df['ph'] = 7.0 # Default neutral
            
            df = df.dropna()
            
            # Features: [Lat, Lon, Turbidity, pH]
            # We add pH to learn correlation
            live_X = df[['latitude', 'longitude', 'turbidity', 'ph']].values
            live_y = df['target'].values

        # --- 2. Prepare CSV Data (The "Teaching" Part) ---
        csv_X = []
        csv_y = []
        try:
            csv_path = "water_potability.csv"
            
            import os
            if os.path.exists(csv_path):
                csv_df = pd.read_csv(csv_path)
                # Use 'Turbidity' AND 'ph'
                csv_df = csv_df.fillna(csv_df.mean())
                
                t_values = csv_df['Turbidity'].values
                p_values = csv_df['ph'].values  # Get pH too
                
                # Create sliding window
                X_static = []
                y_static = []
                for i in range(len(t_values) - 1):
                    # X: [Lat(generic), Lon(generic), Turbidity_t, pH_t]
                    # We assume the pH corresponds to that sample
                    X_static.append([34.0, -6.8, t_values[i], p_values[i]]) 
                    y_static.append(t_values[i+1])
                
                csv_X = np.array(X_static)
                csv_y = np.array(y_static)
                print(f"[RFModel] Loaded {len(csv_X)} samples (Turbidity+pH) from CSV.")
            else:
                print(f"[RFModel] Warning: {csv_path} not found.")
        except Exception as e:
            print(f"[RFModel] Error loading CSV: {e}")

        # --- 3. Combine & Train ---
        
        if len(live_X) == 0 and len(csv_X) == 0:
            return 0.0
            
        # Check shape compatibility (If live_X was old 3-feature, it will fail vs new 4-feature CSV)
        # We must align them.
        
        # Merge
        if len(live_X) > 0 and len(csv_X) > 0:
            final_X = np.concatenate((csv_X, live_X), axis=0)
            final_y = np.concatenate((csv_y, live_y), axis=0)
        elif len(csv_X) > 0:
            final_X = csv_X
            final_y = csv_y
        else:
            final_X = live_X
            final_y = live_y
            
        self.model.fit(final_X, final_y)
        self.is_trained = True
        
        # --- 4. Predict Next Step for Real Sensors ---
        if df is not None and not df.empty:
            last_row = df.iloc[-1]
            # Use pH from live data or default
            current_ph = last_row['ph'] if 'ph' in last_row else 7.0
            
            last_input = np.array([[last_row['latitude'], last_row['longitude'], last_row['turbidity'], current_ph]])
            prediction = self.model.predict(last_input)
            return prediction[0]
        else:
            return 0.0

