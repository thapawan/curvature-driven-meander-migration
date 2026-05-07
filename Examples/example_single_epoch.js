/**
 * Example: Process a single Landsat epoch for meander migration
 * Run this in Google Earth Engine Code Editor
 */

// Define study area (replace with your coordinates)
var studyArea = ee.Geometry.Rectangle(-90.95, 32.60, -90.80, 32.80);

// Define date range
var startDate = '2015-01-01';
var endDate = '2024-12-31';

// Load Landsat collection
var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterDate(startDate, endDate)
  .filterBounds(studyArea)
  .filter(ee.Filter.lt('CLOUD_COVER', 10));

// Function to compute MNDWI
function addMNDWI(image) {
  var green = image.select('SR_B3');
  var swir = image.select('SR_B6');
  var mndwi = green.subtract(swir).divide(green.add(swir));
  return image.addBands(mndwi.rename('MNDWI'));
}

// Apply MNDWI
var withMNDWI = collection.map(addMNDWI);

// Compute median composite
var medianMNDWI = withMNDWI.select('MNDWI').median();

// Simple threshold (replace with Otsu for production)
var waterMask = medianMNDWI.gt(0);

// Visualize
Map.centerObject(studyArea, 12);
Map.addLayer(waterMask, {palette: ['white', 'blue']}, 'Water Mask');
Map.addLayer(medianMNDWI, {min: -0.5, max: 0.5, palette: ['brown', 'white', 'blue']}, 'MNDWI');

print('Processing complete!');
