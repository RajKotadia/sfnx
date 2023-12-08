import { Command } from 'commander';

import { execute } from './execute';
import { serve } from './serve';

const program = new Command();

// $ sfnx serve --asl-file "path/to/asl.json" -p "8083" -c "path/to/config.json"
program
	.command('serve')
	.description('Starts the step function server locally.')
	.requiredOption('--asl-file <PATH>', 'Path to the step function ASL file.')
	.option(
		'-p, --port <INTEGER>',
		'Port on which the server would be running.',
		'8083'
	)
	.option(
		'-c, --config-file <PATH>',
		'Path to the JSON file containing the configuration options for step functions.'
	)
	.action(serve);

// $ sfnx execute "StepFunctionName" -i "path/to/input.json"
program
	.command('execute')
	.description('Executes a given Step Function locally.')
	.argument('<StepFunction>', 'Name of the step function to be executed.')
	.option(
		'-i, --input-file <PATH>',
		'Path to the JSON file containing input to a step function.'
	)
	.action(execute);

export default program;
