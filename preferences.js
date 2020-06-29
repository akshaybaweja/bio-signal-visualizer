const {remote} = require('electron');
const config = require('./config');
const inputFields = document.querySelectorAll('input');
const saveButton = document.querySelector('#saveValues');
const resetButton = document.querySelector('#resetDefaultValues');

inputFields.forEach(input => {
	input.value = config.get(input.name);
});

saveButton.addEventListener('click', () => {
	inputFields.forEach(input => {
		config.set(input.name, input.value);
	});
	remote.getCurrentWindow().close();
});

resetButton.addEventListener('click', () => {
	inputFields.forEach(input => {
		config.reset(input.name);
		input.value = config.get(input.name);
	});
});
