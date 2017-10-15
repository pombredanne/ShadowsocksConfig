/// <reference types="gulp" />
/// <reference types="es6-promise" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const MochaLib = require('mocha');

const plugins = gulpLoadPlugins();

gulp.task('compile:lib', () => {
  return gulp.src('ShadowSocksConfig.ts')
    .pipe(plugins.typescript({
      target: 'es6',
      module: 'none',
      declaration: true
    }))
    .pipe(plugins.replace(
      'Object.defineProperty(exports, "__esModule", { value: true });',
      [
        'if (typeof exports === "undefined") {',
        '  var exports = {};',
        '}',
        'Object.defineProperty(exports, "__esModule", { value: true });'
      ].join('\n')
    ))
    .pipe(gulp.dest('.'));
});

gulp.task('compile:test', () => {
  return gulp.src([
    './test/unit/*.ts'
  ])
  .pipe(plugins.typescript({
    target: 'es6',
    module: 'none'
  }))
  .pipe(gulp.dest('./test/unit'));
})

gulp.task('default', [
  'compile:lib'
]);

gulp.task('test', (done) => {
  runSequence(
    'compile:test',
    'compile:lib',
    'test:unit',
    done
  )
});

gulp.task('test:unit', () => {

  return new Promise<number>((resolve) => {
    let runner = new MochaLib({reporter: 'list'});
    runner.addFile('test/unit/mocha-runner.js');
    runner.run((failureCount) => resolve(failureCount))
  });

});
