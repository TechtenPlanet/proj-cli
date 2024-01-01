/**
 * util.ts - Utility functions for file operations
 */

import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";

/**
 * Returns the absolute path of a project file.
 * @param projectPath - The relative path of the project file.
 * @returns The absolute path of the project file.
 */
export const getProjectPath = (projectPath: string) =>
  path.join(process.cwd(), "out", projectPath);

// Function to remove temporary directory
export const removeTempDir = async (tempDirPath: string) => {
  try {
    await fs.promises.rmdir(tempDirPath, { recursive: true });
    console.log(`Temporary directory ${tempDirPath} has been removed.`);
  } catch (error) {
    console.error(`Error removing temporary directory: ${error}`);
  }
};

export const checkRNRenamePackage = async () => {
  return new Promise<void>((resolve, reject) => {
    exec("react-native-rename --version", (error, stdout, stderr) => {
      if (error) {
        console.log(`react-native-rename is not installed. Installing ...'`);
        exec("npm install -g react-native-rename", (error, stdout, stderr) => {
          if (error) {
            console.error(`Failed to install react-native-rename: ${error}`);
            return reject(error);
          } else {
            console.log("Successfully installed react-native-rename globally");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  });
};
