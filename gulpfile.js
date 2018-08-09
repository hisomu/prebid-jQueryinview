var browserSync = require('browser-sync').create();
var del = require('del');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var sequence = require('run-sequence');
var uglify = require('gulp-uglify');
var csso = require('gulp-csso');

/**
**  Dev tasks
**/

gulp.task('dev:browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'src'
    },
  })
});

gulp.task('dev', ['dev:browserSync'], function () {
  // Reload files
  gulp.watch(['./src/*.html', './src/js/**/*.js', './src/css/**/*.css'], browserSync.reload);
});

/**
**  Prod tasks
**/

gulp.task('prod:browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
  })
});


gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('min:css', function () {
  return gulp.src('src/css/*.css')
    .pipe(csso())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('min:js', function () {
  return gulp.src('src/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('minify', function () {
  sequence('html', 'min:css', 'min:js');
});

gulp.task('clean', function () {
  return del.sync('dist');
});

gulp.task('build', function () {
  sequence('clean', 'minify');
});

// This task will minify/concat CSS and JS and serve in localhost.
gulp.task('default', function () {
  sequence('build', 'prod:browserSync')
});