import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

const fsStat = promisify(fs.stat);
const fsReaddir = promisify(fs.readdir);
const NodeGreaterThanXX = nodeGreaterThanXX();

export default class ModelPaths {
  paths: Set<string> = new Set();

  private absSrcPath: string;

  private singular: boolean = false;

  constructor(absSrcPath: string, singular: boolean = false) {
    this.absSrcPath = absSrcPath;
    this.singular = singular;
    this.updatePaths();
  }

  setSingular(singular: boolean = false): Promise<boolean> {
    if (this.singular === !!singular) return Promise.resolve(false);
    this.singular = !!singular;
    return this.updatePaths();
  }

  async updatePaths() {
    const modelDirname = this.singular ? 'model' : 'models';
    const globalModelsTask = findTypeScriptFilesRecursively(join(this.absSrcPath, modelDirname));
    const nextPaths = [...(await globalModelsTask)];
    const hasUpdated = nextPaths.some(path => !this.paths.has(path));
    this.paths = new Set(nextPaths);
    return hasUpdated;
  }
}

async function findTypeScriptFilesRecursively(specPath: string): Promise<string[]> {
  const { files, directories } = await groupAbsFilesPathsInSpecificPath(specPath);
  const subDirs = await Promise.all(directories.map(dir => findTypeScriptFilesRecursively(dir)));
  return files.filter(file => file.endsWith('.ts')).concat(...subDirs);
}

async function groupAbsFilesPathsInSpecificPath(specPath: string) {
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
