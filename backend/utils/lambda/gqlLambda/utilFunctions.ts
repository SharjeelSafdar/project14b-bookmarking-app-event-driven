import { DynamoDBRecord } from "aws-lambda";
import { Mutations, Bookmark } from "./types";

export const determineMutationType = (record: DynamoDBRecord) => {
  switch (record.eventName) {
    case "INSERT": {
      return Mutations.CREATE_BOOKMARK;
    }
    case "MODIFY": {
      return Mutations.EDIT_BOOKMARK;
    }
    case "REMOVE":
    default: {
      return Mutations.DELETE_BOOKMARK;
    }
  }
};

export const getData = (record: DynamoDBRecord): Bookmark | null => {
  if (record.dynamodb?.NewImage) {
    return {
      id: record.dynamodb.NewImage.id.S as string,
      title: record.dynamodb.NewImage.title.S as string,
      url: record.dynamodb.NewImage.url.S as string,
    };
  } else if (record.dynamodb?.OldImage) {
    return {
      id: record.dynamodb.OldImage.id.S as string,
      title: record.dynamodb.OldImage.title.S as string,
      url: record.dynamodb.OldImage.url.S as string,
    };
  } else {
    return null;
  }
};
