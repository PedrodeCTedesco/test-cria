import { AccessToken } from '../types/auth/access.token';

export interface ApiKeyResponse extends AccessToken {
  api_key: string;
}
