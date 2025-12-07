import time
import schedule
import subprocess
import os
from datetime import datetime

# Intervalle de vérification (en minutes)
# En prod, ça pourrait être toutes les 6h ou 24h selon la fréquence de passage Sentinel-2
CHECK_INTERVAL_MINUTES = 60 

def job():
    print(f"[{datetime.now()}] 🛰️  Démarrage du job satellite...")
    try:
        # Exécuter le pipeline comme un sous-processus
        # Cela évite que le scheduler crash si le pipeline échoue
        result = subprocess.run(["python", "src/sat_pipeline.py"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"[{datetime.now()}] ✅ Job terminé avec succès")
            print(result.stdout)
        else:
            print(f"[{datetime.now()}] ❌ Erreur dans le job")
            print(result.stderr)
            
    except Exception as e:
        print(f"[{datetime.now()}] 💥 Exception critique: {e}")

def main():
    print("===== AQUAWATCH SATELLITE SCHEDULER =====")
    print(f"Intervalle: {CHECK_INTERVAL_MINUTES} minutes")
    
    # Exécuter une fois au démarrage pour tester
    job()
    
    # Planifier
    schedule.every(CHECK_INTERVAL_MINUTES).minutes.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
