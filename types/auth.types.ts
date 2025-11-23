/**
 * Authentication related TypeScript types
 * Generated from API schema
 */

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string | null;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  full_name?: string | null;
  created_at: string;
  is_active: boolean;
}

export interface ChangePassword {
  old_password: string;
  new_password: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface ApiError {
  message: string;
  status?: number;
  details?: HTTPValidationError;
}

export interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
