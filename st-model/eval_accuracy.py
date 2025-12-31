import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from src.rf_model import RFModel
import os

def main():
    print("[Eval] Evaluating optimized Water Potability Classifier...")
    
    # 1. Initialize model
    rf = RFModel()
    
    # 2. Load data
    csv_path = "water_potability.csv"
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    
    # 3. Apply notebook-specific preprocessing for fair comparison
    # Imputation
    for col in ['ph', 'Sulfate', 'Trihalomethanes']:
        df[col] = df[col].fillna(df.groupby('Potability')[col].transform('mean'))
    
    # Outlier removal
    df = rf._drop_outliers(df, threshold=2.0)
    
    X = df[rf.features_list]
    y = df['Potability']
    
    # 4. Standard evaluation (Cross-validation)
    print("[Eval] Running 5-fold cross-validation...")
    scores = cross_val_score(rf.classifier, X, y, cv=5, scoring='accuracy')
    
    print(f"\n[Eval] Results:")
    print(f"Mean Accuracy: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")
    
    # 5. Fixed split evaluation (Match notebook)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=15)
    rf.classifier.fit(X_train, y_train)
    
    train_acc = rf.classifier.score(X_train, y_train)
    test_acc = rf.classifier.score(X_test, y_test)
    
    print(f"\n[Eval] Notebook Split Accuracy (0.25 test, rs=15):")
    print(f"Training set: {train_acc:.4f} (Notebook achieved 1.0)")
    print(f"Test set:     {test_acc:.4f} (Notebook achieved ~0.78)")

if __name__ == "__main__":
    main()
