import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router';

export default class PathBreadcrumbs extends Component {
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
                <Link to={'/'+pathParts.slice(0, index+1).join('/')}>{part}</Link>}
             </li>
           );
         })}
      </ol>
    );
  }
}
