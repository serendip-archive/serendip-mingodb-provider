var gulp = require("gulp");
var ts = require("gulp-typescript");
var fs = require("fs-extra");
var mocha = require("gulp-mocha");

var paths = {
  dist: "dist",
  tsSources: "src/**/*.ts",
  tests: "dist/test/*.js"
};

// compile typescripts
function build() {
  if (fs.existsSync(paths.dist)) {
    fs.emptyDirSync(paths.dist);
  }

  return gulp
    .src(paths.tsSources)
    .pipe(ts({
      "skipLibCheck" : true
    }))
    .pipe(gulp.dest(paths.dist));
}

function test() {
  return gulp.src([paths.tests], { read: false }).pipe(
    mocha({
      reporter: "spec",
      exit: true
    })
  );
}

gulp.watch(paths.tsSources, gulp.series(build, test));

exports.test = gulp.series(build, test);
exports.build = gulp.series(build);

exports.default = gulp.series(build, test);

gulp.task("default", this.default);
