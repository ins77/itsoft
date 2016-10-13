'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var del = require('del');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var server = require('browser-sync');
var notify = require('gulp-notify');
var runSequence = require('run-sequence');
var fs = require('fs');
var foldero = require('foldero');
var path = require('path');
var gulpIf = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');

var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var assets = require('postcss-assets');
var mqpacker = require('css-mqpacker');
var flexboxfixer = require('postcss-flexboxfixer')
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var reporter = require('postcss-reporter');
var syntax_scss = require('postcss-scss');
var stylelint = require('stylelint');

var pug = require('gulp-pug');

var uglify = require('gulp-uglify');
var svg_sprite = require('gulp-svg-sprite');
var imagemin = require('gulp-imagemin')

var spritesmith = require('gulp.spritesmith-multi');

var argv = require('minimist')(process.argv.slice(2));
var isOnProduction = !!argv.production;
// var isOnProduction = !argv.production;
var buildPath = isOnProduction ? 'build' : 'tmp';
var srcPath = 'src';
var dataPath = path.join(srcPath, 'pug/_data/');
var ghPages = require('gulp-gh-pages');

/*
  --- JADE ---
*/

gulp.task('pug', function() {
  // var siteData = {};
  // if (fs.existsSync(dataPath)) {
  //   siteData = foldero(dataPath, {
  //     recurse: true,
  //     whitelist: '(.*/)*.+\.(json)$',
  //     loader: function loadAsString(file) {
  //       var json = {};
  //       try {
  //         json = JSON.parse(fs.readFileSync(file, 'utf8'));
  //       } catch (e) {
  //         console.log('Error Parsing JSON file: ' + file);
  //         console.log('==== Details Below ====');
  //         console.log(e);
  //       }
  //       return json;
  //     }
  //   });
  // }

  return gulp.src('_pages/*.pug', {cwd: path.join(srcPath, 'pug')})
    .pipe(plumber({
      errorHandler: notify.onError('Error:  <%= error.message %>')
    }))
    .pipe(pug({
      locals: {
        site: {
          // data: siteData
        }
      },
      pretty: true
    }))
    .pipe(gulp.dest(path.join(buildPath)))
    .pipe(notify({
      message: 'Pug: <%= file.relative %>',
      sound: 'Pop'
    }));
});


/*
  --- JS ---
*/

gulp.task('js', function() {
  gulp.src(['lib/jquery-2.2.4.js', 'lib/**', 'modules/**', 'app.js'], {cwd: path.join(srcPath, 'js')})
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')))
    .pipe(uglify())
    .pipe(rename('script.min.js'))
    .pipe(gulp.dest(path.join(buildPath, 'js')))
    .pipe(notify({
      message: 'JS: <%= file.relative %>',
      sound: 'Pop'
    }))
});


/*
  --- IMG ---
*/

gulp.task('img', function() {
  gulp.src(['!svg-sprite', '!svg-sprite/**', '!inline', '!inline/**', '!sprites', '!sprites/**', '**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')})
    .pipe(imagemin({
      progressive: true}))
    .pipe(gulp.dest(path.join(buildPath, 'img')))
});


/*
  --- SPRITES ---
*/

var spritesDirPath = 'src/img/sprites';
var imgPath = '../img/sprites/';
// var tmplName = 'scss_retina.template.handlebars';
// var tmplPath = './node_modules/spritesheet-templates/lib/templates/';
// var cssTemplate = tmplPath + tmplName;
var cssTemplate = 'scss_retina.template.handlebars';

gulp.task('sprites', function() {
  var spriteData = gulp.src(['src/img/sprites/**/*.png', '!src/img/sprites/*.png'])
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(spritesmith({
      spritesmith(options) {
        options.imgPath = imgPath + options.imgName;
        options.retinaImgPath = imgPath + options.retinaImgName;
        options.cssName = options.cssName.replace(/\.css$/, '.scss');
        options.cssFormat = 'scss';
        options.cssTemplate = cssTemplate;
        options.algorithm = 'binary-tree';
        options.padding = 8;

        return options;
      }
    }));

  spriteData.img.pipe(gulp.dest(path.join(buildPath, 'img/sprites')));
  spriteData.css.pipe(gulp.dest('src/sass/_global/sprites'));
  // var imgStream = spriteData.img.pipe(path.join(buildPath, 'images/sprites'));
  // var styleStream = spriteData.css.pipe(gulp.dest('src/sass/global/sprites'));
  //
  // return merge(imgStream, styleStream);
});



/*
  --- SVG ---
*/

