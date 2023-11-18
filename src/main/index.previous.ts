import { 
  BrowserWindow, 
  app, 
  globalShortcut,
  Tray,
  Menu,
  shell, 
  ipcMain,
  screen, 
} from 'electron'
import { autoUpdater } from "electron-updater";
import { platform } from "os";


import { getCurrentOperatingSystem } from "../common/helpers/operating-system-helpers";

import { release } from 'node:os'
import { join } from 'node:path'
import { AppearanceOptions } from "../common/config/appearance-options";
import { ElectronStoreConfigRepository } from "../common/config/electron-store-config-repository";
import { deepCopy } from "../common/helpers/object-helpers";
import { UserConfigOptions, defaultUserConfigOptions } from "../common/config/user-config-options";
import { PluginType } from "./plugin-type";
import { IpcChannels } from "../common/ipc-channels";

import { getRescanIntervalInMilliseconds } from "./helpers/rescan-interval-helpers";
import { isValidHotKey } from "../common/global-hot-key/global-hot-key-helpers";
import { GlobalHotKey } from "../common/global-hot-key/global-hot-key";
import { GlobalHotKeyKey } from "../common/global-hot-key/global-hot-key-key";
import { GlobalHotKeyModifier } from "../common/global-hot-key/global-hot-key-modifier";
import { OperatingSystem } from "../common/operating-system";
import { isDev } from "../common/is-dev";
import { trayIconPathMacOs, trayIconPathWindows } from "./helpers/tray-icon-helpers";
import { windowIconMacOs, windowIconWindows } from "./helpers/window-icon-helpers";

import { toHex } from "./plugins/color-converter-plugin/color-converter-helpers";

import { defaultGeneralOptions } from "../common/config/general-options";

const operatingSystem = getCurrentOperatingSystem(platform());

const appIsInDevelopment = isDev(process.execPath);
const trayIconFilePath = operatingSystem === OperatingSystem.Windows ? trayIconPathWindows : trayIconPathMacOs;
const windowIconFilePath = operatingSystem === OperatingSystem.Windows ? windowIconWindows : windowIconMacOs;

const minimumRefreshIntervalInSeconds = 10;
const configRepository = new ElectronStoreConfigRepository(deepCopy(defaultUserConfigOptions));

console.log('🦄 🦄 🦄 operatingSystem', operatingSystem);

autoUpdater.autoDownload = false;

let config = configRepository.getConfig();

let trayIcon: Tray;
let mainWindow: BrowserWindow;
let settingsWindow: BrowserWindow;
let lastWindowPosition = config.generalOptions.lastWindowPosition;

let rescanInterval = config.generalOptions.rescanEnabled
    ? setInterval(
          () => refreshAllIndexes(),
          getRescanIntervalInMilliseconds(
              Number(config.generalOptions.rescanIntervalInSeconds),
              minimumRefreshIntervalInSeconds,
          ),
      )
    : undefined;


function refreshAllIndexes() {
    onIndexRefreshStarted();
    // searchEngine
    //     .refreshAllIndexes()
    //     .then(() => {
    //         logger.debug("Successfully refreshed all indexes");
    //         notifyRenderer(translationSet.successfullyRefreshedIndexes, NotificationType.Info);
    //     })
    //     .catch((err) => {
    //         if (Array.isArray(err)) {
    //             err.forEach((e) => logger.error(e));
    //         } else {
    //             logger.error(err);
    //         }
    //         notifyRenderer(err, NotificationType.Error);
    //     })
    //     .finally(onIndexRefreshFinished);
}

function onIndexRefreshStarted() {
  BrowserWindow.getAllWindows().forEach((window) => window.webContents.send(IpcChannels.refreshIndexesStarted));
}

function registerGlobalKeyboardShortcut(toggleAction: () => void, newHotKey: GlobalHotKey) {
  newHotKey = isValidHotKey(newHotKey) ? newHotKey : defaultGeneralOptions.hotKey;
  globalShortcut.unregisterAll();

  const hotKeyParts: (GlobalHotKeyKey | GlobalHotKeyModifier)[] = [];

  // Add first key modifier, if any
  if (newHotKey.modifier && newHotKey.modifier !== GlobalHotKeyModifier.None) {
      hotKeyParts.push(newHotKey.modifier);
  }

  // Add second key modifier, if any
  if (newHotKey.secondModifier && newHotKey.secondModifier !== GlobalHotKeyModifier.None) {
      hotKeyParts.push(newHotKey.secondModifier);
  }

  // Add actual key
  hotKeyParts.push(newHotKey.key);
  globalShortcut.register(hotKeyParts.join("+"), toggleAction);
}

