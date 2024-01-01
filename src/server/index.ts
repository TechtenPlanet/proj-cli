/**
 * This file contains functions for initializing and setting up a server project.
 */

import fs from "fs-extra";
import simpleGit, { SimpleGit } from "simple-git";
import { getProjectPath } from "../util";

/**
 * Initializes the server project by copying files from a temporary directory.
 * @param projectName - The name of the project.
 * @param tempDir - The path of the temporary directory.
 */
export const initializeServerProject = async (
  projectName: string,
  tempDir: string
) => {
  await fs.copy(
    `${tempDir}/server/parse-b4a`,
    getProjectPath(`./${projectName}/server/parse-b4a`),
    { filter: (src) => src !== ".git", }
  );
};

/**
 * Sets up the server project by creating a repository, adding a submodule, initializing the project, and making an initial commit.
 * @param projectName - The name of the project.
 * @param projectGit - The SimpleGit instance for the project.
 * @param githubUrl - The GitHub URL.
 * @param tempDir - The path of the temporary directory.
 * @param createRepoFunc - The function for creating a repository.
 * @param userOrOrg - The username or organization name.
 */
export const setupServerProject = async (
  projectName: string,
  projectGit: SimpleGit,
  githubUrl: string,
  tempDir: string,
  createRepoFunc: any,
  userOrOrg: string
) => {
  await createRepoFunc({
    org: userOrOrg,
    name: `${projectName}-server`,
    auto_init: true,
  });
  await projectGit.submoduleAdd(
    `${githubUrl}/${projectName}-server.git`,
    "server/parse-b4a"
  );
  await initializeServerProject(projectName, tempDir);
  let appGit = simpleGit(getProjectPath(`./${projectName}/server/parse-b4a`));
  await appGit.add("./*");
  await appGit.commit("Initial commit");
  await appGit.push("origin", "main");
};
