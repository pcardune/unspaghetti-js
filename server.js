import express from 'express';
import madge from 'madge';
import fs from 'fs';
import path from 'path';

const BASE_PATH = process.env.BASE_PATH || '.';

let madgeConfig;

function adjustMadgeConfigPath(p) {
  if (!p) {
    return path.resolve(path.dirname(process.env.MADGERC));
  } else if (p[0] !== '/') {
    // p is a relative path. Make it absolute
    // since this process might be running in a different directory
    return path.resolve(path.dirname(process.env.MADGERC), p);
  }
}

if (process.env.MADGERC) {
  madgeConfig = JSON.parse(fs.readFileSync(process.env.MADGERC));
  madgeConfig.baseDir = adjustMadgeConfigPath(madgeConfig.baseDir);
  madgeConfig.webpackConfig = adjustMadgeConfigPath(madgeConfig.webpackConfig);
  console.log("using madge config", madgeConfig);
} else {
  console.warn("No MADGERC environment variable specified. Your milage may vary.");
  madgeConfig = {};
}

const app = express();

app.set('port', (process.env.API_PORT || 3001));

const FILE_EXTENSIONS = madgeConfig.fileExtensions || ['', 'js'];

function getFilesJSON(lsPath, basePath, items) {
  return {
    directory: lsPath,
    items: items
      .map(item => {
        return {
          filename: item,
          filepath: basePath + '/' + item,
          isDirectory: fs.lstatSync(path.resolve(lsPath, item)).isDirectory(),
        };
      })
      .filter(item => {
        const filename = item.filename;
        if (filename[0] === '.') {
          // no hidden files
          return false;
        }
        if (item.isDirectory) {
          return true;
        }
        let foundMatchingExtension = false;
        for (let extension of FILE_EXTENSIONS) {
          const endsWith = '.' + extension;
          if (filename.slice(filename.length - endsWith.length) === endsWith) {
            foundMatchingExtension = true;
            break;
          }
        }
        return foundMatchingExtension;
      }),
  };
}

app.get('/api/ls', (req, res) => {
  let lsPath = path.resolve(BASE_PATH, req.query.path || '.');
  let basePath = req.query.path;
  if (!fs.lstatSync(lsPath).isDirectory()) {
    lsPath = path.dirname(lsPath);
    basePath = path.dirname(basePath);
  }
  fs.readdir(
    lsPath,
    (err, items) => {
      if (!err) {
        res.json(getFilesJSON(lsPath, basePath, items));
      } else {
        res.json(getFilesJSON(lsPath, basePath, []));
      }
    }
  );
});

app.get('/api/deps', (req, res) => {
  const depsPath = path.resolve(BASE_PATH, req.query.path);
  console.info(`Getting dependency graph for ${depsPath}`);
  madge(depsPath, madgeConfig)
    .then(tree => res.json(tree))
    .catch((err) => {
      console.error(err);
      res.json(false);
    });
});

app.listen(app.get('port'), () => {
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});