function getMaxWindowHeight(
  maxSearchResultsPerPage: number,
  searchResultHeight: number,
  userInputHeight: number,
  userInputBottomMargin: number,
): number {
  return (
      Number(maxSearchResultsPerPage) * Number(searchResultHeight) +
      Number(userInputHeight) +
      Number(userInputBottomMargin)
  );
}

function calculateX(display: Electron.Display): number {
  return Math.round(Number(display.bounds.x + display.bounds.width / 2 - config.appearanceOptions.windowWidth / 2));
}

function calculateY(display: Electron.Display): number {
  return Math.round(
      Number(
          display.bounds.y +
              display.bounds.height / 2 -
              getMaxWindowHeight(
                  config.appearanceOptions.maxSearchResultsPerPage,
                  config.appearanceOptions.searchResultHeight,
                  config.appearanceOptions.userInputHeight,
                  config.appearanceOptions.userInputBottomMargin,
              ) /
                  2,
      ),
  );
}

function onBlur() {
  if (config.generalOptions.hideMainWindowOnBlur) {
      hideMainWindow();
  }
}

function windowExists(window: BrowserWindow): boolean {
  return window && !window.isDestroyed();
}

function showMainWindow() {
  if (windowExists(mainWindow)) {
      if (mainWindow.isVisible()) {
          mainWindow.focus();
      } else {
          const mousePosition = screen.getCursorScreenPoint();
          const display = config.generalOptions.showAlwaysOnPrimaryDisplay
              ? screen.getPrimaryDisplay()
              : screen.getDisplayNearestPoint(mousePosition);
          const windowBounds: Electron.Rectangle = {
              height: Math.round(
                  Number(config.appearanceOptions.userInputHeight) +
                      Number(config.appearanceOptions.userInputBottomMargin),
              ),
              width: Math.round(Number(config.appearanceOptions.windowWidth)),
              x:
                  config.generalOptions.rememberWindowPosition && lastWindowPosition && lastWindowPosition.x
                      ? lastWindowPosition.x
                      : calculateX(display),
              y:
                  config.generalOptions.rememberWindowPosition && lastWindowPosition && lastWindowPosition.y
                      ? lastWindowPosition.y
                      : calculateY(display),
          };
          // this is a workaround to restore the focus on the previously focussed window
          if (operatingSystem === OperatingSystem.macOS) {
              app.show();
          }
          if (operatingSystem === OperatingSystem.Windows) {
              mainWindow.restore();
          }
          mainWindow.setBounds(windowBounds);
          mainWindow.show();
          mainWindow.focus();
      }
      mainWindow.webContents.send(IpcChannels.mainWindowHasBeenShown);
  }
}

function hideMainWindow() {
  if (windowExists(mainWindow)) {
      mainWindow.webContents.send(IpcChannels.mainWindowHasBeenHidden);

      setTimeout(() => {
          // updateMainWindowSize(0, config.appearanceOptions);
          if (windowExists(mainWindow)) {
              // this is a workaround to restore the focus on the previously focussed window
              if (operatingSystem === OperatingSystem.Windows) {
                  mainWindow.minimize();
              }
              mainWindow.hide();

              // this is a workaround to restore the focus on the previously focussed window
              if (operatingSystem === OperatingSystem.macOS) {
                  if (
                      !settingsWindow ||
                      (settingsWindow && settingsWindow.isDestroyed()) ||
                      (settingsWindow && !settingsWindow.isDestroyed() && !settingsWindow.isVisible())
                  ) {
                      app.hide();
                  }
              }
          }
      }, 25);
  }
}

function toggleMainWindow() {
  if (mainWindow.isVisible()) {
      if (mainWindow.isFocused()) {
          hideMainWindow();
      } else {
          showMainWindow();
      }
  } else {
      showMainWindow();
  }
}

