import * as AWS from "aws-sdk";

export const editBookmark = async (
  ddbClient: AWS.DynamoDB.DocumentClient,
  TableName: string,
  id: string,
  title: string,
  url: string
) => {
  try {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName,
      Key: { id },
      UpdateExpression: "SET #oldTitle = :newTitle, #oldUrl = :newUrl",
      ExpressionAttributeNames: {
        "#oldTitle": "title",
        "#oldUrl": "url",
      },
      ExpressionAttributeValues: {
        ":newTitle": title,
        ":newUrl": url,
      },
    };
    await ddbClient.update(params).promise();
    console.log("Bookmark Updated");
  } catch (error) {
    console.log("Error updating bookmark: ", error);
  }
};
