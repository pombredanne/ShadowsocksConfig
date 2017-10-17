/// <reference types="gulp" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const MochaLib = require('mocha');

const plugins = gulpLoadPlugins();

gulp.task('build:lib', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(tsProject())
    .js
    .pipe(gulp.dest('.'));
});

gulp.task('build:tests', () => {
  return gulp.src([
      './ShadowsocksConfig.ts',
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
    'build:tests',
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
    'build:tests',
    'test:unit',
    done
  );
});

gulp.task('default', [
  'build:lib',
]);

