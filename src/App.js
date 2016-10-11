import React, { Component, PropTypes } from 'react';
import vis from 'vis';
import * as api from './api';

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

class BoxData {
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

class Layer extends Component {
  render() {
    const style = {
      display: 'flex',
      margin: 5,
      overflow: 'scroll',
    };
    const {boxes} = this.props;
    boxes.sort((a, b) => {
      if (a.paths.length > 0 && b.paths.length > 0) {
        let aPath = a.paths[0].path.toLowerCase();
        let bPath = b.paths[0].path.toLowerCase();
        if (aPath < bPath) { return -1; }
        if (aPath > bPath) { return 1; }
        return 0;
      }
      return 0;
    })
    return (
      <div style={style}>
        {boxes.map((boxData, index) => <Box key={index} data={boxData}/>)}
      </div>
    );
  }
}

class Box extends Component {
  state = {
    expanded: true,
  }
  handleClick = (event) => {
    this.setState({expanded: !this.state.expanded});
    event.stopPropagation();
  }
  render() {
    const {data} = this.props;
    const style = {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(0,0,0,0.5)',
      padding: 5,
      margin: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(0,0,0,0.1)'
    };
    if (data.isEntryPoint) {
      style.backgroundColor = 'yellow';
    }
    if (data.layers.length > 0) {
      style.borderWidth = 3;
      style.cursor = 'pointer';
    }
    const layerStyle = {display: 'none'};
    if (this.state.expanded) {
      layerStyle.display = 'block';
    }
    const paths = data.paths;
    paths.sort((a, b) => a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1);
    return (
      <div style={style} onClick={this.handleClick}>
        {paths.map(pathData => (
           <span
             key={pathData.path}
             style={{display: 'block'}}
             title={pathData.originalPath}
           >
             {pathData.path}
           </span>
         ))}
        <div style={layerStyle}>
          {data.layers.map((boxes, index) => <Layer key={index} boxes={boxes}/>)}
        </div>
      </div>
    );
  }
}

class Folder extends Component {
  render() {
    const {data} = this.props;
    const paths = data.paths;
    paths.sort((a, b) => a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1);
    return (
      <li>
        {paths.map(pathData => (
           <div key={pathData.path}>
             {pathData.path}
           </div>
         ))}
       {data.layers.map((boxes, index) => (
          <ul key={index}>
            {boxes.map((boxData, index) => <Folder key={index} data={boxData}/>)}
          </ul>
        ))}
      </li>
    );
  }
}

class PathBreadcrumbs extends Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
  };

  render() {
    const pathParts = this.props.path.split('/');
    return (
      <ol className="breadcrumb">
        {pathParts.map((part, index) => {
           const isLast = index === pathParts.length - 1;
           const activeClass = isLast ? 'breadcrumb-active' : '';
           return (
             <li key={part + index} className={`breadcrumb-item ${activeClass}`}>
               {isLast ? part :
                <a href={'/'+pathParts.slice(0, index+1).join('/')}>{part}</a>}
             </li>
           );
         })}
      </ol>
    );
  }
}

class DirectoryTree extends Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
  };

  state = {
    files: null,
  };

  componentDidMount() {
    api.getFiles(this.props.path).then(
      files => this.setState({files})
    );
  }

  render() {
    if (!this.state.files) {
      return null;
    }
    const files = this.state.files.items;
    files.sort((a,b) => {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      } else if (b.isDirectory && !a.isDirectory) {
        return 1;
      }
      return a.filename.toLowerCase() >= b.filename.toLowerCase() ? 1 : -1;
    });
    const pathParts = this.props.path.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];
    return (
      <div className="list-group">
        {files.map(item => {
           if (lastPathPart === item.filename) {
             return <a key={item.filepath} href="#" className="list-group-item active">{item.filename}</a>;
           }
           const pathURL = '/'+item.filepath;
           const href = item.isDirectory ? pathURL : pathURL+'?showDeps=true';
           const text = item.isDirectory ? item.filename+'/' : item.filename;
           return (
             <a
               key={item.filepath}
               className="list-group-item"
               href={href}
             >
               {text}
             </a>
           );
         })}
      </div>
    );
  }
}

import data from './data.js';
import newData from './new-data.js';
const root = new BoxData(newData);

