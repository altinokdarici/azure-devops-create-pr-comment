import { readFile, writeFile } from "fs-extra";
import { exit } from "process";
import { execSync } from "child_process";

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
  const content = await readJson<PackageJson>("package.json");
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
  const filePath = "task.json";
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
  const filePath = "vss-extension.json";
  const content = await readJson<PackageJson>(filePath);
  content.version = `${major}.${minor}.${patch}`;
  return writeJson(filePath, content);
};

export const bumpVersion = async () => {
  const {
    major: preMajor,
    minor: preMinor,
    patch: prePatch
  } = await readPackageJson();
  execSync("beachball changelog");
  execSync("beachball bump");
  const { major, minor, patch } = await readPackageJson();
  if (major !== preMajor && minor !== preMinor && patch != prePatch) {
    await updateTaskJson(major, minor, patch);
    await updateExtensionJson(major, minor, patch);
  }
};

bumpVersion()
  .then(() => {
    console.log("task.json and vss-extension.json bumped");
  })
  .catch(err => {
    console.log(`Error: ${err}`);
    exit(1);
  });