function updateMainWindowSize(searchResultCount: number, appearanceOptions: AppearanceOptions, center?: boolean) {
  if (windowExists(mainWindow)) {
      mainWindow.resizable = true;
      const windowHeight =
          searchResultCount > appearanceOptions.maxSearchResultsPerPage
              ? Math.round(
                    getMaxWindowHeight(
                        appearanceOptions.maxSearchResultsPerPage,
                        appearanceOptions.searchResultHeight,
                        appearanceOptions.userInputHeight,
                        appearanceOptions.userInputBottomMargin,
                    ),
                )
              : Math.round(
                    Number(searchResultCount) * Number(appearanceOptions.searchResultHeight) +
                        Number(appearanceOptions.userInputHeight) +
                        Number(appearanceOptions.userInputBottomMargin),
                );

      mainWindow.setSize(Number(appearanceOptions.windowWidth), Number(windowHeight));
      if (center) {
          mainWindow.center();
      }
      mainWindow.resizable = false;
  }
}

function updateAutoStartOptions(userConfig: UserConfigOptions) {
  if (!appIsInDevelopment) {
      app.setLoginItemSettings({
          args: [],
          openAtLogin: userConfig.generalOptions.autostart,
          path: process.execPath,
      });
  }
}


function createTrayIcon() {
  if (config.generalOptions.showTrayIcon) {
      trayIcon = new Tray(trayIconFilePath);
      trayIcon.setToolTip("ueli");
      updateTrayIconContextMenu();
  }
}

function onSettingsOpen() {
  if (operatingSystem === OperatingSystem.macOS) {
      app.dock.show();
  }
}

function onSettingsClose() {
  if (operatingSystem === OperatingSystem.macOS) {
      app.dock.hide();
  }
}

function openSettings() {
  onSettingsOpen();
  if (!settingsWindow || settingsWindow.isDestroyed()) {
      settingsWindow = new BrowserWindow({
          height: 750,
          icon: windowIconFilePath,
          // title: translationSet.settings,
          title: "title",
          webPreferences: {
              nodeIntegration: true,
              contextIsolation: false,
              spellcheck: false,
          },
          width: 1000,
      });
      settingsWindow.setMenu(null);
      settingsWindow.loadFile(join(__dirname, "..", "settings.html"));
      settingsWindow.on("close", onSettingsClose);
      if (appIsInDevelopment) {
          settingsWindow.webContents.openDevTools();
      }
  } else {
      settingsWindow.focus();
  }
}


function updateTrayIconContextMenu() {
  if (trayIcon && !trayIcon.isDestroyed()) {
      trayIcon.setContextMenu(
          Menu.buildFromTemplate([
              {
                  click: showMainWindow,
                  // label: translationSet.trayIconShow,
                  label: "A",
              },
              {
                  click: openSettings,
                  // label: translationSet.trayIconSettings,
                  label: "B",
              },
              {
                  click: refreshAllIndexes,
                  // label: translationSet.ueliCommandRefreshIndexes,
                  label: "C",
              },
              {
                  click: quitApp,
                  // label: translationSet.trayIconQuit,
                  label: "D",
              },
          ]),
      );
  }
}

function quitApp() {
  beforeQuitApp()
      .then(() => {
          /* Do nothing */
      })
      .catch((err) => console.error(err))
      // .catch((err) => logger.error(err))
      .finally(() => {
          // if (rescanInterval) {
          //     clearInterval(rescanInterval);
          // }
          globalShortcut.unregisterAll();
          app.quit();
      });
}

function beforeQuitApp(): Promise<void> {
  return new Promise((resolve, reject) => {
      destroyTrayIcon();
      if (config.generalOptions.clearCachesOnExit) {
          // searchEngine
          //     .clearCaches()
          //     .then(() => {
          //         logger.debug("Successfully cleared all caches before app quit");
          //         resolve();
          //     })
          //     .catch((err) => reject(err));
      } else {
          resolve();
      }
  });
}

function updateTrayIcon(updatedConfig: UserConfigOptions) {
  if (updatedConfig.generalOptions.showTrayIcon) {
      if (trayIcon === undefined || (trayIcon && trayIcon.isDestroyed())) {
          createTrayIcon();
      }
  } else {
      destroyTrayIcon();
  }
}

function destroyTrayIcon() {
  if (trayIcon !== undefined && !trayIcon.isDestroyed()) {
      trayIcon.destroy();
  }
}

