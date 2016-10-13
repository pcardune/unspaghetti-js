import React, { Component } from 'react';
import DependencyViewer from './DependencyViewer';

class App extends Component {

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <nav className="navbar navbar-dark bg-inverse" style={{marginTop: 10}}>
              <a className="navbar-brand" href="#">Unspaghetti</a>
            </nav>
          </div>
        </div>
        <DependencyViewer style={{marginTop: 10}}/>
      </div>
    );
  }
}

export default App;
