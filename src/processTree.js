import vis from 'vis';
import randomColor from 'randomcolor';
import {getModuleDirpath} from './util';

export default function processTree(tree, config) {
  config = Object.assign(
    {
      maxLevel: 5,
      usePhysics: false,
      cluster: true,
    },
    config
  );
  const allModules = Object.keys(tree);
  const moduleToMaxDepth = {};
  const cycles = [];
  const packageCycles = {};
  const isInCycle = m => cycles.some(cycle => cycle.includes(m));
  const isEdgeInCycle = (from, to) => cycles.some(cycle => cycle.includes(from) && cycle.includes(to))
  const isOuterModule = module => module.indexOf('..') === 0;
  const isInnerModule = module => !isOuterModule(module);
  const isImported = module => allModules.some(
    m => tree[m].includes(module)
  );
  const isImportedByInnerModule = module => allModules.some(
    m => isInnerModule(m) && tree[m].includes(module)
  );
  const getModulePackage = module => getModuleDirpath(module).split('/')[0];
  const moduleSortString = {};
  let maxDepth = 0;
  function traverse(root, depth=0, visitedModules=[], visitedPackages=[]) {
    if (!isInnerModule(root) && !isImportedByInnerModule(root)) {
      // we are not interested in these...
      return;
    }
    const rootPackage = getModulePackage(root);
    const cycleStartIndex = visitedModules.indexOf(root);
    if (cycleStartIndex >= 0) {
      // cycle detected....
      const cycle = visitedModules.slice(cycleStartIndex);
      cycles.push(cycle);
      console.log(
        `Found a cycle: `,
        cycle.concat(root).join(' -> '));
      return;
    }
    const packageCycleStartIndex = visitedPackages.findIndex(d => d.package === rootPackage);
    if (packageCycleStartIndex >= 0 && packageCycleStartIndex < visitedPackages.length - 1) {
      const cycle = visitedPackages.slice(packageCycleStartIndex);
      const cyclePackages = cycle.map(c => c.package);
      if (cyclePackages[cyclePackages.length - 1] !== rootPackage) {
        cyclePackages.push(rootPackage);
      }
      const key = cyclePackages.join(',');
      console.log("found cycle", key);
      if (!packageCycles[key]) {
        packageCycles[key] = {
          packageCycle: cyclePackages,
          visitedModules: {},
        };
      }
      const modulePath = visitedModules.slice(cycle[0].startIndex).concat(
        root
      );
      packageCycles[key].visitedModules[modulePath.join(',')] = modulePath;
    }
    visitedModules[root] = true;
    maxDepth = Math.max(depth, maxDepth);
    if (moduleToMaxDepth[root] !== undefined && moduleToMaxDepth[root] > depth) {
      // already visited this one through another deeper path...
      return;
    }
    moduleToMaxDepth[root] = depth;
    moduleSortString[root] = getModuleDirpath(root).toLowerCase(); //(visitedModules.join('|') + '|' + root).toLowerCase();
    if (depth >= 20) {
      console.warn("Maximum depth of 20 exceeded!", visitedModules.join(' -> '))
      return;
    }
    let nextVisitedPackages = visitedPackages;
    if (visitedPackages.length === 0 ||
        visitedPackages[visitedPackages.length - 1].package !== rootPackage
    ) {
      nextVisitedPackages = nextVisitedPackages.concat({
        package: rootPackage,
        startIndex: visitedModules.length,
        endIndex: visitedModules.length,
      });
    } else {
      nextVisitedPackages[nextVisitedPackages.length - 1] = {
        ...visitedPackages[visitedPackages.length - 1],
        endIndex: visitedPackages[visitedPackages.length - 1].endIndex + 1
      };
    }
    tree[root].forEach(
      child => traverse(
        child,
        depth + 1,
        visitedModules.concat(root),
        nextVisitedPackages
      )
    );
  }
  allModules.forEach(m => {
    if (!isImported(m)) {
      traverse(m);
    }
  });
  const getLevel = module => isOuterModule(module) ? maxDepth : (moduleToMaxDepth[module] || 0);

  var directories = {};

  const modulesToRender = allModules
    .filter(m => isInnerModule(m) || isImportedByInnerModule(m))
    .filter(m => getLevel(m) < config.maxLevel);
//  console.log("rendering modules", modulesToRender.map(m => m+' '+getLevel(m)));
  // compute module distribution in graph
  const modulesByLevel = {};
  let maxNodesInLevel = 0;
  let maxLevel = 0;
  modulesToRender.forEach(m => {
    const level = getLevel(m);
    modulesByLevel[level] = modulesByLevel[level] || [];
    modulesByLevel[level].push(m);
    maxNodesInLevel = Math.max(modulesByLevel[level].length, maxNodesInLevel);
    maxLevel = Math.max(level, maxLevel);
  });
//  console.log("max level is", maxLevel, config.maxLevel);
  for (let level = 0; level < maxLevel; level++) {
    if (modulesByLevel[level]) {
      modulesByLevel[level].sort((a,b) => moduleSortString[a] > moduleSortString[b] ? 1 : -1);
    }
  }

  let groupsConfig = {
    cycle: {color: 'red'},
  };

  var nodes = modulesToRender.map((module, index) => {
    const dirpath = getModuleDirpath(module);
    const level = getLevel(module);
    let directory = directories[dirpath];
    if (!directory) {
      directories[dirpath] = directory = {
        modules:[],
        minModuleLevel: Infinity,
      };
    }
    directory.modules.push(module);
    directory.minModuleLevel = Math.min(directory.minModuleLevel, level)
//    console.log(module, dirpath);
    const nodeConfig = {
      id: module,
      label: module,
      title: module,
      dirpath,
      shape: 'dot',
      level,
      group: isInCycle(module) ? 'cycle' : dirpath || '.',
    };
    if (!groupsConfig[nodeConfig.group]) {
      groupsConfig[nodeConfig.group] = {color: randomColor({seed: nodeConfig.group})};
    }
    if (!config.usePhysics) {
      const maxWidth = maxNodesInLevel * 25 * 2 * 4;
      const spacing = maxWidth / modulesByLevel[level].length;
      Object.assign(nodeConfig, {
        x: modulesByLevel[level].indexOf(module) * spacing + spacing / 2,
        y: level * 25 * 2 * 3,
      });
    }
    return nodeConfig;
  });

  const directoriesByLevel = {};
  let maxDirectoriesInLevel = 0;
  Object.keys(directories).forEach(dirpath => {
    let directoryLevel = directories[dirpath].minModuleLevel;
    let directoriesInLevel = directoriesByLevel[directoryLevel];
    if (!directoriesInLevel) {
      directoriesInLevel = directoriesByLevel[directoryLevel] = []
    }
    if (!directoriesInLevel.includes(dirpath)) {
      directoriesInLevel.push(dirpath);
    }
    maxDirectoriesInLevel = Math.max(directoriesInLevel.length, maxDirectoriesInLevel);
  });
  for (let level = 0; level < maxLevel; level++) {
    if (directoriesByLevel[level]) {
      console.log('directoriesByLevel', level, directoriesByLevel[level]);
    }
  }

  var edges = [].concat(
    ...modulesToRender.map(
      module => tree[module]
        .filter(dependency => modulesToRender.includes(dependency))
        .map(dependency => Object.assign(
          {
            from: module,
            to: dependency,
            arrows: 'to',
          },
          isEdgeInCycle(module, dependency) ? {color: 'red'} : {}
        ))
    )
  );

  var data = {
    nodes: new vis.DataSet(nodes.slice(0)),
    edges: new vis.DataSet(edges.slice(0)),
  };

  var options = {
    layout: {
      hierarchical: {
        enabled: config.usePhysics,
        sortMethod: 'directed',
      },
    },
    edges: {
      smooth: true,
      color: {
        color: '#ccc',
        highlight: '#c0c',
      },
    },
    physics: {
      enabled: config.usePhysics,
      solver: 'hierarchicalRepulsion',
      hierarchicalRepulsion: {
        nodeDistance: 220,
      },
      stabilization: {
        enabled: config.usePhysics,
      },
    },
    groups: groupsConfig,
  };

  return {
    data,
    options,
    directories,
    cycles,
    packageCycles: Object.values(packageCycles),
    clusterDirpath(dirpath, network) {
      const clusterConfig = {
        group: dirpath,
        label: dirpath + '/*',
        shape: 'dot',
        level: directories[dirpath].minModuleLevel,
      };

      if (!config.usePhysics) {
        const clustersOnThisLevel = [];
        modulesByLevel[clusterConfig.level].forEach((module, index) => {
          const moduleDirpath = getModuleDirpath(module);
          const moduleClusterLevel = directories[moduleDirpath].minModuleLevel;
          if (clustersOnThisLevel.indexOf(moduleDirpath) < 0 &&
              moduleClusterLevel === clusterConfig.level) {
            clustersOnThisLevel.push(moduleDirpath);
          }
        });
        const maxWidth = maxDirectoriesInLevel * 25 * 2 * 4;
        const spacing = maxWidth / directoriesByLevel[clusterConfig.level].length;
        console.log(
          'x',
          'maxWidth', maxWidth,
          'spacing', spacing,
          'on level', clusterConfig.level,
          'cluster', clusterConfig.group,
          'is at index',
          directoriesByLevel[clusterConfig.level].indexOf(dirpath));
        Object.assign(clusterConfig, {
          x: directoriesByLevel[clusterConfig.level].indexOf(dirpath) * spacing + spacing / 2,
          y: clusterConfig.level * 25 * 2 * 3,
        });
      }

      network.cluster({
        joinCondition: (otherNode) => otherNode.dirpath === dirpath,
        clusterNodeProperties: clusterConfig
      });
    }
  };

}
