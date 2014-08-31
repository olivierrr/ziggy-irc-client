var gulp = require('gulp'),
    rimraf = require('gulp-rimraf'),
    sass = require('gulp-ruby-sass')

gulp.task('clean', function() {
    return gulp.src('./assets/css').pipe(rimraf({force: true }))
})

gulp.task('styles', function() {
    return gulp.src('./assets/sass/ziggy.scss')
        .pipe(sass({ style: 'expanded', require: ['bourbon'], loadPath: './assets/sass/ziggy.scss' }))
        .pipe(gulp.dest('./assets/css'))
})

gulp.task('default', ['clean', 'styles'])