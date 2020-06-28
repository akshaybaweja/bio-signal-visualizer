'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		appVersion: '0.0.1',
	}
});
