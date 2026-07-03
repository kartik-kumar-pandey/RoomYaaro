import { baseTemplate, button, divider } from './base.template.js';

export const passwordResetTemplate = ({ name, resetUrl }) => {
  const content = `
    <h2 style="font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0;">Reset Your Password 🔒</h2>
    <p style="font-size: 15px; line-height: 1.625; color: #4B5563; margin: 0 0 20px 0;">
      Hi ${name}, we received a request to reset the password for your RoomYaaro account.
    </p>
    <p style="font-size: 15px; line-height: 1.625; color: #4B5563; margin: 0 0 20px 0;">
      Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
    </p>
    ${button('Reset My Password', resetUrl)}
    ${divider}
    <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; padding: 16px; margin: 0 0 20px 0;">
      <p style="font-size: 14px; line-height: 1.5; color: #92400E; margin: 0;">
        <strong>⚠️ Security Notice:</strong> If you did not request a password reset, please ignore this email. 
        Your password will remain unchanged. Do not share this link with anyone.
      </p>
    </div>
    <p style="font-size: 13px; line-height: 1.625; color: #9CA3AF; margin: 0;">
      If the button above doesn't work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #2563EB; word-break: break-all;">${resetUrl}</a>
    </p>
  `;

  return baseTemplate({
    title: 'Reset Your Password – RoomYaaro',
    preview: `Hi ${name}, reset your RoomYaaro password using the secure link inside.`,
    content,
  });
};
