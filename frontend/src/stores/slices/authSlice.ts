import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { fetchApi } from '@/utils/api/fetch'
import type { User } from '@/utils/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

// Verify if the token is valid
export const verifyToken = createAsyncThunk<boolean, string>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const { valid } = await fetchApi<{ valid: boolean }>(
        '/auth/verify-token',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return valid
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// Actions for initializing authentication state
export const initializeAuth = createAsyncThunk<
  { token: string | null; user: User | null },
  void
>('auth/initialize', async (_, { dispatch }) => {
  const storedToken = localStorage.getItem(TOKEN_KEY)
  const storedUser = localStorage.getItem(USER_KEY)
  if (storedToken && storedUser) {
    const valid = await dispatch(verifyToken(storedToken)).unwrap()
    if (valid) {
      return { token: storedToken, user: JSON.parse(storedUser) }
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }
  return { token: null, user: null }
})

// login
export const login = createAsyncThunk<
  { token: string; user: User },
  { email: string; password: string }
>('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const data = await fetchApi<{ token: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    )
    return data
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// signup
export const signup = createAsyncThunk<
  { token: string; user: User },
  { username: string; email: string; password: string }
>(
  'auth/signup',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const data = await fetchApi<{ token: string; user: User }>(
        '/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        }
      )
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// other users' profile
export const fetchViewUser = createAsyncThunk<
  User,
  number,
  { state: { auth: AuthState } }
>('auth/fetchViewUser', async (userId, { getState, rejectWithValue }) => {
  const token = getState().auth.token
  try {
    return await fetchApi<User>(`/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// user's profile
export const getProfile = createAsyncThunk<
  User,
  number,
  { state: { auth: AuthState } }
>('auth/getProfile', async (userId, { getState, rejectWithValue }) => {
  const token = getState().auth.token
  try {
    return await fetchApi<User>(`/profile/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// update nickname
export const updateProfile = createAsyncThunk<
  User,
  { userId: number; username: string },
  { state: { auth: AuthState } }
>(
  'auth/updateProfile',
  async ({ userId, username }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    try {
      return await fetchApi<User>(`/profile/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      })
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// update profile image
export const updateProfileImage = createAsyncThunk<
  User,
  { userId: number; file: File },
  { state: { auth: AuthState } }
>(
  'auth/updateProfileImage',
  async ({ userId, file }, { getState, rejectWithValue }) => {
    const token = getState().auth.token
    const formData = new FormData()
    formData.append('profileImage', file)
    try {
      return await fetchApi<User>(`/profile/${userId}/image-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// password reset flow
export const requestPasswordReset = createAsyncThunk<
  { resetToken: string; message: string },
  string
>('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
  try {
    return await fetchApi<{ resetToken: string; message: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    )
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// verify reset code
export const verifyResetCode = createAsyncThunk<
  { message: string },
  { email: string; reset_token: number }
>('auth/verifyResetCode', async ({ email, reset_token }, { rejectWithValue }) => {
  try {
    return await fetchApi<{ message: string }>('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, reset_token }),
    })
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// reset password
export const resetPassword = createAsyncThunk<
  { message: string },
  { email: string; newPassword: string; reset_token: number }
>(
  'auth/resetPassword',
  async ({ email, newPassword, reset_token }, { rejectWithValue }) => {
    try {
      return await fetchApi<{ message: string }>('/auth/reset-password', {
        method: 'PATCH',
        body: JSON.stringify({ email, newPassword, reset_token }),
      })
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// verify current password
export const verifyCurrentPassword = createAsyncThunk<
  boolean,
  { email: string; currentPassword: string }
>('auth/verifyCurrentPassword', async ({ email, currentPassword }, { rejectWithValue }) => {
  try {
    const data = await fetchApi<{ message?: string; error?: string }>(
      '/auth/verify-current-password',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword }),
      }
    )
    if (data.error) throw new Error(data.error)
    return true
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

// change password
export const changePassword = createAsyncThunk<
  void,
  { email: string; currentPassword: string; newPassword: string }
>(
  'auth/changePassword',
  async ({ email, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await fetchApi<{ message?: string; error?: string }>(
        '/auth/change-password',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, currentPassword, newPassword }),
        }
      )
      if (data.error) throw new Error(data.error)
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

// delete user
export const deleteUser = createAsyncThunk<
  void,
  number,
  { state: { auth: AuthState } }
>('auth/deleteUser', async (userId, { getState, rejectWithValue, dispatch }) => {
  const token = getState().auth.token
  try {
    await fetchApi(`/auth/delete-user/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    dispatch(logout())
  } catch (err: any) {
    return rejectWithValue(err.message)
  }
})

export interface AuthState {
  token: string | null
  user: User | null
  viewUser: User | null
  isLoggedIn: boolean
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  token: null,
  user: null,
  viewUser: null,
  isLoggedIn: false,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      logout(state) {
        state.token = null
        state.user = null
        state.viewUser = null
        state.isLoggedIn = false
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      },
    },
    extraReducers: (builder) => {
      // 1) initializeAuth
      builder.addCase(initializeAuth.fulfilled, (state, { payload }) => {
        state.token = payload.token
        state.user = payload.user
        state.isLoggedIn = !!payload.token
      })
  
      // 2) verifyToken rejection
      builder.addCase(verifyToken.rejected, (state) => {
        state.token = null
        state.user = null
        state.isLoggedIn = false
        localStorage.clear()
      })
  
      // 3) login & signup success
      builder.addCase(login.fulfilled, (state, { payload }) => {
        state.token = payload.token
        state.user = payload.user
        state.isLoggedIn = true
        state.status = 'idle'
        localStorage.setItem(TOKEN_KEY, payload.token)
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
      })
      builder.addCase(signup.fulfilled, (state, { payload }) => {
        state.token = payload.token
        state.user = payload.user
        state.isLoggedIn = true
        state.status = 'idle'
        localStorage.setItem(TOKEN_KEY, payload.token)
        localStorage.setItem(USER_KEY, JSON.stringify(payload.user))
      })
  
      // 4) fetchViewUser / getProfile / updateProfile / updateProfileImage
      builder.addCase(fetchViewUser.fulfilled, (state, { payload }) => {
        state.viewUser = payload
      })
      builder.addCase(getProfile.fulfilled, (state, { payload }) => {
        state.user = payload
        localStorage.setItem(USER_KEY, JSON.stringify(payload))
      })
      builder.addCase(updateProfile.fulfilled, (state, { payload }) => {
        state.user = payload
        localStorage.setItem(USER_KEY, JSON.stringify(payload))
      })
      builder.addCase(updateProfileImage.fulfilled, (state, { payload }) => {
        state.user = payload
        localStorage.setItem(USER_KEY, JSON.stringify(payload))
      })
  
      // 5) password reset flow (no-op on success)
      builder.addCase(requestPasswordReset.fulfilled, () => {})
      builder.addCase(verifyResetCode.fulfilled,       () => {})
      builder.addCase(resetPassword.fulfilled,         () => {})
      builder.addCase(verifyCurrentPassword.fulfilled, () => {})
      builder.addCase(changePassword.fulfilled,        () => {})
  
      builder
        .addMatcher(
          action => action.type.endsWith('/pending'),
          state => {
            state.status = 'loading'
            state.error  = null
          }
        )
        .addMatcher(
          action => action.type.endsWith('/rejected'),
          (state, action: PayloadAction<string>) => {
            state.status = 'failed'
            state.error  = action.payload
          }
        )
    },
  })
  

export const { logout } = authSlice.actions
export default authSlice.reducer
