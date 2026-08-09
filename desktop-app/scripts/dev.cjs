const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const isWindows = process.platform === "win32";
const npm = isWindows ? "npm.cmd" : "npm";
const processes = [];

const run = (args, options = {}) => {
  const child = spawn(npm, args, { cwd: root, stdio: "inherit", shell: isWindows, ...options });
  processes.push(child);
  return child;
};

const waitForClient = (attempt = 0) => new Promise((resolve, reject) => {
  const request = http.get("http://localhost:5173", (response) => {
    response.resume();
    resolve();
  });
  request.on("error", () => {
    if (attempt >= 40) return reject(new Error("The CRM client did not start on port 5173."));
    setTimeout(() => resolve(waitForClient(attempt + 1)), 500);
  });
  request.setTimeout(1000, () => request.destroy());
});

const stopAll = () => processes.forEach((child) => child.kill());
process.on("SIGINT", stopAll);
process.on("SIGTERM", stopAll);

(async () => {
  run(["run", "dev:server"]);
  run(["run", "dev:client"]);
  await waitForClient();
  run(["exec", "electron", "."], {
    cwd: path.join(root, "desktop-app"),
    env: { ...process.env, CALL_FLOW_DESKTOP_URL: "http://localhost:5173" }
  });
})();
