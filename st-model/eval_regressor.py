import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.model_selection import train_test_split
import os

def main():
    print("[Eval] Evaluating Random Forest Regressor (Turbidity Forecasting)...")
    
    csv_path = "water_potability.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # Same preprocessing as in rf_model.py
    t_values = df['Turbidity'].values
    X = []
    y = []
    
    for i in range(len(t_values) - 1):
        # Features: [lat, lon, current_turbidity, ph]
        # We use the same static values as in rf_model.py for consistency
        X.append([34.0, -6.8, t_values[i], 7.0])
        y.append(t_values[i+1])
    
    X = np.array(X)
    y = np.array(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    rf = RandomForestRegressor(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)
    
    print(f"\n[Eval] Regressor Results:")
    print(f"R² Score:  {r2:.4f}")
    print(f"MSE:       {mse:.4f}")
    
    # Also test on training to see if it's overfit
    train_pred = rf.predict(X_train)
    train_r2 = r2_score(y_train, train_pred)
    print(f"Train R²:  {train_r2:.4f}")

if __name__ == "__main__":
    main()
