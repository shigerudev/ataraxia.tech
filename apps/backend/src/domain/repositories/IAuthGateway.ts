export interface AuthenticatedUser {
  id: string;
  isAnonymous: boolean;
}

/**
 * Verifica un token de acceso (JWT de Supabase) y devuelve el usuario.
 * Permite que el backend confíe en la identidad anónima creada en el frontend.
 */
export interface IAuthGateway {
  verifyAccessToken(accessToken: string): Promise<AuthenticatedUser | null>;
}
