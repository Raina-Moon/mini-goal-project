import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchApi } from "@/utils/api/fetch";
import type { Post } from "@/utils/api";
import type { RootState } from "../index";

export const fetchBookmarkedPosts = createAsyncThunk<
  Post[],
  number,
  { state: RootState }
>(
  "bookmarks/fetchBookmarkedPosts",
  async (userId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const posts = await fetchApi<Post[]>(`/bookmarks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return posts;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: fetch detailed bookmarked posts
export const fetchBookmarkedPostDetail = createAsyncThunk<
  Post[],
  number,
  { state: RootState }
>(
  "bookmarks/fetchBookmarkedPostDetail",
  async (userId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const posts = await fetchApi<Post[]>(`/bookmarks/${userId}/detailed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return posts;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: register a post to bookmarks
export const bookmarkPost = createAsyncThunk<
  void,
  { userId: number; postId: number },
  { state: RootState }
>(
  "bookmarks/bookmarkPost",
  async ({ userId, postId }, { getState, rejectWithValue, dispatch }) => {
    const token = getState().auth.token;
    try {
      await fetchApi("/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, postId }),
      });
      // Dispatch fetchBookmarkedPosts to update the list after bookmarking
      dispatch(fetchBookmarkedPosts(userId));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: remove a post from bookmarks
export const unbookmarkPost = createAsyncThunk<
  void,
  { userId: number; postId: number },
  { state: RootState }
>(
  "bookmarks/unbookmarkPost",
  async ({ userId, postId }, { getState, rejectWithValue, dispatch }) => {
    const token = getState().auth.token;
    try {
      await fetchApi(`/bookmarks/${userId}/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Dispatch fetchBookmarkedPosts to update the list after unbookmarking
      dispatch(fetchBookmarkedPosts(userId));
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface BookmarksState {
  bookmarked: Post[];
  detailed: Post[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: BookmarksState = {
  bookmarked: [],
  detailed: [],
  status: "idle",
  error: null,
};

const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchBookmarkedPosts
    builder
      .addCase(fetchBookmarkedPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchBookmarkedPosts.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.status = "idle";
          state.bookmarked = action.payload;
        }
      )
      .addCase(fetchBookmarkedPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // fetchBookmarkedPostDetail
    builder
      .addCase(fetchBookmarkedPostDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchBookmarkedPostDetail.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.status = "idle";
          state.detailed = action.payload;
        }
      )
      .addCase(fetchBookmarkedPostDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // bookmarkPost
    builder
      .addCase(bookmarkPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(bookmarkPost.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(bookmarkPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // unbookmarkPost
    builder
      .addCase(unbookmarkPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(unbookmarkPost.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(unbookmarkPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default bookmarksSlice.reducer;
