import * as fs from "fs";
import * as path from "path";
import { Logger } from "../../utils/logger.js";
import { Blockchain } from "../model/blockchain.js";

export class StorageService {
  identifier: string;
  filePath: string;
  fileName: string;

  constructor(identifier: any) {
    this.identifier = identifier;
    this.fileName = `blockchain-${this.identifier}.json`;
    // Resolve folder from the project root
    const dataDir = path.resolve(process.cwd(), "data");
    // Ensure the directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.filePath = path.join(dataDir, this.fileName);
    Logger.trace("Blockchain will be save on: " + this.filePath);
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
