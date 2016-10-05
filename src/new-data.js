export default {
  path: 'apps/src',
  layers: [
    [{path: 'sites/', layers: [[
      {path: 'code-studio/', layers: [
        [{path:'pages/', layers:[[
          {path: 'applab-page.js'},
          {path: 'gamelab-page.js'},
          {path: 'weblab-page.js'},
          {path: 'maze-page.js'},
        ]]}],
        [{path:'init/', layers: [[
          {path: 'redux.js'},
          {path: 'constants.js'},
        ]]}],
      ]},
      {path: 'org/'}]]}],
    [
      {
        path: 'lib/',
        layers: [
          [{
            path: 'kits/',
            layers: [[
              {path: 'applab/'},
              {path: 'gamelab/'},
              {path: 'weblab/'},
              {path: 'maze/'},
            ]]
          }],
          [{path: 'tools/', layers:[[
            {path: 'feedback/'},
            {path: 'instructions/'},
          ]]}],
          [{path: 'ui/'}],
          [{path: 'util/'}],
          [{path: 'third-party/'}],
        ]
      }
    ],
  ]
}
