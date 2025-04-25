import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import postReducer from "./slices/postSlice";
import bookmarksReducer from "./slices/bookmarksSlice";
import commentReducer from "./slices/commentsSlice";
import followReducer from "./slices/followSlice";
import goalReducer from "./slices/goalSlice";
import likesReducer from "./slices/likesSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    bookmarks: bookmarksReducer,
    comments: commentReducer,
    follow: followReducer,
    goal: goalReducer,
    likes: likesReducer,
    Notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
