'use strict';
const path = require('path');
const {
	app,
	BrowserWindow,
	Menu,
	screen,
	ipcMain,
	dialog
} = require('electron');
const {
	autoUpdater
} = require('electron-updater');
const {
	is
} = require('electron-util');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
// X const config = require('./config');
const menu = require('./menu');
const fs = require('fs');

unhandled();
debug();
contextMenu();

const appID = 'com.akshaybaweja.bio-signal-visualizer';
app.setAppUserModelId(appID);

let w = 800;
let h = 600;

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
if (!is.development) {
	const TWENTY_FOUR_HOURS = 1000 * 60 * 60 * 24;
	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, TWENTY_FOUR_HOURS);

	autoUpdater.checkForUpdates();
}

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: w,
		height: h,
		minHeight: 600,
		minWidth: 800,
		fullscreenable: true,
		webPreferences: {
			devTools: true,
			enableRemoteModule: true,
			nodeIntegration: true
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
	await app.whenReady().then(() => {
		w = screen.getPrimaryDisplay().workAreaSize.width;
		h = screen.getPrimaryDisplay().workAreaSize.height;
	});
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();
	mainWindow.webContents.executeJavaScript(`document.querySelector('#version-number').textContent = '${app.getVersion()}'`);
})();

ipcMain.on('showErrorDialog', (event, arg) => {
	dialog.showErrorBox(arg.title, arg.body);
});

ipcMain.on('ssBase64', (event, arg) => {
	const buf = Buffer.from(arg, 'base64');
	dialog.showSaveDialog(mainWindow, {
		defaultPath: 'BioSignal-output.jpg'
	}).then(data => {
		if (data.canceled === false) {
			fs.writeFile(data.filePath, buf, err => {
				if (err) {
					throw err;
				}
			});
		}
	});
});
