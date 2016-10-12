import React, { Component } from 'react';

class Layer extends Component {
  render() {
    const style = {
      display: 'flex',
      margin: 5,
      overflow: 'scroll',
    };
    const {boxes} = this.props;
    boxes.sort((a, b) => {
      if (a.paths.length > 0 && b.paths.length > 0) {
        let aPath = a.paths[0].path.toLowerCase();
        let bPath = b.paths[0].path.toLowerCase();
        if (aPath < bPath) { return -1; }
        if (aPath > bPath) { return 1; }
        return 0;
      }
      return 0;
    })
    return (
      <div style={style}>
        {boxes.map((boxData, index) => <Box key={index} data={boxData}/>)}
      </div>
    );
  }
}

export default class Box extends Component {
  state = {
    expanded: true,
  }
  handleClick = (event) => {
    this.setState({expanded: !this.state.expanded});
    event.stopPropagation();
  }
  render() {
    const {data} = this.props;
    const style = {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: 'rgba(0,0,0,0.5)',
      padding: 5,
      margin: 5,
      borderRadius: 5,
      backgroundColor: 'rgba(0,0,0,0.1)'
    };
    if (data.isEntryPoint) {
      style.backgroundColor = 'yellow';
    }
    if (data.layers.length > 0) {
      style.borderWidth = 3;
      style.cursor = 'pointer';
    }
    const layerStyle = {display: 'none'};
    if (this.state.expanded) {
      layerStyle.display = 'block';
    }
    const paths = data.paths;
    paths.sort((a, b) => a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1);
    return (
      <div style={style} onClick={this.handleClick}>
        {paths.map(pathData => (
           <span
             key={pathData.path}
             style={{display: 'block'}}
             title={pathData.originalPath}
           >
             {pathData.path}
           </span>
         ))}
        <div style={layerStyle}>
          {data.layers.map((boxes, index) => <Layer key={index} boxes={boxes}/>)}
        </div>
      </div>
    );
  }
}
