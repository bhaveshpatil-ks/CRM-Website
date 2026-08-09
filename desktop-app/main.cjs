const { app, BrowserWindow } = require("electron");

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 720,
    autoHideMenuBar: true,
    title: "AI CALL CRM",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  window.loadURL(process.env.CALL_FLOW_DESKTOP_URL || "http://localhost:5173");
};

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
