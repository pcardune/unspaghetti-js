import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import queryString from 'query-string';
import vis from 'vis';

export default class DependencyGraph extends Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
    deps: PropTypes.object.isRequired,
    maxLevel: PropTypes.number.isRequired,
    usePhysics: PropTypes.bool.isRequired,
    cluster: PropTypes.bool.isRequired,
    processedTree: PropTypes.object.isRequired,
  };

  goDeeper = () => this.setState({maxLevel: this.props.maxLevel + 1});
  goShallower = () => this.setState({maxLevel: this.props.maxLevel - 1});
  togglePhysics = () => this.setState({usePhysics: !this.props.usePhysics});

  getUrl(query={}) {
    query = Object.assign({
      showDeps: true,
      maxLevel: this.props.maxLevel,
      usePhysics: this.props.usePhysics,
      cluster: this.props.cluster,
    }, query);
    for (let key in query) {
      if (!query[key]) {
        delete query[key];
      }
    }
    return `/${this.props.path}?${queryString.stringify(query)}`;
  }

  renderTree() {
    let {data, options, directories, clusterDirpath} = this.props.processedTree;

    var network = new vis.Network(this.root, data, options);

    network.on("selectNode", ({nodes}) => {
      if (nodes.length === 1) {
      }
    });

    network.on('doubleClick', (params) => {
      const {nodes} = params;
      if (nodes.length === 1) {
        const nodeId = nodes[0];
        if (network.isCluster(nodeId)) {
          network.openCluster(nodeId);
        } else {
          clusterDirpath(data.nodes.get(nodeId).dirpath, network);
        }
      }
    });

    if (this.props.cluster) {
      Object.keys(directories)
            .forEach((d) => clusterDirpath(d, network));
    }
    network.fit();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.processedTree !== this.props.processedTree) {
      this.renderTree();
    }
  }

  componentDidMount() {
    this.renderTree();
  }

  render() {
    return (
      <div className="card">
        <div className="card-header">
          Dependency Graph
        </div>
        <div className="card-block">
          <div className="clearfix">
            max depth: {this.props.maxLevel}
            <div className="btn-group pull-md-right">
              <Link
                className="btn btn-secondary"
                to={this.getUrl({cluster: !this.props.cluster})}
              >
                {this.props.cluster ? 'uncluster' : 'cluster'}
              </Link>
              <Link
                className="btn btn-secondary"
                to={this.getUrl({maxLevel: this.props.maxLevel + 1})}
              >
                go deeper
              </Link>
              <Link
                className="btn btn-secondary"
                to={this.getUrl({maxLevel: this.props.maxLevel - 1})}
              >
                go shallower
              </Link>
              <Link
                className="btn btn-secondary"
                to={this.getUrl({usePhysics: !this.props.usePhysics})}
              >
                {this.props.usePhysics ? 'disable physics' : 'enable physics'}
              </Link>
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
          {Object.keys(this.props.processedTree.options.groups).map(group => (
             <div
               style={{
                 display: 'flex',
                 alignItems: 'center',
               }}
               key={group}
             >
               <span style={{
                 display: 'inline-block',
                 width: 20,
                 height: 20,
                 backgroundColor: this.props.processedTree.options.groups[group].color,
                 padding: 5,
                 borderRadius: 25,
                 marginRight: 5,
               }}/>
               {group}
             </div>
           ))}
        </div>
      </div>
    )
  }
}
