import * as fs from "fs";
import * as path from "path";
import { Blockchain } from ".";
import { Logger } from "./logger";

export class StorageService {
  identifier: string;
  filePath: string;
  fileName: string;

  constructor(identifier: any) {
    this.identifier = identifier;
    this.fileName = `blockchain-${this.identifier}.json`;
    this.filePath = path.join(__dirname, "../data/".concat(this.fileName));
  }

  saveData = (data: Blockchain): void => {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
      Logger.debug(`${this.fileName} written successfully`);
    } catch (error) {
      Logger.error(`Error writing data: ${JSON.stringify(error)}`);
    }
  };

  // Function to read JSON data from a file
  loadData = (): Blockchain | null => {
    try {
      if (!fs.existsSync(this.filePath)) {
        Logger.debug(`${this.fileName} file not found!`);
        return null;
      }

      const fileData = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(fileData);
    } catch (error) {
      Logger.error(`Error reading ${this.fileName} : ${JSON.stringify(error)}`);
      return null;
    }
  };
}
