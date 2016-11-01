import React, {Component, PropTypes} from 'react';

export default class Advice extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    explanation: PropTypes.node,
    children: PropTypes.node,
    failure: PropTypes.bool.isRequired,
  };

  render() {
    const cssClass = this.props.failure ? 'card-outline-danger' : 'card-outline-success';
    return (
      <div className={`card ${cssClass}`}>
        <div className="card-block">
          <h4 className="card-title">{this.props.title}</h4>
          <p className="card-text">
            {this.props.explanation}
          </p>
          {this.props.children}
        </div>
      </div>
    )
  }
}
