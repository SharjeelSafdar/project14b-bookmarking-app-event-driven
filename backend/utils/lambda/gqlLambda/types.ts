export enum Mutations {
  CREATE_BOOKMARK = "createBookmark",
  EDIT_BOOKMARK = "editBookmark",
  DELETE_BOOKMARK = "deleteBookmark",
  BATCH_DELETE_BOOKMARKS = "batchDeleteBookmarks",
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
}
