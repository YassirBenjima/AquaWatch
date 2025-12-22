import torch
from .model import STModel
import numpy as np

class Predictor:
    def __init__(self):
        self.model = STModel()
        self.model.eval()
        # In a real scenario, you would load weights here:
        # self.model.load_state_dict(torch.load("model_weights.pth"))
        print("[STModel] Model Initialized (Random Weights for Demo)")

    def predict_next_step(self, input_tensor):
        """
        Input: numpy array [Batch, Time, Channels, Height, Width]
        Output: Prediction for next time step
        """
        with torch.no_grad():
            tensor = torch.from_numpy(input_tensor)
            output = self.model(tensor)
            return output.numpy()

    def generate_alerts(self, prediction_grid, threshold=50):
        """
        Check if any predicted value exceeds threshold (e.g. turbidity > 50 NTU).
        """
        max_val = np.max(prediction_grid)
        if max_val > threshold:
            return True, max_val
        return False, max_val
