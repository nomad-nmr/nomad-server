const CracoLessPlugin = require('craco-less')

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@layout-header-background': '#ffffff',
              '@layout-body-background': '#fff',
              '@layout-header-padding': '0px',
              '@menu-dark-bg': '#001529',
              '@border-radius-base': '4px',
              '@card-padding-base': '20px',
              // '@table-header-bg': '#f0f0f0',
              // '@table-border-color': '#d9d9d9',
              '@layout-sider-background-light': '#001529',
              '@layout-sider-background': '#001529',
              '@table-row-hover-bg': '#fffbe6',
              '@layout-header-height': '72px'
            },
            javascriptEnabled: true
          }
        }
      }
    }
  ]
}
