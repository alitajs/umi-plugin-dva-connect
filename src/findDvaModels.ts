import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { UmiInternalRoute } from './types';

/**
 * initialize promisified nodejs api
 */
const fsStat = promisify(fs.stat);
const fsExists = promisify(fs.exists);
const fsReaddir = promisify(fs.readdir);
const NodeGreaterThanXX = nodeGreaterThanXX();

export default async function findDvaModels(
  absSrcPath: string,
  singular: boolean,
  routes: UmiInternalRoute[] = [],
): Promise<string[]> {
  const modelDir = singular ? 'model' : 'models';
  const globalModelDir = join(absSrcPath, modelDir);

  /** find pages models */
  const pagesModelsTasks = routes.map(route => findDvaModelsInRoute(absSrcPath, modelDir, route));

  /** there are no global models */
  if (!(await fsExists(globalModelDir)) || !(await fsStat(globalModelDir)).isDirectory())
    return flat(await Promise.all(pagesModelsTasks));

  /** find global models */
  const globalModelsTask = findTypeScriptFilesRecursively(globalModelDir);
  return flat([await globalModelsTask, ...(await Promise.all(pagesModelsTasks))]);
}

async function findDvaModelsInRoute(
  absSrcPath: string,
  dir: string,
  route: UmiInternalRoute = {},
): Promise<string[]> {
  const tasks: Promise<string[]>[] = [];

  /** find models in the directory of component */
  if (route.component && !route.component.startsWith('() =>'))
    tasks.push(findTypeScriptFilesRecursively(join(absSrcPath, route.component, dir)));

  /** find models in sub-routes */
  if (route.routes?.length)
    tasks.push(...route.routes.map(subRoute => findDvaModelsInRoute(absSrcPath, dir, subRoute)));
  return flat(await Promise.all(tasks));
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

function flat<T>(array: (T | T[])[]): T[] {
  return 'flat' in array && typeof array.flat === 'function'
    ? array.flat()
    : array.reduce<T[]>((prev, curr) => prev.concat(curr), []);
}
