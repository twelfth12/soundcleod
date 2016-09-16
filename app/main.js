'use strict'

const electron = require('electron')
const menu = require('./menu')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const Menu = electron.Menu
const ipcMain = electron.ipcMain

var mainWindow = null

const profile = process.env.SOUNDCLEOD_PROFILE
if (profile)
  app.setPath('userData', app.getPath('userData') + ' ' + profile)

var quitting = false

app.on('before-quit', function() {
  quitting = true
})

app.on('ready', function() {
  Menu.setApplicationMenu(menu)

  mainWindow = new BrowserWindow({
    width: 1290,
    height: 800,
    minWidth: 1024,
    minHeight: 760,
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    }
  })

  mainWindow.loadURL('https://soundcloud.com')

  mainWindow.on('close', (event) => {
    if (!quitting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', function() {
    mainWindow = null
  })

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('playPause')
  })

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('next')
  })

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('previous')
  })

  menu.events.on('home', () => {
    mainWindow.webContents.send('navigate', '/')
  })

  menu.events.on('back', () => {
    mainWindow.webContents.goBack()
  })

  menu.events.on('forward', () => {
    mainWindow.webContents.goForward()
  })

  menu.events.on('main-window', () => {
    mainWindow.show()
  })

  require('electron').powerMonitor.on('suspend', () => {
    ipcMain.once('isPlaying', (_, isPlaying) => {
      if (isPlaying)
        mainWindow.webContents.send('playPause')
    })
    mainWindow.webContents.send('isPlaying')
  })
})
