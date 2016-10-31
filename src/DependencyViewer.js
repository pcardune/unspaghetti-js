import React, { Component } from 'react';
import {Link, withRouter} from 'react-router';
import queryString from 'query-string';
import * as api from './api';
import PathBreadcrumbs from './PathBreadcrumbs';
import DirectoryTree from './DirectoryTree';
import DependencyGraph from './DependencyGraph';
import processTree from './processTree';

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
      maxLevel: 5,
      usePhysics: false,
      cluster: false,
      processedTree: null,
    };

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
          this.setState({
            processedTree: processTree(
              this.state.deps.tree,
              {
                maxLevel: this.state.maxLevel,
                usePhysics: this.state.usePhysics,
                cluster: this.state.cluster,
              }
            )
          });
        }
      }
    }

    render() {
      return (
        <div style={this.props.style}>
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
                   <button className="btn btn-secondary" onClick={this.forceFetchAndRender}>
                     refresh
                   </button>
                   {this.state.processedTree &&
                    <DependencyGraph
                      path={this.state.path}
                      deps={this.state.deps}
                      maxLevel={this.state.maxLevel}
                      usePhysics={this.state.usePhysics}
                      cluster={this.state.cluster}
                      processedTree={this.state.processedTree}
                    />}
                 </div>}
            </div>
          </div>
        </div>
      );
    }
  });
