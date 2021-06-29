import * as AWS from "aws-sdk";
import { randomBytes } from "crypto";

export const createBookmark = async (
  ddbClient: AWS.DynamoDB.DocumentClient,
  TableName: string,
  title: string,
  url: string
) => {
  try {
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName,
      Item: {
        id: randomBytes(16).toString("hex"),
        title,
        url,
      },
    };
    await ddbClient.put(params).promise();
    console.log("New Bookmark Added");
  } catch (error) {
    console.log("Error creating new bookmark: ", error);
  }
};
