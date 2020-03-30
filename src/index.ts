import { WebApi, getPersonalAccessTokenHandler } from "azure-devops-node-api";
import {
  CommentType,
  CommentThreadStatus
} from "azure-devops-node-api/interfaces/GitInterfaces";
import * as taskLib from "azure-pipelines-task-lib";
import { GitApi } from "azure-devops-node-api/GitApi";

const createComment = async (
  gitApi: GitApi,
  content: string,
  repositoryId: string,
  pullRequestId: number
) => {
  return gitApi.createThread(
    {
      comments: [
        {
          parentCommentId: 0,
          content,
          commentType: CommentType.Text
        }
      ],
      status: CommentThreadStatus.Closed
    },
    repositoryId,
    pullRequestId
  );
};

export const getVariables = () => {
  const accessToken = taskLib.getVariable("System.AccessToken");
  if (!accessToken) {
    throw new Error("Bad input for System.AccessToken");
  }
  taskLib.debug(`accessToken:${accessToken}`);
  const repositoryId = taskLib.getVariable("Build.Repository.ID");
  if (!repositoryId) {
    throw new Error("Bad input for repositoryId");
  }
  taskLib.debug(`repositoryId:${repositoryId}`);

  const pullRequestId = Number(
    taskLib.getVariable("System.PullRequest.PullRequestId")
  );
  if (!pullRequestId) {
    throw new Error("Bad input for pullRequestId");
  }
  taskLib.debug(`pullRequestId:${pullRequestId}`);

  return {
    accessToken,
    repositoryId,
    pullRequestId
  };
};

const getInputs = () => {
  const organizationUrl = taskLib.getInput("organizationUrl", true);
  if (!organizationUrl) {
    throw new Error("Bad input for organizationUrl");
  }
  taskLib.debug(`organizationUrl:${organizationUrl}`);

  const content = taskLib.getInput("content", true);
  if (!content) {
    throw new Error("Bad input for content");
  }
  taskLib.debug(`content:${content}`);

  return {
    organizationUrl,
    content
  };
};

async function run() {
  try {
    taskLib.debug("heyo run");
    const { accessToken, pullRequestId, repositoryId } = getVariables();
    const { organizationUrl, content } = getInputs();

    const authHandler = getPersonalAccessTokenHandler(accessToken);
    const connection = new WebApi(organizationUrl, authHandler);
    if (!connection) {
      taskLib.setResult(taskLib.TaskResult.Failed, "Connection failed");
      return;
    }

    taskLib.debug("connection successfully");
    const gitApi = await connection.getGitApi();
    taskLib.debug("gitapi created");
    const result = await createComment(
      gitApi,
      content,
      repositoryId,
      pullRequestId
    );
    taskLib.debug("comment created");
    taskLib.setResult(
      taskLib.TaskResult.Succeeded,
      `$Comment created with Id:${result.id}`
    );
  } catch (err) {
    taskLib.setResult(taskLib.TaskResult.Failed, err.message);
  }
}

run()
  .then(() =>
    taskLib.setResult(
      taskLib.TaskResult.Succeeded,
      `Task completed successfully`
    )
  )
  .catch(err => {
    taskLib.setResult(taskLib.TaskResult.Failed, `Task failed: ${err}`);
  });
