import React, { Component } from 'react';
import Folder from './Folder';
import Box from './Box';
import newData from './new-data.js';
import BoxData from './BoxData';
import DependencyViewer from './DependencyViewer';

const root = new BoxData(newData);

class App extends Component {

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <nav className="navbar navbar-dark bg-inverse">
              <a className="navbar-brand" href="#">Unspaghetti</a>
            </nav>
          </div>
        </div>
        <DependencyViewer style={{marginTop: 10}}/>
        <section style={{maxWidth: 500}}>
          <h1>code.org javascript architecture</h1>
          <p>
            Rules:
          </p>
          <ul>
            <li>Modules can import from any modules below them</li>
            <li>Modules cannot import from any module above them</li>
            <li>Modules cannot import from any module next to them</li>
            <li>Modules in the same box can import from each other</li>
            <li>Modules in the same box are located in the same folder on the filesystem</li>
          </ul>
          <p>
            Principles:
          </p>
          <ul>
            <li>
              The fewer the number of dependencies a module has, the farther down it
              should go in the stack of layers.
            </li>
            <li>
              Shared state should be "owned" by modules higher in the stack, and
              pushed down to modules lower in the stack which need to access that state.
            </li>
            <li>
              Modules that do similar things should be grouped together in the same box.
            </li>
            <li>
              The less a module is shared, the deeper in the filesystem hierarchy it
              should go. For example, utility functions that get used everywhere (like
              the kind you see in lodash), should be near the root of the filesystem.
              On the other hand, highly specialized utility functions, say for some
              applab-specific feature, should live inside the applab directory.
            </li>
          </ul>
          <p>
            The below diagram is what I get when I try to apply the above rules/principles
            to all the files and folders that are in the <code>apps/src</code> directory.
          </p>
        </section>
        <h2>Proposed hierarchy</h2>
        <Box data={root}/>
        <h2>Proposed filesystem structure</h2>
        <ul>
          <Folder data={root}/>
        </ul>
      </div>
    );
  }
}

export default App;
