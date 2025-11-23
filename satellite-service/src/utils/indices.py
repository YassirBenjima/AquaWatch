import numpy as np


def ndwi(b3, b8):
    return (b3 - b8) / (b3 + b8 + 1e-6)


def chlorophyll(b5, b6):
    return (b5 / (b6 + 1e-6))


def turbidity(b4, b8a):
    return (b4 / (b8a + 1e-6))

