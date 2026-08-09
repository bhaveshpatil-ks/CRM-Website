import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initialData } from "./seedData.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const bundleDataFile = path.resolve(currentDirectory, "..", "data", "db.json");

const isVercel = Boolean(process.env.VERCEL);
const dataDirectory = isVercel
  ? path.join(process.env.TMPDIR || "/tmp", "data")
  : path.resolve(currentDirectory, "..", "data");
const dataFile = path.join(dataDirectory, "db.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class Store {
  constructor() {
    this.state = clone(initialData);
    this.writeQueue = Promise.resolve();
    this.ensureDataFile();
    this.load();
  }

  ensureDataFile() {
    try {
      if (!fs.existsSync(dataDirectory)) {
        fs.mkdirSync(dataDirectory, { recursive: true });
      }

      if (!fs.existsSync(dataFile)) {
        if (fs.existsSync(bundleDataFile)) {
          const content = fs.readFileSync(bundleDataFile, "utf8");
          fs.writeFileSync(dataFile, content);
        } else {
          fs.writeFileSync(dataFile, JSON.stringify(this.state, null, 2));
        }
      }
    } catch {
      // In serverless read-only contexts, fallback gracefully
    }
  }

  load() {
    try {
      const sourceFile = fs.existsSync(dataFile)
        ? dataFile
        : fs.existsSync(bundleDataFile)
        ? bundleDataFile
        : null;

      if (!sourceFile) {
        this.state = clone(initialData);
        return;
      }

      const raw = fs.readFileSync(sourceFile, "utf8");
      const parsed = JSON.parse(raw);
      this.state = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        companyRequests: Array.isArray(parsed.companyRequests) ? parsed.companyRequests : [],
        leads: Array.isArray(parsed.leads) ? parsed.leads : []
      };
    } catch {
      this.state = clone(initialData);
    }
  }

  async save() {
    this.writeQueue = this.writeQueue.then(() =>
      fs.promises.writeFile(dataFile, JSON.stringify(this.state, null, 2))
    );

    return this.writeQueue;
  }

  getUsers() {
    return this.state.users;
  }

  getLeads() {
    return this.state.leads;
  }

  getCompanyRequests() {
    return this.state.companyRequests;
  }
}

export const store = new Store();
