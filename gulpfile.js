"use strict";

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    htmlreplace = require('gulp-html-replace'),
    cssmin = require('gulp-cssmin');

gulp.task("concatScripts", gulp.series([],function () {
    return gulp.src([
            'assets/js/vendor/jquery-3.4.1.min.js',
            'assets/js/vendor/popper.min.js',
            'assets/js/vendor/bootstrap.min.js'
        ])
        .pipe(maps.init())
        .pipe(concat('main.js'))
        .pipe(maps.write('./'))
        .pipe(gulp.dest('assets/js'))
        .pipe(browserSync.stream());
}));

gulp.task("minifyScripts", gulp.series(["concatScripts"], function () {
    return gulp.src("assets/js/main.js")
        .pipe(uglify())
        .pipe(rename('main.min.js'))
        .pipe(gulp.dest('dist/assets/js'));
}));

gulp.task('compileSass', gulp.series([],function () {
    return gulp.src("assets/css/main.scss")
        .pipe(maps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('assets/css'))
        .pipe(browserSync.stream());
}));

gulp.task("minifyCss", gulp.series(["compileSass"], function () {
    return gulp.src("assets/css/main.css")
        .pipe(cssmin())
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('dist/assets/css'));
}));

gulp.task('watchFiles', gulp.series([],function () {
    gulp.watch('assets/css/**/*.scss', gulp.series('compileSass'));
    gulp.watch('assets/js/*.js', gulp.series('concatScripts'));
}))

gulp.task('browser-sync', gulp.series([],function () {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
}));

gulp.task('clean', gulp.series([],function () {
    return new Promise((resolve,reject) => {
      del(['dist', 'assets/css/main.css*', 'assets/js/main*.js*']);
      resolve()
    })
}));

gulp.task('renameSources', gulp.series([],function () {
    return gulp.src(['dist/*.html'])
      .pipe(htmlreplace({
        'js': 'assets/js/main.min.js',
        'css': 'assets/css/main.min.css'
      }))
      .pipe(gulp.dest('dist'));
}));

gulp.task("build", gulp.series(['minifyScripts', 'minifyCss'], function () {
    return gulp.src(['*.html', '*.php', 'favicon.ico',
            "assets/img/**", "assets/fonts/**", "assets/js/scripts.js"
        ], {
            base: './'
        })
        .pipe(gulp.dest('dist'));
}));

gulp.task("default", gulp.series(["clean", 'build'], function () {
    return new Promise((resolve,reject) => {
      gulp.src(['*.html'])
        .pipe(htmlreplace({
          'js': 'assets/js/main.min.js',
          'css': 'assets/css/main.min.css'
        }))
        .pipe(gulp.dest('dist'));
      resolve()
    })
}));

gulp.task('serve', gulp.series(['compileSass','concatScripts'], function () {

    browserSync.init({
        server: "./"
    });

    gulp.watch('assets/css/**/*.scss', gulp.series('compileSass'));
    gulp.watch('assets/js/*.js', gulp.series('concatScripts'));
    gulp.watch(['*.html', '*.php']).on('change', browserSync.reload);
}));
