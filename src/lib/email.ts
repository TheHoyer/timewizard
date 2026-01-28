import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const APP_NAME = 'TimeWizard'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@timewizard.pl'

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  
  try {
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Resetowanie hasła - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset hasła</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⏰ ${APP_NAME}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #1e293b; margin-top: 0;">Resetowanie hasła</h2>
              
              <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta w ${APP_NAME}.</p>
              
              <p>Kliknij poniższy przycisk, aby ustawić nowe hasło:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Zresetuj hasło
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">
                Link wygaśnie za <strong>1 godzinę</strong>.
              </p>
              
              <p style="color: #64748b; font-size: 14px;">
                Jeśli nie prosiłeś o reset hasła, zignoruj tę wiadomość. Twoje hasło pozostanie bez zmian.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                Jeśli przycisk nie działa, skopiuj i wklej ten link w przeglądarce:<br>
                <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
  try {
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Potwierdź swój email - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weryfikacja email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⏰ ${APP_NAME}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #1e293b; margin-top: 0;">Witaj w ${APP_NAME}! 🎉</h2>
              
              <p>Dziękujemy za rejestrację! Jeszcze tylko jeden krok - potwierdź swój adres email.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Potwierdź email
                </a>
              </div>
              
              <p style="color: #64748b; font-size: 14px;">
                Link wygaśnie za <strong>24 godziny</strong>.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                Jeśli przycisk nie działa, skopiuj i wklej ten link w przeglądarce:<br>
                <a href="${verifyUrl}" style="color: #7c3aed; word-break: break-all;">${verifyUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    await resend.emails.send({
      from: `${APP_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Witaj w ${APP_NAME}! 🎉`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Witaj w ${APP_NAME}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 40px 20px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⏰ ${APP_NAME}</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #1e293b; margin-top: 0;">Cześć${name ? ` ${name}` : ''}! 👋</h2>
              
              <p>Świetnie, że dołączyłeś do ${APP_NAME}! Jesteśmy podekscytowani, że możemy pomóc Ci lepiej zarządzać czasem.</p>
              
              <h3 style="color: #1e293b;">Co możesz teraz zrobić:</h3>
              
              <ul style="padding-left: 20px;">
                <li><strong>Stwórz swoje pierwsze zadanie</strong> - zacznij od czegoś prostego</li>
                <li><strong>Ustaw dostępność</strong> - powiedz nam, kiedy lubisz pracować</li>
                <li><strong>Poznaj inteligentne planowanie</strong> - pozwól AI zoptymalizować Twój dzień</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                  Przejdź do dashboardu
                </a>
              </div>
              
              <p style="color: #64748b;">
                Masz pytania? Odpowiedz na tego maila - chętnie pomożemy!
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
              <p>© ${new Date().getFullYear()} ${APP_NAME}. Wszystkie prawa zastrzeżone.</p>
            </div>
          </body>
        </html>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
