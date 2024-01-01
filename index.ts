#! /usr/bin/env node

/**
 * This script is a command-line interface (CLI) that allows users to create new projects based on templates.
 * It supports creating projects for React, React Native, and Parse Server.
 * Users can provide a GitHub URL to create a repository and push the project to it.
 * If no GitHub URL is provided, the script will skip repository creation and initialize the project locally.
 */

import "dotenv/config";
import { Octokit } from "@octokit/rest";
import fs from "fs-extra";
import inquirer from "inquirer";
import simpleGit from "simple-git";
import {
  initializeReactNativeProject,
  setupReactNativeProject,
} from "./src/react-native";
import { initializeReactProject, setupReactProject } from "./src/react";
import { initializeServerProject, setupServerProject } from "./src/server";
import {
  checkRNRenamePackage,
  getProjectPath,
  removeTempDir,
} from "./src/util";

const main = async () => {
  console.log("Starting CLI...");
  // Check if GitHub URL and token are provided
  if (!process.env.GITHUB_URL && !process.env.GITHUB_TOKEN) {
    console.log("A GitHub account was not found.");
  }

  const githubUrl = process.env.GITHUB_URL;
  try {
    await checkRNRenamePackage();
  } catch {
    console.log("Are we weror");
    process.exit(1); // Exit if the command fails
  }

  const git = simpleGit();
  const tempDir = "./out/tempDir";

  // Remove temporary directory if it exists
  if (fs.existsSync(tempDir)) {
    await removeTempDir(tempDir);
  }
  // Ask the user for the project type they want to create
  const questions = [
    { type: "input", name: "projectName", message: "Enter project name:" },
    {
      type: "checkbox",
      name: "projectTypes",
      message: "Which project templates would you like to use?",
      choices: [
        { name: "React", value: "react" },
        { name: "React Native", value: "reactNative" },
        { name: "Parse Server", value: "parseServer" },
      ],
    },
  ];
  // Wait for user response
  let { projectTypes, projectName } = await inquirer.prompt(questions);

  console.log("Cloning template repository to temporary directory...");
  await git.clone("https://github.com/react-ghana/template.git", tempDir, [
    "--recursive",
  ]);

  if (githubUrl) {
    console.log("GitHub URL provided. Proceeding with repository creation...");

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const userOrOrg = githubUrl.split("github.com/")[1];
    let isOrganization: boolean;

    try {
      await octokit.orgs.get({ org: userOrOrg });
      isOrganization = true;
    } catch (error) {
      isOrganization = false;
    }

    let createRepoFunc = isOrganization
      ? octokit.repos.createInOrg
      : octokit.repos.createForAuthenticatedUser;

    try {
      // Delete existing repositories with the same names
      await octokit.repos.delete({ owner: userOrOrg, repo: projectName });
      await octokit.repos.delete({
        owner: userOrOrg,
        repo: `${projectName}-react-app`,
      });
      await octokit.repos.delete({
        owner: userOrOrg,
        repo: `${projectName}-rn-app`,
      });
      await octokit.repos.delete({
        owner: userOrOrg,
        repo: `${projectName}-server`,
      });
    } catch (err) {}

    // Create the main project repository
    await createRepoFunc({
      org: userOrOrg,
      name: projectName,
      auto_init: true,
    });

    const mainRepoUrl = `${githubUrl}/${projectName}.git`;
    await git.clone(mainRepoUrl, getProjectPath(projectName));
    const projectGit = simpleGit(getProjectPath(projectName));

    // Setup project based on selected project types
    if (projectTypes.includes("react")) {
      await setupReactProject(
        projectName,
        projectGit,
        githubUrl,
        tempDir,
        createRepoFunc,
        userOrOrg
      );
    }
    if (projectTypes.includes("reactNative")) {
      await setupReactNativeProject(
        projectName,
        projectGit,
        githubUrl,
        tempDir,
        createRepoFunc,
        userOrOrg
      );
    }
    if (projectTypes.includes("parseServer")) {
      await setupServerProject(
        projectName,
        projectGit,
        githubUrl,
        tempDir,
        createRepoFunc,
        userOrOrg
      );
    }

    // Commit and push the changes to the main repository
    await projectGit.add("./*");
    await projectGit.commit("Initial commit with submodules");
    await projectGit.push("origin", "main");
  } else {
    console.log("GitHub URL not provided. Skipping repository creation...");

    // Initialize the project locally based on selected project types
    if (projectTypes.includes("react")) {
      await initializeReactProject(projectName, tempDir);
    }
    if (projectTypes.includes("reactNative")) {
      await initializeReactNativeProject(projectName, tempDir);
    }
    if (projectTypes.includes("parseServer")) {
      await initializeServerProject(projectName, tempDir);
    }
  }

  // Remove temporary directory if it exists
  if (fs.existsSync(tempDir)) {
    await removeTempDir(tempDir);
  }

  console.log("CLI operation completed.");
};

main().catch(console.error);
