'use strict';

var gulp         = require('gulp');
var sass         = require('gulp-sass');
var rename       = require('gulp-rename');
var cssmin       = require('gulp-cssmin');
var jsmin        = require('gulp-jsmin');
var clean        = require('gulp-clean');
var concat       = require('gulp-concat');
var browserSync  = require('browser-sync');
var runSequence  = require('run-sequence');
var fileinclude  = require('gulp-html-extend');
var wait         = require('gulp-wait');
var babel        = require('gulp-babel');
var sourcemaps   = require('gulp-sourcemaps')


/********** THIS CODE DOES SOMETHING COOL BELOW *********/

gulp.task('includes', function() {
  return  gulp.src(['src/*.html'])
    .pipe(fileinclude({
      annotations: false,
      verbose: false
    }))
    .pipe(gulp.dest('build'))
});

gulp.task('clean-build', function()
{
	return gulp.src('./build', {read: false}).pipe(clean());
});

gulp.task('reload', function() {
  return browserSync.reload();
});


/********** COMPILE SASS TO CSS AND MOVE TO BUILD FOLDER THEN MINIFY CSS *********/

gulp.task('sass', function () {
    return gulp.src('src/sass/import.scss')
      .pipe(sourcemaps.init())
      .pipe(wait(500))
    	.pipe(sass().on('error', sass.logError))
    	.pipe(rename('pop.css'))
      .pipe(sourcemaps.write("."))
    	.pipe(gulp.dest('build/css'));
});

gulp.task('concat-styles', function() {
    return gulp.src([
      'node_modules/@fortawesome/fontawesome-free/css/brands.css',
      'node_modules/@fortawesome/fontawesome-free/css/regular.css',
      'node_modules/@fortawesome/fontawesome-free/css/solid.css',
      'node_modules/@fortawesome/fontawesome-free/css/fontawesome.css'
      ])
      .pipe(sourcemaps.init())
      .pipe(concat('pop.plugins.css'))
      .pipe(gulp.dest('build/css'));
});

gulp.task('cssmin', function () {
   return  gulp.src(['build/css/pop.css', 'build/css/pop.plugins.css'])
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/css'));
});

gulp.task('clean-css', function()
{
	return gulp.src(['build/css/pop.css', 'build/css/pop.plugins.css'], {read: false})
      .pipe(clean());
});

gulp.task('styles', function() {
  runSequence('sass', 'concat-styles', 'cssmin', 'reload');
});


/********** CONCAT JS, MINIFY AND DELETE THE UNMINIFIED THEN MOVE TO BUILD FOLDER **********/
gulp.task('concat-scripts', function() {
  	return gulp.src('src/js/*.js')
    	.pipe(concat('pop.js'))
    	.pipe(gulp.dest('build/js'));
});

gulp.task('jsmin', function () {
   	return  gulp.src('build/js/pop.js')
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/js'));
});

gulp.task('clean-js', function()
{
	return gulp.src('build/js/pop.js', {read: false}).pipe(clean());
});

gulp.task("babel", function () {
  return gulp.src("src/js/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .on('error', function(err) {
        console.log('[Compilation Error]');
        console.log(err.fileName + ( err.loc ? `( ${err.loc.line}, ${err.loc.column} ): ` : ': '));
        console.log('error Babel: ' + err.message + '\n');
        console.log(err.codeFrame);
        this.emit('end');
    })
    .pipe(concat("pop.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build/js"));
});

gulp.task('scripts', function() { //if you don't work with babel, just replace this task with 'concat-scripts'
  runSequence('babel', 'jsmin', 'reload');
});


/********** COPY IMG AND FONTS FILES FROM SRC TO BUILD **********/
gulp.task('copy-images', function() {
  return gulp.src('src/images/**').pipe(gulp.dest('build/images'));
});

gulp.task('copy-fontawesome', function() {
    return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/**').pipe(gulp.dest('build/webfonts'));
});

// Move the javascript files into our js folder
gulp.task('copy-js', function() {
    return gulp.src(['node_modules/datatables.net-bs4/js/dataTables.bootstrap4.js', 'node_modules/datatables.net/js/jquery.dataTables.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest("build/js"))
        .pipe(browserSync.stream());
});

gulp.task('copy', function() {
  runSequence('copy-images', 'copy-fontawesome', 'copy-js', 'reload');
});


/********** MAIN TASKS TO RUN **********/
gulp.task('serve', function() {
    browserSync({
        server: "build/"
    });

    gulp.watch('src/sass/*.scss', ['styles']);
    gulp.watch('src/js/*.js', ['scripts']);
    gulp.watch(['src/*.html', 'src/includes/*.html'], function(){ runSequence('includes', 'reload') });
    gulp.watch(['src/images/*'], ['copy-images']);
});

gulp.task('default', function()
{
  runSequence('build', 'serve');
});


gulp.task('build', function() {
  runSequence('clean-build', 'copy', 'styles', 'scripts', 'includes');
});
