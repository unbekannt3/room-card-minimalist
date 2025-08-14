const path = require('path');

module.exports = {
	// Der Einstiegspunkt deines Projekts
	entry: './src/index.js',
	mode: 'development',
	output: {
		// Der Dateiname für die fertige Karte
		filename: 'room-card-minimalist.js',
		path: path.resolve(__dirname, 'dist'),
	},
	// Konfiguration für den Live-Reload-Server
	devServer: {
		static: path.join(__dirname, 'dist'),
		port: 8080, // Du kannst einen anderen Port wählen, falls 8080 belegt ist
		host: '0.0.0.0', // Erlaubt Zugriff von anderen Geräten im Netzwerk (dein HA)
		headers: {
			// Dieser Header ist entscheidend, damit Home Assistant die Datei laden darf
			'Access-Control-Allow-Origin': '*',
		},
	},
};
