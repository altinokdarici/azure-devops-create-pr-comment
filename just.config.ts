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

task("build", series("clean", webpackTask()));

task("pack", series("build", "copy", "create-extension"));

task("publish-extension", () =>
  execSync(
    `tfx extension publish --manifest-globs vss-extension.json --token ${process.env.PUBLISH_TOKEN}`
  )
);

task("publish", series("pack", "publish-extension"));

task("push", () => {
  execSync('git add . && git commit -m "Applying package updates"');
});
