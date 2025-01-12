import {
  BaseEntity,
  createExtendedApi,
  ApiResponse,
  TagTypes,
} from "./baseApi";

export type MessageStatus = "new" | "assigned" | "in_progress" | "resolved";

export interface Message extends BaseEntity {
  name: string;
  email: string;
  subject: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface Admin extends User {
  role: "admin";
}

export interface User extends BaseEntity {
  username: string;
  email: string;
  role: string;
  newsletter: boolean;
  fullName?: {
    honorificTitle?: string;
    firstName: string;
    fatherName: string;
    familyName: string;
    gender: "male" | "female";
  };
  birthDate?: string;
  mobilePhone?: string;
  landline?: string;
  address?: {
    unit?: string;
    buildingName?: string;
    street?: string;
    dependentLocality?: string;
    poBox?: string;
    city: string;
    emirate: string;
  };
}

export interface Newsletter extends BaseEntity {
  subject: string;
  content: string;
  sentBy: User;
  recipientCount: number;
  recipients: string[];
  sentAt: string;
}

export interface NewsletterInput {
  subject: string;
  content: string;
}

export interface NewsletterHistoryResponse {
  newsletters: Newsletter[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const adminApi = createExtendedApi({
  reducerPath: "adminApi",
  endpoints: (builder) => ({
    // Gestion des utilisateurs
    getUsers: builder.query<User[], void>({
      query: () => "/admin/users",
      transformResponse: (response: ApiResponse<User[]>) => response.data || [],
      providesTags: [{ type: "AdminUsers" }],
      extraOptions: {
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    }),

    // Gestion du profil admin (utilise les routes user)
    getProfile: builder.query<User, void>({
      query: () => "/users/profile",
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) throw new Error("No profile data");
        return response.data;
      },
      providesTags: [{ type: "AdminProfile" }],
      extraOptions: {
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
    }),
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/users/profile",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) throw new Error("No profile data");
        return response.data;
      },
      invalidatesTags: [{ type: "AdminProfile" }],
    }),
    updateUsername: builder.mutation<User, { username: string }>({
      query: (data) => ({
        url: "/users/profile/username",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) throw new Error("No profile data");
        return response.data;
      },
      invalidatesTags: [{ type: "AdminProfile" }],
    }),
    updateEmail: builder.mutation<User, { email: string }>({
      query: (data) => ({
        url: "/users/profile/email",
        method: "PUT",
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => {
        if (!response.data) throw new Error("No profile data");
        return response.data;
      },
      invalidatesTags: [{ type: "AdminProfile" }],
    }),
    updatePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/users/profile/password",
        method: "PUT",
        body: data,
      }),
    }),
    deleteProfile: builder.mutation<void, void>({
      query: () => ({
        url: "/users/profile",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AdminProfile" }],
    }),

    // Gestion de la newsletter
    sendNewsletter: builder.mutation<
      { recipientCount: number },
      NewsletterInput
    >({
      query: (data) => ({
        url: "/admin/newsletter",
        method: "POST",
        body: data,
      }),
      transformResponse: (
        response: ApiResponse<{ recipientCount: number }>
      ) => {
        if (!response.data) throw new Error("No newsletter data");
        return response.data;
      },
      invalidatesTags: [{ type: "NewsletterHistory" }],
    }),
    getNewsletterHistory: builder.query<
      NewsletterHistoryResponse,
      { page: number; limit: number }
    >({
      query: ({ page, limit }) =>
        `/admin/newsletter/history?page=${page}&limit=${limit}`,
      transformResponse: (response: ApiResponse<NewsletterHistoryResponse>) => {
        if (!response.data) throw new Error("No newsletter history data");
        return response.data;
      },
      providesTags: [{ type: "NewsletterHistory" }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateUsernameMutation,
  useUpdateEmailMutation,
  useUpdatePasswordMutation,
  useDeleteProfileMutation,
  useSendNewsletterMutation,
  useGetNewsletterHistoryQuery,
} = adminApi;
