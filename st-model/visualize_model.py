import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from src.rf_model import RFModel
import os

def main():
    print("[Visualize] Starting model visualization script...")
    
    # 1. Initialize our optimized model class
    rf = RFModel()
    
    # 2. Load and preprocess data exactly as RFModel does
    csv_path = "water_potability.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # Class-based mean imputation for base features
    for col in ['ph', 'Sulfate', 'Trihalomethanes']:
        df[col] = df[col].fillna(df.groupby('Potability')[col].transform('mean'))
    
    # Outlier removal (using threshold 2.0 as per notebook)
    df = rf._drop_outliers(df, threshold=2.0)
    print(f"[Visualize] Dataset size after outlier removal: {len(df)}")
    
    # 3. Split data (Match notebook: 25% test, random_state 15)
    X = df[rf.features_list]
    y = df['Potability']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=15)
    
    # 4. Train the classifier
    print("[Visualize] Training optimized classifier...")
    rf.classifier.fit(X_train, y_train)
    
    # 5. Evaluate
    y_pred = rf.classifier.predict(X_test)
    print("\n[Visualize] Classification Report:")
    print(classification_report(y_test, y_pred))
    
    # 6. Generate Confusion Matrix Plot
    print("[Visualize] Generating Confusion Matrix plot...")
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Not Potable', 'Potable'], yticklabels=['Not Potable', 'Potable'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix - Optimized GB Classifier')
    plt.savefig('confusion_matrix.png')
    print("[Visualize] Saved confusion_matrix.png")
    
    # 7. Generate Feature Importance Plot
    print("[Visualize] Generating Feature Importance plot...")
    # Access the fitted GradientBoostingClassifier from the Pipeline
    gbc = rf.classifier.named_steps['gbc']
    importances = gbc.feature_importances_
    features = rf.features_list
    
    fi_df = pd.DataFrame({'Feature': features, 'Importance': importances}).sort_values(by='Importance', ascending=False)
    
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=fi_df, palette='viridis')
    plt.title('Feature Importances - Optimized GB Classifier')
    plt.tight_layout()
    plt.savefig('feature_importance.png')
    print("[Visualize] Saved feature_importance.png")

if __name__ == "__main__":
    main()
