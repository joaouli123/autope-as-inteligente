import Constants from 'expo-constants';

const RESEND_API_KEY = Constants.expoConfig?.extra?.RESEND_API_KEY || process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'AutoPeças IA <noreply@autopecas-ia.com>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Email service error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background-color: #f3f4f6; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header Azul -->
            <div style="background-color: #1e3a8a; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🚗 AutoPeças IA</h1>
              <p style="color: #d1d5db; margin: 10px 0 0 0; font-size: 16px;">Bem-vindo ao futuro das autopeças!</p>
            </div>
            
            <!-- Conteúdo -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${name}! 👋</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Sua conta foi criada com sucesso! Agora você pode aproveitar todas as funcionalidades do nosso app:
              </p>
              
              <ul style="color: #4b5563; line-height: 1.8; margin: 0 0 30px 0; padding-left: 20px;">
                <li>🔍 Busca inteligente de peças</li>
                <li>🤖 Diagnóstico por IA</li>
                <li>🚗 Cadastro do seu veículo</li>
                <li>📦 Acompanhamento de pedidos</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="autopecas-ia://" 
                   style="background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Acessar App
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                Se você não criou esta conta, por favor ignore este email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                © 2026 AutoPeças IA. Todos os direitos reservados.
              </p>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
                AutoPeças IA v1.0
              </p>
            </div>
            
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🎉 Bem-vindo ao AutoPeças IA!',
    html,
  });
};

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string) => {
  const resetLink = `autopecas-ia://reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="background-color: #f3f4f6; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header Azul -->
            <div style="background-color: #1e3a8a; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🔐 Redefinir Senha</h1>
            </div>
            
            <!-- Conteúdo -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${name}!</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Recebemos uma solicitação para redefinir a senha da sua conta.
              </p>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 30px 0; font-size: 16px;">
                Clique no botão abaixo para criar uma nova senha:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #1e3a8a; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; display: inline-block; font-weight: 600; font-size: 16px;">
                  Redefinir Senha
                </a>
              </div>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                ⚠️ Este link expira em 1 hora por segurança.
              </p>
              
              <p style="color: #9ca3af; font-size: 14px; margin: 20px 0 0 0; text-align: center;">
                Se você não solicitou esta redefinição, ignore este email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                © 2026 AutoPeças IA. Todos os direitos reservados.
              </p>
            </div>
            
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: '🔐 Redefinição de Senha - AutoPeças IA',
    html,
  });
};
