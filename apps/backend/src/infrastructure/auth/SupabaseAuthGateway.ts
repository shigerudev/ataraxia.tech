import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticatedUser, IAuthGateway } from '../../domain/repositories/IAuthGateway.js';

export class SupabaseAuthGateway implements IAuthGateway {
  constructor(private readonly client: SupabaseClient) {}

  async verifyAccessToken(accessToken: string): Promise<AuthenticatedUser | null> {
    const { data, error } = await this.client.auth.getUser(accessToken);
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      isAnonymous: Boolean((data.user as { is_anonymous?: boolean }).is_anonymous),
    };
  }
}
