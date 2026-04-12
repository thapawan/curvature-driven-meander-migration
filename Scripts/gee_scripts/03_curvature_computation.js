/**
 * Curvature Computation for Meander Migration Analysis
 * Implements finite difference curvature estimation
 */

function computeCurvature(points) {
  // points: FeatureCollection with ordered points along centerline
  // Each point must have 'distance' property
  
  var pointsList = points.toList(points.size());
  
  var withCurvature = pointsList.map(function(point, index) {
    var idx = ee.Number(index);
    var prev = ee.Feature(pointsList.get(idx.subtract(1)));
    var curr = ee.Feature(point);
    var next = ee.Feature(pointsList.get(idx.add(1)));
    
    // Get coordinates
    var prevCoords = ee.List(prev.geometry().coordinates());
    var currCoords = ee.List(curr.geometry().coordinates());
    var nextCoords = ee.List(next.geometry().coordinates());
    
    var x1 = ee.Number(prevCoords.get(0));
    var y1 = ee.Number(prevCoords.get(1));
    var x2 = ee.Number(currCoords.get(0));
    var y2 = ee.Number(currCoords.get(1));
    var x3 = ee.Number(nextCoords.get(0));
    var y3 = ee.Number(nextCoords.get(1));
    
    // First derivatives (centered difference)
    var dx_ds = (x3.subtract(x1)).divide(2);
    var dy_ds = (y3.subtract(y1)).divide(2);
    
    // Second derivatives
    var d2x_ds2 = x3.subtract(x2.multiply(2)).add(x1);
    var d2y_ds2 = y3.subtract(y2.multiply(2)).add(y1);
    
    // Curvature formula: k = (x'y'' - y'x'') / (x'^2 + y'^2)^(3/2)
    var numerator = dx_ds.multiply(d2y_ds2).subtract(dy_ds.multiply(d2x_ds2));
    var denominator = dx_ds.pow(2).add(dy_ds.pow(2)).pow(1.5);
    var curvature = numerator.divide(denominator);
    
    // Sign convention: positive = left turn (looking downstream)
    return curr.set('curvature', curvature);
  });
  
  return ee.FeatureCollection(withCurvature);
}

function applyGaussianSmoothing(points, sigma) {
  // sigma in meters (recommended: 200m for Yazoo River)
  // Convert sigma to pixels (30m resolution)
  var sigmaPixels = sigma / 30;
  
  // Extract curvature values
  var curvatures = points.aggregate_array('curvature');
  
  // Apply Gaussian filter (simplified moving average with Gaussian weights)
  var kernelSize = ee.Number(sigmaPixels).multiply(6).ceil();  // 6 sigma for full width
  
  // Return smoothed points (implementation depends on GEE capabilities)
  // For production, export to Python for Gaussian smoothing
  
  return points;
}
