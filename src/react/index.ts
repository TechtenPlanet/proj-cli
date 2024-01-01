/**
 * This code is responsible for setting up and initializing a React project.
 * It includes functions to install node modules, copy files, create a repository,
 * add a submodule, initialize the project, commit changes, and push to the repository.
 */

import { exec } from "child_process";
import fs from "fs-extra";
import simpleGit, { SimpleGit } from "simple-git";
import { getProjectPath } from "../util";

/**
 * Installs node modules for a React project.
 * @param projectName - Name of the project.
 * @returns A promise that resolves when the node modules are installed successfully.
 */
const installReactNodeModules = async (projectName: string): Promise<void> => {
  console.log("Installing node modules for React project...");
  return new Promise<void>((resolve, reject) => {
    exec(
      "yarn",
      { cwd: getProjectPath(`./${projectName}/app/react/web`) },
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
};

/**
 * Initializes a React project by copying files and installing node modules.
 * @param projectName - Name of the project.
 * @param tempDir - Temporary directory path.
 */
export const initializeReactProject = async (
  projectName: string,
  tempDir: string
) => {
  await fs.copy(
    `${tempDir}/app/react/web`,
    getProjectPath(`./${projectName}/app/react/web`),
    {
      filter: (src) => src !== ".git",
    }
  );
  await installReactNodeModules(projectName);
};

/**
 * Sets up a React project by creating a repository, adding a submodule,
 * initializing the project, committing changes, and pushing to the repository.
 * @param projectName - Name of the project.
 * @param projectGit - SimpleGit instance for the project.
 * @param githubUrl - GitHub URL.
 * @param tempDir - Temporary directory path.
 * @param createRepoFunc - Function to create a repository.
 * @param userOrOrg - User or organization name.
 */
export const setupReactProject = async (
  projectName: string,
  projectGit: SimpleGit,
  githubUrl: string,
  tempDir: string,
  createRepoFunc: any,
  userOrOrg: string
) => {
  await createRepoFunc({
    org: userOrOrg,
    name: `${projectName}-react-app`,
    auto_init: true,
  });
  await projectGit.submoduleAdd(
    `${githubUrl}/${projectName}-react-app.git`,
    "app/react/web"
  );
  await initializeReactProject(projectName, tempDir);
  let appGit = simpleGit(getProjectPath(`./${projectName}/app/react/web`));
  await appGit.add("./*");
  await appGit.commit("Initial commit");
  await appGit.push("origin", "main");
};
