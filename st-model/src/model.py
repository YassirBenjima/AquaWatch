import torch
import torch.nn as nn

class ConvLSTMCell(nn.Module):
    def __init__(self, input_dim, hidden_dim, kernel_size, bias):
        super(ConvLSTMCell, self).__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.kernel_size = kernel_size
        self.padding = kernel_size[0] // 2, kernel_size[1] // 2
        self.bias = bias

        self.conv = nn.Conv2d(in_channels=self.input_dim + self.hidden_dim,
                              out_channels=4 * self.hidden_dim,
                              kernel_size=self.kernel_size,
                              padding=self.padding,
                              bias=self.bias)

    def forward(self, input_tensor, cur_state):
        h_cur, c_cur = cur_state
        combined = torch.cat([input_tensor, h_cur], dim=1)  # concatenate along channel axis
        combined_conv = self.conv(combined)
        cc_i, cc_f, cc_o, cc_g = torch.split(combined_conv, self.hidden_dim, dim=1)
        i = torch.sigmoid(cc_i)
        f = torch.sigmoid(cc_f)
        o = torch.sigmoid(cc_o)
        g = torch.tanh(cc_g)

        c_next = f * c_cur + i * g
        h_next = o * torch.tanh(c_next)
        return h_next, c_next

    def init_hidden(self, batch_size, image_size):
        height, width = image_size
        return (torch.zeros(batch_size, self.hidden_dim, height, width, device=self.conv.weight.device),
                torch.zeros(batch_size, self.hidden_dim, height, width, device=self.conv.weight.device))


class STModel(nn.Module):
    """
    Simplified ConvLSTM model for Spatio-Temporal Prediction.
    Takes a sequence of frames (time, channels, height, width) and predicts the next frame.
    """
    def __init__(self, input_dim=1, hidden_dim=16, kernel_size=(3, 3), num_layers=1):
        super(STModel, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.cell = ConvLSTMCell(input_dim, hidden_dim, kernel_size, True)
        self.final_conv = nn.Conv2d(hidden_dim, 1, kernel_size=(1, 1)) # Map back to 1 channel (e.g. turbidity)

    def forward(self, x):
        # x shape: [batch, time, channels, height, width]
        b, t, c, h, w = x.size()
        h_internal, c_internal = self.cell.init_hidden(b, (h, w))

        last_h = None
        for time_step in range(t):
            h_internal, c_internal = self.cell(x[:, time_step, :, :, :], (h_internal, c_internal))
            last_h = h_internal
        
        # Predict next state from last hidden state
        prediction = self.final_conv(last_h)
        return prediction
