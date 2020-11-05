'use strict'

var gulp = require('gulp');
var nunjucks = require('gulp-nunjucks');
var sass = require('gulp-sass');
var browsersync = require('browser-sync');
var del = require('del');
var reload = browsersync.reload;
var changed = require('gulp-changed');

var imagemin = require('gulp-imagemin');
var webpp = require('gulp-webp');


var path = {
  src: {
    html: 'src/*.html',
    styles: 'src/styles/*.scss',
    images: 'src/img/*.{jpg,JPG,jpeg,png,webp,svg}'
  },
  build: {
    html: 'build/',
    styles: 'build/css/',
    images: 'build/img/'
  },
  watch: {
    html: 'src/**/*.html',
    styles: 'src/styles/**/*.scss',
    images: 'src/img/**/*.{jpg,JPG,jpeg,png,webp,svg}'
  },
  base: './build'
};

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: path.base
    },
    port: 3000
  });
  done();
};

function clean() {
  return del(path.base);
};

function html() {
  return gulp
    .src(path.src.html)
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
};

function styles() {
  return gulp
    .src(path.src.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.build.styles))
    .pipe(reload({ stream: true }));
};

function images() {
  return gulp
    .src(path.src.images)
    .pipe(changed(path.build.images))
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
    ]))
    .pipe(gulp.dest(path.build.images))
    .pipe(webpp())
    .pipe(gulp.dest(path.build.images))
    .pipe(reload({ stream: true }));
};

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.styles], styles);
  gulp.watch([path.watch.images], images)
};

gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('img', images);

gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, images)));
gulp.task('watch', gulp.parallel(watchFiles, browserSync));
