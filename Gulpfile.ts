/// <reference types="gulp" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const MochaLib = require('mocha');

const plugins = gulpLoadPlugins();

const moduleCompatibilityHeader = `(function() {
const isNode = (typeof module !== 'undefined'); 
const _module_exports = (function() {
    if (isNode) {
        return  module.exports;
    } else if (typeof window !== 'undefined') {
        return window;
    }
    throw new Error('Import failed: incompatible import interface');
})();`;

const moduleCompatibilityFooter = `})();`;

gulp.task('build:lib', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json');

  return gulp.src([
      '*.ts',
      '!*.d.ts'
    ])
    .pipe(plugins.sourcemaps.init())
    .pipe(tsProject())
    // .pipe(plugins.replace(
    //   'Object.defineProperty(exports, "__esModule", { value: true });',
    //   [
    //     'if (typeof exports === "undefined") { var exports = {}; }',
    //     'Object.defineProperty(exports, "__esModule", { value: true });'
    //   ].join('\n')
    // ))
    .pipe(plugins.replace(
      'Object.defineProperty(exports, "__esModule", { value: true });',
      moduleCompatibilityHeader
    ))
    .pipe(plugins.replace(
      /^exports\./,
      '_module_exports'
    ))
    .pipe(plugins.insert.append(moduleCompatibilityFooter))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('build:tests', () => {
  return gulp.src([
      './test/unit/*.ts',
    ])
    .pipe(plugins.typescript({
      target: 'ES6',
      module: 'commonjs',
      moduleResolution: 'node',
      isolatedModules: true,
      allowJs: true,
      noImplicitAny: true,
      noImplicitThis: true,
      removeComments: true,
      rootDir: '.',
      outDir: './test/unit',
    }))
    .pipe(gulp.dest('./test/unit'));
});

gulp.task('build', (done: any) => {
  runSequence(
    'build:lib',
    done
  );
});

gulp.task('test:unit', () => {
  return new Promise<number>((resolve) => {
    const runner = new MochaLib({reporter: 'list'});
    runner.addFile('test/unit/mocha-runner.js');
    runner.run((failureCount: number) => resolve(failureCount))
  });
});

gulp.task('test', (done: any) => {
  runSequence(
    'build:lib',
    'build:tests',
    'test:unit',
    done
  );
});

gulp.task('default', [
  'build:lib',
]);

