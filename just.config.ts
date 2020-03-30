import { execSync } from "child_process";
import {
  cleanTask,
  copyInstructionsTask,
  series,
  task,
  webpackTask
} from "just-scripts";

task(
  "clean",
  cleanTask({
    paths: ["dist", "lib"]
  })
);

task("build", series("clean", webpackTask()));

task(
  "copy",
  copyInstructionsTask({
    copyInstructions: [
      {
        sourceFilePath: "task.json",
        destinationFilePath: "dist/buildAndReleaseTask/task.json"
      },
      {
        sourceFilePath: "dist/index.js",
        destinationFilePath: "dist/buildAndReleaseTask/index.js"
      }
    ]
  })
);

task("create-extension", () =>
  execSync(
    "tfx extension create --manifest-globs vss-extension.json --output-path dist"
  )
);

task("pack", series("copy", "create-extension"));

task("bump-publish", () =>
  execSync(`node dist/bumpVersion.js ${process.env.PUBLISH_TOKEN}`)
);

task("git-push", () =>
  execSync(
    'git add . && git commit -a -m "Applying package updates" && git push'
  )
);

task("bump", series("bump-publish", "git-push"));
