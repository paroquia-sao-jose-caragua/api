import type { UsersDAF } from '@/services/database/users-daf';
import type { PasswordResetTokensDAF } from '@/services/database/password-reset-tokens-daf';
import type { EmailService } from '@/services/email/email-service';
import type { UserRole, UserStatus } from '@/entities/user';
import { ResourceAlreadyExistsError } from '../errors/resource-already-exists-error';
import { ulid } from 'serverless-crypto-utils/id-generation';
import { hashPassword } from 'serverless-crypto-utils/password-hashing';
import { generateSecureToken, hashToken } from '@/utils/token-crypto';
import type { SafeUser } from './list-users';

interface CreateUserUseCaseRequest {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  sendInvite?: boolean;
  panelBaseUrl?: string;
}

interface CreateUserUseCaseResponse {
  user: SafeUser;
}

export class CreateUserUseCase {
  constructor(
    private usersDaf: UsersDAF,
    private passwordResetTokensDaf: PasswordResetTokensDAF,
    private emailService: EmailService,
  ) {}

  async execute({
    name,
    email,
    role,
    password,
    sendInvite = false,
    panelBaseUrl = 'http://localhost:3000',
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const existing = await this.usersDaf.findByEmail(email);

    if (existing) {
      throw new ResourceAlreadyExistsError();
    }

    const id = ulid();
    const rawPassword = password || generateSecureToken(16);
    const passwordHash = await hashPassword(rawPassword);
    const status: UserStatus = sendInvite ? 'pending' : 'active';

    const created = await this.usersDaf.create({
      id,
      name,
      email,
      passwordHash,
      role,
      status,
      tokenVersion: 1,
    });

    if (sendInvite) {
      const rawToken = generateSecureToken(32);
      const tokenHash = await hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 horas para convite
      const tokenId = ulid();

      await this.passwordResetTokensDaf.create({
        id: tokenId,
        userId: created.id,
        tokenHash,
        type: 'invite',
        expiresAt,
      });

      const cleanBaseUrl = panelBaseUrl.replace(/\/+$/, '');
      const inviteUrl = `${cleanBaseUrl}/redefinir-senha?token=${rawToken}`;

      await this.emailService.sendUserInviteEmail({
        to: created.email,
        name: created.name,
        inviteUrl,
        role: created.role,
      });
    }

    return {
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        status: created.status,
        lastLoginAt: created.lastLoginAt,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
    };
  }
}
