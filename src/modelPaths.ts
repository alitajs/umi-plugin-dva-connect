import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

/**
 * initialize promisified nodejs api
 */
const fsStat = promisify(fs.stat);
const fsReaddir = promisify(fs.readdir);
const NodeGreaterThanXX = nodeGreaterThanXX();

export default async function findDvaModelAbsPaths(
  absSrcPath: string,
  singular: boolean,
): Promise<string[]> {
  const modelDir = singular ? 'model' : 'models';
  const globalModelsTask = findTypeScriptFilesRecursively(join(absSrcPath, modelDir));
  return [...(await globalModelsTask)];
}

async function findTypeScriptFilesRecursively(specPath: string): Promise<string[]> {
  const { files, directories } = await groupFilesAbsPathsInSpecificPath(specPath);
  const subDirs = await Promise.all(directories.map(dir => findTypeScriptFilesRecursively(dir)));
  return files.filter(file => file.endsWith('.ts')).concat(...subDirs);
}

async function groupFilesAbsPathsInSpecificPath(specPath: string) {
  const grouped: { files: string[]; directories: string[] } = { files: [], directories: [] };
  if (NodeGreaterThanXX) {
    const filesDirents = await fsReaddir(specPath, { withFileTypes: true });
    filesDirents.forEach(file => {
      const absFilePath = join(specPath, file.name);
      if (file.isFile()) grouped.files.push(absFilePath);
      else if (file.isDirectory()) grouped.directories.push(absFilePath);
    });
  } else {
    const filesPaths = await fsReaddir(specPath);
    const filesStats = await Promise.all(filesPaths.map(file => fsStat(file)));
    filesPaths.forEach((file, index) => {
      const absFilePath = join(specPath, file);
      if (filesStats[index].isFile()) grouped.files.push(absFilePath);
      else if (filesStats[index].isDirectory()) grouped.directories.push(absFilePath);
    });
  }
  return grouped;
}

function nodeGreaterThanXX(): boolean {
  const [major, minor] = process.version.match(/(\d*)\.(\d*)\.(\d*)/).slice(1);
  if (parseInt(major) > 10) return true;
  return major === '10' && parseInt(minor) >= 10;
}
