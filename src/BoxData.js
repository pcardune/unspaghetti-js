
function getPathData({path, originalPath}) {
  if (!path && originalPath) {
    const parts = originalPath.split('/');
    if (originalPath.slice(originalPath.length-1) === '/') {
      path = parts[parts.length - 2]+'/';
    } else {
      path = parts[parts.length - 1];
    }
  }
  return {path, originalPath};
}

export default class BoxData {
  constructor({paths, layers, isEntryPoint, ...pathData}) {
    pathData = getPathData(pathData);
    if (pathData.path) {
      this.paths = [pathData];
    } else {
      this.paths = paths.map(pathData => getPathData(pathData));
    }
    this.isEntryPoint = isEntryPoint || false;
    this.layers = (layers && layers.map(
      layerBoxConfigs => layerBoxConfigs.map(
        boxConfig => new BoxData(boxConfig)
      )
    )) || [];
  }
}
