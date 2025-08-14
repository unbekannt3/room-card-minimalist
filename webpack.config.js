const path = require('path');

module.exports = {
	entry: './src/index.js',
	mode: 'development',
	output: {
		filename: 'room-card-minimalist.js',
		path: path.resolve(__dirname, 'dist'),
	},
	devServer: {
		static: path.join(__dirname, 'dist'),
		port: 8080,
		host: '0.0.0.0',
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		// Error overlays
		client: {
			overlay: false,
		},
	},
};