class DependencyTree extends Component {
  renderTree(tree) {
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
        .filter(m => getLevel(m) < this.state.maxLevel ||
                   !(isInnerModule(m) || isImportedByInnerModule(m)))
        .map(m => `${m} ${getLevel(m)} isInner: ${isInnerModule(m)} isImported: ${isImportedByInnerModule(m)}`)
    )
    console.log("tree is", tree);
    const modulesToRender = allModules
      .filter(m => isInnerModule(m) || isImportedByInnerModule(m))
      .filter(m => getLevel(m) < this.state.maxLevel);
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
    console.log("max level is", maxLevel, this.state.maxLevel);
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
      if (!this.state.usePhysics) {
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
          enabled: this.state.usePhysics,
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
        enabled: this.state.usePhysics,
        solver: 'hierarchicalRepulsion',
        hierarchicalRepulsion: {
          nodeDistance: 220,
        },
        stabilization: {
          enabled: this.state.usePhysics,
        },
      },
      groups: {
        out: {color: '#ccc'},
        in: {color: '#c5c'},
        root: {color: '#c55'},
        cycle: {color: 'red'},
      }
    };
    var network = new vis.Network(this.root, data, options);
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
            joinCondition: node => node[groupBy] == value,
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

  fetchAndRender = () => {
    if (this.state.showDeps) {
      this.setState({fetchingDeps: true});
      api.getDeps(this.state.path).then(
        deps => {
          this.setState({fetchingDeps: false});
          if (deps) {
            this.setState({deps});
          }
        }
      );
    }
  }

  state = {
    path: window.location.pathname.slice(1) || '.',
    fetchingDeps: false,
    showDeps: window.location.search.indexOf('showDeps=true') > 0,
    deps: null,
    maxLevel: 5,
    usePhysics: false,
  };

  goDeeper = () => this.setState({maxLevel: this.state.maxLevel + 1});
  goShallower = () => this.setState({maxLevel: this.state.maxLevel - 1});
  togglePhysics = () => this.setState({usePhysics: !this.state.usePhysics});

  componentDidMount() {
    this.fetchAndRender();
  }

  componentDidUpdate() {
    if (this.state.deps) {
      this.renderTree(this.state.deps.tree);
    }
  }

  render() {
    return (
      <div className="card" style={this.props.style}>
        <h3 className="card-header">Dependency Graph</h3>
        <div className="card-block">
          <div className="row">
            <div className="col-md-12">
              <PathBreadcrumbs path={this.state.path} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <DirectoryTree path={this.state.path}/>
            </div>
            <div className="col-md-9">
              {this.state.fetchingDeps && <span>Loading dependency tree...</span>}
              {!this.state.showDeps && (
                 <a href="?showDeps=true" className="btn btn-primary">
                   Show Dependencies for All Files in Directory
                 </a>
               )}
              {this.state.showDeps && this.state.deps &&
               <div>
                 {this.state.deps.skipped.length > 0 &&
                  <div>
                    <strong>WARNING:</strong> the following paths could not be resolved...
                    <ul>
                      {this.state.deps.skipped.map(path => <li>{path}</li>)}
                    </ul>
                  </div>
                 }
                 <div className="clearfix">
                   max depth: {this.state.maxLevel}
                   <div className="btn-group pull-md-right">
                     <button className="btn btn-secondary" onClick={this.goDeeper}>
                       go deeper
                     </button>
                     <button className="btn btn-secondary" onClick={this.goShallower}>
                       go shallower
                     </button>
                     <button className="btn btn-secondary" onClick={this.fetchAndRender}>
                       refresh
                     </button>
                     <button className="btn btn-secondary" onClick={this.togglePhysics}>
                       {this.state.usePhysics ? 'disable physics' : 'enable physics'}
                     </button>
                   </div>
                 </div>
                 <div
                   ref={el => this.root = el}
                   style={{
                     width: '100%',
                     height: 600,
                     border: '1px solid #ccc',
                     borderRadius: 5,
                     marginTop: 10,
                   }}
                 />
               </div>}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <nav className="navbar navbar-dark bg-inverse">
              <a className="navbar-brand" href="#">Unspaghetti</a>
            </nav>
          </div>
        </div>
        <DependencyTree style={{marginTop: 10}}/>
        <section style={{maxWidth: 500}}>
          <h1>code.org javascript architecture</h1>
          <p>
            Rules:
          </p>
          <ul>
            <li>Modules can import from any modules below them</li>
            <li>Modules cannot import from any module above them</li>
            <li>Modules cannot import from any module next to them</li>
            <li>Modules in the same box can import from each other</li>
            <li>Modules in the same box are located in the same folder on the filesystem</li>
          </ul>
          <p>
            Principles:
          </p>
          <ul>
            <li>
              The fewer the number of dependencies a module has, the farther down it
              should go in the stack of layers.
            </li>
            <li>
              Shared state should be "owned" by modules higher in the stack, and
              pushed down to modules lower in the stack which need to access that state.
            </li>
            <li>
              Modules that do similar things should be grouped together in the same box.
            </li>
            <li>
              The less a module is shared, the deeper in the filesystem hierarchy it
              should go. For example, utility functions that get used everywhere (like
              the kind you see in lodash), should be near the root of the filesystem.
              On the other hand, highly specialized utility functions, say for some
              applab-specific feature, should live inside the applab directory.
            </li>
          </ul>
          <p>
            The below diagram is what I get when I try to apply the above rules/principles
            to all the files and folders that are in the <code>apps/src</code> directory.
          </p>
        </section>
        <h2>Proposed hierarchy</h2>
        <Box data={root}/>
        <h2>Proposed filesystem structure</h2>
        <ul>
          <Folder data={root}/>
        </ul>
      </div>
    );
  }
}

export default App;
