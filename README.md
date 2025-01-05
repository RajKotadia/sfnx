# sfnx - Step Function Executor

A CLI tool to execute AWS Step Functions locally using just a single command.

## Commands

`invoke` - To invoke the step function locally

**[Options]** </br>

**--asl-file** _PATH_</br>
Path to the step function ASL file which contains the state-machine definition.</br>
_required_

**--port, -p** _INTEGER_ </br>
Port on which the step function server would be running.</br>
_default: 8083_

**--input-file, -i** _PATH_ </br>
Path to the JSON file containing input to the step function.

**--config-file, -i** _PATH_ </br>
Path to the JSON file containing the configuration options for step function.</br>
Currently only supports `LAMBDA_PORT` which represents the port on which lambda server is running locally.

```bash
$ sfnx invoke \
	-p 8083 \
	--asl-file "path/to/asl-file" \
	--input-file "path/to/input-file" \
	--config-file "path/to/config-file"
```

## Example

```bash
# Basic (contains just a simple state-machine)
$ sfnx invoke --asl-file "./example/basic/state-machine.asl.json"

# With Lambda (The state-machine uses lambda as one of the steps)
# Provided the lambda server is running locally in another shell
$ sfnx invoke --asl-file "./example/with-lambda/state-machine.asl.json" --config-file "./example/with-lambda/config.json"
```

## To run locally

```bash
# install the dependencies
$ npm i

# build the project
$ npm run build

# execute commands
$ npx sfnx -v
$ npx sfnx invoke --asl-file "path/to/asl-file"
```
