/**
 * This script renames a React Native project, installs node modules, sets up submodules, and initializes a Git repository.
 */

import { exec } from "child_process";
import fs from "fs-extra";
import simpleGit, { SimpleGit } from "simple-git";
import { getProjectPath } from "../util";

/**
 * Renames a React Native project.
 * @param projectName - The name of the project.
 * @param projectPath - The path for the project.
 * @returns A Promise that resolves when the project is renamed successfully.
 */
const renameReactNativeProject = (
  projectName: string,
  projectPath: string
): Promise<void> => {
  console.log("Renaming React Native project...");
  return new Promise((resolve, reject) => {
    exec(
      `react-native-rename ${projectName} -b com.${projectName.toLowerCase()} --skipGitStatusCheck`,
      { cwd: projectPath },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        console.log("React Native project renamed successfully.");
        resolve();
      }
    );
  });
};

/**
 * Installs node modules for a React Native project.
 * @param projectName - The name of the project.
 * @returns A Promise that resolves when the node modules are installed successfully.
 */
async function installReactNativeNodeModules(projectName: string) {
  console.log("Installing node modules for React Native project...");
  return new Promise<void>((resolve, reject) => {
    exec(
      "yarn",
      { cwd: getProjectPath(`${projectName}/app/rn/mobile`) },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error installing node modules: ${error}`);
          return reject(error);
        }
        console.log("Node modules installed successfully.");
        resolve();
      }
    );
  });
}

/**
 * Initializes a React Native project by copying files, renaming the project, and installing node modules.
 * @param projectName - The name of the project.
 * @param tempDir - The temporary directory.
 */
export const initializeReactNativeProject = async (
  projectName: string,
  tempDir: string
) => {
  await fs.copy(
    `${tempDir}/app/rn/mobile`,
    getProjectPath(`./${projectName}/app/rn/mobile`),
    {
      filter: (src) => src !== ".git",
    }
  );

  await renameReactNativeProject(
    projectName,
    getProjectPath(`./${projectName}/app/rn/mobile`)
  );
  await installReactNativeNodeModules(projectName);
};

/**
 * Sets up a React Native project by creating a repository, adding submodules, initializing Git, and pushing initial commit.
 * @param projectName - The name of the project.
 * @param projectGit - The Git instance for the project.
 * @param githubUrl - The GitHub URL.
 * @param tempDir - The temporary directory.
 * @param createRepoFunc - The function to create a repository.
 * @param userOrOrg - The username or organization.
 */
export const setupReactNativeProject = async (
  projectName: string,
  projectGit: SimpleGit,
  githubUrl: string,
  tempDir: string,
  createRepoFunc: any,
  userOrOrg: string
) => {
  await createRepoFunc({
    org: userOrOrg,
    name: `${projectName}-rn-app`,
    auto_init: true,
  });
  await projectGit.submoduleAdd(
    `${githubUrl}/${projectName}-rn-app.git`,
    "app/rn/mobile"
  );
  await projectGit.submoduleAdd(
    "https://github.com/react-ghana/lib-react-native.git",
    "app/rn/lib/lib-react-native"
  );

  await initializeReactNativeProject(projectName, tempDir);

  let appGit = simpleGit(getProjectPath(`./${projectName}/app/rn/mobile`));

  await appGit.add("./*");
  await appGit.commit("Initial commit");
  await appGit.push("origin", "main");
};
