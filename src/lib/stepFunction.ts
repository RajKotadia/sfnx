import fs from 'node:fs/promises';

import {
	CreateStateMachineCommand,
	CreateStateMachineInput,
	CreateStateMachineOutput,
	DescribeExecutionCommand,
	DescribeExecutionCommandInput,
	DescribeExecutionCommandOutput,
	GetExecutionHistoryCommand,
	SFNClient,
	StartExecutionCommand,
	StartExecutionCommandInput,
	StartExecutionCommandOutput,
} from '@aws-sdk/client-sfn';

export class StepFunctionController {
	private sfnClient: SFNClient;

	constructor(port: string) {
		this.sfnClient = new SFNClient({
			endpoint: `http://localhost:${port}`,
		});
	}

	/**
	 * Creates the state-machine using the ASL definition
	 * @param name - Name for the state-machine
	 * @param aslDefinitionPath - Path to the definition file
	 * @returns Response for create state-machine request
	 */
	private async createStateMachine(
		name: string,
		aslDefinitionPath: string
	): Promise<CreateStateMachineOutput> {
		const definition = await fs.readFile(aslDefinitionPath, 'utf8');

		const command = new CreateStateMachineCommand({
			name,
			definition: definition,
			roleArn: 'arn:aws:iam::012345678901:role/DummyRole',
		} as CreateStateMachineInput);

		return this.sfnClient.send(command);
	}

	/**
	 * Executes the state-machine
	 * @param stateMachineArn - The ARN of the state machine to be executed
	 * @param stateMachineInput - The input for the state-machine
	 * @returns The response for state-machine execution request
	 */
	private executeStateMachine(
		stateMachineArn: string,
		stateMachineInput?: any
	): Promise<StartExecutionCommandOutput> {
		const command = new StartExecutionCommand({
			stateMachineArn,
			...(stateMachineInput && { input: stateMachineInput }),
		} as StartExecutionCommandInput);

		return this.sfnClient.send(command);
	}

	/**
	 * Fetches the execution result for the state-machine
	 *
	 * @param stateMachineExecutionArn - The execution ARN for the state-machine
	 * @returns Execution result
	 */
	private executionOutput(
		stateMachineExecutionArn: string
	): Promise<DescribeExecutionCommandOutput> {
		const command = new DescribeExecutionCommand({
			executionArn: stateMachineExecutionArn,
		} as DescribeExecutionCommandInput);

		return this.sfnClient.send(command);
	}

	/**
	 * Fetches the execution logs of a state-machine
	 *
	 * @param executionArn - The execution ARN for the state-machine
	 * @returns Execution logs
	 */
	private executionHistory(executionArn: string): Promise<any> {
		const command = new GetExecutionHistoryCommand({
			executionArn,
		});

		return this.sfnClient.send(command);
	}

	/**
	 * Creates and executes the state-machine
	 *
	 * @param aslDefinitionPath - Path to the definition file of state-machine
	 * @param inputFilePath - Path to the input-file for the state-machine
	 * @param cleanUp - Callback function for cleanup post execution
	 */
	public async main(
		aslDefinitionPath: string,
		inputFilePath: string | undefined,
		cleanUp: () => Promise<void>
	) {
		try {
			console.log('>> Creating the StateMachine');
			const { stateMachineArn } = await this.createStateMachine(
				'StateMachine',
				aslDefinitionPath
			);

			console.log('>> Executing the StateMachine');

			let stateMachineInput;
			if (inputFilePath) {
				stateMachineInput = await fs.readFile(inputFilePath, 'utf8');
			}

			const { executionArn } = await this.executeStateMachine(
				stateMachineArn!,
				stateMachineInput
			);

			const timer = setInterval(async () => {
				const result = await this.executionOutput(executionArn!);
				if (result.status === 'RUNNING') {
					console.log('>> Processing...');
				} else {
					clearInterval(timer);
					console.log('>> State Machine execution result -');
					console.log(result);

					console.log('>> Execution logs');
					const logs = await this.executionHistory(executionArn!);
					console.log(JSON.stringify(logs, null, 2));

					console.log('>> Execution completed! Cleaning up..');
					await cleanUp();
				}
			}, 5000);
		} catch (error: any) {
			throw new Error(
				`Error while executing the step function: ${error.message}`
			);
		}
	}
}
