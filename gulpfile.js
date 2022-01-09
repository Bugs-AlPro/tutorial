import gulp from 'gulp';
import nunjucks from 'gulp-nunjucks';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import browsersync from 'browser-sync';
import del from 'del';
const reload = browsersync.reload;
import clone from 'gulp-clone';
const sink = clone.sink();
import changed from 'gulp-changed';
import webp from 'gulp-webp';
import imagemin from 'gulp-imagemin';
import svgSprite from 'gulp-svg-sprite';
import cheerio from 'gulp-cheerio';


var path = {
  src: {
    html: 'src/*.html',
    styles: 'src/styles/*.scss',
    images: 'src/img/*.{jpg,jpeg,png,webp,svg}',
    js: 'src/js/*.js',
    font: 'src/fonts/*.{woff,woff2,ttf}',
    video: 'src/video/*.{mp4,ogv,webm}',
    svgcolor: 'src/img/svgcolor/*.svg',
    svg: 'src/img/svg/*.svg'
  },
  build: {
    html: 'build/',
    styles: 'build/css/',
    images: 'build/img/',
    js: 'build/js/',
    font: 'build/fonts/',
    video: 'build/video/',
    svgcolor: 'build/img/svgcolor/',
    svg: 'build/img/svg'
  },
  watch: {
    html: 'src/**/*.html',
    styles: 'src/styles/**/*.scss',
    js: 'src/js/*.js',
    video: 'src/video/*.{mp4,ogv,webm}',
    images: 'src/img/**/*.{jpg,jpeg,png,webp,svg}',
    svgcolor: 'src/img/svgcolor/*.svg',
    svg: 'src/img/svg/*.svg'
  },
  base: './build'
};

export const browserSync = (done) => {
  browsersync.init({
    server: {
      baseDir: path.base
    },
    port: 3000
  });
  done();
};

export const clean = () => {
  return del(path.base);
};

export const html = () => {
  return gulp
    .src(path.src.html)
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
};

export const styles = () => {
  return gulp
    .src(path.src.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.build.styles))
    .pipe(reload({ stream: true }));
};

export const js = () => {
  return gulp
    .src(path.src.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
};

export const font = () => {
  return gulp
    .src(path.src.font)
    .pipe(gulp.dest(path.build.font))
    .pipe(reload({ stream: true }));
};

export const video = () => {
  return gulp
    .src(path.src.video)
    .pipe(gulp.dest(path.build.video))
    .pipe(reload({ stream: true }));
};

export const images = () => {
  return gulp
    .src(path.src.images)
    .pipe(changed(path.build.images))
    .pipe(sink)
    .pipe(webp())
    .pipe(sink.tap())
    .pipe(imagemin())
    .pipe(gulp.dest(path.build.images))
    .pipe(reload({ stream: true }));
};

export const svg = () => {
  return gulp
    .src(path.src.svg)
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite-black.svg"
        }
      }
    }))
    .pipe(gulp.dest(path.build.svg))
    .pipe(reload({ stream: true }));
};

export const svgcolor = () => {
  return gulp
    .src(path.src.svgcolor)
    .pipe(imagemin())
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../sprite-color.svg"
          // example: true
        }
      }
    }))
    .pipe(gulp.dest(path.build.svg))
    .pipe(reload({ stream: true }));
};

export const watchFiles = () => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.styles], styles);
  gulp.watch([path.watch.images], images);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.video], video);
  gulp.watch([path.watch.svgcolor], svgcolor);
  gulp.watch([path.watch.svg], svg)
};

export const build = gulp.series(clean, gulp.parallel(html, styles, images, js, font, video, svgcolor, svg));
export const watch = gulp.parallel(watchFiles, browserSync);
