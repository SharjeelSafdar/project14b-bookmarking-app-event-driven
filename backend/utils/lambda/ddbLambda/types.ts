import { EventBridgeEvent } from "aws-lambda";

export enum Mutations {
  CREATE_BOOKMARK = "createBookmark",
  EDIT_BOOKMARK = "editBookmark",
  DELETE_BOOKMARK = "deleteBookmark",
  BATCH_DELETE_BOOKMARKS = "batchDeleteBookmarks",
}

export type DetailType =
  | {
      id: never;
      title: string;
      url: string;
      ids: string[];
    }
  | {
      id: string;
      title: string;
      url: string;
      ids: string[];
    }
  | {
      id: string;
      title: never;
      url: never;
      ids: string[];
    }
  | {
      id: never;
      title: never;
      url: never;
      ids: string[];
    };

export type EventType = EventBridgeEvent<Mutations, DetailType>;
