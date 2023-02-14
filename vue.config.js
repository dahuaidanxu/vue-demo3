const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    // proxy: 'http://58.213.124.101:38088/'
    open: true,
    port:8080,
    https:false,
    proxy: {
      '/testAPI': {
        target: 'http://222.92.63.221:38088/',
        changeOrigin: true,
        pathRewrite: {
          '^/testAPI': ''
        }
      }
    }
  }
})
