type ServeOptions = {
	templateFile: string;
	port?: string;
	configFile?: string;
};

export const serve = (options: ServeOptions) => {
	console.log(`execute command options`, options);
};
