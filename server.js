import express from 'express';
import madge from 'madge';
import fs from 'fs';
import path from 'path';
import _debug from 'debug';

const debug = _debug('unspaghetti');

const BUILD_PATH = path.join(__dirname, 'build')

export function getMadgeConfig(BASE_PATH, madgerc) {
  let madgeConfig;
  madgerc = madgerc || process.env.MADGERC;
  if (!madgerc) {
    const possiblePath = path.resolve(BASE_PATH, '.madgerc');
    try {
      fs.accessSync(possiblePath);
      madgerc = possiblePath;
    } catch (e) {
      madgerc = null;
    }
  }

  function adjustMadgeConfigPath(p) {
    if (!p) {
      return path.resolve(path.dirname(madgerc));
    } else if (p[0] !== '/') {
      // p is a relative path. Make it absolute
      // since this process might be running in a different directory
      return path.resolve(path.dirname(madgerc), p);
    }
  }

  if (madgerc) {
    madgeConfig = JSON.parse(fs.readFileSync(madgerc));
    madgeConfig.baseDir = adjustMadgeConfigPath(madgeConfig.baseDir);
    madgeConfig.webpackConfig = adjustMadgeConfigPath(madgeConfig.webpackConfig);
    debug("using madge config at", madgerc, "\n", madgeConfig);
  } else {
    console.warn(
      `.madgerc file not found at ${BASE_PATH} and no MADGERC ` +
      `environment variable specified. Your milage may vary.`
    );
    madgeConfig = {};
  }
  return madgeConfig;
}

export function start(BASE_PATH, madgerc) {

  const madgeConfig = getMadgeConfig(BASE_PATH, madgerc);

  function getBasePath() {
    if (madgeConfig.baseDir) {
      return madgeConfig.baseDir;
    }
    return BASE_PATH;
  }

  const app = express();
  app.use(express.static(BUILD_PATH));
  app.set('port', (process.env.PORT || 3001));

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
            if (filename.endsWith('.' + extension)) {
              foundMatchingExtension = true;
              break;
            }
          }
          return foundMatchingExtension;
        }),
    };
  }

  app.get('/api/ls', (req, res) => {
    let lsPath = path.resolve(getBasePath(), req.query.path || '.');
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
    const depsPath = path.resolve(getBasePath(), req.query.path);
    debug(`Getting dependency graph for ${depsPath}`);
    madge(depsPath, madgeConfig)
      .then(tree => res.json(tree))
      .catch((err) => {
        console.error(err);
        res.json(false);
      });
  });

  app.listen(app.get('port'), () => {
    console.log(`Find the server at: http://localhost:${app.get('port')}/`);
  });
}
