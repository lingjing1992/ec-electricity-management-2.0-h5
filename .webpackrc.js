const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
      proxy:{
        "/api": {
          "target": "http://dev-ecmc.batmobi.net/",
          // "target": "http://test-ecmc.batmobi.net/",
          // "target": "http://merchant.pearlgo.com/",
          "changeOrigin": true,
          "secure": false
        }
      }
    },
  },
  externals: {
    '@antv/data-set': 'DataSet',
    rollbar: 'rollbar',
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableDynamicImport: false,
  publicPath: '/',
  hash: true,
};
