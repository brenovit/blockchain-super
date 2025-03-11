import * as fs from "fs";
import * as path from "path";
import { Blockchain } from ".";

export class StorageService {
  identifier: string;
  filePath: string;
  fileName: string;

  constructor(identifier: string) {
    this.identifier = identifier;
    this.fileName = `blockchain-${this.identifier}.json`;
    this.filePath = path.join(__dirname, this.fileName);
  }

  saveData = (data: Blockchain): void => {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
      console.log(`${this.fileName} written successfully`);
    } catch (error) {
      console.error("Error writing JSON:", error);
    }
  };

  // Function to read JSON data from a file
  loadData = (): Blockchain | null => {
    try {
      if (!fs.existsSync(this.filePath)) {
        console.log(`${this.fileName} file not found!`);
        return null;
      }

      const fileData = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(fileData);
    } catch (error) {
      console.error(`Error reading ${this.fileName}`, error);
      return null;
    }
  };
}
