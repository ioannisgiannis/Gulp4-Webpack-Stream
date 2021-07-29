const { src, dest, parallel, series, watch } = require('gulp')
const clean = require('gulp-clean')
const sourcemaps = require('gulp-sourcemaps')
const sass = require('gulp-sass')(require('sass'))
const nunjucksRender = require('gulp-nunjucks-render')
const plumber = require('gulp-plumber')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const bundles = require('./gulp.bundles')
const merge = require('merge-stream')
const imagemin = require('gulp-imagemin')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const cssnano = require('cssnano')
const autoprefixer = require('autoprefixer')
const stringReplace = require('gulp-string-replace')
// webpack
const webpack = require('webpack-stream')
const webpackConfig = require('./webpack.config.js')

const renderTemplates = {
  path: './src/html/modules',
  watch: false,
  envOptions: {
    tags: {
      blockStart: '<%',
      blockEnd: '%>',
      variableStart: '{@',
      variableEnd: '@}',
      commentStart: '{#',
      commentEnd: '#}',
    },
  },
}

const htmlDev = () => {
  return src('./src/html/pages/*.htm')
    .pipe(
      nunjucksRender(renderTemplates).on('error', function (err) {
        console.error(err)
        this.emit('end')
      })
    )
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })
    .pipe(dest('./public/html'))
    .on('end', function () {
      console.log('Html rendering process completed!')
    })
}

const htmlBuild = () => {
  var timestamp = new Date().getTime()

  return (
    src('./src/html/pages/*.htm')
      // .pipe(stripBom())
      .pipe(
        nunjucksRender(renderTemplates).on('error', function (err) {
          console.error(err)
          this.emit('end')
        })
      )
      // .pipe(stripBom())
      .on('error', function (err) {
        console.error(err)
        this.emit('end')
      })

      .pipe(stringReplace('upfold.css', `upfold.min.css?t=${timestamp}`))
      .pipe(stringReplace('main.css', `main.min.css?t=${timestamp}`))
      .pipe(stringReplace('vendors.js', `vendors.min.js?t=${timestamp}`))
      .pipe(stringReplace('main.js', `main.min.js?t=${timestamp}`))
      .pipe(stringReplace('<div class="e-device-detector"></div>', ''))
      .pipe(dest('./public/html'))
      .on('end', function () {
        console.log('Html rendering process completed!')
      })
  )
}

const clear = () => {
  return src('./public/*', {
    read: false,
  }).pipe(clean())
}

const imagesDev = () => {
  return src('./src/imgs/**/**').pipe(dest('./public/imgs'))
}

const imagesBuild = () => {
  return src('./src/imgs/**/**')
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 95, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo(),
      ])
    )
    .pipe(dest('./public/imgs'))
}

const fonts = () => {
  return src('./src/fonts/**/**').pipe(dest('./public/fonts'))
}

const static = () => {
  return src('./src/static/**/**').pipe(dest('./public/static'))
}

const stylesDev = () => {
  return src('./src/scss/*.scss')
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(plumber())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(dest('./public/css/'))
}

const stylesBuild = () => {
  return src('./src/scss/*.scss')
    .pipe(plumber())
    .pipe(
      sass({
        outputStyle: 'expanded',
      })
    )
    .pipe(rename({ suffix: '.min' }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest('./public/css/'))
}

const scriptsDev = () => {
  process.env.BUILD_MODE = 'development'

  let tasks = bundles.js.map(function (obj) {
    return src(obj.src)
      .pipe(concat(`${obj.bundleName}.js`))
      .pipe(dest('./public/js'))
  })

  return merge(tasks)
}

const scriptsBuild = () => {
  process.env.BUILD_MODE = 'production'

  let tasks = bundles.js.map(function (obj) {
    return src(obj.src)
      .pipe(concat(`${obj.bundleName}.js`))
      .pipe(uglify())
      .pipe(rename({ suffix: '.min' }))
      .pipe(dest('./public/js'))
  })

  return merge(tasks)
}

const scriptsVueDev = () => {
  webpackConfig.mode = 'development'
  webpackConfig.watch = true

  return src('./src/js/vue/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(dest('./public/js'))
}

const scriptsVueBuild = () => {
  webpackConfig.mode = 'production'

  return src('./src/js/vue/index.js')
    .pipe(webpack(webpackConfig))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest('./public/js'))
}

const mockServer = () => {
  return src('./src/static/json/**/**').pipe(dest('./src/mockServer'))
}

// BrowserSync
const serve = (cb) => {
  browserSync.init({
    codeSync: true,
    server: {
      baseDir: './public',
      directory: true,
    },
  })
  cb()
}

// BrowserSync Reload
const reload = (cb) => {
  browserSync.reload()
  cb()
}

const watchFiles = (cb) => {
  watch('./src/scss/**/**', series(stylesDev, reload))
  watch('./src/js/**/**', series(scriptsDev, reload))
  watch('./src/html/**/**', series(htmlDev, reload))
  watch('./src/imgs/**/**', imagesDev)
  watch('./src/fonts/**/**', fonts)
  watch('./src/static/**/**', static)
  watch('./src/static/json/**/**', mockServer)
  cb()
}

// Tasks to define the execution of the functions simultaneously or in series
exports.serve = serve
exports.dev = parallel(
  serve,
  htmlDev,
  scriptsDev,
  scriptsVueDev,
  stylesDev,
  imagesDev,
  fonts,
  static,
  mockServer,
  watchFiles
)
exports.build = series(
  clear,
  parallel(
    htmlBuild,
    scriptsBuild,
    scriptsVueBuild,
    stylesBuild,
    imagesBuild,
    fonts,
    static,
    mockServer
  )
)
