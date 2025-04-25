import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/utils/api/fetch'
import { Like } from '@/utils/api'
import type { AppDispatch, RootState } from '../index'

export interface LikesState {
  likedPosts: Like[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: LikesState = {
  likedPosts: [],
  status: 'idle',
  error: null,
}

export const fetchLikedPosts = createAsyncThunk<
  Like[],
  number,
  { state: RootState; rejectValue: string }
>(
  'likes/fetchLikedPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchApi<Like[]>(`/likes/${userId}`)
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const likePost = createAsyncThunk<
  number,
  { userId: number; postId: number },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'likes/likePost',
  async ({ userId, postId }, { dispatch, rejectWithValue, getState }) => {
    try {
      await fetchApi<{ user_id: number; post_id: number }>(
        '/likes',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, post_id: postId }),
        }
      )
      // re-fetch liked posts list
      dispatch(fetchLikedPosts(userId))
      // fetch updated like count
      const { like_count } = await fetchApi<{ like_count: number }>(
        `/likes/count/${postId}`
      )
      return like_count
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const unlikePost = createAsyncThunk<
  number,
  { userId: number; postId: number },
  { state: RootState; dispatch: AppDispatch; rejectValue: string }
>(
  'likes/unlikePost',
  async ({ userId, postId }, { dispatch, rejectWithValue }) => {
    try {
      await fetchApi<{ message: string }>(
        '/likes',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, post_id: postId }),
        }
      )
      dispatch(fetchLikedPosts(userId))
      const { like_count } = await fetchApi<{ like_count: number }>(
        `/likes/count/${postId}`
      )
      return like_count
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLikedPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLikedPosts.fulfilled, (state, action: PayloadAction<Like[]>) => {
        state.status = 'idle'
        state.likedPosts = action.payload
      })
      .addCase(fetchLikedPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      .addCase(likePost.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(likePost.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(likePost.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      .addCase(unlikePost.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(unlikePost.fulfilled, (state) => {
        state.status = 'idle'
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export default likesSlice.reducer
