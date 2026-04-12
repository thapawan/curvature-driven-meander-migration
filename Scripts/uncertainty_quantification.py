"""
Uncertainty Quantification for Meander Migration Model
Implements bootstrap, sensitivity analysis, and detection limits
"""

import numpy as np
import pandas as pd
from scipy import stats

def bootstrap_uncertainty(observed, predicted, n_iterations=1000, alpha=0.05):
    """
    Bootstrap resampling for RMSE confidence intervals
    
    Parameters:
    -----------
    observed : array-like
        Observed migration rates
    predicted : array-like
        Model-predicted migration rates
    n_iterations : int
        Number of bootstrap samples
    alpha : float
        Significance level (default 0.05 for 95% CI)
    
    Returns:
    --------
    dict with mean, CI, standard error
    """
    n = len(observed)
    errors = observed - predicted
    rmse_values = []
    
    for _ in range(n_iterations):
        # Sample with replacement
        indices = np.random.choice(n, n, replace=True)
        sample_errors = errors[indices]
        rmse = np.sqrt(np.mean(sample_errors**2))
        rmse_values.append(rmse)
    
    mean_rmse = np.mean(rmse_values)
    ci_lower = np.percentile(rmse_values, 100 * alpha / 2)
    ci_upper = np.percentile(rmse_values, 100 * (1 - alpha / 2))
    std_error = np.std(rmse_values)
    
    return {
        'mean_rmse': mean_rmse,
        'ci_lower': ci_lower,
        'ci_upper': ci_upper,
        'std_error': std_error
    }

def sensitivity_analysis(centerlines, parameter_ranges):
    """
    Sensitivity analysis for model parameters
    
    Parameters:
    -----------
    centerlines : dict
        Centerline data for each epoch
    parameter_ranges : dict
        {parameter_name: [min, max, n_steps]}
    
    Returns:
    --------
    pd.DataFrame with sensitivity metrics
    """
    results = []
    
    # Test node spacing sensitivity
    spacings = np.linspace(10, 50, 5)  # meters
    
    for spacing in spacings:
        # Resample centerlines at this spacing
        # Compute RMSE
        # Store result
        results.append({
            'parameter': 'node_spacing',
            'value': spacing,
            'rmse': None  # Placeholder - compute from your data
        })
    
    # Test Gaussian filter sigma sensitivity
    sigmas = np.linspace(100, 300, 5)  # meters
    
    for sigma in sigmas:
        results.append({
            'parameter': 'gaussian_sigma',
            'value': sigma,
            'rmse': None  # Placeholder
        })
    
    # Test erodibility coefficient sensitivity
    betas = np.linspace(0.09, 0.27, 5)  # half to 1.5x calibrated value
    
    for beta in betas:
        results.append({
            'parameter': 'erodibility_beta',
            'value': beta,
            'rmse': None  # Placeholder
        })
    
    return pd.DataFrame(results)

def detection_limit(landsat_resolution=30, min_migration_pixels=0.5):
    """
    Calculate minimum detectable migration given Landsat resolution
    
    Parameters:
    -----------
    landsat_resolution : float
        Landsat pixel resolution in meters (30)
    min_migration_pixels : float
        Minimum migration in pixels to be detectable (0.5 = half-pixel)
    
    Returns:
    --------
    dict with detection limits
    """
    min_detectable_migration = landsat_resolution * min_migration_pixels
    
    # For a 15-year epoch
    min_annual_rate_15yr = min_detectable_migration / 15
    min_annual_rate_10yr = min_detectable_migration / 10
    min_annual_rate_5yr = min_detectable_migration / 5
    
    return {
        'min_detectable_migration_absolute': min_detectable_migration,
        'min_annual_rate_15yr_epoch': min_annual_rate_15yr,
        'min_annual_rate_10yr_epoch': min_annual_rate_10yr,
        'min_annual_rate_5yr_epoch': min_annual_rate_5yr,
        'note': 'Migration below this threshold cannot be reliably resolved'
    }

def spatial_lag_analysis(centerlines, migration_rates, lag_range=(0, 500, 10)):
    """
    Analyze optimal spatial lag between curvature and migration
    
    Parameters:
    -----------
    centerlines : GeoDataFrame
        Centerline with curvature values
    migration_rates : array-like
        Observed migration rates at each point
    lag_range : tuple
        (min_lag, max_lag, step) in meters
    
    Returns:
    --------
    dict with optimal lag and correlation by lag distance
    """
    lags = np.arange(lag_range[0], lag_range[1] + lag_range[2], lag_range[2])
    correlations = []
    
    # Get curvature values
    curvatures = centerlines['curvature'].values
    
    for lag in lags:
        # Convert lag to index shift (assuming 20m spacing)
        lag_pixels = int(lag / 20)
        
        if lag_pixels == 0:
            shifted_curvature = curvatures
        elif lag_pixels > 0:
            shifted_curvature = np.roll(curvatures, -lag_pixels)
            shifted_curvature[-lag_pixels:] = np.nan
        else:
            shifted_curvature = np.roll(curvatures, -lag_pixels)
            shifted_curvature[:-lag_pixels] = np.nan
        
        # Mask NaN values
        valid = ~np.isnan(shifted_curvature) & ~np.isnan(migration_rates)
        if np.sum(valid) > 10:
            corr = stats.pearsonr(
                shifted_curvature[valid], 
                migration_rates[valid]
            )[0]
            correlations.append(corr)
        else:
            correlations.append(np.nan)
    
    optimal_lag = lags[np.nanargmax(correlations)]
    optimal_correlation = np.nanmax(correlations)
    
    return {
        'optimal_lag_meters': optimal_lag,
        'optimal_correlation': optimal_correlation,
        'lags': lags,
        'correlations': correlations
    }

if __name__ == "__main__":
    # Example usage
    dl = detection_limit()
    print(f"Minimum detectable migration: {dl['min_detectable_migration_absolute']:.1f} m")
    print(f"Minimum annual rate (15-yr epoch): {dl['min_annual_rate_15yr_epoch']:.2f} m/yr")
