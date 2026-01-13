import Constants from 'expo-constants';

const RESEND_API_KEY = Constants.expoConfig?.extra?.RESEND_API_KEY || process.env.RESEND_API_KEY;
const RESEND_API_URL = 'https://api.resend.com/emails';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface OrderEmailData {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  storeEmail: string;
  storeName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
  };
}

const sendEmail = async ({ to, subject, html }: SendEmailParams) => {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not configured. Skipping email send.');
    return { success: false, error: 'API key not configured' };
  }

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

export const sendOrderEmails = async (data: OrderEmailData) => {
  try {
    // Email para cliente
    const customerHtml = `
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
                <h1 style="color: #ffffff; margin: 0; font-size: 32px;">✅ Pedido Confirmado!</h1>
              </div>
              
              <!-- Conteúdo -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${data.customerName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                  Seu pedido <strong>${data.orderCode}</strong> foi confirmado com sucesso!
                </p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Resumo do Pedido</h3>
                  ${data.items.map(item => `
                    <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between;">
                        <span style="color: #4b5563;">${item.quantity}x ${item.name}</span>
                        <span style="color: #1f2937; font-weight: 600;">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  `).join('')}
                  <div style="padding: 15px 0 0 0;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #1f2937; font-size: 18px; font-weight: bold;">Total</span>
                      <span style="color: #1e3a8a; font-size: 24px; font-weight: bold;">R$ ${data.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📍 Endereço de Entrega</h3>
                  <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                    ${data.address.street}, ${data.address.number}<br/>
                    ${data.address.city} - ${data.address.state}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0;">
                  ✅ Você receberá atualizações sobre seu pedido<br/>
                  🚚 Estimativa de entrega: 3-5 dias úteis<br/>
                  📱 Acompanhe seu pedido no app
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  © ${new Date().getFullYear()} AutoPeças IA. Todos os direitos reservados.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `;

    // Email para lojista
    const storeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background-color: #f3f4f6; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header Verde -->
              <div style="background-color: #10b981; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px;">🎉 Novo Pedido Recebido!</h1>
              </div>
              
              <!-- Conteúdo -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Olá, ${data.storeName}!</h2>
                
                <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                  Você recebeu um novo pedido: <strong>${data.orderCode}</strong>
                </p>
                
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">👤 Cliente</h3>
                  <p style="color: #4b5563; margin: 0 0 10px 0;">
                    <strong>Nome:</strong> ${data.customerName}<br/>
                    <strong>Email:</strong> ${data.customerEmail}
                  </p>
                  
                  <h3 style="color: #1f2937; margin: 20px 0 15px 0; font-size: 18px;">📦 Itens do Pedido</h3>
                  ${data.items.map(item => `
                    <div style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; justify-content: space-between;">
                        <span style="color: #4b5563;">${item.quantity}x ${item.name}</span>
                        <span style="color: #1f2937; font-weight: 600;">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  `).join('')}
                  <div style="padding: 15px 0 0 0;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: #1f2937; font-size: 18px; font-weight: bold;">Total</span>
                      <span style="color: #10b981; font-size: 24px; font-weight: bold;">R$ ${data.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
                  <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">📍 Endereço de Entrega</h3>
                  <p style="color: #4b5563; margin: 0; line-height: 1.6;">
                    ${data.address.street}, ${data.address.number}<br/>
                    ${data.address.city} - ${data.address.state}
                  </p>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                  🎯 Acesse o painel para processar o pedido
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; font-size: 14px;">
                  © ${new Date().getFullYear()} AutoPeças IA. Todos os direitos reservados.
                </p>
              </div>
              
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar ambos os emails
    await Promise.all([
      sendEmail({
        to: data.customerEmail,
        subject: `✅ Pedido ${data.orderCode} confirmado!`,
        html: customerHtml,
      }),
      sendEmail({
        to: data.storeEmail,
        subject: `🎉 Novo pedido ${data.orderCode} recebido!`,
        html: storeHtml,
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error sending order emails:', error);
    return { success: false, error };
  }
};
