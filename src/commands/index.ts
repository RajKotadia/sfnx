import { Command } from 'commander';

import { invoke } from './invoke';

const program = new Command();

// sfnx invoke -p "8083" -c "path/to/config.json" --asl-file "path/to/asl.json" -i "path/to/input.json"
program
	.command('invoke')
	.description('Locally invoke the step function')
	.requiredOption('--asl-file <PATH>', 'Path to the step function ASL file.')
	.option(
		'-i, --input-file <PATH>',
		'Path to the JSON file containing input to a step function.'
	)
	.option(
		'-p, --port <INTEGER>',
		'Port on which the step function server would be running.',
		'8083'
	)
	.option(
		'-c, --config-file <PATH>',
		'Path to the JSON file containing the configuration options for step function.'
	)
	.action(invoke);

export default program;
