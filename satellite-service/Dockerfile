FROM continuumio/miniconda3

WORKDIR /app

# Install system dependencies if needed (e.g. for gdal if not pure conda)
# RUN apt-get update && apt-get install -y ...

COPY environment.yml .
RUN conda env create -f environment.yml && conda clean -afy

# Make sure the environment is activated:
SHELL ["conda", "run", "-n", "satproc", "/bin/bash", "-c"]

COPY . .

# Run the pipeline (can be overridden)
CMD ["conda", "run", "--no-capture-output", "-n", "satproc", "python", "src/sat_pipeline.py"]
