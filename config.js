'use strict';
const Store = require('electron-store');

module.exports = new Store({
	configName: 'user-preferences',
	defaults: {
		strokeColor: '#ff0000',
		strokeWidth: '3',
		axisName: {
			x: 'x-axis',
			y: 'y-axis'
		}
	}
});

