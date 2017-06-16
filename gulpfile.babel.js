var gulp = require('gulp');
var gls = require('gulp-live-server');
var connect = require('gulp-connect');
var server;
// Include plugins
var plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
  replaceString: /\bgulp[\-.]/
});

var dest = 'dist';
var client = 'client';
var serverDir = 'server';
var commandCenterDest = dest + "/public/command-center";
var commandCenterSrc = client + "/command-center";
var loginDest = dest + "/public/login";
var loginSrc = client + "/login";
var modulesSrc = client + "/modules";
var serverDest = dest + "/server";


gulp.task('bowerjs', function() {
  gulp.src(plugins.mainBowerFiles({
    paths: {
      bowerDirectory: './bower_components',
      bowerJson: 'bower.json'
    }
  }))
    .pipe(plugins.filter('**/*.js'))
    .pipe(plugins.concat('main.js'))
    //.pipe(plugins.uglify({mangle:false}))
    .pipe(gulp.dest(dest + '/public/js'))
});

gulp.task('bowercss', function() {
  gulp.src(plugins.mainBowerFiles({
    paths: {
      bowerDirectory: './bower_components',
      bowerJson: 'bower.json'
    }
  }))
    .pipe(plugins.filter('**/*.css'))
    .pipe(plugins.concat('main.css'))
    .pipe(gulp.dest(dest + '/public/css'))
  ;
});

gulp.task('lib', function(){
  gulp.src(commandCenterSrc + '/lib/js/*.js')
    .pipe(plugins.concat('lib.js'))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(commandCenterDest + '/lib'));
  gulp.src(commandCenterSrc + '/lib/css/*.js')
    .pipe(plugins.concat('lib.css'))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(commandCenterDest + '/lib'));
});

gulp.task('img', function(){
  gulp.src([commandCenterSrc + '/images/*'])
    .pipe(gulp.dest(commandCenterDest + '/images'));
});

gulp.task('css', function(){
  gulp.src([commandCenterSrc + '/css/*'])
    .pipe(gulp.dest(commandCenterDest + '/css'));
});

gulp.task('full-clean', function(){
  gulp.src(dest)
    .pipe(plugins.clean())
});

gulp.task('lint', function(){
  gulp.src([commandCenterSrc + '/app/*.js', commandCenterSrc + '/app/**/*.js'])
    .pipe(plugins.jslint())
    .pipe(plugins.jslint.reporter( 'stylish' ))
});

gulp.task('hint', function(){
  gulp.src([commandCenterSrc + '/app/*.js', commandCenterSrc + '/app/**/*.js'])
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter( 'default' ))
});

gulp.task('command-center', function(){
  gulp.src([commandCenterSrc + '/command-center.app.js',
    commandCenterSrc + '/command-center.routes.js',
    commandCenterSrc + '/services/*/js',
    commandCenterSrc + '/app/**/*.js',
    commandCenterSrc + '/app/admin/**/*.js'])
    .pipe(plugins.concat('command-center.js'))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(commandCenterDest + '/js'));
  gulp.src([commandCenterSrc + '/**/*.html', commandCenterSrc + 'index.html'] )
    .pipe(gulp.dest(commandCenterDest));
});

gulp.task('login', function(){
  gulp.src([loginSrc + '/login.app.js',
    loginSrc + '/login.routes.js',
    loginSrc + '/services/*/js',
    loginSrc + '/app/**/*.js'])
    .pipe(plugins.concat('login.js'))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(loginDest + '/js'));
  gulp.src([loginSrc + '/**/*.html', loginSrc + 'index.html'] )
    .pipe(gulp.dest(loginDest));
});

gulp.task('application', ['command-center', 'login']);

gulp.task('modules', function(){
  gulp.src([modulesSrc + '/**/*.js'])
    .pipe(plugins.concat('modules.js'))
    .pipe(plugins.uglify({mangle: false}))
    .pipe(gulp.dest(dest + '/public/js'));
});

gulp.task('server', function(){
  gulp.src([serverDir + '/**/*.js'])
    .pipe(plugins.babel())
    .pipe(gulp.dest(serverDest));
  gulp.src(['index.js'])
    .pipe(gulp.dest(dest))
});

gulp.task('app', function(){
  gulp.src(['src/app.js'])
    .pipe(gulp.dest('dist'))
});

gulp.task('packages', function () {
  gulp.src('package.json')
    .pipe(gulp.dest(dest));
  gulp.src('procfile')
    .pipe(gulp.dest(dest));
});

gulp.task('build', ['server', 'packages'], function(){


});

gulp.task('full-build', ['build', 'bowerjs', 'bowercss']);

gulp.task('webserver', function() {
  return server.start();
});

gulp.task('default', function(){
  gulp.run('server');
  if(server){
    server.stop();
  }
  else
  {
    server = gls.new( dest + '/index.js');
  }
  gulp.run('webserver');

});
