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

interface UsernameUpdateRequest {
  username: string;
}

interface EmailUpdateRequest {
  email: string;
}

interface DeleteProfileRequest {
  password: string;
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

interface ProfileUpdateData {
  username?: string;
  email?: string;
  newsletter?: boolean;
  fullName?: IUserName;
  birthDate?: string;
  mobilePhone?: string;
  landline?: string;
  address?: IAddress;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const profileApi = createExtendedApi({
  reducerPath: 'profileApi',
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ApiResponse<User>, ProfileUpdateData>({
      query: (profileData) => ({
        url: '/users/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateUsername: builder.mutation<User, UsernameUpdateRequest>({
      query: (data) => ({
        url: '/users/profile/username',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateEmail: builder.mutation<User, EmailUpdateRequest>({
      query: (data) => ({
        url: '/users/profile/email',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Profile'],
    }),
    updateNewsletter: builder.mutation<User, boolean>({
      query: (newsletter) => ({
        url: '/users/profile/newsletter',
        method: 'PUT',
        body: { newsletter },
      }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation<void, PasswordChangeRequest>({
      query: (passwordData) => ({
        url: '/users/profile/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    deleteProfile: builder.mutation<void, DeleteProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'DELETE',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateUsernameMutation,
  useUpdateEmailMutation,
  useUpdateNewsletterMutation,
  useChangePasswordMutation,
  useDeleteProfileMutation,
} = profileApi; 