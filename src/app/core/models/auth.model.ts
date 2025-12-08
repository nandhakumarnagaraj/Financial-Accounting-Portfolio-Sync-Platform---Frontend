export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  roles?: string[];
}

export interface JwtResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  xeroAccessToken?: string;
  xeroTenantId?: string;
  tokenExpiry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthMessageResponse {
  message: string;
}