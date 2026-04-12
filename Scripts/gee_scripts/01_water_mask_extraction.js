/**
 * Water Mask Extraction for River Meander Migration Analysis
 * IEEE GRSL Paper: Landsat-Based Meander Migration Mapping
 * Author: Pawan Thapa
 * Repository: https://github.com/thapawan/landsat-meander-migration
 * 
 * Description: Extracts binary water masks from Landsat time series
 * using MNDWI and Otsu thresholding in Google Earth Engine.
 */

// ============================================================
// USER PARAMETERS (MODIFY FOR YOUR STUDY AREA)
// ============================================================

var studyArea = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
  .filter(ee.Filter.eq('country_co', 'US'))
  .filterBounds(ee.Geometry.Point(-90.88, 32.71))  // Yazoo River
  .geometry();

var startYear = 1984;
var endYear = 2024;
var epochs = [
  {name: '1984-1999', start: 1984, end: 1999},
  {name: '2000-2014', start: 2000, end: 2014},
  {name: '2015-2024', start: 2015, end: 2024}
];

var cloudCoverMax = 10;  // percent
var seasonalFilter = {startMonth: 8, endMonth: 10};  // August-October

// ============================================================
// LANDSAT COLLECTION FUNCTIONS
// ============================================================

function getLandsatCollection(sensor, startDate, endDate) {
  var collection = ee.ImageCollection(sensor)
    .filterDate(startDate, endDate)
    .filterBounds(studyArea)
    .filter(ee.Filter.lt('CLOUD_COVER', cloudCoverMax));
  
  // Apply seasonal filter
  collection = collection.filter(ee.Filter.calendarRange(
    seasonalFilter.startMonth, seasonalFilter.endMonth, 'month'));
  
  return collection;
}

function mergeLandsatCollections(startDate, endDate) {
  var l5 = getLandsatCollection('LANDSAT/LT05/C02/T1_L2', startDate, endDate);
  var l7 = getLandsatCollection('LANDSAT/LE07/C02/T1_L2', startDate, endDate);
  var l8 = getLandsatCollection('LANDSAT/LC08/C02/T1_L2', startDate, endDate);
  var l9 = getLandsatCollection('LANDSAT/LC09/C02/T1_L2', startDate, endDate);
  
  return l5.merge(l7).merge(l8).merge(l9);
}

// ============================================================
// MNDWI COMPUTATION
// ============================================================

function computeMNDWI(image) {
  // Landsat 5 & 7: Band 2 (Green), Band 5 (SWIR)
  // Landsat 8 & 9: Band 3 (Green), Band 6 (SWIR)
  
  var sensor = image.get('SPACECRAFT_ID');
  var green, swir;
  
  if (sensor === 'LANDSAT_5' || sensor === 'LANDSAT_7') {
    green = image.select('SR_B2');
    swir = image.select('SR_B5');
  } else if (sensor === 'LANDSAT_8' || sensor === 'LANDSAT_9') {
    green = image.select('SR_B3');
    swir = image.select('SR_B6');
  } else {
    return null;
  }
  
  var mndwi = green.subtract(swir).divide(green.add(swir));
  return image.addBands(mndwi.rename('MNDWI'));
}

// ============================================================
// OTSU THRESHOLDING
// ============================================================

function otsuThreshold(image, bandName, region) {
  // Calculate histogram
  var histogram = image.select(bandName).reduceRegion({
    reducer: ee.Reducer.histogram(255, 0.01),
    geometry: region,
    scale: 30,
    maxPixels: 1e9
  });
  
  var hist = ee.Dictionary(histogram.get(bandName));
  var counts = ee.Array(hist.get('histogram'));
  var means = ee.Array(hist.get('bucketMeans'));
  
  // Otsu algorithm implementation
  var total = counts.reduce(ee.Reducer.sum(), [0]).get([0]);
  var sum = means.multiply(counts).reduce(ee.Reducer.sum(), [0]).get([0]);
  var mean = sum.divide(total);
  
  var indices = ee.List.sequence(1, counts.length().get([0]));
  
  var otsu = indices.map(function(i) {
    var iNum = ee.Number(i);
    var weightB = counts.slice(0, 0, iNum).reduce(ee.Reducer.sum(), [0]).get([0]);
    var weightF = total.subtract(weightB);
    
    var sumB = means.slice(0, 0, iNum)
      .multiply(counts.slice(0, 0, iNum))
      .reduce(ee.Reducer.sum(), [0]).get([0]);
    var meanB = sumB.divide(weightB);
    
    var sumF = means.slice(0, iNum)
      .multiply(counts.slice(0, iNum))
      .reduce(ee.Reducer.sum(), [0]).get([0]);
    var meanF = sumF.divide(weightF);
    
    var between = weightB.multiply(weightF).multiply(meanB.subtract(meanF).pow(2));
    return between;
  });
  
  var maxBetween = ee.List(otsu).reduce(ee.Reducer.max(), [0]);
  var threshold = means.get(ee.List(otsu).indexOf(maxBetween));
  
  return threshold;
}

function applyWaterMask(image, region) {
  var mndwi = image.select('MNDWI');
  var threshold = otsuThreshold(mndwi, 'MNDWI', region);
  var waterMask = mndwi.gt(threshold);
  return waterMask.rename('water');
}

// ============================================================
// COMPOSITE WATER MASK GENERATION
// ============================================================

function generateEpochWaterMask(epoch) {
  var startDate = ee.Date.fromYMD(epoch.start, 1, 1);
  var endDate = ee.Date.fromYMD(epoch.end, 12, 31);
  
  var collection = mergeLandsatCollections(startDate, endDate);
  var withMNDWI = collection.map(computeMNDWI).filter(ee.Filter.notNull(['MNDWI']));
  
  var waterMasks = withMNDWI.map(function(img) {
    return applyWaterMask(img, studyArea);
  });
  
  // Composite using mode (most frequent value) to reduce errors
  var compositeMask = waterMasks.mode();
  
  // Morphological smoothing (remove small water bodies, fill small holes)
  var smoothedMask = compositeMask
    .focal_min(1)   // erosion to remove isolated pixels
    .focal_max(3)   // dilation to fill holes
    .focal_min(1);  // final erosion
  
  return smoothedMask.rename('water_mask');
}

// ============================================================
// EXPORT FUNCTIONS
// ============================================================

function exportWaterMask(epoch, mask) {
  var exportName = 'yazoo_river_water_mask_' + epoch.name.replace(/-/g, '_');
  
  Export.image.toDrive({
    image: mask.clip(studyArea),
    description: exportName,
    folder: 'meander_migration_water_masks',
    scale: 30,
    region: studyArea,
    maxPixels: 1e9
  });
}

// ============================================================
// MAIN EXECUTION
// ============================================================

epochs.forEach(function(epoch) {
  var mask = generateEpochWaterMask(epoch);
  exportWaterMask(epoch, mask);
  
  // Add to map for visualization
  Map.addLayer(mask, {palette: ['white', 'blue']}, epoch.name + ' Water Mask');
  print('Generated water mask for:', epoch.name);
});

Map.centerObject(studyArea, 12);
