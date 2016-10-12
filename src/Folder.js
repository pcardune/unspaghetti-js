import React, {Component} from 'react';

export default class Folder extends Component {
  render() {
    const {data} = this.props;
    const paths = data.paths;
    paths.sort((a, b) => a.path.toLowerCase() < b.path.toLowerCase() ? -1 : 1);
    return (
      <li>
        {paths.map(pathData => (
           <div key={pathData.path}>
             {pathData.path}
           </div>
         ))}
       {data.layers.map((boxes, index) => (
          <ul key={index}>
            {boxes.map((boxData, index) => <Folder key={index} data={boxData}/>)}
          </ul>
        ))}
      </li>
    );
  }
}
