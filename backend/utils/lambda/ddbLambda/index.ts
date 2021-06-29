import * as AWS from "aws-sdk";

import { EventType, Mutations } from "./types";
import { createBookmark } from "./createBookmark";
import { editBookmark } from "./editBookmark";
import { deleteBookmark } from "./deleteBookmark";
import { batchDeleteBookmarks } from "./batchDeleteBookmarks";

const BOOKMARKS_TABLE_NAME = process.env.BOOKMARKS_TABLE_NAME;
const STACK_REGION = process.env.STACK_REGION;
const ddbClient = new AWS.DynamoDB.DocumentClient({ region: STACK_REGION });

export const handler = async (event: EventType) => {
  console.log("Event: ", JSON.stringify(event, null, 2));

  if (!STACK_REGION || !BOOKMARKS_TABLE_NAME) {
    const message =
      "STACK_REGION and BOOKMARKS_TABLE_NAME env variables must be provided.";
    console.log(message);
    throw new Error(message);
  }

  const mutationType = event["detail-type"];

  switch (mutationType) {
    case Mutations.CREATE_BOOKMARK: {
      await createBookmark(
        ddbClient,
        BOOKMARKS_TABLE_NAME,
        event.detail.title,
        event.detail.url
      );
      break;
    }
    case Mutations.EDIT_BOOKMARK: {
      await editBookmark(
        ddbClient,
        BOOKMARKS_TABLE_NAME,
        event.detail.id,
        event.detail.title,
        event.detail.url
      );
      break;
    }
    case Mutations.DELETE_BOOKMARK: {
      await deleteBookmark(ddbClient, BOOKMARKS_TABLE_NAME, event.detail.id);
      break;
    }
    case Mutations.BATCH_DELETE_BOOKMARKS: {
      const parsedIds = event.detail.ids
        .slice(1, -1)
        .split(",")
        .map((id, ind) => (ind === 0 ? id : id.slice(1)));
      console.log("parsedIds: ", parsedIds);
      await batchDeleteBookmarks(ddbClient, BOOKMARKS_TABLE_NAME, parsedIds);
      break;
    }
    default: {
      break;
    }
  }
};
