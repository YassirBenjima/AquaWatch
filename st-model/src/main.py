import schedule
import time
from src.data_loader import DataLoader
from src.predict import Predictor
import os

def run_prediction_cycle():
    print("\n[STModel] Starting Prediction Cycle...")
    loader = DataLoader()
    predictor = Predictor()

    # 1. Fetch Data
    df = loader.fetch_recent_data(hours=24)
    
    if df is not None and not df.empty:
        print(f"[STModel] Fetched {len(df)} data points from DB.")
        
        # 2. Prepare Input (Real Data Interpolation)
        # [Batch=1, Time=5, Channels=1, Height=64, Width=64]
        try:
            input_data = loader.prepare_tensor_sequence(df, time_steps=5)
            
            if input_data is not None:
                # 3. Predict
                prediction = predictor.predict_next_step(input_data)
                print(f"[STModel] Prediction Shape: {prediction.shape}")
            
                # 4. Check Alerts
                alert, max_val = predictor.generate_alerts(prediction)
                if alert:
                    print(f"[STModel] [ALERT] High Turbidity Predicted! Max: {max_val:.2f}")
                else:
                    print(f"[STModel] Forecast Normal. Max: {max_val:.2f}")
            else:
                print("[STModel] Failed to prepare input tensor (insufficient data?).")

        except Exception as e:
            print(f"[STModel] Error during processing: {e}")
            import traceback
            traceback.print_exc()

    else:
        print("[STModel] No data found in DB. Waiting for sensors...")
    
    loader.close()
    print("[STModel] Cycle Complete.")

def main():
    print("===== AQUAWATCH ST-MODEL SERVICE =====")
    
    # Run once at startup
    run_prediction_cycle()

    # Schedule every hour
    schedule.every(1).hours.do(run_prediction_cycle)

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
