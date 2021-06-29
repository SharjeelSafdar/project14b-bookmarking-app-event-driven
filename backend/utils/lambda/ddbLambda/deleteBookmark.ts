import * as AWS from "aws-sdk";

export const deleteBookmark = async (
  ddbClient: AWS.DynamoDB.DocumentClient,
  TableName: string,
  id: string
) => {
  try {
    const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
      TableName,
      Key: { id },
    };
    await ddbClient.delete(params).promise();
    console.log("Bookmark Deleted");
  } catch (error) {
    console.log("Error deleting bookmark: ", error);
  }
};
