FROM condaforge/mambaforge

WORKDIR /app
RUN mkdir -p outputs

# Install system dependencies if needed (e.g. for gdal if not pure conda)
# RUN apt-get update && apt-get install -y ...

COPY environment.yml .
RUN mamba env create -f environment.yml && mamba clean -afy

# Make sure the environment is activated:
SHELL ["mamba", "run", "-n", "satproc", "/bin/bash", "-c"]

COPY . .

# Run the pipeline (can be overridden)
CMD ["mamba", "run", "--no-capture-output", "-n", "satproc", "python", "src/sat_pipeline.py"]
