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
        sourceFilePath: "config/task.json",
        destinationFilePath: "dist/buildAndReleaseTask/task.json"
      },
      {
        sourceFilePath: "dist/index.js",
        destinationFilePath: "dist/buildAndReleaseTask/index.js"
      }
    ]
  })
);

task("tfx", () =>
  execSync(
    "tfx extension create --manifest-globs ./config/vss-extension.json --output-path dist"
  )
);

task(
  "build",
  series("clean", webpackTask({ config: "./config/webpack.config.js" }))
);

task("pack", series("build", "copy", "tfx"));
