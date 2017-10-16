/// <reference types="gulp" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const MochaLib = require('mocha');

const plugins = gulpLoadPlugins();

gulp.task('build:lib', () => {
  return gulp.src([
    'ShadowsocksConfig.ts',
    'ShadowsocksConfigHTMLElement.ts',  // FIXME: not included?
  ]).pipe(plugins.typescript({
    target: 'es6',
    module: 'none',
    sourceMap: true,
    lib: ['es6', 'dom'],
    declaration: true,
  }))
  .pipe(plugins.replace(
    'Object.defineProperty(exports, "__esModule", { value: true });',
    `if (typeof exports === "undefined") {
      var exports = {};
    }
    Object.defineProperty(exports, "__esModule", { value: true });`
  ))
  .pipe(gulp.dest('.'));
});

gulp.task('build:test', () => {
  return gulp.src([
    './test/unit/*.ts',
  ])
  .pipe(plugins.typescript({
    target: 'es6',
    module: 'none',
    sourceMap: true,
  }))
  .pipe(gulp.dest('./test/unit'));
})

gulp.task('build', (done) => {
  // TODO: stop if e.g. build:lib fails, don't continue to build:test
  runSequence(
    'build:lib',
    'build:test',
    done
  );
});

gulp.task('default', [
  'build:lib',
]);

gulp.task('test', (done) => {
  // TODO: stop if e.g. build:lib fails, don't continue to build:test
  runSequence(
    'build:lib',
    'build:test',
    'test:unit',
    done
  );
});

gulp.task('test:unit', () => {
  return new Promise<number>((resolve) => {
    const runner = new MochaLib({reporter: 'list'});
    runner.addFile('test/unit/mocha-runner.js');
    runner.run((failureCount) => resolve(failureCount))
  });
});
