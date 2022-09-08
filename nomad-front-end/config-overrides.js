const { override, fixBabelImports, addLessLoader } = require('customize-cra')

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css'
  })
  //   addLessLoader({
  //     javascriptEnabled: true,
  //     modifyVars: {
  //       '@layout-header-background': '#ffffff',
  //       '@layout-body-background': '#fff',
  //       '@layout-header-padding': '0px',
  //       '@menu-dark-bg': '#001529',
  //       '@border-radius-base': '4px',
  //       '@card-padding-base': '20px',
  //       '@table-header-bg': '#f0f0f0',
  //       '@layout-sider-background-light': '#001529',
  //       '@layout-sider-background': '#001529',
  //       '@table-row-hover-bg': '#fffbe6'
  //     }
  //   })
)
