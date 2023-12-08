#!/usr/bin/env node

import packageJson from '../package.json';
import program from './commands';

program
	.name('sfnx')
	.description('A CLI tool to execute AWS Step Functions locally')
	.version(packageJson.version, '-v, --version');

program.parse(process.argv);
