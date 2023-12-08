type ExecuteOptions = {
	inputFile: string;
};

export const execute = (stepFunction: string, options: ExecuteOptions) => {
	console.log(
		`execute command argument - ${stepFunction} & options - `,
		options
	);
};
