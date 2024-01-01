/**
 * util.ts - Utility functions for file operations
 */

import path from "path";

/**
 * Returns the absolute path of a project file.
 * @param projectPath - The relative path of the project file.
 * @returns The absolute path of the project file.
 */
export const getProjectPath = (projectPath: string) =>
  path.join(process.cwd(), "out", projectPath);