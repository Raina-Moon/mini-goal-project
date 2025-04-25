import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchApi } from '@/utils/api/fetch';
import type { Comment } from '@/utils/api';
import type { RootState } from '../index';

// Thunk: Fetch all comments for a given post
export const fetchComments = createAsyncThunk<Comment[], number>(
  'comments/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const comments = await fetchApi<Comment[]>(`/comments/${postId}`);
      return comments;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Add a new comment with optimistic update
export const addComment = createAsyncThunk<
  Comment,
  { userId: number; postId: number; content: string; username: string; profileImage: string },
  { state: RootState }
>(
  'comments/addComment',
  async ({ userId, postId, content }, { rejectWithValue }) => {
    try {
      const newComment = await fetchApi<Comment>('/comments', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, post_id: postId, content }),
      });
      return newComment;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Edit an existing comment with optimistic update
export const editComment = createAsyncThunk<
  Comment,
  { postId: number; commentId: number; content: string },
  { state: RootState }
>(
  'comments/editComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      const updatedComment = await fetchApi<Comment>(`/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
      return updatedComment;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk: Delete a comment
export const deleteComment = createAsyncThunk<
  { postId: number; commentId: number },
  { postId: number; commentId: number }
>(
  'comments/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await fetchApi<{ message: string }>(`/comments/${commentId}`, {
        method: 'DELETE',
      });
      return { postId, commentId };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface CommentsState {
  commentsByPost: { [postId: number]: Comment[] };
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CommentsState = {
  commentsByPost: {},
  status: 'idle',
  error: null,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // Optimistic update for adding a comment
    addCommentOptimistic: (
      state,
      action: PayloadAction<{
        postId: number;
        tempComment: Comment;
      }>
    ) => {
      const { postId, tempComment } = action.payload;
      state.commentsByPost[postId] = [tempComment, ...(state.commentsByPost[postId] || [])];
    },
    // Rollback for addComment failure
    rollbackAddComment: (
      state,
      action: PayloadAction<{
        postId: number;
        previousComments: Comment[];
      }>
    ) => {
      const { postId, previousComments } = action.payload;
      state.commentsByPost[postId] = previousComments;
    },
    // Optimistic update for editing a comment
    editCommentOptimistic: (
      state,
      action: PayloadAction<{
        postId: number;
        commentId: number;
        content: string;
      }>
    ) => {
      const { postId, commentId, content } = action.payload;
      if (state.commentsByPost[postId]) {
        state.commentsByPost[postId] = state.commentsByPost[postId].map((c) =>
          c.id === commentId ? { ...c, content } : c
        );
      }
    },
    // Rollback for editComment failure
    rollbackEditComment: (
      state,
      action: PayloadAction<{
        postId: number;
        previousComments: Comment[];
      }>
    ) => {
      const { postId, previousComments } = action.payload;
      state.commentsByPost[postId] = previousComments;
    },
  },
  extraReducers: (builder) => {
    // Fetch comments
    builder
      .addCase(fetchComments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<Comment[], string, { arg: number }>) => {
        state.status = 'idle';
        const postId = action.meta.arg;
        state.commentsByPost[postId] = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Add comment
    builder
      .addCase(addComment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        addComment.fulfilled,
        (
          state,
          action: PayloadAction<
            Comment,
            string,
            { arg: { userId: number; postId: number; content: string; username: string; profileImage: string } }
          >
        ) => {
          state.status = 'idle';
          const postId = action.meta.arg.postId;
          state.commentsByPost[postId] = state.commentsByPost[postId].map((c) =>
            c.id === Date.now() ? action.payload : c
          );
        }
      )
      .addCase(addComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Edit comment
    builder
      .addCase(editComment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        editComment.fulfilled,
        (
          state,
          action: PayloadAction<
            Comment,
            string,
            { arg: { postId: number; commentId: number; content: string } }
          >
        ) => {
          state.status = 'idle';
          const { postId, commentId } = action.meta.arg;
          state.commentsByPost[postId] = state.commentsByPost[postId].map((c) =>
            c.id === commentId ? action.payload : c
          );
        }
      )
      .addCase(editComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // Delete comment
    builder
      .addCase(deleteComment.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(
        deleteComment.fulfilled,
        (state, action: PayloadAction<{ postId: number; commentId: number }>) => {
          state.status = 'idle';
          const { postId, commentId } = action.payload;
          state.commentsByPost[postId] = state.commentsByPost[postId].filter(
            (c) => c.id !== commentId
          );
        }
      )
      .addCase(deleteComment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {
  addCommentOptimistic,
  rollbackAddComment,
  editCommentOptimistic,
  rollbackEditComment,
} = commentsSlice.actions;
export default commentsSlice.reducer;