function getMainWindowBackgroundColor(userConfigOptions: UserConfigOptions): string {
  const transparent = "#00000000";

  if (operatingSystem === OperatingSystem.macOS) {
      return transparent;
  }

  return userConfigOptions.appearanceOptions.allowTransparentBackground === true
      ? transparent
      : toHex(userConfigOptions.colorThemeOptions.searchResultsBackgroundColor, "#FFFFFF");
}


function updateConfig(updatedConfig: UserConfigOptions, needsIndexRefresh?: boolean, pluginType?: PluginType) {
  // if (updatedConfig.generalOptions.language !== config.generalOptions.language) {
  //     onLanguageChange(updatedConfig);
  // }

  if (updatedConfig.generalOptions.hotKey !== config.generalOptions.hotKey) {
      registerGlobalKeyboardShortcut(toggleMainWindow, updatedConfig.generalOptions.hotKey);
  }

  if (updatedConfig.generalOptions.rescanIntervalInSeconds !== config.generalOptions.rescanIntervalInSeconds) {
      if (rescanInterval) {
          clearInterval(rescanInterval);
      }
      rescanInterval = setInterval(
          () => refreshAllIndexes(),
          getRescanIntervalInMilliseconds(
              Number(updatedConfig.generalOptions.rescanIntervalInSeconds),
              minimumRefreshIntervalInSeconds,
          ),
      );
  }

  if (!updatedConfig.generalOptions.rescanEnabled) {
      if (rescanInterval) {
          clearInterval(rescanInterval);
      }
  }

  if (Number(updatedConfig.appearanceOptions.windowWidth) !== Number(config.appearanceOptions.windowWidth)) {
      mainWindow.resizable = true;
      mainWindow.setSize(
          Number(updatedConfig.appearanceOptions.windowWidth),
          getMaxWindowHeight(
              updatedConfig.appearanceOptions.maxSearchResultsPerPage,
              updatedConfig.appearanceOptions.searchResultHeight,
              updatedConfig.appearanceOptions.userInputHeight,
              updatedConfig.appearanceOptions.userInputBottomMargin,
          ),
      );
      updateMainWindowSize(0, updatedConfig.appearanceOptions);
      mainWindow.center();
      mainWindow.resizable = false;
  }

  if (JSON.stringify(updatedConfig.appearanceOptions) !== JSON.stringify(config.appearanceOptions)) {
      mainWindow.webContents.send(IpcChannels.appearanceOptionsUpdated, updatedConfig.appearanceOptions);
  }

  if (JSON.stringify(updatedConfig.colorThemeOptions) !== JSON.stringify(config.colorThemeOptions)) {
      if (
          updatedConfig.colorThemeOptions.searchResultsBackgroundColor !==
          config.colorThemeOptions.searchResultsBackgroundColor
      ) {
          mainWindow.setBackgroundColor(getMainWindowBackgroundColor(updatedConfig));
      }
      mainWindow.webContents.send(IpcChannels.colorThemeOptionsUpdated, updatedConfig.colorThemeOptions);
  }

  if (JSON.stringify(updatedConfig.generalOptions) !== JSON.stringify(config.generalOptions)) {
      mainWindow.webContents.send(IpcChannels.generalOptionsUpdated, updatedConfig.generalOptions);
  }

  if (updatedConfig.generalOptions.allowWindowMove !== config.generalOptions.allowWindowMove) {
      mainWindow.setMovable(updatedConfig.generalOptions.allowWindowMove);
  }

  config = updatedConfig;

  updateTrayIcon(updatedConfig);
  updateAutoStartOptions(updatedConfig);

  configRepository
      .saveConfig(updatedConfig)
      .then(() => {
          // searchEngine
          //     .updateConfig(updatedConfig, translationSet)
          //     .then(() => {
          //         if (needsIndexRefresh) {
          //             if (pluginType) {
          //                 refreshIndexOfPlugin(pluginType);
          //             } else {
          //                 refreshAllIndexes();
          //             }
          //         } else {
          //             notifyRenderer(translationSet.successfullyUpdatedconfig, NotificationType.Info);
          //         }
          //     })
          //     .catch((err) => logger.error(err));
      })
      .catch((err) => console.error(err));
}


// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})
