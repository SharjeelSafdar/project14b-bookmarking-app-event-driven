import * as AWS from "aws-sdk";

import { deleteBookmark } from "./deleteBookmark";

export const batchDeleteBookmarks = async (
  ddbClient: AWS.DynamoDB.DocumentClient,
  TableName: string,
  ids: string[]
) => {
  try {
    ids.forEach(async id => {
      await deleteBookmark(ddbClient, TableName, id);
    });
    console.log("Bookmarks Deleted in Batch");
  } catch (error) {
    console.log("Error deleting bookmarks in batch: ", error);
  }
};
