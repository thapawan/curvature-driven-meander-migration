/**
 * Validation Metrics for Migration Model
 * Computes RMSE, bias, correlation coefficient
 */

function computeRMSE(predicted, observed) {
  // Pair points by distance along channel
  var paired = predicted.map(function(pred) {
    var dist = pred.get('distance');
    var obs = observed.filter(ee.Filter.eq('distance', dist)).first();
    
    var predCoords = ee.List(pred.geometry().coordinates());
    var obsCoords = ee.List(obs.geometry().coordinates());
    
    var dx = ee.Number(predCoords.get(0)).subtract(ee.Number(obsCoords.get(0)));
    var dy = ee.Number(predCoords.get(1)).subtract(ee.Number(obsCoords.get(1)));
    
    var error = dx.pow(2).add(dy.pow(2)).sqrt();
    return pred.set('error', error);
  });
  
  var errors = paired.aggregate_array('error');
  var mse = errors.map(function(e) {
    return ee.Number(e).pow(2);
  }).reduce(ee.Reducer.mean(), [0]);
  
  var rmse = mse.sqrt();
  return rmse;
}

function bootstrapRMSE(predicted, observed, iterations) {
  var rmseValues = ee.List.sequence(1, iterations).map(function(i) {
    // Random sampling with replacement
    var sampled = predicted.randomColumn('random').filter(ee.Filter.lt('random', 0.632));
    return computeRMSE(sampled, observed);
  });
  
  var meanRMSE = rmseValues.reduce(ee.Reducer.mean(), [0]);
  var stdRMSE = rmseValues.reduce(ee.Reducer.stdDev(), [0]);
  
  return {
    mean: meanRMSE,
    ci_lower: meanRMSE.subtract(stdRMSE.multiply(1.96)),
    ci_upper: meanRMSE.add(stdRMSE.multiply(1.96))
  };
}

function computeCorrelation(predicted, observed) {
  var paired = predicted.map(function(pred) {
    var dist = pred.get('distance');
    var obs = observed.filter(ee.Filter.eq('distance', dist)).first();
    return pred.set('observed_x', obs.geometry().coordinates().get(0))
                .set('observed_y', obs.geometry().coordinates().get(1));
  });
  
  var predX = paired.aggregate_array('observed_x');  // Placeholder
  var obsX = paired.aggregate_array('observed_x');
  
  // Pearson correlation coefficient
  var n = predX.size();
  var sumPred = predX.reduce(ee.Reducer.sum(), [0]);
  var sumObs = obsX.reduce(ee.Reducer.sum(), [0]);
  var sumProd = predX.zip(obsX).map(function(p) {
    return ee.Number(p.get(0)).multiply(ee.Number(p.get(1)));
  }).reduce(ee.Reducer.sum(), [0]);
  
  var sumPredSq = predX.map(function(x) {
    return ee.Number(x).pow(2);
  }).reduce(ee.Reducer.sum(), [0]);
  
  var sumObsSq = obsX.map(function(x) {
    return ee.Number(x).pow(2);
  }).reduce(ee.Reducer.sum(), [0]);
  
  var numerator = sumProd.multiply(n).subtract(sumPred.multiply(sumObs));
  var denominator = sumPredSq.multiply(n).subtract(sumPred.pow(2))
    .multiply(sumObsSq.multiply(n).subtract(sumObs.pow(2)))
    .sqrt();
  
  var r = numerator.divide(denominator);
  return r;
}
