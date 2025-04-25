import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchApi } from "@/utils/api/fetch";
import { Post } from "@/utils/api";

// Thunk: Fetch nailed posts
export const fetchNailedPosts = createAsyncThunk<Post[], number>(
  "posts/fetchNailedPosts",
  async (userId, { rejectWithValue }) => {
    try {
      const posts = await fetchApi<Post[]>(`/posts/nailed/${userId}`);
      return posts;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Fetch all posts
export const fetchAllPosts = createAsyncThunk<Post[], number | undefined>(
  "posts/fetchAllPosts",
  async (viewerId, { rejectWithValue }) => {
    try {
      const query = viewerId ? `?viewerId=${viewerId}` : "";
      const posts = await fetchApi<Post[]>(`/posts${query}`);
      return posts;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Create a post
export const createPost = createAsyncThunk<
  Post,
  { userId: number; goalId: number; imageUrl: string; description: string }
>(
  "posts/createPost",
  async ({ userId, goalId, imageUrl, description }, { rejectWithValue }) => {
    try {
      const newPost = await fetchApi<Post>("/posts", {
        method: "POST",
        body: JSON.stringify({
          user_id: userId,
          goal_id: goalId,
          image_url: imageUrl,
          description,
        }),
      });
      return newPost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Upload post image
export const uploadPostImage = createAsyncThunk<string, File>(
  "posts/uploadPostImage",
  async (imageFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const { imageUrl } = await fetchApi<{ imageUrl: string }>(
        "/posts/upload-image",
        {
          method: "POST",
          body: formData,
        }
      );
      return imageUrl;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface PostState {
  nailedPosts: Post[];
  allPosts: Post[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: PostState = {
  nailedPosts: [],
  allPosts: [],
  status: "idle",
  error: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // 1) fetchNailedPosts
    builder
      .addCase(fetchNailedPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchNailedPosts.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.status = "idle";
          state.nailedPosts = action.payload;
        }
      )
      .addCase(fetchNailedPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // 2) fetchAllPosts
    builder
      .addCase(fetchAllPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAllPosts.fulfilled,
        (state, action: PayloadAction<Post[]>) => {
          state.status = "idle";
          state.allPosts = action.payload;
        }
      )
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // 3) createPost
    builder
      .addCase(createPost.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.status = "idle";
        state.nailedPosts = [...state.nailedPosts, action.payload];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });

    // 4) uploadPostImage
    builder
      .addCase(uploadPostImage.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadPostImage.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(uploadPostImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default postSlice.reducer;
