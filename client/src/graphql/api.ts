/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type BookmarkInput = {
  id: string,
  title: string,
  url: string,
};

export type MutationCompletedReturnType = {
  __typename: "MutationCompletedReturnType",
  mutationType: string,
  bookmark: Bookmark,
};

export type Bookmark = {
  __typename: "Bookmark",
  id: string,
  title: string,
  url: string,
};

export type CreateBookmarkMutationVariables = {
  title: string,
  url: string,
};

export type CreateBookmarkMutation = {
  createBookmark: string,
};

export type EditBookmarkMutationVariables = {
  id: string,
  title: string,
  url: string,
};

export type EditBookmarkMutation = {
  editBookmark: string,
};

export type DeleteBookmarkMutationVariables = {
  id: string,
};

export type DeleteBookmarkMutation = {
  deleteBookmark: string,
};

export type BatchDeleteBookmarksMutationVariables = {
  ids: Array< string >,
};

export type BatchDeleteBookmarksMutation = {
  batchDeleteBookmarks: string,
};

export type MutationCompletedMutationVariables = {
  mutationType: string,
  bookmark: BookmarkInput,
};

export type MutationCompletedMutation = {
  mutationCompleted:  {
    __typename: "MutationCompletedReturnType",
    mutationType: string,
    bookmark:  {
      __typename: "Bookmark",
      id: string,
      title: string,
      url: string,
    },
  },
};

export type BookmarksQuery = {
  bookmarks:  Array< {
    __typename: "Bookmark",
    id: string,
    title: string,
    url: string,
  } >,
};

export type OnMutationCompletedSubscription = {
  onMutationCompleted?:  {
    __typename: "MutationCompletedReturnType",
    mutationType: string,
    bookmark:  {
      __typename: "Bookmark",
      id: string,
      title: string,
      url: string,
    },
  } | null,
};
