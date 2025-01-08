import { createApi, fetchBaseQuery, EndpointBuilder, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { RootState } from '../store'
import { logout } from '../slices/authSlice'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Types communs
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Tags communs
export type TagTypes = 
  | 'Auth'
  | 'Profile'
  | 'AdminUsers'
  | 'AdminProfile'
  | 'NewsletterHistory'
  | 'Contact'
  | 'Events'
  | 'Reviews'

// Création d'une baseQuery avec gestion du token expiré
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL + '/api',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions)
  
  // Si le token est expiré (401), on déconnecte l'utilisateur
  if (result.error && result.error.status === 401) {
    api.dispatch(logout())
  }
  
  return result
}

// Configuration de base pour toutes les APIs
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    'Auth',
    'Profile',
    'AdminUsers',
    'AdminProfile',
    'NewsletterHistory',
    'Contact',
    'Events',
    'Reviews',
  ],
})

// Helper pour créer une API étendue
export const createExtendedApi = <T extends Record<string, any>>(
  config: {
    reducerPath: string
    endpoints: (builder: EndpointBuilder<
      BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
      TagTypes,
      string
    >) => T
  }
) => {
  return baseApi.injectEndpoints({
    endpoints: config.endpoints,
    overrideExisting: false,
  })
}