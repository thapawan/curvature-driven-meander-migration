# curvature-driven-meander-migration

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GEE](https://img.shields.io/badge/Google-Earth_Engine-blue)](https://earthengine.google.com/)

## Overview

This repository contains the complete code and data for the paper:

**"Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution"**  


The framework extracts river centerlines from Landsat time series (1984-2024) and models meander migration as a function of local curvature: **M = β·κ**.

## Key Results

| Metric | Value |
|--------|-------|
| Calibration RMSE (1984-1999) | 28.4 m [95% CI: 22.1-34.7 m] |
| Validation RMSE (2000-2024) | 32.5 m [95% CI: 26.4-38.6 m] |
| Improvement vs. geometric baseline | 45-46% |
| Peak migration rate | 22.5 m/yr at bend with κ = 0.021 m⁻¹ |

## Repository Structure
curvature-driven-meander-migration/
│
├── README.md
├── LICENSE
├── requirements.txt
├── .gitignore
│
├── gee_scripts/
│   ├── 01_water_mask_extraction.js
│   ├── 02_centerline_extraction.js
│   ├── 03_curvature_computation.js
│   ├── 04_migration_modeling.js
│   └── 05_validation_metrics.js
│
├── python_scripts/
│   ├── postprocess_centerlines.py
│   ├── curvature_analysis.py
│   ├── migration_rates.py
│   ├── uncertainty_quantification.py
│   └── figure_generation.py
│
├── data/
│   ├── study_area.geojson
│   ├── calibration_epochs.csv
│   └── validation_epochs.csv
│
├── outputs/
│   ├── figures/
│   ├── tables/
│   └── model_results/
│
├── docs/
│   ├── methodology.pdf
│   ├── parameter_sensitivity.pdf
│   └── validation_report.pdf
│
└── zenodo/
    ├── metadata.json
    └── CITATION.cff


## Quick Start

### 1. Google Earth Engine (GEE)

```javascript
// Copy and paste in GEE Code Editor
// Load the water mask extraction script
var script = require('users/thapawan/landsat-meander-migration:gee_scripts/01_water_mask_extraction.js');
script.run();

# Install dependencies
pip install -r requirements.txt

# Run migration rate calculation
python python_scripts/migration_rates.py

python python_scripts/figure_generation.py --output outputs/figures/

Dependencies
GEE Requirements
Google Earth Engine account (free: https://earthengine.google.com/)

Landsat Surface Reflectance Tier 1 access

# Python Requirements
text
numpy>=1.21.0
pandas>=1.3.0
geopandas>=0.10.0
shapely>=1.8.0
scipy>=1.7.0
scikit-learn>=1.0.0
matplotlib>=3.4.0
seaborn>=0.11.0
Parameters
Parameter	Value	Description
Node spacing	20 m	Centerline discretization
Smoothing filter	330 m (11 pixels)	Moving average for centerline
Curvature filter	200 m	Gaussian smoothing
Time step (Δt)	5 years	Migration iteration step
Erodibility (β)	0.18 yr⁻¹	Calibrated for Yazoo River
Citation
If you use this code in your research, please cite:

bibtex
@article{thapa2026landsat,
  title={Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution},
  author={Thapa, Pawan},
  journal={IEEE Geoscience and Remote Sensing Letters},
  year={2026},
  doi={10.1109/XXXXX}
}

@software{thapa2026code,
  author = {Thapa, Pawan},
  title = {landsat-meander-migration: Curvature-driven meander migration from Landsat time series},
  year = {2026},
  publisher = {Zenodo},
  version = {v1.0.0},
  doi = {10.5281/zenodo.XXXXX},
  url = {https://github.com/thapawan/landsat-meander-migration}
}
License
MIT License - see LICENSE file for details.

Contact
Pawan Thapa
Department of Geography & the Environment
University of Alabama
[Your Email]

Acknowledgments
This research was supported by [Your funding sources].

text

---
