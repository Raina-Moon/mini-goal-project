import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/utils/api/fetch'
import { User } from '@/utils/api'
import type { RootState } from '../index'

export interface FollowerState {
  followers: User[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: FollowerState = {
  followers: [],
  status: 'idle',
  error: null,
}

// Fetch list of followers for a given user
export const fetchFollowers = createAsyncThunk<
  User[],
  number,
  { state: RootState }
>('followers/fetchFollowers',
  async (userId, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      const data = await fetchApi<User[]>(
        `/followers/followers/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Follow a user, then re-fetch followers list
export const followUser = createAsyncThunk<
  User[],
  { followerId: number; followingId: number },
  { state: RootState }
>('followers/followUser',
  async ({ followerId, followingId }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      await fetchApi<{ follower_id: number; following_id: number }>(
        '/followers',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            follower_id: followerId,
            following_id: followingId,
          }),
        }
      )
      const data = await fetchApi<User[]>(
        `/followers/followers/${followingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Unfollow a user, then re-fetch followers list
export const unfollowUser = createAsyncThunk<
  User[],
  { followerId: number; followingId: number },
  { state: RootState }
>('followers/unfollowUser',
  async ({ followerId, followingId }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      await fetchApi<{ message: string }>(
        '/followers',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            follower_id: followerId,
            following_id: followingId,
          }),
        }
      )
      const data = await fetchApi<User[]>(
        `/followers/followers/${followingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const followersSlice = createSlice({
  name: 'followers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Handle fulfilled for each thunk
    builder.addCase(fetchFollowers.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.status = 'idle'
      state.followers = action.payload
    })
    builder.addCase(followUser.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.status = 'idle'
      state.followers = action.payload
    })
    builder.addCase(unfollowUser.fulfilled, (state, action: PayloadAction<User[]>) => {
      state.status = 'idle'
      state.followers = action.payload
    })
    // Generic pending/rejected handlers
    builder
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading'
          state.error = null
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.status = 'failed'
          state.error = action.payload
        }
      )
  },
})

export default followersSlice.reducer
