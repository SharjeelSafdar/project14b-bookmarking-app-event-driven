import * as AWS from "aws-sdk";

import { deleteBookmark } from "./deleteBookmark";

export const batchDeleteBookmarks = async (
  ddbClient: AWS.DynamoDB.DocumentClient,
  TableName: string,
  ids: string[]
) => {
  try {
    for (var i = 0; i < ids.length; ++i) {
      await deleteBookmark(ddbClient, TableName, ids[i]);
    }
    console.log("Bookmarks Deleted in Batch");
  } catch (error) {
    console.log("Error deleting bookmarks in batch: ", error);
  }
};
