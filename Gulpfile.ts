/// <reference types="gulp" />

const gulp = require('gulp');
const runSequence = require('run-sequence');
const gulpLoadPlugins = require('gulp-load-plugins');
const MochaLib = require('mocha');
const map = require('map-stream');

const plugins = gulpLoadPlugins();

// ----------------------------- GitHub Statuses ------------------------------
import { Repository, Statuses, StatusOptions } from 'commit-status-reporter';
const githubRepository = new Repository(
  'uProxy',
  'ShadowsocksConfig',
  plugins.util.env.GITHUB_TOKEN,
);
console.log('Reporting on commit:', plugins.util.env.COMMIT);
const githubCommit = githubRepository.commit(plugins.util.env.COMMIT);
// ----------------------------------------------------------------------------

const moduleCompatibilityHeader = `(function iife() {
  const platformExportObj = (function detectPlatformExportObj() {
    if (typeof module !== 'undefined' && module.exports) {
      return module.exports;  // node
    } else if (typeof window !== 'undefined') {
      return window;  // browser
    }
    throw new Error('Could not detect platform global object (no window or module.exports)');
  })();`;

const moduleCompatibilityFooter = `})();`;

gulp.task('build:lib', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json');

  return gulp.src([
      'shadowsocks_config.ts',
    ])
    // Handle source maps manually rather than having tsc generate them because we
    // modify the output of tsc.
    .pipe(plugins.sourcemaps.init())
    .pipe(tsProject())
    .once('error', function () {
      this.once('finish', () => process.exit(1))
    })
    .pipe(plugins.replace(
      'Object.defineProperty(exports, "__esModule", { value: true });',
      moduleCompatibilityHeader
    ))
    .pipe(plugins.replace(
      'exports.',
      'platformExportObj.'
    ))
    .pipe(plugins.insert.append(moduleCompatibilityFooter))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('.'));
});

gulp.task('build:tests', () => {
  const tsProject = plugins.typescript.createProject('tsconfig.json', {
    module: 'commonjs',
    moduleResolution: 'node',
  });
  return gulp.src([
      './test/unit/*.ts',
    ])
    .pipe(tsProject())
    .once('error', function () {
      this.once('finish', () => process.exit(1))
    })
    .js
    .pipe(gulp.dest('./test/unit'));
});

gulp.task('build', (done: any) => {
  runSequence(
    'build:lib',
    done
  );
});

gulp.task('test:unit', () => {
  
  const status = githubCommit.getStatus('Unit Tests');
  return status.report(Statuses.pending)
  .then(() => {
    return new Promise((resolve) => {
      const mocha = new MochaLib({reporter: 'list'});
      mocha.addFile('test/unit/mocha-runner.js');
      mocha.run((errorCount: number) => resolve(errorCount))
    });
  })
  .then((errorCount: number) => {
    const hasErrors = (errorCount > 0);
    const state = hasErrors ? Statuses.failure : Statuses.success;
    let description;
    if (hasErrors) {
      description = `${errorCount} failure${errorCount === 1 ? '' : 's'}`;
    } else {
      description = 'All tests passed, huzzah!';
    }
    return status.report(Statuses.success)
  });

});


gulp.task('tslint', () => {

  let errorCount = 0;
  const status = githubCommit.getStatus('TypeScript Code Style');
  return status.report(Statuses.pending)
    .then(() => {
      return gulp.src('shadowsocks_config.ts')
        .pipe(plugins.tslint({
          configuration: 'tslint.json',
          formatter: 'prose'
        }))
        .pipe(map((file, done) => {
          errorCount += file.tslint.errorCount;
          done(null, file);
        }))
        .pipe(plugins.tslint.report({
          emitError: false
        }));
    })
    .then(() => {
      const hasErrors = (errorCount > 0);
      const state = hasErrors ? Statuses.failure : Statuses.success;
      const description = hasErrors ? `failed with ${errorCount} errors` : '';
      return status.report(state, description);
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

gulp.task('default', ['build:lib']);

gulp.task('travis', (done: any) => {
  runSequence(
    'tslint',
    'test',
    done
  );
});
