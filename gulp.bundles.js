module.exports = {
  js: [
    {
      src: [
        './src/js/vendors/vendor1.js',
        './src/js/vendors/vendor2.js',
        './src/js/vendors/vendor3.js',
        // process.env.BUILD_MODE === 'production'
        //   ? './src/js/vue/_lib/vue.v2.6.10.min.js'
        //   : './src/js/vue/_lib/vue.v2.6.10.js',
      ],
      bundleName: 'vendors',
    },
    {
      src: ['./src/js/main/main1.js', './src/js/main/main2.js'],
      bundleName: 'main',
    },
  ],
}
