import { DynamoDBStreamHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import fetch from "node-fetch";

import { determineMutationType, getData } from "./utilFunctions";

const url = process.env.APPSYNC_GRAPHQL_API_ENDPOINT as string;
const apiKey = process.env.APPSYNC_API_KEY as string;

export const handler: DynamoDBStreamHandler = async (
  event,
  context,
  callback
) => {
  console.log(
    `DynamoDB Stream Records = ${JSON.stringify(event.Records, null, 2)}`
  );

  event.Records.forEach(async record => {
    const postBody = {
      query: /* GraphQL */ `
        mutation MutationCompleted(
          $mutationType: String!
          $bookmark: BookmarkInput!
        ) {
          mutationCompleted(mutationType: $mutationType, bookmark: $bookmark) {
            mutationType
            bookmark {
              id
              title
              url
            }
          }
        }
      `,
      variables: {
        mutationType: determineMutationType(record),
        bookmark: getData(record),
      },
    };
    console.log(`Post Body = ${JSON.stringify(postBody, null, 2)}`);

    const endpoint = new AWS.Endpoint(url);

    const options = {
      method: "POST",
      body: JSON.stringify(postBody),
      headers: {
        host: endpoint.host,
        "Content-Type": "application/json; charset=UTF-8",
        "x-api-key": apiKey,
      },
    };
    const response = await fetch(endpoint.href, options);
    const json = await response.json();

    console.log("Mutation Completed: ", json);
  });

  callback(null);
};