gulp.task('svg', function() {
  return gulp.src('svg-sprite/*.svg', {cwd: path.join(srcPath, 'img')})
    .pipe(svg_sprite({
      mode: {
        symbol: {
          dest: '.',
          dimensions: '%s',
          sprite: path.join(buildPath, 'img/svg-sprite.svg'),
          example: false,
          render: {
            scss: {
              dest: path.join(srcPath, 'sass/_global/svg-sprite.scss'),
            }
          }
        }
      },
      svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false
      }
    }))
    .pipe(gulp.dest('./'))
});


/*
  --- FONT ---
*/

gulp.task('font', function() {
  gulp.src('**/*{woff,woff2,ttf}', {cwd: path.join(srcPath, 'fonts')})
    .pipe(gulp.dest(path.join(buildPath, 'fonts')))
});


/*
  --- STYLETEST ---
*/

gulp.task('styletest', function() {
  var processors = [
    stylelint(),
    reporter({
      throwError: true
    })
  ];

  return gulp.src(['!_global/svg-sprite.scss', '!_global/sprites/*.scss', '**/*.scss'], {cwd: path.join(srcPath, 'sass')})
    .pipe(plumber())
    .pipe(postcss(processors, {
      syntax: syntax_scss
    }))
});


/*
  --- STYLE ---
*/

gulp.task('style', function() {
  gulp.src('style.scss', {cwd: path.join(srcPath, 'sass')})
    .pipe(plumber({
      errorHandler: notify.onError('Error:  <%= error.message %>')
    }))
    .pipe(gulpIf(!isOnProduction, sourcemaps.init()))
    .pipe(sass())
    .pipe(postcss([
      mqpacker,
      flexboxfixer,
      autoprefixer({
        browsers: [
          'last 4 version',
          'last 4 Chrome versions',
          'last 4 Firefox versions',
          'last 4 Opera versions',
          'last 4 Edge versions'
        ]
      }),
      assets({
        loadPaths: [path.join(srcPath, 'img')]
      })
      // cssnano({
      //   safe: true
      // })
    ]))
    // .pipe(rename('style.min.css'))
    .pipe(gulpIf(!isOnProduction, sourcemaps.write()))
    .pipe(gulp.dest(path.join(buildPath, 'css')))

    .pipe(server.stream({match: '**/*.css'}))
    .pipe(notify({
      message: 'Style: <%= file.relative %>',
      sound: 'Pop'
    }));
});


/*
  --- DEL ---
*/


gulp.task('del', function() {
  return del([path.join(buildPath), path.join(srcPath, 'sass/_global/svg-sprite.scss'), path.join(srcPath, 'sass/_global/sprites')]).then(paths => {
    console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});

/*
  --- SERVE ---
*/

gulp.task('serve', function() {
  server.init({
    server: {
      baseDir: buildPath
    },
    notify: true,
    open: false,
    ui: false
  });
});

/*
  --- BUILD ---
*/

gulp.task('build', ['del'], function (callback) {
  runSequence(
    'svg',
    'sprites',
    'img',
    ['pug', 'js', 'font'],
    'style',
    callback);
})

/*
  --- DEPLOY ---
*/

gulp.task('deploy', function() {
  return gulp.src('**/*.*', {cwd: path.join(buildPath)})
    .pipe(ghPages());
});

/*
  --- DEFAULT ---
*/

var allTasks = ['build'];
if (!isOnProduction) {
  allTasks.push('serve');
}

gulp.task('default', allTasks, function() {
  if (!isOnProduction) {
    gulp.watch('**/*.js', {cwd: path.join(srcPath, 'js')}, ['js', server.reload]);
    gulp.watch('sprites/**/*.{jpg,png}', {cwd: path.join(srcPath, 'img')}, ['sprites', server.reload]);
    gulp.watch('svg-sprite/*.svg', {cwd: path.join(srcPath, 'img')}, ['svg', server.reload]);
    gulp.watch(['!svg-sprite', '!svg-sprite/**', '!inline', '!inline/**', '**/*.{jpg,png,svg}'], {cwd: path.join(srcPath, 'img')}, ['img', server.reload]);
    gulp.watch('**/*{ttf,woff,woff2}', {cwd: path.join(srcPath, 'fonts')}, ['font', server.reload]);
    gulp.watch('**/*.scss', {cwd: path.join(srcPath, 'sass')}, ['style', server.stream]);
    gulp.watch('**/*.*', {cwd: path.join(srcPath, 'pug')}, ['pug', server.reload]);
  }
});
