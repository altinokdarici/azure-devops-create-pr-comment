import { readFile, writeFile } from "fs-extra";
import path from "path";
import { exit } from "process";

interface PackageJson {
  version: string;
}

const readJson = async <T>(path: string) => {
  return JSON.parse(await readFile(path, "utf8")) as T;
};

const writeJson = async <T>(path: string, content: T) => {
  return writeFile(path, JSON.stringify(content, null, "\t"));
};

const readPackageJson = async () => {
  const content = await readJson<PackageJson>(
    path.join(__dirname, "..", "package.json")
  );
  const [major, minor, patch] = content.version.split(".");
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch)
  };
};

interface TaskJson {
  version: {
    Major: number;
    Minor: number;
    Patch: number;
  };
}
const updateTaskJson = async (major: number, minor: number, patch: number) => {
  const filePath = path.join(__dirname, "..", "task.json");
  const content = await readJson<TaskJson>(filePath);
  content.version = {
    Major: major,
    Minor: minor,
    Patch: patch
  };

  return writeJson(filePath, content);
};

const updateExtensionJson = async (
  major: number,
  minor: number,
  patch: number
) => {
  const filePath = path.join(__dirname, "..", "vss-extension.json");
  const content = await readJson<PackageJson>(filePath);
  content.version = `${major}.${minor}.${patch}`;
  return writeJson(filePath, content);
};

export const bumpVersion = async () => {
  const { major, minor, patch } = await readPackageJson();
  await updateTaskJson(major, minor, patch);
  await updateExtensionJson(major, minor, patch);
};

bumpVersion()
  .then(() => {
    console.log("task.json and vss-extension.json bumped");
  })
  .catch(err => {
    console.log(`Error: ${err}`);
    exit(1);
  });
