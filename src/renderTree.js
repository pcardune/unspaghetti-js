import vis from 'vis';

export default function renderTree(tree, rootEl, config) {
  config = Object.assign(
    {
      maxLevel: 5,
      usePhysics: false,
    },
    config
  );
  const allModules = Object.keys(tree);
  const depths = {};
  const cycles = [];
  const isInCycle = m => cycles.some(cycle => cycle.includes(m));
  const isEdgeInCycle = (from, to) => cycles.some(cycle => cycle.includes(from) && cycle.includes(to))
  const isOuterModule = module => module.indexOf('..') === 0;
  const isInnerModule = module => !isOuterModule(module);
  const isImported = module => allModules.some(
    m => tree[m].includes(module)
  );
  const isRoot = module => !isImported(module);
  const isImportedByInnerModule = module => allModules.some(
    m => isInnerModule(m) && tree[m].includes(module)
  );
  const moduleSortString = {};
  let maxDepth = 0;
  function traverse(root, depth=0, visited=[]) {
    if (!isInnerModule(root) && !isImportedByInnerModule(root)) {
      // we are not interested in these...
      return;
    }
    const cycleStartIndex = visited.indexOf(root);
    if (cycleStartIndex >= 0) {
      // cycle detected....
      const cycle = visited.slice(cycleStartIndex);
      cycles.push(cycle);
      console.log(
        `Found a cycle: `,
        cycle.concat(root).join(' -> '));
      return;
    }
    visited[root] = true;
    maxDepth = Math.max(depth, maxDepth);
    if (depths[root] !== undefined && depths[root] > depth) {
      // already visited this one through another deeper path...
      return;
    }
    depths[root] = depth;
    moduleSortString[root] = (visited.join('|') + '|' + root).toLowerCase();
    if (depth >= 20) {
      console.warn("Maximum depth of 20 exceeded!", visited.join(' -> '))
      return;
    }
    tree[root].forEach(
      child => traverse(child, depth+1, visited.concat(root))
    );
  }
  allModules.forEach(m => {
    if (!isImported(m)) {
      traverse(m);
    }
  });
  const getLevel = module => isOuterModule(module) ? maxDepth : (depths[module] || 0);

  var directories = {};
  console.log(
    "hiding these modules:",
    allModules
      .filter(m => getLevel(m) < config.maxLevel ||
                 !(isInnerModule(m) || isImportedByInnerModule(m)))
      .map(m => `${m} ${getLevel(m)} isInner: ${isInnerModule(m)} isImported: ${isImportedByInnerModule(m)}`)
  )
  console.log("tree is", tree);
  const modulesToRender = allModules
    .filter(m => isInnerModule(m) || isImportedByInnerModule(m))
    .filter(m => getLevel(m) < config.maxLevel);
  console.log("rendering modules", modulesToRender.map(m => m+' '+getLevel(m)));
  const byLevel = {};
  let maxNodesInLevel = 0;
  let maxLevel = 0;
  modulesToRender.forEach(m => {
    const level = getLevel(m);
    byLevel[level] = byLevel[level] || [];
    byLevel[level].push(m);
    maxNodesInLevel = Math.max(byLevel[level].length, maxNodesInLevel);
    maxLevel = Math.max(level, maxLevel);
  });
  console.log("max level is", maxLevel, config.maxLevel);
  for (let level = 0; level < maxLevel; level++) {
    if (byLevel[level]) {
      byLevel[level].sort((a,b) => moduleSortString[a] > moduleSortString[b] ? 1 : -1);
    }
  }

  var nodes = modulesToRender.map((module, index) => {
    const parts = module.split('/');
    const dirpath = parts.slice(0, parts.length - 1).join('/');
    if (dirpath) {
      if (!directories[dirpath]) {
        directories[dirpath] = [];
      }
      directories[dirpath].push(module);
    }
    console.log(module, dirpath);
    const level = getLevel(module);
    const nodeConfig = {
      id: module,
      label: module,
      title: module,
      dirpath,
      shape: 'dot',
      level,
      group: (
        isInCycle(module) ? 'cycle' :
        isOuterModule(module) ? 'out' :
        isRoot(module) ? 'root' :
        //'in'
        dirpath || 'in'
      ),
    };
    if (!config.usePhysics) {
      const maxWidth = maxNodesInLevel * 25 * 2 * 4;
      const spacing = maxWidth / byLevel[level].length;
      Object.assign(nodeConfig, {
        x: byLevel[level].indexOf(module) * spacing + spacing / 2,
        y: level * 25 * 2 * 3,
      });
    }
    return nodeConfig;
  });

  var edges = [].concat(
    ...modulesToRender.map(
      module => tree[module]
        .filter(dependency => modulesToRender.includes(dependency))
        .map(dependency => Object.assign({
          from: module,
          to: dependency,
          arrows: 'to',
        }, isEdgeInCycle(module, dependency) ? {color: 'red'} : {})
        )
    )
  );

  var data = {
    nodes: new vis.DataSet(nodes.slice(0)),
    edges: new vis.DataSet(edges.slice(0)),
  };
  console.log("data is", {nodes, edges});
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
    groups: {
      out: {color: '#ccc'},
      in: {color: '#c5c'},
      root: {color: '#c55'},
      cycle: {color: 'red'},
    }
  };
  var network = new vis.Network(rootEl, data, options);
  network.on("selectNode", ({nodes}) => {
    if (nodes.length === 1) {
    }
  });
  network.on('doubleClick', (params) => {
    const {nodes} = params;
    if (nodes.length === 1) {
      if (network.isCluster(nodes[0])) {
        network.openCluster(nodes[0]);
      } else {
        const groupBy = 'dirpath';
        const value = data.nodes.get(nodes[0])[groupBy];
        network.cluster({
          joinCondition: node => node[groupBy] === value,
          clusterNodeProperties: {
            [groupBy]: value,
            label: `${groupBy} ${value}`,
            shape: 'dot',
          }
        });
      }
    }
  });
}
