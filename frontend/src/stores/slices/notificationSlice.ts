import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/utils/api/fetch'
import { Notification } from '@/utils/api'
import type { RootState, AppDispatch } from '../index'

export interface NotificationsState {
  notifications: Notification[]
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  status: 'idle',
  error: null,
}

// Fetch all notifications for a user
export const fetchNotifications = createAsyncThunk<
  Notification[],
  number,
  { state: RootState; rejectValue: string }
>(
  'notifications/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await fetchApi<Notification[]>(`/notifications/${userId}`)
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Mark a notification as read
export const markAsRead = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await fetchApi(`/notifications/${notificationId}/read`, { method: 'PUT' })
      return notificationId
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Delete a notification
export const deleteNotification = createAsyncThunk<
  number,
  number,
  { state: RootState; rejectValue: string }
>(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await fetchApi(`/notifications/${notificationId}`, { method: 'DELETE' })
      return notificationId
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
        state.status = 'idle'
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      .addCase(markAsRead.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(markAsRead.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'idle'
        const id = action.payload
        state.notifications = state.notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })

      .addCase(deleteNotification.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(deleteNotification.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'idle'
        state.notifications = state.notifications.filter(n => n.id !== action.payload)
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload as string
      })
  },
})

export default notificationsSlice.reducer
