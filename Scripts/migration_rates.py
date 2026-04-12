"""
Migration Rate Calculation and Visualization
IEEE GRSL Paper: Landsat-Based Meander Migration Mapping
"""

import numpy as np
import pandas as pd
import geopandas as gpd
from shapely.geometry import LineString, Point
from scipy.ndimage import gaussian_filter1d
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt

def compute_migration_rates(centerlines_dict, beta=0.18):
    """
    Compute annual migration rates from centerline time series
    
    Parameters:
    -----------
    centerlines_dict : dict
        {epoch_name: GeoDataFrame of centerline points}
    beta : float
        Erodibility coefficient (yr^-1)
    
    Returns:
    --------
    pd.DataFrame with migration rates and statistics
    """
    results = []
    
    epochs = list(centerlines_dict.keys())
    
    for i in range(len(epochs) - 1):
        epoch1 = epochs[i]
        epoch2 = epochs[i + 1]
        
        gdf1 = centerlines_dict[epoch1]
        gdf2 = centerlines_dict[epoch2]
        
        # Pair points by distance along channel
        merged = pd.merge(
            gdf1[['distance', 'geometry', 'curvature']],
            gdf2[['distance', 'geometry']],
            on='distance',
            suffixes=('_t1', '_t2')
        )
        
        # Compute displacement
        merged['dx'] = merged['geometry_t2'].x - merged['geometry_t1'].x
        merged['dy'] = merged['geometry_t2'].y - merged['geometry_t1'].y
        merged['displacement'] = np.sqrt(merged['dx']**2 + merged['dy']**2)
        
        # Time difference in years
        year1 = int(epoch1.split('-')[0])
        year2 = int(epoch2.split('-')[0])
        dt = year2 - year1
        
        merged['migration_rate'] = merged['displacement'] / dt
        
        # Model prediction: M = β·κ
        merged['predicted_rate'] = beta * np.abs(merged['curvature'])
        
        # RMSE
        rmse = np.sqrt(mean_squared_error(
            merged['migration_rate'], 
            merged['predicted_rate']
        ))
        
        # Confidence intervals (bootstrap)
        n_bootstrap = 1000
        bootstrap_rmse = []
        for _ in range(n_bootstrap):
            sample = merged.sample(n=len(merged), replace=True)
            bootstrap_rmse.append(np.sqrt(mean_squared_error(
                sample['migration_rate'], 
                sample['predicted_rate']
            )))
        
        ci_lower = np.percentile(bootstrap_rmse, 2.5)
        ci_upper = np.percentile(bootstrap_rmse, 97.5)
        
        results.append({
            'epoch': f"{epoch1}_to_{epoch2}",
            'dt_years': dt,
            'mean_migration_rate': merged['migration_rate'].mean(),
            'max_migration_rate': merged['migration_rate'].max(),
            'rmse': rmse,
            'ci_lower': ci_lower,
            'ci_upper': ci_upper,
            'correlation': merged['migration_rate'].corr(merged['predicted_rate'])
        })
        
        # Export to CSV
        merged.to_csv(f'outputs/migration_rates_{epoch1}_to_{epoch2}.csv', index=False)
    
    return pd.DataFrame(results)

def compare_to_baseline(centerlines_dict):
    """
    Compare curvature-informed model to geometric baseline
    Geometric baseline assumes uniform migration rate along reach
    """
    results = []
    
    epochs = list(centerlines_dict.keys())
    
    for i in range(len(epochs) - 1):
        epoch1 = epochs[i]
        epoch2 = epochs[i + 1]
        
        gdf1 = centerlines_dict[epoch1]
        gdf2 = centerlines_dict[epoch2]
        
        merged = pd.merge(
            gdf1[['distance', 'geometry']],
            gdf2[['distance', 'geometry']],
            on='distance'
        )
        
        merged['dx'] = merged['geometry_y'].x - merged['geometry_x'].x
        merged['dy'] = merged['geometry_y'].y - merged['geometry_x'].y
        merged['displacement'] = np.sqrt(merged['dx']**2 + merged['dy']**2)
        
        year1 = int(epoch1.split('-')[0])
        year2 = int(epoch2.split('-')[0])
        dt = year2 - year1
        
        merged['observed_rate'] = merged['displacement'] / dt
        
        # Geometric baseline: constant rate = mean observed rate
        mean_rate = merged['observed_rate'].mean()
        merged['baseline_rate'] = mean_rate
        
        baseline_rmse = np.sqrt(mean_squared_error(
            merged['observed_rate'], 
            merged['baseline_rate']
        ))
        
        results.append({
            'epoch': f"{epoch1}_to_{epoch2}",
            'baseline_rmse': baseline_rmse,
            'improvement_percent': (1 - baseline_rmse / results[i]['rmse']) * 100
            if i < len(results) else None
        })
    
    return pd.DataFrame(results)

if __name__ == "__main__":
    # Load centerlines from CSV files
    # centerlines = load_centerlines_from_csv('outputs/centerlines/')
    # results = compute_migration_rates(centerlines, beta=0.18)
    # print(results)
    # results.to_csv('outputs/model_results/migration_rates_summary.csv', index=False)
    pass
