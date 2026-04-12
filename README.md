# curvature-driven-meander-migration

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GEE](https://img.shields.io/badge/Google-Earth_Engine-blue)](https://earthengine.google.com/)

## Overview

This repository contains the complete code and data for the paper:

**"Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution"**  
* IEEE Geoscience and Remote Sensing Letters (2026)*

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

Python Requirements
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

### File: `zenodo/metadata.json`

```json
{
  "title": "landsat-meander-migration: Curvature-driven meander migration from Landsat time series",
  "description": "Complete code and data for 'Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution' (IEEE GRSL 2026). Extracts river centerlines from Landsat time series (1984-2024) and models meander migration as M = β·κ.",
  "creators": [
    {
      "name": "Thapa, Pawan",
      "affiliation": "University of Alabama, Department of Geography & the Environment",
      "orcid": "0000-0000-0000-0000"
    }
  ],
  "keywords": [
    "Landsat",
    "meander migration",
    "curvature",
    "centerline extraction",
    "Google Earth Engine",
    "remote sensing",
    "fluvial geomorphology",
    "Yazoo River"
  ],
  "license": "MIT",
  "upload_type": "software",
  "language": "eng",
  "version": "v1.0.0",
  "related_identifiers": [
    {
      "identifier": "10.1109/GRSL.2026.XXXXX",
      "relation": "isSupplementTo",
      "resource_type": "publication-article"
    }
  ],
  "communities": [
    {
      "identifier": "geoscience-remote-sensing"
    },
    {
      "identifier": "google-earth-engine"
    },
    {
      "identifier": "fluvial-geomorphology"
    }
  ],
  "grants": [
    {
      "id": "GRANT_NUMBER"
    }
  ]
}
File: zenodo/CITATION.cff
yaml
cff-version: 1.2.0
message: "If you use this software, please cite it using these metadata."
title: "landsat-meander-migration"
doi: 10.5281/zenodo.XXXXX
version: v1.0.0
date-released: 2026-04-11

authors:
  - family-names: "Thapa"
    given-names: "Pawan"
    affiliation: "University of Alabama, Department of Geography & the Environment"
    orcid: "https://orcid.org/0000-0000-0000-0000"

repository-code: "https://github.com/thapawan/landsat-meander-migration"
license: "MIT"

keywords:
  - Landsat
  - meander migration
  - curvature
  - centerline extraction
  - Google Earth Engine
  - remote sensing

abstract: "Complete code and data for curvature-driven meander migration mapping from Landsat time series (1984-2024). Implements M = β·κ model with validation on Yazoo River, Mississippi."

references:
  - type: article
    authors:
      - family-names: "Thapa"
        given-names: "Pawan"
    title: "Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution"
    journal: "IEEE Geoscience and Remote Sensing Letters"
    year: 2026
    doi: "10.1109/GRSL.2026.XXXXX"


GitHub Setup Commands
bash
# Initialize repository
mkdir landsat-meander-migration
cd landsat-meander-migration
git init

# Create directory structure
mkdir -p gee_scripts python_scripts data outputs/docs zenodo

# Add files (copy all code above into respective files)
# Add README, LICENSE, requirements.txt

# Initial commit
git add .
git commit -m "Initial commit: Complete code for IEEE GRSL paper"

# Create GitHub repository
gh repo create landsat-meander-migration --public --source=. --remote=origin --push

# Create version tag
git tag -a v1.0.0 -m "First release - corresponds to IEEE GRSL submission"
git push origin v1.0.0

# Zenodo will automatically archive the release if connected
Summary Checklist
Item	Status	Action
GitHub repository created	☐	landsat-meander-migration
All GEE scripts uploaded	☐	5 JavaScript files
Python scripts uploaded	☐	5 Python files
README.md with badge	☐	Add DOI badge after Zenodo
LICENSE (MIT)	☐	Create MIT license file
requirements.txt	☐	List dependencies
Zenodo upload	☐	Submit to 4 communities
Zenodo DOI	☐	Replace XXXXX in README
GitHub-Zenodo link	☐	Enable in Zenodo settings
Final Command to Create Everything
Run this in your terminal to create the complete repository structure:

bash
# Create repository structure
mkdir -p landsat-meander-migration/{gee_scripts,python_scripts,data,outputs/{figures,tables,model_results},docs,zenodo}
cd landsat-meander-migration

# Create README
cat > README.md << 'EOF'
# Landsat-Based Meander Migration Mapping

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXX)

## Overview
Complete code for "Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution" (IEEE GRSL 2026).

## Quick Start
See documentation in docs/ directory.
EOF

# Create LICENSE
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Pawan Thapa

Permission is hereby granted...
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
numpy>=1.21.0
pandas>=1.3.0
geopandas>=0.10.0
shapely>=1.8.0
scipy>=1.7.0
scikit-learn>=1.0.0
matplotlib>=3.4.0
seaborn>=0.11.0
EOF

