#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-check

const logger = require('@docusaurus/logger').default;
const semver = require('semver');
const path = require('path');
const {program} = require('commander');
const {default: init} = require('../lib');
const requiredVersion = require('../package.json').engines.node;

if (!semver.satisfies(process.version, requiredVersion)) {
  logger.error('Minimum Node.js version not met :(');
  logger.info`You are using Node.js number=${process.version}, Requirement: Node.js number=${requiredVersion}.`;
  process.exit(1);
}

function wrapCommand(fn) {
  return (...args) =>
    fn(...args).catch((err) => {
      logger.error(err.stack);
      process.exitCode = 1;
    });
}

program.version(require('../package.json').version);

program
  .arguments('[siteName] [template] [rootDir]')
  .option('--use-npm', 'Use NPM as package manage even with Yarn installed')
  .option(
    '--skip-install',
    'Do not run package manager immediately after scaffolding',
  )
  .option('--typescript', 'Use the TypeScript template variant')
  .option(
    '--git-strategy <strategy>',
    `Only used if the template is a git repository.
\`deep\`: preserve full history
\`shallow\`: clone with --depth=1
\`copy\`: do a shallow clone, but do not create a git repo
\`custom\`: enter your custom git clone command. We will prompt you for it.`,
  )
  .description('Initialize website.')
  .action(
    (
      siteName,
      template,
      rootDir = '.',
      {useNpm, skipInstall, typescript, gitStrategy} = {},
    ) => {
      wrapCommand(init)(path.resolve(rootDir), siteName, template, {
        useNpm,
        skipInstall,
        typescript,
        gitStrategy,
      });
    },
  );

program.parse(process.argv);

if (!process.argv.slice(1).length) {
  program.outputHelp();
}
