import React, { Component } from 'react';
import {Link, withRouter} from 'react-router';
import * as api from './api';
import PathBreadcrumbs from './PathBreadcrumbs';
import DirectoryTree from './DirectoryTree';
import renderTree from './renderTree';
import queryString from 'query-string';

export default withRouter(
  class DependencyViewer extends Component {

    fetchAndRender = (force) => {
      if (this.state.showDeps) {
        if (!force && this.state.path === this.state.fetchedPath) {
          // no-op, we already fetched this path.
          return;
        }
        this.setState({fetchingDeps: true});
        api.getDeps(this.state.path).then(
          deps => {
            this.setState({
              fetchingDeps: false,
              fetchedPath: this.state.path,
            });
            if (deps) {
              this.setState({deps});
            }
          }
        );
      }
    }
    forceFetchAndRender = () => this.fetchAndRender(true);

    state = {
      path: window.location.pathname.slice(1) || '.',
      fetchingDeps: false,
      showDeps: window.location.search.indexOf('showDeps=true') > 0,
      deps: null,
      groups: null,
      maxLevel: 5,
      usePhysics: false,
      cluster: false,
    };

    goDeeper = () => this.setState({maxLevel: this.state.maxLevel + 1});
    goShallower = () => this.setState({maxLevel: this.state.maxLevel - 1});
    togglePhysics = () => this.setState({usePhysics: !this.state.usePhysics});

    getUrl(query={}) {
      query = Object.assign({
        showDeps: this.state.showDeps,
        maxLevel: this.state.maxLevel,
        usePhysics: this.state.usePhysics,
        cluster: this.state.cluster,
      }, query);
      for (let key in query) {
        if (!query[key]) {
          delete query[key];
        }
      }
      return `/${this.state.path}?${queryString.stringify(query)}`;
    }

    componentDidMount() {
      this.props.router.listen(location => {
        const query = queryString.parse(location.search);
        const path = location.pathname.slice(1) || '.';
        this.setState(
          {
            path,
            showDeps: query.showDeps !== undefined,
            maxLevel: query.maxLevel ? parseInt(query.maxLevel, 10) : 5,
            usePhysics: query.usePhysics !== undefined,
            cluster: query.cluster !== undefined,
          },
          () => this.fetchAndRender()
        );
      });
      this.fetchAndRender();
    }

    componentDidUpdate(prevProps, prevState) {
      if (
        this.state.deps !== prevState.deps ||
        this.state.maxLevel !== prevState.maxLevel ||
        this.state.usePhysics !== prevState.usePhysics ||
        this.state.cluster !== prevState.cluster
      ) {
        if (this.state.deps) {
          let groups = renderTree(
            this.state.deps.tree,
            this.root,
            {
              maxLevel: this.state.maxLevel,
              usePhysics: this.state.usePhysics,
              cluster: this.state.cluster,
            }
          );
          this.setState({groups});
        }
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
                      {this.state.deps.skipped.map(path => <li key={path}>{path}</li>)}
                    </ul>
                  </div>
                 }
                 <div className="clearfix">
                   max depth: {this.state.maxLevel}
                   <div className="btn-group pull-md-right">
                     <Link
                       className="btn btn-secondary"
                       to={this.getUrl({cluster: !this.state.cluster})}
                     >
                       {this.state.cluster ? 'uncluster' : 'cluster'}
                     </Link>
                     <Link
                       className="btn btn-secondary"
                       to={this.getUrl({maxLevel: this.state.maxLevel + 1})}
                     >
                       go deeper
                     </Link>
                     <Link
                       className="btn btn-secondary"
                       to={this.getUrl({maxLevel: this.state.maxLevel - 1})}
                     >
                       go shallower
                     </Link>
                     <button className="btn btn-secondary" onClick={this.forceFetchAndRender}>
                       refresh
                     </button>
                     <Link
                       className="btn btn-secondary"
                       to={this.getUrl({usePhysics: !this.state.usePhysics})}
                     >
                       {this.state.usePhysics ? 'disable physics' : 'enable physics'}
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
                 {this.state.groups &&
                  Object.keys(this.state.groups).map(group => (
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
                        backgroundColor: this.state.groups[group].color,
                        padding: 5,
                        borderRadius: 25,
                        marginRight: 5,
                      }}/>
                      {group}
                    </div>
                  ))}
               </div>}
              </div>
            </div>
          </div>
        </div>
      );
    }
  });
