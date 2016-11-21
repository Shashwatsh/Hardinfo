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
const paste = require('teknik-paste')

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function generator_list(cb) {
  var output = '';
  // start generate list 
  get_batteryinfo()
    .then(battery => {
      output += battery+'\r';
      return output
    })
    .then(get_graphicsinfo)
    .then(video => {
      output += video+'\r'
      return output
    })
    .then(get_system)
    .then(system => {
      output += system+'\r'
      return output
    })
    .then(get_mem)
    .then(mem => {
      output += mem+'\r'
      return output
    })
    .then(get_osinfo)
    .then(osinfo => {
      output += osinfo+'\r'
      return output
    })
    .then(get_cpu)
    .then(cpu => {
      output += cpu+'\r'
      return output
    })
    .then(output => {
      paste.paste({title: 'test', code: output}, (res, err) => {
        if(err) {
          return cb(null, err)
        }
        return cb(res, null)
      })
    })
}

ipcMain.on('generate_info', function(event, args){
  generator_list((res, err) => {
    if(err) {
      event.sender.send('generate_info', {
        error: 1,
        message: err
      });
      return;
    }
    event.sender.send('generate_info', {
      error: 0,
      message: res
    });
    return;
  });
});

function get_cpu() {
  return new Promise((resolve, reject) => {
    // get main info cpu
    si.cpu(function(res, err){
      if(err) {
        reject(err)
      }

      cpuinfo = new Array();
      cpuinfo['manufacturer'] = res.manufacturer;
      cpuinfo['brand'] = res.brand;
      cpuinfo['speed_coree'] = res.speed;
      cpuinfo['cores_count'] = res.cores;
    
      list_info = '--- CPU info ---\n';
      Object.keys(cpuinfo).forEach(function(key) {
        list_info += key+': '+cpuinfo[key]+'\n';
      });
      resolve(list_info)
    })
  })
}

function get_osinfo() {
  return new Promise((resolve, reject) => {
    // get main info OS
    si.osInfo(function(res, err){
      if(err) {
        reject(err)
      }

      osinfo = new Array();
      osinfo['platform'] = res.platform;
      osinfo['distro'] = res.distro;
      osinfo['release'] = res.release;
      osinfo['codename'] = (process.platform === 'darwin' ? '-' : res.codename);
      osinfo['kernel'] = res.kernel;
      osinfo['arch'] = res.arch;
      osinfo['hostname'] = res.hostname;
      osinfo['logofile'] = res.logofile;
    
      list_info = '--- OS info ---\n';
      Object.keys(osinfo).forEach(function(key) {
        list_info += key+': '+osinfo[key]+'\n';
      });
      resolve(list_info)
    })
  })
}

function get_mem() {
  return new Promise((resolve, reject) => {
    // get main info memory
    si.mem(function(res, err){
      if(err) {
        reject(err)
      }

      meminfo = new Array();
      meminfo['total_memory'] = formatBytes(res.total);
      meminfo['swaptotal'] = formatBytes(res.swaptotal);
      
      list_info = '--- Memory info ---\n';
      Object.keys(meminfo).forEach(function(key) {
        list_info += key+': '+meminfo[key]+'\n';
      });
      resolve(list_info)
    })
  })
}
 
function get_system() {
  return new Promise((resolve, reject) => {
    // get main info device
    si.system(function(res, err){
      if(err) {
        reject(err)
      }

      systeminfo = new Array();
      systeminfo['manufacturer'] = res.manufacturer;
      systeminfo['model'] = res.model;
      systeminfo['serial'] = res.serial;
      systeminfo['uuid'] = res.uuid;

      list_info = '--- System info ---\n';
      Object.keys(systeminfo).forEach(function(key) {
        list_info += key+': '+systeminfo[key]+'\n';
      });
      resolve(list_info)
    });
  })
}

function get_batteryinfo() {
  return new Promise((resolve, reject) => {
    // get main info battery
    si.battery(function(res, err){
      if(err) {
        reject(err)
      }
      batteryinfo = new Array();

      batteryinfo['hasbattery'] = res.hasbattery;
      batteryinfo['maxcapacity'] = res.maxcapacity;

      
      list_info = '--- Battery info ---\n';
      Object.keys(batteryinfo).forEach(function(key) {
        list_info += key+': '+batteryinfo[key]+'\n';
      });
      resolve(list_info)
    })
  })
}


function get_graphicsinfo() {
  return new Promise((resolve, reject) => {
    si.graphics(function(res, err){
      if(err) {
        reject(reject)
      }

      graphicsinfo = new Array();

      graphicsinfo['model'] = res.controllers[0].model;
      graphicsinfo['vendor'] = res.controllers[0].vendor;
      graphicsinfo['videoram'] = res.controllers[0].vram+' MB';
      graphicsinfo['display_model'] = res.displays[0].model;
      graphicsinfo['display_connection'] = res.displays[0].connection;
      graphicsinfo['resolutionx'] = res.displays[0].resolutionx;
      graphicsinfo['resolutiony'] = res.displays[0].resolutiony;
      // graphicsinfo['depth'] = res.displays[0].depth;


      list_info = '--- Graphics info ---\n';
      Object.keys(graphicsinfo).forEach(function(key) {
        list_info += key+': '+graphicsinfo[key]+'\n';
      });
      resolve(list_info)
    })
  })
}

function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000;
   var dm = decimals + 1 || 3;
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
