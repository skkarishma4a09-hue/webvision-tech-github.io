/**
 * OTP Email Template
 * Branded HTML + plain-text emails for Project Content AI Marketplace
 */

export function getOtpEmailHtml(otp: string, expiryMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0a0a12; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #13131f; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3d; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%); padding: 36px 40px; text-align: center; }
    .header-logo { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; }
    .header-logo span { opacity: 0.8; }
    .header-tagline { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 6px; }
    .body { padding: 40px; }
    .greeting { font-size: 24px; font-weight: 700; color: #f1f5f9; margin-bottom: 12px; }
    .body-text { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 32px; }
    .otp-container { background: #1e1e2e; border: 2px solid #8b5cf6; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 28px; }
    .otp-label { font-size: 12px; font-weight: 600; color: #8b5cf6; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; }
    .otp-code { font-size: 42px; font-weight: 800; color: #f1f5f9; letter-spacing: 12px; font-family: 'Courier New', monospace; }
    .otp-expiry { font-size: 13px; color: #64748b; margin-top: 14px; }
    .divider { border: none; border-top: 1px solid #2a2a3d; margin: 28px 0; }
    .security-box { background: #1a1a2e; border: 1px solid #2a2a3d; border-radius: 10px; padding: 18px 20px; }
    .security-title { font-size: 12px; font-weight: 700; color: #f59e0b; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .security-text { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
    .footer { padding: 24px 40px; text-align: center; border-top: 1px solid #2a2a3d; }
    .footer-text { font-size: 12px; color: #475569; line-height: 1.7; }
    .footer-brand { font-size: 13px; font-weight: 600; color: #8b5cf6; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">Project Content <span>AI Marketplace</span></div>
      <div class="header-tagline">Secure Authentication</div>
    </div>
    <div class="body">
      <p class="greeting">Your Verification Code</p>
      <p class="body-text">
        You requested a sign-in verification code for Project Content AI Marketplace. 
        Use the code below to complete your authentication.
      </p>
      <div class="otp-container">
        <div class="otp-label">&#128274; Verification Code</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">Expires in <strong>${expiryMinutes} minutes</strong></div>
      </div>
      <hr class="divider" />
      <div class="security-box">
        <div class="security-title">&#9888; Security Notice</div>
        <p class="security-text">
          If you did not request this verification code, you can safely ignore this email. 
          Your account remains secure. <strong>Never share this code with anyone</strong> — 
          our team will never ask for it.
        </p>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">Project Content AI Marketplace</div>
      <p class="footer-text">
        This is an automated security email. Please do not reply.<br />
        &copy; ${new Date().getFullYear()} Project Content AI Marketplace. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export function getOtpEmailText(otp: string, expiryMinutes: number): string {
  return `
PROJECT CONTENT AI MARKETPLACE
Secure Authentication

Your Verification Code
======================

${otp}

This code expires in ${expiryMinutes} minutes.

SECURITY NOTICE:
If you did not request this code, you can safely ignore this email.
Do NOT share this code with anyone.

---
Project Content AI Marketplace
This is an automated security email. Please do not reply.
`.trim();
}
