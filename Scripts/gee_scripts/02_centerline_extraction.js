/**
 * Centerline Extraction using Medial Axis Transform (MAT)
 * IEEE GRSL Paper: Landsat-Based Meander Migration Mapping
 * 
 * Extracts one-pixel-wide centerlines from binary water masks.
 */

// ============================================================
// CENTERLINE EXTRACTION FUNCTIONS
// ============================================================

function distanceTransform(binaryImage) {
  // Compute Euclidean distance to nearest water boundary
  var inverted = binaryImage.Not();
  var distance = inverted.fastDistanceTransform({
    neighborhood: 256,
    units: 'pixels'
  });
  return distance;
}

function extractMedialAxis(distanceImage, binaryImage) {
  // Local maxima detection for medial axis
  var maxNeighborhood = distanceImage.focal_max(1);
  var isLocalMax = distanceImage.eq(maxNeighborhood);
  
  // Constrain to water pixels
  var medialAxis = isLocalMax.updateMask(binaryImage);
  
  // Thinning to one-pixel width
  var thinned = medialAxis
    .reduceToVectors({
      geometryType: 'line',
      reducer: ee.Reducer.mean(),
      scale: 30,
      maxPixels: 1e9
    });
  
  return thinned;
}

function smoothCenterline(centerline, smoothingDistance) {
  // Simplify line to remove pixel-level zigzag
  var simplified = centerline.map(function(line) {
    return ee.Feature(line).simplify(smoothingDistance);
  });
  
  return simplified;
}

function discretizeCenterline(centerline, spacing) {
  // Convert to points at uniform spacing
  var points = centerline.map(function(line) {
    var coords = ee.List(line.geometry().coordinates().get(0));
    var length = line.geometry().length();
    var numPoints = ee.Number(length).divide(spacing).ceil();
    
    var step = ee.List.sequence(0, numPoints.subtract(1));
    var sampled = step.map(function(i) {
      var distance = ee.Number(i).multiply(spacing);
      var point = line.geometry().interpolate(distance);
      return ee.Feature(point, {'distance': distance});
    });
    
    return ee.FeatureCollection(sampled);
  }).flatten();
  
  return points;
}

// ============================================================
// MAIN EXECUTION FOR EACH EPOCH
// ============================================================

function extractCenterlinesForEpoch(epochName, waterMaskImage) {
  // Compute distance transform
  var distance = distanceTransform(waterMaskImage);
  
  // Extract medial axis
  var medialAxis = extractMedialAxis(distance, waterMaskImage);
  
  // Smooth with 330m filter (11 pixels at 30m resolution)
  var smoothed = smoothCenterline(medialAxis, 330);
  
  // Discretize at 20m spacing
  var discretized = discretizeCenterline(smoothed, 20);
  
  // Export
  Export.table.toDrive({
    collection: discretized,
    description: 'centerline_' + epochName.replace(/-/g, '_'),
    folder: 'meander_migration_centerlines',
    fileFormat: 'CSV'
  });
  
  return {medialAxis: medialAxis, points: discretized};
}
