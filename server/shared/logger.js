const colour = require('colour');

const success = (message, ...params) => {
	print(message, params, 'green');
};
const error = (message, ...params) => {
	print(message, params, 'red');
};
const warning = (message, ...params) => {
	print(message, params, 'yellow');
};
const info = (message, ...params) => {
	print(message, params, 'blue');
};
const print = (msg, params, color) => {
	if (process.env.NODE_ENV === 'production') {
		return;
	}
	const log = console.log.bind();
	switch (color) {
		case 'green':
			log(colour.green(msg), ...params);
			break;
		case 'red':
			log(colour.red(msg), ...params);
			break;
		case 'yellow':
			log(colour.yellow(msg), ...params);
			break;
		case 'blue':
			log(colour.blue(msg), ...params);
			break;
	}
};
const clear=()=>console.clear.call();
module.exports = { success, error, warning, info,clear };
