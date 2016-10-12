import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router';
import * as api from './api';

export default class DirectoryTree extends Component {

  static propTypes = {
    path: PropTypes.string.isRequired,
  };

  state = {
    files: null,
    fetching: true,
  };

  fetchFiles = () => {
    this.setState({fetching: true});
    api.getFiles(this.props.path).then(
      files => this.setState({files, fetching: false})
    );
  };

  componentDidMount() {
    this.fetchFiles();
  }

  componentDidUpdate(prevProps) {
    if (this.props.path !== prevProps.path) {
      this.fetchFiles();
    }
  }

  render() {
    if (!this.state.files && this.state.fetching) {
      return <span>Loading...</span>;
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
      <div
        className="list-group"
        style={this.state.fetching ? {opacity: 0.5} : {}}
      >
        {files.map(item => {
           if (lastPathPart === item.filename) {
             return <Link key={item.filepath} to="#" className="list-group-item active">{item.filename}</Link>;
           }
           const pathURL = '/'+item.filepath;
           const href = item.isDirectory ? pathURL : pathURL+'?showDeps=true';
           const text = item.isDirectory ? item.filename+'/' : item.filename;
           return (
             <Link
               key={item.filepath}
               className="list-group-item"
               to={href}
             >
               {text}
             </Link>
           );
         })}
      </div>
    );
  }
}
