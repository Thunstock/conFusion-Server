const express = require('express');
const cors = require('cors');
const app = express();

const whitelist = [ 'http://localhost:3000', 'https://localhost:3443', 'https://Tylers-MacBook-Pro-2:3001' ];
let corsOptionsDelegate = (req, callback) => {
	let corsOptions;
	console.log(req.header('Origin'));
	if (whitelist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}
	callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
