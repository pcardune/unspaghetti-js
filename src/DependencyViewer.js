import React, { Component } from 'react';
import {Link, withRouter} from 'react-router';
import * as api from './api';
import PathBreadcrumbs from './PathBreadcrumbs';
import DirectoryTree from './DirectoryTree';
import renderTree from './renderTree';

export default withRouter(
  class DependencyTree extends Component {

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
      this.props.router.listen(location => {
        this.setState(
          {
            path: location.pathname.slice(1) || '.',
            showDeps: location.search.indexOf('showDeps=true') > 0,
          },
          () => this.fetchAndRender()
        );
      });
      this.fetchAndRender();
    }

    componentDidUpdate() {
      if (this.state.deps) {
        renderTree(
          this.state.deps.tree,
          this.root,
          {
            maxLevel: this.state.maxLevel,
            usePhysics: this.state.usePhysics,
          }
        );
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
                   <Link to={`/${this.state.path}?showDeps=true`} className="btn btn-primary">
                     Show Dependencies for All Files in Directory
                   </Link>
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
  });
