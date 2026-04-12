# Curvature-Driven Meander Migration from Landsat Time Series

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Earth Engine](https://img.shields.io/badge/Google-Earth_Engine-4285F4?logo=google-earth&logoColor=white)](https://earthengine.google.com/)
[![IEEE GRSL](https://img.shields.io/badge/IEEE-GRSL-00629B?logo=ieee&logoColor=white)](https://ieeexplore.ieee.org/xpl/RecentIssue.jsp?punumber=8859)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## 📋 Overview

This repository provides a complete, reproducible implementation of a **curvature-informed framework for quantifying river meander migration** from multi-decadal Landsat imagery. The framework bridges the gap between geometric change detection and process-based meander theory by modeling lateral migration as a function of local channel curvature.

**Associated Paper:** *"Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution"* — Under Submission IEEE Geoscience and Remote Sensing Letters (2026)

### Key Features

| Feature | Description |
|---------|-------------|
| 🛰️ **Satellite Data** | Landsat 5, 7, 8, 9 (1984-2024) |
| ☁️ **Cloud Processing** | Google Earth Engine (GEE) |
| 🌊 **Water Detection** | MNDWI + Otsu adaptive thresholding |
| 📐 **Centerline Extraction** | Medial Axis Transform (MAT) |
| 📈 **Migration Model** | Curvature-driven: M = β·κ |
| ✅ **Validation** | Yazoo River, Mississippi (40-year record) |
| 🔄 **Reproducibility** | Complete code + data + documentation |

### Key Results

| Metric | Value | 95% Confidence Interval |
|--------|-------|-------------------------|
| Calibration RMSE (1984-1999) | 28.4 m | [22.1, 34.7] |
| Validation RMSE (2000-2024) | 32.5 m | [26.4, 38.6] |
| Improvement vs. geometric baseline | 45-46% | — |
| Peak migration rate | 22.5 m/yr | [17.8, 27.2] |
| Optimal erodibility (β) | 0.18 yr⁻¹ | [0.15, 0.21] |

---

## 📁 Repository Structure

```
curvature-driven-meander-migration/
│
├── 📄 README.md                    # This file
├── 📄 LICENSE                      # MIT License
├── 📄 requirements.txt             # Python dependencies
├── 📄 .gitignore                   # Git ignore rules
│
├── 📁 gee_scripts/                 # Google Earth Engine (JavaScript)
│   ├── 01_water_mask_extraction.js    # MNDWI + Otsu thresholding
│   ├── 02_centerline_extraction.js    # Medial Axis Transform
│   ├── 03_curvature_computation.js    # Finite difference curvature
│   ├── 04_migration_modeling.js       # M = β·κ evolution
│   └── 05_validation_metrics.js       # RMSE, bootstrap, correlation
│
├── 📁 python_scripts/              # Post-processing & analysis (Python)
│   ├── migration_rates.py             # Annual rate calculation
│   ├── uncertainty_quantification.py  # Bootstrap CI, sensitivity
│   ├── curvature_analysis.py          # Curvature statistics
│   ├── figure_generation.py           # Publication-ready figures
│   └── postprocess_centerlines.py     # Data cleaning & formatting
│
├── 📁 data/                        # Input data
│   ├── study_area.geojson             # Yazoo River boundary
│   ├── calibration_epochs.csv         # 1984-1999 epochs
│   └── validation_epochs.csv          # 2000-2014, 2015-2024 epochs
│
├── 📁 outputs/                     # Generated outputs
│   ├── figures/                       # All paper figures
│   ├── tables/                        # Summary tables
│   └── model_results/                 # CSV exports of migration rates
│
├── 📁 docs/                        # Documentation
│   ├── methodology.pdf                # Detailed methods
│   ├── parameter_sensitivity.pdf      # Sensitivity analysis results
│   └── validation_report.pdf          # Complete validation report
│
└── 📁 zenodo/                      # Archiving metadata
    ├── metadata.json                   # Zenodo upload metadata
    └── CITATION.cff                    # Citation file
```

---

## 🚀 Quick Start

### Prerequisites

1. **Google Earth Engine Account** (free)
   - Sign up at [earthengine.google.com](https://earthengine.google.com/)
   - Accept Terms of Service

2. **Python 3.9+** with pip

### Step 1: Clone Repository

```bash
git clone https://github.com/thapawan/curvature-driven-meander-migration.git
cd curvature-driven-meander-migration
```

### Step 2: Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Run in Google Earth Engine

1. Open [GEE Code Editor](https://code.earthengine.google.com/)
2. Copy contents of `gee_scripts/01_water_mask_extraction.js`
3. Paste into new script and run
4. Repeat for subsequent scripts (02-05)

### Step 4: Post-Process Results

```bash
# Calculate migration rates
python python_scripts/migration_rates.py

# Generate uncertainty quantification
python python_scripts/uncertainty_quantification.py

# Create paper figures
python python_scripts/figure_generation.py --output outputs/figures/
```

---

## 📊 Model Description

### Core Equation

The migration rate at a point on the centerline is modeled as:

$$M(s) = \beta \cdot \kappa(s)$$

where:
- $M(s)$ = lateral migration rate (m/yr) in local normal direction
- $\beta$ = erodibility coefficient (yr⁻¹) — calibrated from observations
- $\kappa(s)$ = local channel curvature (m⁻¹)

### Workflow Overview

```
Landsat Imagery (1984-2024)
       ↓
MNDWI + Otsu Thresholding
       ↓
Binary Water Masks (per epoch)
       ↓
Medial Axis Transform (MAT)
       ↓
Centerline Extraction (20 m spacing)
       ↓
Curvature Computation (κ)
       ↓
Migration Model: M = β·κ
       ↓
Iterative Evolution (Δt = 5 yr)
       ↓
Validation (RMSE, correlation)
```

---

## ⚙️ Parameters

| Parameter | Value | Description | Justification |
|-----------|-------|-------------|---------------|
| **Node spacing** | 20 m | Centerline discretization | 1/4 channel width (Yazoo: 80-120 m) |
| **Smoothing filter** | 330 m (11 pixels) | Moving average for centerline | Removes pixel-scale noise |
| **Curvature filter** | 200 m | Gaussian smoothing | Matches bend wavelength scale |
| **Time step (Δt)** | 5 years | Migration iteration step | Stability + Landsat sampling |
| **Erodibility (β)** | 0.18 yr⁻¹ | Curvature-migration scaling | Calibrated for Yazoo River |
| **Spatial lag (δ)** | 0 m (assumed) | Upstream curvature influence | To be refined in future work |

---

## 📈 Validation Results

### Model Performance by Epoch

| Epoch | Type | RMSE (m) | 95% CI (m) | Improvement |
|-------|------|----------|------------|-------------|
| 1984-1999 | Calibration | 28.4 | [22.1, 34.7] | 46% |
| 2000-2014 | Validation | 31.2 | [25.3, 37.1] | 44% |
| 2015-2024 | Validation | 33.8 | [27.6, 40.0] | 45% |
| **Pooled** | **Overall** | **32.5** | **[26.4, 38.6]** | **45%** |

*Improvement = comparison to geometric baseline (uniform migration assumption)*

### Spatial Correlation

| Curvature Class | |κ| (m⁻¹) | n | Correlation (r) | p-value |
|----------------|---------|---|----------------|---------|
| High curvature | >0.015 | 12 | 0.87 | <0.001 |
| Moderate curvature | 0.005-0.015 | 18 | 0.72 | <0.01 |
| Low curvature | <0.005 | 24 | — | n.s. |

---

## 🛠️ Dependencies

### Google Earth Engine
- Requires authenticated GEE account
- Landsat Surface Reflectance Tier 1 access (included with account)

### Python Environment

Create a virtual environment (recommended):

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

**requirements.txt:**
```
numpy>=1.21.0
pandas>=1.3.0
geopandas>=0.10.0
shapely>=1.8.0
scipy>=1.7.0
scikit-learn>=1.0.0
matplotlib>=3.4.0
seaborn>=0.11.0
tqdm>=4.62.0
pyproj>=3.2.0
```

---

## 📝 Citation

If you use this code, data, or methodology in your research, please cite:

### Paper Citation

```bibtex
@article{thapa2026landsat,
  title     = {Landsat-Based Meander Migration Mapping Using Curvature-Driven Centerline Evolution},
  author    = {Thapa, Pawan},
  journal   = {IEEE Geoscience and Remote Sensing Letters},
  volume    = {23},
  pages     = {1-5},
  year      = {2026},
  doi       = {10.1109/GRSL.2026.XXXXX},
  keywords  = {Landsat, meander migration, curvature, centerline extraction, Google Earth Engine}
}
```

### Code Citation

```bibtex
@software{thapa2026code,
  author       = {Thapa, Pawan},
  title        = {curvature-driven-meander-migration: Landsat-based meander migration mapping},
  year         = {2026},
  publisher    = {Zenodo},
  version      = {v1.0.0},
  doi          = {10.5281/zenodo.XXXXX},
  url          = {https://github.com/thapawan/curvature-driven-meander-migration},
  license      = {MIT}
}
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use, copy, modify, and distribute this software
- ✅ Use it for commercial purposes
- ✅ Include it in proprietary software

Under the condition that you include the original copyright notice and disclaimer.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss.

---

## 📧 Contact

**Pawan Thapa**  
Department of Geography & the Environment  
University of Alabama  

📩 **Email:** [Your University Email]  
🌐 **GitHub:** [github.com/thapawan](https://github.com/thapawan)  
🦋 **ORCID:** [0000-0000-0000-0000](https://orcid.org/0000-0000-0000-0000)

---

## 🙏 Acknowledgments

- Google Earth Engine team for providing free access to Landsat archive
- IEEE GRSL reviewers for constructive feedback
- [Add any funding sources here]

---

## 📚 Related Work

| Paper | Focus | Link |
|-------|-------|------|
| Liu et al. (2023) | CARSM model for meandering rivers | [Remote Sensing](https://www.mdpi.com/2072-4292/15/14/3636) |
| Donovan et al. (2021) | Curvature-migration relationship | [JGR Earth Surface](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2020JF006058) |
| Li & Limaye (2024) | Morphodynamic feedback timescales | [JGR Earth Surface](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2023JF007413) |
| Nagel et al. (2023) | Satellite remote sensing review | [Earth-Science Reviews](https://www.sciencedirect.com/science/article/pii/S0012825223002735) |

---

## ⚠️ Limitations & Caveats

1. **Spatial Resolution:** Landsat 30-m pixels limit detection to migrations >15 m per epoch
2. **Spatial Lag (δ=0):** Current model assumes no lag between curvature and erosion (error ±28% upstream of bends)
3. **Uniform Erodibility:** β assumed constant along reach (error at cutoffs: 41%, confluences: 34%)
4. **Constant Discharge:** Does not incorporate interannual flow variability

See the [validation report](docs/validation_report.pdf) for detailed error analysis.

---

## 🔄 Updates & Versioning

| Version | Date | Changes |
|---------|------|---------|
| v1.0.0 | 2026-04-11 | Initial release for IEEE GRSL submission |
| v1.x.x | TBD | Future updates (spatial lag implementation, Sentinel-2 support) |

---

## ⭐ Star the Repository

If you find this work useful, please consider starring the repository on GitHub to help others discover it.

---

**Built with ☁️ Google Earth Engine and 🐍 Python**
