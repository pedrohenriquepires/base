var gulp = require("gulp");
var sass = require("gulp-sass");
var minifyCss = require("gulp-minify-css");
var rename = require("gulp-rename");
var inject = require("gulp-inject");
var series = require("stream-series");
var angularFilesort = require('gulp-angular-filesort');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var paths = {
	index: "./app/index.html",
	appStyles: "./app/scss/app.scss",
	appScripts: "./app/js/**/*.js",
	appScriptsDist: "./dist/js/app.min.js",
	appStylesDist: "./dist/css/app.min.css",
	libStyles: [""],
	libScripts: [""],
	libScriptsDist: "./dist/js/libs.min.js",
	libStylesDist: "./dist/css/libs.min.css",
	appViews: "./app/views/*.html"
};

var pipes = {};

pipes.compileSass = function(done){
	gulp.src(paths.appStyles)
		.pipe(sass())
		.on("error", sass.logError)
		.pipe(minifyCss({ keepSpecialComments: 0 }))
		.pipe(rename({ extname: ".min.css" }))
		.pipe(gulp.dest("./dist/css/"))
		.on("end", done);
}

pipes.minifyLibStyles = function(done){
	if(paths.libStyles .length === 0)
		return;

	gulp.src(paths.libStyles)
		.pipe(concat('libs.css'))
		.pipe(minifyCss({ keepSpecialComments: 0 }))
		.pipe(rename({ basename: "libs", extname: ".min.css" }))
		.pipe(gulp.dest("./dist/css/"))
		.on("end", done);
}

pipes.compressAppScripts = function(){
	gulp.src(paths.appScripts)
		.pipe(angularFilesort())
		.pipe(concat('app.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest("./dist/js/"));
}

pipes.compressLibScripts = function(){
	if(paths.libScripts.length === 0)
		return;

	gulp.src(paths.libScripts)
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest("./dist/js/"));
}

pipes.copyViews = function(){
	gulp.src(paths.appViews)
		.pipe(gulp.dest("./dist/views/"));
}

pipes.indexInjector = function(){
	var appScripts = gulp.src(paths.appScriptsDist, {read: false});
	var libScripts = gulp.src(paths.libScriptsDist, {read: false});
	var appStyles  = gulp.src(paths.appStylesDist, {read: false});
	var libStyles  = gulp.src(paths.libStylesDist, {read: false});

	gulp.src(paths.index)
		.pipe(inject(series(appScripts, libScripts), {relative: true}))
		.pipe(inject(series(libStyles, appStyles), {relative: true}))
		.pipe(gulp.dest("./dist/"));
}


gulp.task("sass", pipes.compileSass)
	.task("compress-app", pipes.compressAppScripts)
	.task("compress-lib", pipes.compressLibScripts)
	.task("minify-lib-styles", pipes.minifyLibStyles)
	.task("copy-views", pipes.copyViews)
	.task("index-injector", ["sass", "compress-app", "compress-lib", "minify-lib-styles", "copy-views"], pipes.indexInjector);

gulp.task("default", [
	"sass",
	"compress-app", 
	"compress-lib", 
	"minify-lib-styles", 
	"copy-views",
	"index-injector"
]);

gulp.task('watch-sass', function() {
	gulp.watch(paths.sass, ['sass']);
});
