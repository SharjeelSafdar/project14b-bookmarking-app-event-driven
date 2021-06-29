import React, {
  createContext,
  FC,
  useContext,
  useState,
  useEffect,
  useReducer,
  Reducer,
} from "react";
import { API } from "aws-amplify";

import { reducerFunc, ReducerState, Action } from "./reducerFunction";
import { bookmarks as getAllBookmarksQuery } from "../graphql/queries";
import {
  createBookmark,
  editBookmark,
  deleteBookmark,
  batchDeleteBookmarks,
} from "../graphql/mutations";
import { onMutationCompleted } from "../graphql/subscriptions";
import {
  BookmarksQuery,
  CreateBookmarkMutation,
  CreateBookmarkMutationVariables,
  EditBookmarkMutation,
  EditBookmarkMutationVariables,
  DeleteBookmarkMutation,
  DeleteBookmarkMutationVariables,
  BatchDeleteBookmarksMutation,
  BatchDeleteBookmarksMutationVariables,
  OnMutationCompletedSubscription,
} from "../graphql/api";

const reducerInitialState: ReducerState = {
  bookmarks: [],
  isSelectionMode: false,
  selectedBookmarks: [],
};

const initialState: ContextType = {
  ...reducerInitialState,
  isFetchingBookmarks: true,
  isBusy: false,
  startSelectionMode: () => {},
  finishSelectionMode: () => {},
  toggleBookmarkSelection: () => {},
  getAllBookmarks: () => {},
  createNewBookmark: () => {},
  updateBookmark: () => {},
  deleteBookmarkById: () => {},
  batchDeleteBookmarksById: () => {},
};

export const AppContext = createContext<ContextType>(initialState);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: FC = ({ children }) => {
  const [reducerState, dispatch] = useReducer<Reducer<ReducerState, Action>>(
    reducerFunc,
    reducerInitialState
  );
  const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(
    initialState.isFetchingBookmarks
  );
  const [isBusy, setIsBusy] = useState(initialState.isBusy);

  const startSelectionMode = () => {
    dispatch({ id: "START_SELECTION_MODE" });
  };

  const finishSelectionMode = () => {
    dispatch({ id: "FINISH_SELECTION_MODE" });
  };

  const toggleBookmarkSelection = (bookmarkId: string) => {
    dispatch({ id: "TOGGLE_BOOKMARK_SELECTION", payload: { bookmarkId } });
  };

  /* *********************************************************** */
  /* ********************* Query Functions ********************* */
  /* *********************************************************** */
  const getAllBookmarks = async () => {
    setIsFetchingBookmarks(true);

    try {
      const response = (await API.graphql({
        query: getAllBookmarksQuery,
      })) as { data: BookmarksQuery };
      const bookmarks = response.data.bookmarks;

      dispatch({ id: "SET_BOOKMARKS", payload: { bookmarks } });
    } catch (err) {
      console.log("Error fetching bookmarks: ", JSON.stringify(err, null, 2));
    }

    setIsFetchingBookmarks(false);
  };

  /* ************************************************************** */
  /* ********************* Mutation Functions ********************* */
  /* ************************************************************** */
  const createNewBookmark = async (title: string, url: string) => {
    setIsBusy(true);

    try {
      const variables: CreateBookmarkMutationVariables = { title, url };
      const response = (await API.graphql({
        query: createBookmark,
        variables,
      })) as { data: CreateBookmarkMutation };

      console.log(
        "createBookmark mutation successful: ",
        response.data.createBookmark
      );
    } catch (err) {
      console.log(
        "Error creating new bookmark: ",
        JSON.stringify(err, null, 2)
      );
    }

    setIsBusy(false);
  };

  const updateBookmark = async (id: string, title: string, url: string) => {
    setIsBusy(true);

    try {
      const variables: EditBookmarkMutationVariables = { id, title, url };
      const response = (await API.graphql({
        query: editBookmark,
        variables,
      })) as { data: EditBookmarkMutation };

      console.log(
        "editBookmark mutation successful: ",
        response.data.editBookmark
      );
    } catch (err) {
      console.log("Error updating bookmark: ", err);
    }

    setIsBusy(false);
  };

  const deleteBookmarkById = async (id: string) => {
    setIsBusy(true);

    try {
      const variables: DeleteBookmarkMutationVariables = { id };
      const response = (await API.graphql({
        query: deleteBookmark,
        variables,
      })) as { data: DeleteBookmarkMutation };

      console.log(
        "deleteBookmark mutation successful: ",
        response.data.deleteBookmark
      );
    } catch (err) {
      console.log("Error deleting the bookmark: ", err);
    }

    setIsBusy(false);
  };

  const batchDeleteBookmarksById = async () => {
    setIsBusy(true);

    try {
      const variables: BatchDeleteBookmarksMutationVariables = {
        ids: reducerState.selectedBookmarks,
      };
      const response = (await API.graphql({
        query: batchDeleteBookmarks,
        variables,
      })) as { data: BatchDeleteBookmarksMutation };

      console.log(
        "batchDeleteBookmarks mutation successful: ",
        response.data.batchDeleteBookmarks
      );
    } catch (err) {
      console.log("Error deleting the bookmarks: ", err);
    }

    finishSelectionMode();
    setIsBusy(false);
  };

  /* ****************************************************************** */
  /* ********************* Subscription Functions ********************* */
  /* ****************************************************************** */
  const onMutationCompletedSub = async () => {
    const subscription = API.graphql({
      query: onMutationCompleted,
    }) as any;

    subscription.subscribe({
      next: (status: { value: { data: OnMutationCompletedSubscription } }) => {
        if (status.value.data.onMutationCompleted) {
          const data = status.value.data.onMutationCompleted;
          console.log("Sub Data: ", data);
          const bookmark = data.bookmark;

          switch (data.mutationType) {
            case "createBookmark":
              dispatch({ id: "ADD_NEW_BOOKMARK", payload: { bookmark } });
              break;
            case "editBookmark":
              dispatch({ id: "EDIT_BOOKMARK", payload: { bookmark } });
              break;
            case "deleteBookmark":
              dispatch({
                id: "DELETE_BOOKMARK",
                payload: { bookmarkId: bookmark.id },
              });
              break;
            default:
              break;
          }
        }
      },
    });
  };

  useEffect(() => {
    getAllBookmarks();
    onMutationCompletedSub();
  }, []);

  const value: ContextType = {
    ...reducerState,
    isFetchingBookmarks,
    isBusy,
    startSelectionMode,
    finishSelectionMode,
    toggleBookmarkSelection,
    getAllBookmarks,
    createNewBookmark,
    updateBookmark,
    deleteBookmarkById,
    batchDeleteBookmarksById,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export interface ContextType extends ReducerState {
  isFetchingBookmarks: boolean;
  isBusy: boolean;
  startSelectionMode: () => void;
  finishSelectionMode: () => void;
  toggleBookmarkSelection: (bookmarkId: string) => void;
  getAllBookmarks: () => void;
  createNewBookmark: (title: string, url: string) => void;
  updateBookmark: (id: string, title: string, url: string) => void;
  deleteBookmarkById: (id: string) => void;
  batchDeleteBookmarksById: () => void;
}
