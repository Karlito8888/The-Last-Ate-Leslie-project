import { BaseEntity, createExtendedApi } from './baseApi';

interface IUserName {
  honorificTitle?: string;
  firstName?: string;
  fatherName?: string;
  familyName?: string;
  gender?: 'male' | 'female';
}

interface IAddress {
  unit?: string;
  buildingName?: string;
  street?: string;
  dependentLocality?: string;
  poBox?: string;
  city?: string;
  emirate?: string;
}

interface User extends BaseEntity {
  username: string;
  email: string;
  role: string;
  newsletter?: boolean;
  fullName?: IUserName;
  birthDate?: string;
  mobilePhone?: string;
  landline?: string;
  address?: IAddress;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  newsletter?: boolean;
}

export const authApi = createExtendedApi({
  reducerPath: 'authApi',
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<void, string>({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: ({ token, newPassword }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi; 