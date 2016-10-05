export default {
  path: 'apps/src',
  layers: [
    // init layer
    [
      {
        path: 'entry-points/',
        layers: [
          [
            {
              path: 'level-types/',
              layers: [
                [
                  {
                    originalPath: './maze/main.js',
                    path: 'maze-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './turtle/main.js',
                    path: 'turtle-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './bounce/main.js',
                    path: 'bounce-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './flappy/main.js',
                    path: 'flappy-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './studio/main.js',
                    path: 'studio-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './jigsaw/main.js',
                    path: 'jigsaw-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './calc/main.js',
                    path: 'calc-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './applab/main.js',
                    path: 'applab-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './eval/main.js',
                    path: 'eval-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './netsim/main.js',
                    path: 'netsim-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './craft/main.js',
                    path: 'craft-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './gamelab/main.js',
                    path: 'gamelab-level.js',
                    isEntryPoint: true,
                  },
                  {
                    originalPath: './weblab/main.js',
                    path: 'weblab-level.js',
                    isEntryPoint: true,
                  },
                ],
              ],
            },
          ],
        ],
      },
      {
        path:'init/',
        layers: [
          [
            {originalPath: './StudioApp.js'},
            {originalPath: './tutorialExplorer/'},
          ],
          [
            {
              paths: [
                {originalPath: './appMain.js'},
                {originalPath: './blocksCommon.js'},
                {originalPath: './shareWarnings.js'},
                {originalPath: './skins.js'},
              ]
            },
            {
              originalPath: './redux.js',
            }
          ],
        ],
      },
    ],
    // toolkits layer
    [
      {
        path: 'toolkits/',
        layers: [
          [
            {originalPath: './publicKeyCryptography/'},
            {originalPath: './applab/'},
            {originalPath: './bounce/'},
            {originalPath: './calc/'},
            {originalPath: './craft/'},
            {originalPath: './eval/'},
            {originalPath: './flappy/'},
            {originalPath: './gamelab/'},
            {originalPath: './jigsaw/'},
            {originalPath: './maze/'},
            {originalPath: './netsim/'},
            {originalPath: './studio/'},
            {originalPath: './turtle/'},
            {originalPath: './weblab/'},
            {originalPath: './makerlab/'},
          ],
          [
            {originalPath: './redux/'},
          ]
        ]
      },
      {
        originalPath: './code-studio/',
        layers: [
          [
            {originalPath: './blockTooltips/'},
          ]
        ]
      },
    ],
    [
      {
        path: 'tools/',
        layers: [
          [
            {originalPath: './Sounds.js'},
            {
              path: 'js-interpreter/',
              layers: [[
                {
                  paths: [
                    {originalPath: './codegen.js'},
                    {originalPath: './JSInterpreter.js'},
                    {originalPath: './JsInterpreterLogger.js'},
                  ]
                }
              ]]
            },
            {originalPath: './assetManagement/'},
            {
              path: 'authoredHints/',
              layers: [
                [
                  {paths: [
                    {originalPath: './authoredHints.js'},
                    {originalPath: './authoredHintUtils.js'},
                  ]}
                ]
              ]
            },
            {originalPath: './clientApi.js'},
            {originalPath: './MusicController.js'},
            {
              path:'feedback/',
              layers: [
                [
                  {
                    paths: [
                      {originalPath: './feedback.js'},
                      {originalPath: './feedbackBlocks.js'}
                    ]
                  }
                ]
              ]
            }
          ]
        ],
      },
    ],
    [
      {originalPath: './templates', path: 'ui-components/'},
      {
        path: 'util/',
        layers: [
          [
            {
              path: 'blocks',
              layers: [
                [
                  {
                    paths:[
                      {originalPath: './sharedFunctionalBlocks.js'},
                      {originalPath:'./block_utils.js'},
                      {originalPath:'./required_block_utils.js'},
                    ]
                  },
                ]
              ]
            },
            {
              paths: [
                {originalPath:'./CommandHistory.js'},
                {originalPath:'./consoleApi.js'},
                {originalPath:'./dom.js'},
                {originalPath:'./dropletUtils.js'},
                {originalPath:'./xml.js'},
                {originalPath:'./imageUtils.js'},
                {originalPath:'./level_base.js'},
                {originalPath:'./logToCloud.js'},
                {originalPath:'./ObservableEvent.js'},
                {originalPath:'./Observer.js'},
                {originalPath:'./propTypes.js'},
                {originalPath:'./puzzleRatingUtils.js'},
                {originalPath:'./RunLoop.js'},
                {originalPath:'./StylelessRenderer.js'},
                {originalPath:'./timeoutList.js'},
                {originalPath:'./utils.js'},
              ]
            },
            {originalPath: './acemode/'},
          ]
        ]
      },
    ],
    [
      {paths:[
        {path: 'color.js'},
        {path: 'commonStyles.js'},
        {path: 'styleConstants.js'},
        {path: 'constants.js'},
      ]},
      {
        path:'third-party/',
        layers: [
          [
            {originalPath: './canvg/'},
            {originalPath: './hammer.js'},
            {originalPath: './ResizeSensor.js'},
            {originalPath: './slider.js'},
          ]
        ]
      },
    ]
  ]
}
