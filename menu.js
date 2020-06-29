'use strict';
const path = require('path');
const {
	app,
	Menu,
	shell,
	BrowserWindow
} = require('electron');
const {
	is,
	appMenu,
	aboutMenuItem,
	openUrlMenuItem,
	openNewGitHubIssue,
	debugInfo
} = require('electron-util');
const config = require('./config');
const showPreferences = () => {
	const htmlPath = path.join(__dirname, 'preferences.html');
	const prefWindow = new BrowserWindow({
		width: 500,
		height: 330,
		resizable: false,
		alwaysOnTop: true,
		fullscreenable: false,
		maximizable: false,
		minimizable: false,
		skipTaskbar: true,
		enableLargerThanScreen: false,
		titleBarStyle: 'hiddenInset',
		webPreferences: {
			nodeIntegration: true,
			enableRemoteModule: true
		}
	});
	prefWindow.loadFile(htmlPath);
	prefWindow.show();
};

const generateNewCanvas = () => {
	// Refresh Page
	const currentWindow = BrowserWindow.getFocusedWindow();
	currentWindow.reload();
	currentWindow.webContents.executeJavaScript(`document.querySelector('#version-number').textContent = '${app.getVersion()}'`);
};

const export2PDF = () => {
	// Export to PDF
	const currentWindow = BrowserWindow.getFocusedWindow();
	currentWindow.webContents.send('exportScreenshot', 'taadaa');
};

const helpSubmenu = [
	openUrlMenuItem({
		label: 'Website',
		url: 'https://github.com/akshaybaweja/bio-signal-visualizer'
	}),
	openUrlMenuItem({
		label: 'Source Code',
		url: 'https://github.com/akshaybaweja/bio-signal-visualizer'
	}),
	{
		label: 'Report an Issue',
		click() {
			const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

			openNewGitHubIssue({
				user: 'akshaybaweja',
				repo: 'bio-signal-visualizer',
				body
			});
		}
	}
];

if (!is.macos) {
	helpSubmenu.push({
		type: 'separator'
	},
	aboutMenuItem({
		icon: path.join(__dirname, 'static', 'icon.png'),
		text: 'Created by Akshay Baweja'
	}));
}

const debugSubmenu = [{
	label: 'Show Settings',
	click() {
		config.openInEditor();
	}
},
{
	label: 'Show App Data',
	click() {
		shell.openItem(app.getPath('userData'));
	}
},
{
	type: 'separator'
},
{
	label: 'Delete Settings',
	click() {
		config.clear();
		app.relaunch();
		app.quit();
	}
},
{
	label: 'Delete App Data',
	click() {
		shell.moveItemToTrash(app.getPath('userData'));
		app.relaunch();
		app.quit();
	}
}];

const macosTemplate = [
	appMenu([{
		label: 'Preferences',
		accelerator: 'Command+,',
		click() {
			showPreferences();
		}
	}]),
	{
		role: 'fileMenu',
		submenu: [{
			label: 'New Canvas',
			accelerator: 'Command+N',
			click() {
				generateNewCanvas();
			}
		},
		{
			type: 'separator'
		},
		{
			label: 'Save as JPG',
			accelerator: 'Command+S',
			click() {
				export2PDF();
			}
		},
		{
			type: 'separator'
		},
		{
			role: 'close'
		}]
	},
	{
		role: 'windowMenu'
	},
	{
		role: 'help',
		submenu: helpSubmenu
	}
];

// Linux and Windows
const otherTemplate = [{
	role: 'fileMenu',
	submenu: [{
		label: 'New Canvas',
		accelerator: 'Control+N',
		click() {
			generateNewCanvas();
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Save as JPG',
		accelerator: 'Control+S',
		click() {
			export2PDF();
		}
	},
	{
		type: 'separator'
	},
	{
		label: 'Settings',
		accelerator: 'Control+,',
		click() {
			showPreferences();
		}
	},
	{
		type: 'separator'
	},
	{
		role: 'quit'
	}]
},
{
	role: 'help',
	submenu: helpSubmenu
}];

const template = process.platform === 'darwin' ? macosTemplate : otherTemplate;

if (is.development) {
	template.push({
		label: 'Debug',
		submenu: debugSubmenu
	});
}

module.exports = Menu.buildFromTemplate(template);
