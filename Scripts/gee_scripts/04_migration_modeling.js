/**
 * Curvature-Informed Meander Migration Model
 * Implements M(s) = β·κ(s) with iterative centerline evolution
 */

function calibrateErodibility(observedMigrations, curvatures) {
  // Linear regression: M = β·κ
  // β = Σ(M·κ) / Σ(κ²)
  
  var M_dot_kappa = observedMigrations.zip(curvatures)
    .map(function(pair) {
      return ee.Number(pair.get(0)).multiply(ee.Number(pair.get(1)));
    });
  
  var kappa_squared = curvatures.map(function(k) {
    return ee.Number(k).pow(2);
  });
  
  var beta = ee.List(M_dot_kappa).reduce(ee.Reducer.sum(), [0])
    .divide(ee.List(kappa_squared).reduce(ee.Reducer.sum(), [0]));
  
  return beta;
}

function computeNormalVectors(centerline) {
  // Compute unit normal vectors at each point
  var points = centerline.toList(centerline.size());
  
  var withNormals = points.map(function(point, index) {
    var idx = ee.Number(index);
    var prev = ee.Feature(points.get(idx.subtract(1)));
    var curr = ee.Feature(point);
    var next = ee.Feature(points.get(idx.add(1)));
    
    var prevCoords = ee.List(prev.geometry().coordinates());
    var currCoords = ee.List(curr.geometry().coordinates());
    var nextCoords = ee.List(next.geometry().coordinates());
    
    var x1 = ee.Number(prevCoords.get(0));
    var y1 = ee.Number(prevCoords.get(1));
    var x2 = ee.Number(currCoords.get(0));
    var y2 = ee.Number(currCoords.get(1));
    var x3 = ee.Number(nextCoords.get(0));
    var y3 = ee.Number(nextCoords.get(1));
    
    // Tangent vector (forward difference)
    var tx = x3.subtract(x1);
    var ty = y3.subtract(y1);
    var length = tx.pow(2).add(ty.pow(2)).sqrt();
    
    // Unit tangent
    var ux = tx.divide(length);
    var uy = ty.divide(length);
    
    // Unit normal (rotate 90 degrees clockwise)
    var nx = uy;
    var ny = ux.multiply(-1);
    
    return curr.set('nx', nx).set('ny', ny);
  });
  
  return ee.FeatureCollection(withNormals);
}

function evolveCenterline(centerline, beta, timeStep, curvatures) {
  // Displace each node: Δr = M·Δt·n
  // M = β·κ
  
  var withNormals = computeNormalVectors(centerline);
  
  var displaced = withNormals.map(function(point) {
    var curvature = ee.Number(point.get('curvature'));
    var nx = ee.Number(point.get('nx'));
    var ny = ee.Number(point.get('ny'));
    
    var migration = beta.multiply(curvature);
    var displacement = migration.multiply(timeStep);
    
    var x = ee.Number(point.geometry().coordinates().get(0));
    var y = ee.Number(point.geometry().coordinates().get(1));
    
    var newX = x.add(displacement.multiply(nx));
    var newY = y.add(displacement.multiply(ny));
    
    var newPoint = ee.Geometry.Point([newX, newY]);
    return ee.Feature(newPoint, point.toDictionary());
  });
  
  return displaced;
}

function iterativeMigration(initialCenterline, beta, timeSteps, epochs) {
  var currentCenterline = initialCenterline;
  var results = [];
  
  for (var i = 0; i < timeSteps.length; i++) {
    var curvatures = computeCurvature(currentCenterline);
    currentCenterline = evolveCenterline(
      currentCenterline, beta, timeSteps[i], curvatures
    );
    results.push({
      epoch: epochs[i],
      centerline: currentCenterline
    });
  }
  
  return results;
}
