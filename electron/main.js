const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = !app.isPackaged;

let backendProcess = null;

// Start the backend server
function startBackend() {
  return new Promise((resolve, reject) => {
    try {
      const backendPath = isDev 
        ? path.join(__dirname, '..', 'backend', 'src', 'server.js')
        : path.join(process.resourcesPath, 'backend', 'src', 'server.js');

      console.log('🚀 Starting backend from:', backendPath);
      
      backendProcess = spawn('node', [backendPath], {
        stdio: 'pipe',
        windowsHide: true
      });

      // Listen for backend ready message
      let backendReady = false;
      backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('[Backend]:', output);
        
        if (output.includes('running on port 5000') && !backendReady) {
          backendReady = true;
          console.log('✅ Backend started successfully');
          resolve();
        }
      });

      backendProcess.stderr.on('data', (data) => {
        console.error('[Backend Error]:', data.toString());
      });

      backendProcess.on('error', (err) => {
        console.error('Failed to start backend:', err);
        reject(err);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!backendReady) {
          console.log('✅ Backend started (timeout)');
          resolve();
        }
      }, 10000);

    } catch (err) {
      console.error('Error starting backend:', err);
      reject(err);
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const indexPath = path.join(__dirname, '..', 'build', 'index.html');
  win.loadFile(indexPath);

  // Kill backend when window closes
  win.on('closed', () => {
    if (backendProcess) {
      console.log('🛑 Stopping backend');
      backendProcess.kill();
    }
  });
}

// Start backend first, then create window
app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (err) {
    console.error('Failed to start application:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on exit
process.on('exit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
