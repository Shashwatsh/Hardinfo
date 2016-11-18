const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
// ipc electron 
const ipcMain = electron.ipcMain
// system info lib
const si = require('systeminformation')
// lib for paste to pastebin 
const paste = require('pbin-guest')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


ipcMain.on('generate_info', function(event, args){
  var output = '';

  get_graphicsinfo()
    .then(function(res){
      console.log(res)
    })
    .then(function(res){
      console.log(res)
    })
  

  // .then(function(){
  //   get_batteryinfo(function(err, res){
  //     if(!err) {
  //       list_info += '--- Battery info ---\n\r';
  //       Object.keys(res).forEach(function(key) {
  //         list_info += key+': '+res[key]+'\n\r';
  //       });
  //       return;
  //     }
  //   })
  // }, function handleError(err){
  //   console.error(err)
  // })

  // console.log(list_info)

  // var graphics = new Promise(function(resolve, reject) {
    
  // })

 
  // graphics.then(function(val){
  //   console.log(val)
  // })
  // battery.then(function(val){
  //   console.log(val)
  // })


  // get main info device
  si.system(function(res, err){
    hardinfo = {
      manufacturer: res.manufacturer,
      model: res.model,
      serial: res.serial,
      uuid: res.uuid
    }
  });
  // get main info OS
  si.osInfo(function(res, err){
    if(err) {
      event.sender.send('generate_info', {
        err: err,
        res: null
      })
      return;
    }
    platforminfo = {
      platform: res.platform,
      distro: res.distro,
      release: res.release,
      uuid: res.uuid,
      codename: (process.platform === 'darwin' ? res.codename : ''),
      kernel: res.kernel,
      arch: res.arch,
      hostname: res.hostname,
      logofile: res.logofile
    }
  })
  // get main info cpu
  si.cpu(function(res, err){
    if(err) {
      event.sender.send('generate_info', {
        err: err,
        res: null
      })
      return;
    }
    cpuinfo = {
      manufacturer: res.manufacturer,
      brand: res.brand,
      speed_core: res.speed,
      cores_count: res.cores
    }
  })
  // get main info memory
  si.mem(function(res, err){
    if(err) {
      event.sender.send('generate_info', {
        err: err,
        res: null
      })
      return;
    }
    meminfo = {
      total_memory: res.total,
      swaptotal: res.swaptotal
    }
    
    
  })
});

function get_batteryinfo() {
  const _i = new Promise(function(resolve, reject){
    // get main info battery
    si.battery(function(res, err){
      if(err) {
        reject(err)
      }
      batteryinfo = new Array();

      batteryinfo['hasbattery'] = res.hasbattery;
      batteryinfo['maxcapacity'] = res.maxcapacity;

      
      list_info = '--- Battery info ---\n\r';
      Object.keys(batteryinfo).forEach(function(key) {
        list_info += key+': '+batteryinfo[key]+'\n\r';
      });
      resolve(list_info)
    })
  }).then(function(resolve, reject){
    si.graphics(function(res, err){
      if(err) {
        reject(reject)
      }

      graphicsinfo = new Array();

      graphicsinfo['model'] = res.controllers[0].model;
      graphicsinfo['vendor'] = res.controllers[0].vendor;
      graphicsinfo['videoram'] = res.controllers[0].vram;
      graphicsinfo['display_model'] = res.displays[0].model;
      graphicsinfo['display_connection'] = res.displays[0].connection;
      graphicsinfo['resolutionx'] = res.displays[0].resolutionx;
      graphicsinfo['resolutiony'] = res.displays[0].resolutiony;
      // graphicsinfo['depth'] = res.displays[0].depth;


      list_info = '--- Graphics info ---\n\r';
      Object.keys(graphicsinfo).forEach(function(key) {
        list_info += key+': '+graphicsinfo[key]+'\n\r';
      });
      resolve(list_info)
    })
  })
  return _i;
}

const resolve = console.log, 
      reject  = console.log;

function get_graphicsinfo() {
  const _i = new Promise(function (resolve, reject) {
    si.graphics(function(res, err){
      if(err) {
        reject(reject)
      }

      graphicsinfo = new Array();

      graphicsinfo['model'] = res.controllers[0].model;
      graphicsinfo['vendor'] = res.controllers[0].vendor;
      graphicsinfo['videoram'] = res.controllers[0].vram;
      graphicsinfo['display_model'] = res.displays[0].model;
      graphicsinfo['display_connection'] = res.displays[0].connection;
      graphicsinfo['resolutionx'] = res.displays[0].resolutionx;
      graphicsinfo['resolutiony'] = res.displays[0].resolutiony;
      // graphicsinfo['depth'] = res.displays[0].depth;


      list_info = '--- Graphics info ---\n\r';
      Object.keys(graphicsinfo).forEach(function(key) {
        list_info += key+': '+graphicsinfo[key]+'\n\r';
      });
      resolve(list_info)
    })
  })
  return _i;
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      'max-width': 400,
      'max-height': 600,
      frame: false
  })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== 'darwin') {
    app.quit()
  // }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
