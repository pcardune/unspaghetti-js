import express from 'express';
import madge from 'madge';

const madgeConfig = {
  "showFileExtension": true,
  "fontSize": "10px",
  "backgroundColor": "#ffffff",
  "nodeColor": "#000000",
  "noDependencyColor": "#00aa00",
  "cyclicNodeColor": "#ff0000",
  "edgeColor": "#000000",
  "graphVizOptions": {
    "G": {
      "rankdir": "TB"
    }
  },
  "fileExtensions": ["", "js", "jsx"],
  "layout": "dot",
  "detectiveOptions": {
    "es6": {
      "mixedImports": true
    }
  },
//  "baseDir": "../code-dot-org/apps/src",
  "webpackConfig": "../code-dot-org/apps/.madge.webpack.config.js"
}

const app = express();

app.set('port', (process.env.API_PORT || 3001));

app.get('/api/deps', (req, res) => {
  madge(req.query.path, madgeConfig)
    .then(
      tree => res.json(tree)
    )
    .catch(
      () => res.json(false)
    );
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
