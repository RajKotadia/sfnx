import path from 'node:path';

import { DockerController } from '../lib/docker';
import { StepFunctionController } from '../lib/stepFunction';
import { fileExists } from '../utils';

type InvokeOptions = {
	/*
	 * ASL file path which contains the Step Function definition
	 * must be a valid json file
	 */
	aslFile: string;
	/*
	 * Port on which the Step Function server would be running.
	 */
	port: string;
	/*
	 * Path to the input file for the Step Function
	 * must be a valid json file
	 */
	inputFile?: string;
	/*
	 * Path to the config file containing the configuration options for Step Function.
	 * Currently only supports 'LAMBDA_PORT' config property
	 * must be a valid json file
	 */
	configFile?: string;
};

/**
 * The invoke command locally invokes the Step function based on given input and provided config
 *
 * @param options - The command-line options for the invoke command
 */
export const invoke = async (options: InvokeOptions) => {
	let dockerController: DockerController | null = null;
	let containerId: string | undefined = undefined;

	try {
		const currentWorkingDir = process.cwd();

		const aslFilePath = path.join(currentWorkingDir, options.aslFile);
		await fileExists(aslFilePath);

		const inputFilePath = options.inputFile
			? path.join(currentWorkingDir, options.inputFile)
			: undefined;
		if (inputFilePath) {
			await fileExists(inputFilePath);
		}

		const configFilePath = options.configFile
			? path.join(currentWorkingDir, options.configFile)
			: undefined;
		if (configFilePath) {
			await fileExists(configFilePath);
		}

		// spin up the server
		dockerController = new DockerController();
		containerId = await dockerController.startContainer(
			options.port,
			configFilePath
		);

		setTimeout(async () => {
			// execute the step function
			const sfController = new StepFunctionController(options.port);
			await sfController.main(aslFilePath, inputFilePath, async () => {
				await dockerController!.cleanUpContainer(containerId!);
			});
		}, 3000);
	} catch (error: any) {
		console.error(error.message);
		await dockerController!.cleanUpContainer(containerId!);
		process.exit(1);
	}
};
