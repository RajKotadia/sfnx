async function apiHandler(event, context) {
	console.log(event, context);

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: "Hello from Api"
		}),
		headers: {
			"Access-Control-Allow-Origin": "*",
		}
	}
}

async function stepHandler(event, context) {
	console.log(event, context);

	const guest = event.body?.guest || 'Guest'

	return {
		body: JSON.stringify({
			message: `Hello ${guest} from Step!`
		}),
	}
}

module.exports = {
	apiHandler,
	stepHandler
}