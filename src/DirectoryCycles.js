import React, {Component, PropTypes} from 'react';
import Advice from './Advice';

class ExpandableList extends Component {
  state = {expanded: false};

  static propTypes = {
    items: PropTypes.array.isRequired,
    renderItem: PropTypes.func.isRequired,
    max: PropTypes.number,
  };

  static defaultProps = {max: 1};

  render() {
    let itemsToRender = this.props.items.slice(
      0,
      this.state.expanded ? undefined : Math.min(this.props.items.length, this.props.max)
    );
    return (
      <div className="list-group">
        {itemsToRender.map(this.props.renderItem)}
        {itemsToRender.length < this.props.items.length &&
         <button
           className="list-group-item list-group-item-action"
           onClick={() => this.setState({expanded: true})}
         >
           show {this.props.items.length - itemsToRender.length} more
         </button>
        }
      </div>
    );
  }
}

export default class DirectoryCycles extends Component {

  static propTypes = {
    processedTree: PropTypes.object.isRequired,
  };

  render() {
    const {dirpathCycles: cycles} = this.props.processedTree;
    let explanation = "Good job, there aren't any circular dependencies between directories!"
    if (cycles.length > 0) {
      explanation = `
        While these are not as bad as circular module dependencies (which break a lot of
        build systems), they do make for a very confusing directory structure.
        And in the event you take an individual directory and turn it into a standalone package,
        you will end up with circular package dependencies! Don't do this!
        `;
    }
    return (
      <Advice
        title={`${cycles.length} Circular Directory Dependencies`}
        explanation={explanation}
        failure={cycles.length > 0}>
        <div className="list-group">
          {cycles.map(cycle => (
             <div key={cycle.dirpathCycle.join(',')} className="list-group-item">
               {cycle.dirpathCycle.join(' → ')}
               <ExpandableList
                 items={Object.values(cycle.visitedModules)}
                 renderItem={(visitedModules) => (
                     <div key={visitedModules.join(',')} className="list-group-item">
                       {visitedModules.join(' → ')}
                     </div>
                   )}
               />
             </div>
           ))}
        </div>
      </Advice>
    )
  }
}
