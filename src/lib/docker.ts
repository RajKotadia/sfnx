import fs from 'node:fs/promises';

import Docker from 'dockerode';

import { TContainerEnvConfig } from '../types';

export class DockerController {
	private dockerInstance: Docker;

	constructor() {
		this.dockerInstance = new Docker();
	}

	/**
	 * Creates a new docker container based on provided config
	 *
	 * @param port - The port on which to start the step function server
	 * @param envConfig - The configuration options for the step function
	 * @returns Created container object
	 */
	private async createContainer(
		port: string,
		envConfig: TContainerEnvConfig | null
	): Promise<Docker.Container> {
		const container = await this.dockerInstance.createContainer({
			Image: 'amazon/aws-stepfunctions-local',
			AttachStdin: true,
			AttachStdout: true,
			AttachStderr: true,
			Tty: true,
			ExposedPorts: { [`${port}/tcp`]: {} },
			HostConfig: {
				PortBindings: {
					[`${port}/tcp`]: [
						{
							HostPort: port,
						},
					],
				},
			},
			Env: [
				`STEP_FUNCTIONS_ENDPOINT=http://localhost:${port}`,
				...(envConfig?.LAMBDA_PORT
					? [
							`LAMBDA_ENDPOINT=http://host.docker.internal:${envConfig.LAMBDA_PORT}`,
					  ]
					: []),
			],
		});

		return container;
	}

	/**
	 * Sets up a stream to log docker container's execution logs on stdout
	 *
	 * @param container - The docker container whose logs are to be streamed
	 */
	static async containerLogs(container: Docker.Container) {
		const containerStream = await container.logs({
			follow: true,
			stdout: false,
			stderr: true,
		});

		containerStream.on('data', (info: any) => {
			console.log(info.toString('utf8'));
		});

		containerStream.on('error', (err: any) => {
			console.log(err);
		});
	}

	/**
	 * Spins up a new docker container
	 *
	 * @param port - The port on which docker container must be started
	 * @param configFilePath - The file-path to the configuration options for step function server
	 * @returns The created container's id
	 */
	public async startContainer(
		port: string,
		configFilePath: string | undefined
	): Promise<string> {
		try {
			await this.dockerInstance.ping();
		} catch (error) {
			throw new Error(
				'Cannot connect to the docker engine. Make sure docker is running locally'
			);
		}

		try {
			let envConfig: TContainerEnvConfig | null = null;
			if (configFilePath) {
				const envConfigString = await fs.readFile(
					configFilePath,
					'utf8'
				);
				envConfig = JSON.parse(envConfigString);
			}

			console.log('>> Spinning up a new container');
			const container: Docker.Container | null =
				await this.createContainer(port, envConfig);

			console.log(`>> Starting the container - ${container.id}`);
			await container.start();
			await DockerController.containerLogs(container);

			process.on('SIGINT', async () => {
				if (container) {
					await container.stop();
					await container.remove();
				}

				process.exit();
			});

			return container.id;
		} catch (error: any) {
			throw new Error(
				`Error spinning up the docker container: ${error.message}`
			);
		}
	}

	/**
	 * Performs cleanup post execution by removing the docker container
	 *
	 * @param containerId - The container to be flushed
	 */
	public async cleanUpContainer(containerId: string): Promise<void> {
		const container = this.dockerInstance.getContainer(containerId);

		if (container) {
			await container.stop();
			await container.remove();
		}
	}
}
