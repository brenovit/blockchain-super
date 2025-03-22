import * as fs from "fs";
import * as path from "path";
import { Logger } from "../../utils/logger.js";
import { fileURLToPath } from "url";
import { Blockchain } from "../model/blockchain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorageService {
  identifier: string;
  filePath: string;
  fileName: string;

  constructor(identifier: any) {
    this.identifier = identifier;
    this.fileName = `blockchain-${this.identifier}.json`;
    this.filePath = path.join(__dirname, "../data/".concat(this.fileName));
  }

  saveData(data: Blockchain) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
      Logger.trace(`${this.fileName} written successfully`);
    } catch (error) {
      Logger.error(`Error writing data: ${JSON.stringify(error)}`);
      throw error;
    }
  }
  loadData(): Blockchain | null {
    try {
      if (!fs.existsSync(this.filePath)) {
        Logger.trace(`${this.fileName} file not found!`);
        return null;
      }

      const fileData = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(fileData);
    } catch (error) {
      Logger.error(`Error reading ${this.fileName} : ${JSON.stringify(error)}`);
      throw error;
    }
  }
}
