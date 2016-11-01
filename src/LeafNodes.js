import React, {Component, PropTypes} from 'react';
import {getModuleDirpath} from './util';
import Advice from './Advice';

export default class LeafNodes extends Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
    deps: PropTypes.object.isRequired,
    processedTree: PropTypes.object.isRequired,
  };

  render() {
    const leafNodes = [];
    Object.keys(this.props.deps.tree).forEach(moduleName => {
      if (this.props.deps.tree[moduleName].length === 0) {
        // this is a leaf node
        if (getModuleDirpath(this.props.path).endsWith(getModuleDirpath(moduleName))) {
          leafNodes.push(moduleName);
        }
      }
    });
    let explanation = `Good job, there aren't any leaf nodes in the top level directory!`
    if (leafNodes.length > 0) {
      explanation = `Consider moving modules with no dependencies into a "util" directory
      since they probably don't do a whole lot.`
    }
    return (
      <Advice
        title={`Leaf Nodes in ${this.props.path}`}
        explanation={explanation}
        failure={leafNodes.length > 0}
      >
        <div className="list-group">
          {leafNodes.map(module => (
             <div key={module} className="list-group-item">
               {module}
             </div>
           ))}
        </div>
      </Advice>
    );
  }
}
