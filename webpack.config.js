const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  output: {
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
    plugins: [new VueLoaderPlugin()],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js'
        },
    },
}
