#!/usr/bin/env babel-node

import 'babel-polyfill';
import path from 'path';
import program from 'commander';
import madge from 'madge';
import chalk from 'chalk';
import {start as startServer, getMadgeConfig} from './server';
import processTree from './src/processTree';

program
  .version('0.0.1')
  .arguments('command')
  .option('-m, --madgerc <file>', 'Path to .madgerc file');

program
  .command('start-server')
  .description('start a server to view unspaghetti output in a nice web interface')
  .action(() => {
    startServer(process.env.BASE_PATH || '.', program.madgerc);
  });

program
  .command('advice [path]')
  .description('display unspaghetti advice')
  .action((basePath) => {
    if (!basePath) {
      basePath = '.';
    }
    const depsPath = path.resolve(basePath);
    console.log("Figuring out what advice to give you... please wait.\n");
    madge(depsPath, getMadgeConfig(basePath, program.madgerc))
      .then(deps => {
        const {advice} = processTree(deps.tree);
        let failed = 0;
        advice.forEach(a => {
          const color = a.failure ? chalk.red : chalk.green;
          const indicator = a.failure ? color('✘') : color('✓');
          console.log(indicator, color(chalk.underline(a.title)));
          console.log(a.explanation);
          if (a.failure && a.failureMessage) {
            console.log(a.failureMessage);
          }
          console.log('');
          if (a.failure) {
            failed += 1;
          }
        });
        if (failed) {
          console.log(chalk.red(`Found ${failed} peices of advice. Exiting with code 1.`));
          process.exit(1);
        } else {
          console.log(chalk.green(`Congrats! You are following all of my advice!`));
          process.exit(0);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

program.parse(process.argv);
