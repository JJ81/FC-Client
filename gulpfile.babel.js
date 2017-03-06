'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import uglify from 'gulp-uglify';
import cleanCSS from 'gulp-clean-css';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import del from 'del';

const DIR = {
  SRC: 'public',
  DEST: 'dist'
};

const SRC = {
  JS: DIR.SRC + '/javascripts/**/*.js',
  VENDOR: DIR.SRC + '/vendor/**/*.*',
  UPLOADS: DIR.SRC + '/uploads/**/*.*',
  CSS: DIR.SRC + '/stylesheets/*.css',
  HTML: DIR.SRC + '/*.html',
  IMAGES: DIR.SRC + '/images/**/*.*'
};

const DEST = {
  JS: DIR.DEST + '/javascripts',
  VENDOR: DIR.DEST + '/vendor',
  CSS: DIR.DEST + '/stylesheets',
  HTML: DIR.DEST + '/',
  IMAGES: DIR.DEST + '/images',
  FONTS: DIR.DEST + '/fonts'
};

gulp.task('js', () => {
  return gulp.src(SRC.JS, { base: './public/javascripts' })
          .pipe(uglify())
          .pipe(gulp.dest(DEST.JS));
});

// SRC.VENDOR, { base: './public/vendor' }
gulp.task('vendor', () => {
  return gulp.src([
    DIR.SRC + '/vendor/' + 'plugins/requirejs/require.2.3.2.js',
    DIR.SRC + '/vendor/' + 'plugins/jQuery/jquery-2.2.3.min.js',
    DIR.SRC + '/vendor/' + 'jquery-private.js',
    DIR.SRC + '/vendor/' + 'plugins/jquery_cookie/jquery.cookie.1.4.1.js',
    DIR.SRC + '/vendor/' + 'plugins/vimeo-player-js/dist/player.min.js',
    DIR.SRC + '/vendor/' + 'plugins/jquery_timer/jquery.timer.js'
  ])
  .pipe(uglify())
  .pipe(gulp.dest(DEST.VENDOR));
});

gulp.task('copy-font', () => {
  return gulp.src([
    DIR.SRC + '/vendor/' + 'font-awesome-4.7.0/fonts/*.*'
  ])
  .pipe(gulp.dest(DEST.FONTS));
});

gulp.task('copy-css', () => {
  return gulp.src([
    DIR.SRC + '/vendor/' + 'plugins/star-rating-svg/star-rating-svg.css',
    DIR.SRC + '/vendor/' + 'font-awesome-4.7.0/css/font-awesome.min.css'
  ])
  .pipe(cleanCSS({compatibility: 'ie8'}))
  .pipe(gulp.dest(DIR.DEST + '/stylesheets/'));
});

gulp.task('css', () => {
  return gulp.src(SRC.CSS)
          .pipe(cleanCSS({compatibility: 'ie8'}))
          .pipe(gulp.dest(DEST.CSS));
});

gulp.task('html', () => {
  return gulp.src(SRC.HTML)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(DEST.HTML));
});

gulp.task('images', () => {
  return gulp.src(SRC.IMAGES, { base: './public/images' })
        .pipe(imagemin())
        .pipe(gulp.dest(DEST.IMAGES));
});

gulp.task('clean', () => {
  return del.sync([DIR.DEST]);
});

gulp.task('watch', () => {
  let watcher = {
    js: gulp.watch(SRC.JS, ['js']),
    css: gulp.watch(SRC.CSS, ['css']),
    html: gulp.watch(SRC.HTML, ['html']),
    images: gulp.watch(SRC.IMAGES, ['images'])
  };

  let notify = (event) => {
    gutil.log('File', gutil.colors.yellow(event.path), 'was', gutil.colors.magenta(event.type));
  };

  for (let key in watcher) {
    watcher[key].on('change', notify);
  }
});

gulp.task('default', ['clean', 'js', 'vendor', 'copy-font', 'copy-css', 'css', 'html', 'images'], () => {
  gutil.log('Gulp task completed.');
});