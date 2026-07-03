import { baseTemplate, button } from './base.template.js';

export const verifyEmailTemplate = ({ name, verifyUrl }) => {
  const content = `
    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Verify Your Email Address 📧</h2>
    <p style="font-size: 15px; line-height: 1.625; color: #4B5563; margin: 0 0 20px 0;">
      Hi ${name}, welcome to RoomYaaro! We're excited to have you on board.
    </p>
    <p style="font-size: 15px; line-height: 1.625; color: #4B5563; margin: 0 0 20px 0;">
      Please verify your email address to activate your account and start finding your perfect room or yaaro.
    </p>
    ${button('Verify My Email', verifyUrl)}
    <p style="font-size: 13px; line-height: 1.625; color: #9CA3AF; margin: 0 0 8px 0;">
      This link expires in <strong>24 hours</strong>.
    </p>
    <p style="font-size: 13px; line-height: 1.625; color: #9CA3AF; margin: 0;">
      If you didn't create a RoomYaaro account, you can safely ignore this email.
    </p>
  `;

  return baseTemplate({
    title: 'Verify Your Email – RoomYaaro',
    preview: `Hi ${name}, please verify your email to activate your RoomYaaro account.`,
    content,
  });
};
