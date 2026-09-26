export interface EmailService {
  sendPasswordResetEmail(params: {
    to: string;
    name: string;
    resetUrl: string;
  }): Promise<void>;

  sendUserInviteEmail(params: {
    to: string;
    name: string;
    inviteUrl: string;
    role: string;
  }): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private apiKey?: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey;
    this.fromEmail =
      fromEmail ||
      'Paróquia São José <nao-responda@paroquiasaojosecaragua.org.br>';
  }

  async sendPasswordResetEmail({
    to,
    name,
    resetUrl,
  }: {
    to: string;
    name: string;
    resetUrl: string;
  }): Promise<void> {
    if (!this.apiKey) {
      console.warn(
        `[ResendEmailService] RESEND_API_KEY not configured. Skipping email to ${to}. Reset URL: ${resetUrl}`,
      );
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Redefinição de Senha</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbf6ee; margin: 0; padding: 24px; color: #171717; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ECD6BD; padding: 36px 32px; box-shadow: 0 4px 12px rgba(24, 53, 30, 0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; color: #18351E; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #5A463B; margin-bottom: 20px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #18351E; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 9999px; }
          .fallback { font-size: 13px; color: #736254; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0e6d8; }
          .footer { text-align: center; font-size: 12px; color: #8c7b6c; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Paróquia São José</h1>
          </div>
          <p class="text">Olá, <strong>${escapeHtml(name)}</strong>,</p>
          <p class="text">Recebemos uma solicitação para redefinir a senha da sua conta de acesso ao painel paroquial.</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">Redefinir Minha Senha</a>
          </div>
          <p class="text">Por segurança, este link é válido por <strong>60 minutos</strong> e só pode ser utilizado uma única vez.</p>
          <p class="text">Se você não solicitou a redefinição de senha, nenhuma ação é necessária. Sua senha atual permanecerá segura.</p>
          <div class="fallback">
            <p>Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:</p>
            <p><a href="${resetUrl}" style="color: #18351E;">${resetUrl}</a></p>
          </div>
          <div class="footer">
            <p>Diocese de Caraguatatuba • Paróquia São José</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [to],
        subject: 'Redefinição de Senha — Paróquia São José',
        html,
        text: `Olá, ${name}.\n\nPara redefinir sua senha no painel paroquial, acesse o link:\n${resetUrl}\n\nEste link expira em 60 minutos.\nSe você não solicitou, ignore esta mensagem.`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[ResendEmailService] Failed to send email:', errText);
    }
  }

  async sendUserInviteEmail({
    to,
    name,
    inviteUrl,
    role,
  }: {
    to: string;
    name: string;
    inviteUrl: string;
    role: string;
  }): Promise<void> {
    if (!this.apiKey) {
      console.warn(
        `[ResendEmailService] RESEND_API_KEY not configured. Skipping invite email to ${to}. Invite URL: ${inviteUrl}`,
      );
      return;
    }

    const roleName = getRoleFriendlyName(role);

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Convite de Acesso ao Painel</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbf6ee; margin: 0; padding: 24px; color: #171717; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #ECD6BD; padding: 36px 32px; box-shadow: 0 4px 12px rgba(24, 53, 30, 0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 24px; font-weight: bold; color: #18351E; margin-bottom: 12px; }
          .text { font-size: 15px; line-height: 1.6; color: #5A463B; margin-bottom: 20px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background-color: #18351E; color: #ffffff !important; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 9999px; }
          .fallback { font-size: 13px; color: #736254; word-break: break-all; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f0e6d8; }
          .footer { text-align: center; font-size: 12px; color: #8c7b6c; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Paróquia São José</h1>
          </div>
          <p class="text">Olá, <strong>${escapeHtml(name)}</strong>,</p>
          <p class="text">Você foi convidado para acessar o painel administrativo da Paróquia São José com a função de <strong>${escapeHtml(roleName)}</strong>.</p>
          <p class="text">Para ativar seu acesso e definir sua senha pessoal, clique no botão abaixo:</p>
          <div class="btn-container">
            <a href="${inviteUrl}" class="btn" target="_blank" rel="noopener noreferrer">Ativar Minha Conta</a>
          </div>
          <p class="text">Este link de ativação é válido pelas próximas 48 horas.</p>
          <div class="fallback">
            <p>Se o botão acima não funcionar, copie e cole o link a seguir no seu navegador:</p>
            <p><a href="${inviteUrl}" style="color: #18351E;">${inviteUrl}</a></p>
          </div>
          <div class="footer">
            <p>Diocese de Caraguatatuba • Paróquia São José</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [to],
        subject: 'Convite de Acesso ao Painel — Paróquia São José',
        html,
        text: `Olá, ${name}.\n\nVocê foi convidado para acessar o painel paroquial (${roleName}).\nPara ativar sua conta e definir sua senha, acesse:\n${inviteUrl}\n\nLink válido por 48 horas.`,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[ResendEmailService] Failed to send invite email:', errText);
    }
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getRoleFriendlyName(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrador Geral';
    case 'secretary':
    case 'user':
      return 'Secretaria Paroquial';
    case 'pastoral_agent':
      return 'Agente Pastoral';
    case 'viewer':
      return 'Visualizador';
    default:
      return role;
  }
}
