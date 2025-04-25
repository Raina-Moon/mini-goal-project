import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/utils/api/fetch'
import { Goal } from '@/utils/api'
import type { RootState } from '../index'

export interface GoalState {
  goals: Goal[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: GoalState = {
  goals: [],
  status: 'idle',
  error: null,
}

// Fetch all goals for a user
export const fetchGoals = createAsyncThunk<
  Goal[],
  number,
  { state: RootState }
>('goals/fetchGoals',
  async (userId, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      const data = await fetchApi<Goal[]>(`/goals/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Create a new goal
export const createGoal = createAsyncThunk<
  Goal,
  { userId: number; title: string; duration: number },
  { state: RootState }
>('goals/createGoal',
  async ({ userId, title, duration }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      const newGoal = await fetchApi<Goal>('/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, title, duration })
      })
      return newGoal
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Update an existing goal's status
export const updateGoal = createAsyncThunk<
  Goal,
  { goalId: number; status: string },
  { state: RootState }
>('goals/updateGoal',
  async ({ goalId, status }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      const updated = await fetchApi<Goal>(`/goals/${goalId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })
      return updated
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Delete a goal
export const deleteGoal = createAsyncThunk<
  number,
  number,
  { state: RootState }
>('goals/deleteGoal',
  async (goalId, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    if (!token) return rejectWithValue('No auth token')
    try {
      await fetchApi(`/goals/${goalId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      return goalId
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch goals
    builder.addCase(fetchGoals.fulfilled, (state, action: PayloadAction<Goal[]>) => {
      state.status = 'idle'
      state.goals = action.payload
    })
    // Create goal
    builder.addCase(createGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
      state.status = 'idle'
      state.goals.push(action.payload)
    })
    // Update goal
    builder.addCase(updateGoal.fulfilled, (state, action: PayloadAction<Goal>) => {
      state.status = 'idle'
      state.goals = state.goals.map(goal =>
        goal.id === action.payload.id ? action.payload : goal
      )
    })
    // Delete goal
    builder.addCase(deleteGoal.fulfilled, (state, action: PayloadAction<number>) => {
      state.status = 'idle'
      state.goals = state.goals.filter(goal => goal.id !== action.payload)
    })
    // Handle loading and errors for all thunks
    builder
      .addMatcher(
        action => action.type.endsWith('/pending'),
        state => {
          state.status = 'loading'
          state.error = null
        }
      )
      .addMatcher(
        action => action.type.endsWith('/rejected'),
        (state, action: PayloadAction<string>) => {
          state.status = 'failed'
          state.error = action.payload
        }
      )
  }
})

export default goalsSlice.reducer
