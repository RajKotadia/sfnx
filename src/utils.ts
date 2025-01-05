import fs from 'node:fs/promises';

/**
 * Checks whether the file exists on given path or raises an error
 *
 * @param filePath - The path to the file to be verified
 * @throws Error if file does not exist
 */
export const fileExists = async (filePath: string): Promise<any> => {
	try {
		// Check if the file exists
		(await fs.stat(filePath)).isFile();
	} catch (error: any) {
		if (error.code === 'ENOENT') {
			throw new Error(`File ${filePath} does not exist`);
		}

		throw new Error(
			`Error occurred while checking file ${filePath}: ${error.message}`
		);
	}
};
