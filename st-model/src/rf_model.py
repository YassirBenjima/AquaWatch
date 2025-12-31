import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
import os

class RFModel:
    def __init__(self):
        print("[RFModel] Initializing Optimized Water Quality Models...")
        
        # 1. Regressor for Turbidity forecasting
        self.regressor = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler()),
            ('rf', RandomForestRegressor(random_state=42))
        ])
        
        # 2. Classifier for Potability assessment 
        # Using notebook's best parameters for GradientBoostingClassifier
        self.classifier = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler()),
            ('gbc', GradientBoostingClassifier(
                learning_rate=0.3, 
                max_depth=10, 
                n_estimators=250, 
                subsample=1.0,
                random_state=42
            ))
        ])
        
        self.is_trained = False
        self.features_list = ['ph', 'Hardness', 'Solids', 'Chloramines', 'Sulfate', 'Conductivity', 'Organic_carbon', 'Trihalomethanes', 'Turbidity']

    def _drop_outliers(self, df, threshold=2.0):
        """Removes outliers using IQR method as per reference notebook."""
        df_clean = df.copy()
        for col in self.features_list:
            Q1 = df_clean[col].quantile(0.25)
            Q3 = df_clean[col].quantile(0.75)
            IQR = Q3 - Q1
            lower = Q1 - threshold * IQR
            upper = Q3 + threshold * IQR
            df_clean = df_clean[(df_clean[col] >= lower) & (df_clean[col] <= upper)]
        return df_clean

    def _tune_models(self, X_class, y_class, X_reg, y_reg):
        """Perform light-weight hyperparameter tuning."""
        print("[RFModel] Tuning models with RandomizedSearchCV...")
        
        # Param distributions
        reg_params = {
            'rf__n_estimators': [100, 200],
            'rf__max_depth': [None, 10, 20]
        }
        
        # We skip classifier tuning here as we are already using the 'best' notebook parameters
        # but we tune the regressor
        search_reg = RandomizedSearchCV(self.regressor, reg_params, n_iter=5, cv=3, random_state=42, n_jobs=-1)
        search_reg.fit(X_reg, y_reg)
        self.regressor = search_reg.best_estimator_
        
        print("[RFModel] Hyperparameter tuning complete.")

    def train_and_predict(self, live_df):
        """
        Trains on both Live Data (from DB) AND Static Data (from CSV).
        """
        print("[RFModel] Preparing training data...")
        
        # --- 1. Load CSV data for BASE LEARNING ---
        csv_path = "water_potability.csv"
        if not os.path.exists(csv_path):
            print(f"[RFModel] Error: {csv_path} not found.")
            return None, None

        csv_df = pd.read_csv(csv_path)
        
        # --- 2. Preprocessing CSV data as per notebook ---
        # A. Class-based mean imputation
        for col in ['ph', 'Sulfate', 'Trihalomethanes']:
            csv_df[col] = csv_df[col].fillna(csv_df.groupby('Potability')[col].transform('mean'))
        
        # B. Outlier removal
        csv_df = self._drop_outliers(csv_df, threshold=2.0)
        print(f"[RFModel] Cleaned CSV training data: {len(csv_df)} samples remaining.")

        # --- 3. Prepare Classifier Data (Potability) ---
        X_class = csv_df[self.features_list]
        y_class = csv_df['Potability']

        # --- 3. Prepare Regressor Data (Turbidity Forecasting) ---
        # We use a sliding window on the CSV turbidity levels to teach the model "what comes next"
        t_values = csv_df['Turbidity'].values
        # To make it consistent with live data features, we'll use a simplified version for CSV regression
        # In professional time-series, we'd use lags. Here we align with existing project logic.
        X_reg = []
        y_reg = []
        for i in range(len(t_values) - 1):
             # Simplified features for CSV regressor: [generic_lat, generic_lon, current_turbidity, generic_ph]
             X_reg.append([34.0, -6.8, t_values[i], 7.0])
             y_reg.append(t_values[i+1])
        
        X_reg = np.array(X_reg)
        y_reg = np.array(y_reg)

        # --- 4. Add Live Data to Regressor training ---
        if live_df is not None and not live_df.empty and len(live_df) > 5:
            live_df = live_df.sort_values('timestamp')
            # Extract features matching the predictor input: [lat, lon, turbidity, ph]
            # Ensure ph exists
            if 'ph' not in live_df.columns: live_df['ph'] = 7.0
            
            live_X = live_df[['latitude', 'longitude', 'turbidity', 'ph']].values[:-1]
            live_y = live_df['turbidity'].values[1:] # Target is next turbidity
            
            X_reg = np.concatenate((X_reg, live_X))
            y_reg = np.concatenate((y_reg, live_y))
            print(f"[RFModel] Added {len(live_X)} live samples to regressor.")

        # --- 5. Train / Tune ---
        # For simplicity in this cycle, we only auto-tune if not trained yet
        if not self.is_trained:
            self._tune_models(X_class, y_class, X_reg, y_reg)
        else:
            self.classifier.fit(X_class, y_class)
            self.regressor.fit(X_reg, y_reg)
        
        self.is_trained = True

        # --- 6. Prediction for current status ---
        if live_df is not None and not live_df.empty:
            last = live_df.iloc[-1]
            lat, lon = last['latitude'], last['longitude']
            turb, ph = last['turbidity'], (last['ph'] if 'ph' in last else 7.0)
            
            # Turbidity Forecast
            last_reg_input = np.array([[lat, lon, turb, ph]])
            turbidity_pred = self.regressor.predict(last_reg_input)[0]
            
            # Potability Assessment
            # Construction of feature vector for classifier. 
            # Since real sensors only give ph, turb, cond, we must impute the rest with means.
            # We use the pipeline imputer which was trained on CSV means!
            # Vector: [ph, Hardness, Solids, Chloramines, Sulfate, Conductivity, Organic_carbon, Trihalomethanes, Turbidity]
            # Map existing: ph->0, Conductivity->5, Turbidity->8
            feat_vec = [np.nan] * 9
            feat_vec[0] = ph
            feat_vec[5] = last.get('conductivity', np.nan)
            feat_vec[8] = turb
            
            potability_pred = self.classifier.predict([feat_vec])[0]
            
            return turbidity_pred, int(potability_pred)
        
        return None, None

