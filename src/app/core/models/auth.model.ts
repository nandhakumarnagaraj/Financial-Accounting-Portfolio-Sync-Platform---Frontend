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

export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[] | string[];  // Accept both formats
  xeroAccessToken?: string;
  xeroRefreshToken?: string;
  xeroTenantId?: string;
  xeroUserId?: string;
  tokenExpiry?: string;  // ISO 8601 datetime string
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthMessageResponse {
  message: string;
}