import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import postReducer from "./slices/postSlice";
import bookmarksReducer from "./slices/bookmarksSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    bookmarks: bookmarksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
