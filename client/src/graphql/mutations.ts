/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createBookmark = /* GraphQL */ `
  mutation CreateBookmark($title: String!, $url: String!) {
    createBookmark(title: $title, url: $url)
  }
`;
export const editBookmark = /* GraphQL */ `
  mutation EditBookmark($id: ID!, $title: String!, $url: String!) {
    editBookmark(id: $id, title: $title, url: $url)
  }
`;
export const deleteBookmark = /* GraphQL */ `
  mutation DeleteBookmark($id: ID!) {
    deleteBookmark(id: $id)
  }
`;
export const batchDeleteBookmarks = /* GraphQL */ `
  mutation BatchDeleteBookmarks($ids: [ID!]!) {
    batchDeleteBookmarks(ids: $ids)
  }
`;
export const mutationCompleted = /* GraphQL */ `
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
`;
