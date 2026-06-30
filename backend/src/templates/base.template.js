export const baseTemplate = ({ title, preview, content }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset & Base Styles */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; }
    
    /* Layout */
    .wrapper { width: 100%; background-color: #F3F4F6; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
    
    /* Brand Header */
    .header { padding: 32px 40px 24px 40px; text-align: left; }
    .logo-text { font-size: 20px; font-weight: 700; color: #111827; margin: 0; letter-spacing: -0.5px; }
    .logo-text span { color: #2563EB; }
    
    /* Content Body */
    .content { padding: 0 40px 40px 40px; }
    .text { font-size: 15px; line-height: 1.625; color: #4B5563; margin-bottom: 20px; margin-top: 0; }
    
    /* Footer */
    .footer { background-color: #F9FAFB; padding: 32px 40px; text-align: center; border-top: 1px solid #E5E7EB; }
    .footer-text { font-size: 13px; line-height: 1.6; color: #9CA3AF; margin: 0 0 8px 0; }
    .footer-link { color: #2563EB; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${preview}</div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1 class="logo-text">🏠 Rent<span>Finder</span></h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p class="footer-text">Sent by RentFinder. Find your perfect room & flatmate.</p>
        <p class="footer-text">© ${new Date().getFullYear()} RentFinder. All rights reserved.</p>
        <p class="footer-text">
          <a href="#" class="footer-link">Help Center</a> • 
          <a href="#" class="footer-link">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const divider = `
<hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
`;

export const button = (text, url, secondary = false) => {
  if (secondary) {
    return `
    <div style="margin: 28px 0;">
      <a href="${url}" style="display: inline-block; background-color: #FFFFFF; color: #1F2937 !important; border: 1px solid #D1D5DB; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">${text}</a>
    </div>
    `;
  }
  return `
  <div style="margin: 28px 0;">
    <a href="${url}" style="display: inline-block; background-color: #2563EB; color: #FFFFFF !important; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; text-align: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">${text}</a>
  </div>
  `;
};

export const propertyCard = ({ title, location, rent, roomType, availableFrom }) => `
<div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
  <div style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 8px;">🏠 ${title}</div>
  <div style="font-size: 14px; color: #6B7280; margin-bottom: 12px;">
    📍 ${location}
  </div>
  <table cellpadding="0" cellspacing="0" style="margin-top: 8px;">
    <tr>
      <td style="padding-right: 8px;">
        <span style="display: inline-block; background: #EFF6FF; color: #1D4ED8; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 6px;">${rent}</span>
      </td>
      <td style="padding-right: 8px;">
        <span style="display: inline-block; background: #F3F4F6; color: #374151; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 6px;">${roomType}</span>
      </td>
      ${availableFrom ? `
      <td>
        <span style="display: inline-block; background: #F3F4F6; color: #374151; font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 6px;">Available: ${availableFrom}</span>
      </td>
      ` : ''}
    </tr>
  </table>
</div>
`;
