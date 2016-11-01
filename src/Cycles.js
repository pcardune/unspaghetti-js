import React, {Component, PropTypes} from 'react';
import Advice from './Advice';

export default class Cycles extends Component {

  static propTypes = {
    processedTree: PropTypes.object.isRequired,
  };

  render() {
    const {cycles} = this.props.processedTree;
    let explanation = "Good job, there aren't any circular dependencies between modules in the dependency graph!"
    if (cycles.length > 0) {
      explanation = "Get rid of circular dependencies in the module dependency graph."
    }
    return (
      <Advice
        title="Circular Module Dependencies"
        explanation={explanation}
        failure={cycles.length > 0}>
        <div className="list-group">
          {cycles.map(cycle => (
             <div className="list-group-item">
               {cycle.join(' → ')}
             </div>
           ))}
        </div>
      </Advice>
    )
  }
}
