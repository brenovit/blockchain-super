import * as fs from "fs";
import * as path from "path";
import { Blockchain } from ".";

const filePath = path.join(__dirname, "blockchain.json");

// Function to write JSON data to a file
const saveData = (data: Blockchain): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log("Blockchain written successfully");
  } catch (error) {
    console.error("Error writing JSON:", error);
  }
};

// Function to read JSON data from a file
const loadData = (): Blockchain | null => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log("Blockchain file not found!");
      return null;
    }

    const fileData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading Blockchain:", error);
    return null;
  }
};

export { saveData, loadData };
