
export interface AuthKeys {
  token?: string;
  refreshToken?: string;
  expiry?: number;
  verifier?: string;
  tscHash?: string;
}

export interface TokenResponse {
  access_token: string,
  refresh_token: string,
  scope: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}
