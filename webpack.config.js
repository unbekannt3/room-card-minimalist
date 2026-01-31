const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		entry: './src/index.ts',
		mode: argv.mode || 'development',
		output: {
			filename: 'room-card-minimalist.js',
			path: path.resolve(__dirname, 'dist'),
			clean: true,
		},
		resolve: {
			extensions: ['.ts', '.js', '.json'],
			alias: {
				'@': path.resolve(__dirname, 'src'),
				'@types': path.resolve(__dirname, 'src/types'),
				'@utils': path.resolve(__dirname, 'src/utils'),
				'@services': path.resolve(__dirname, 'src/services'),
				'@constants': path.resolve(__dirname, 'src/constants'),
				'@styles': path.resolve(__dirname, 'src/styles'),
			},
		},
		module: {
			rules: [
				{
					test: /\.ts$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									[
										'@babel/preset-env',
										{
											targets: {
												browsers: ['> 1%', 'last 2 versions'],
											},
										},
									],
								],
								plugins: [
									[
										'babel-plugin-template-html-minifier',
										{
											modules: {
												'lit-element': ['html', 'css'],
												lit: ['html', 'css'],
											},
											htmlMinifier: {
												caseSensitive: true,
												collapseWhitespace: true,
												conservativeCollapse: true,
												minifyCSS: true,
												minifyJS: false,
												removeAttributeQuotes: false,
												removeComments: true,
												removeEmptyAttributes: true,
												removeOptionalTags: false,
												removeRedundantAttributes: true,
												removeScriptTypeAttributes: false,
												removeStyleLinkTypeAttributes: false,
												sortAttributes: false,
												sortClassName: false,
											},
											logOnFailure: true,
										},
									],
								],
							},
						},
						{
							loader: 'ts-loader',
							options: {
								transpileOnly: true,
							},
						},
					],
					exclude: /node_modules/,
				},
				{
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {
								presets: [
									[
										'@babel/preset-env',
										{
											targets: {
												browsers: ['> 1%', 'last 2 versions'],
											},
										},
									],
								],
								plugins: [
									[
										'babel-plugin-template-html-minifier',
										{
											modules: {
												'lit-element': ['html', 'css'],
												lit: ['html', 'css'],
											},
											htmlMinifier: {
												caseSensitive: true,
												collapseWhitespace: true,
												conservativeCollapse: true,
												minifyCSS: true,
												minifyJS: false,
												removeAttributeQuotes: false,
												removeComments: true,
												removeEmptyAttributes: true,
												removeOptionalTags: false,
												removeRedundantAttributes: true,
												removeScriptTypeAttributes: false,
												removeStyleLinkTypeAttributes: false,
												sortAttributes: false,
												sortClassName: false,
											},
											logOnFailure: true,
										},
									],
								],
							},
						},
					],
					exclude: /node_modules/,
				},
			],
		},
		optimization: {
			minimize: isProduction,
			splitChunks: false,
			minimizer: [
				new TerserPlugin({
					terserOptions: {
						compress: {
							drop_console: isProduction,
							drop_debugger: isProduction,
						},
						format: {
							comments: false,
						},
					},
					extractComments: false,
				}),
			],
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
};
