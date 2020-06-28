'use strict';
const path = require('path');
const {
	app,
	BrowserWindow,
	Menu
} = require('electron');
// const {autoUpdater} = require('electron-updater');
const {
	is
} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
// X const config = require('./config');
const menu = require('./menu');
// X const packageJson = require('./package.json');

unhandled();
debug();
contextMenu();

app.setAppUserModelId('com.akshaybaweja.bio-signal-visualizer');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, TWENTY_FOUR_HOURS);

// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		minHeight: 600,
		minWidth: 800,
		fullscreen: true,
		webPreferences: {
			devTools: true
		}
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('closed', () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = undefined;
	});

	await win.loadFile(path.join(__dirname, 'index.html'));

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('window-all-closed', () => {
	if (!is.macos) {
		app.quit();
	}
});

app.on('activate', () => {
	if (!mainWindow) {
		mainWindow = createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
	mainWindow.webContents.executeJavaScript(`document.querySelector('#version-number').textContent = '${app.getVersion()}'`);
})();
