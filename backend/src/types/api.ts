export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface UserResponse {
  username: string;
  email: string;
  role?: string;
  newsletter?: boolean;
  fullName?: {
    honorificTitle?: string;
    firstName?: string;
    fatherName?: string;
    familyName?: string;
    gender?: 'male' | 'female';
  };
  birthDate?: Date;
  mobilePhone?: string;
  landline?: string;
  address?: {
    unit?: string;
    buildingName?: string;
    street?: string;
    dependentLocality?: string;
    poBox?: string;
    city?: string;
    emirate?: string;
  };
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
} 