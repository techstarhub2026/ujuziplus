/**
 * Email service.
 * In development without Gmail configured → logs the email to console.
 * In production → sends via Gmail SMTP.
 *
 * To configure Gmail:
 *  1. Enable 2-Step Verification on your Google account.
 *  2. Go to myaccount.google.com → Security → App Passwords.
 *  3. Create a password for "Mail / Other (UjuziLab)".
 *  4. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local.
 */
import nodemailer from "nodemailer";

const isConfigured =
  process.env.GMAIL_USER &&
  process.env.GMAIL_APP_PASSWORD &&
  !process.env.GMAIL_USER.startsWith("your-gmail");

// Use real Gmail or console fallback
const transporter = isConfigured
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
  : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export type EmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(opts: EmailOptions): Promise<EmailResult> {
  if (!transporter) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD)." };
    }
    console.log("\n📧 ─── EMAIL (dev console fallback) ───────────────");
    console.log("To:", opts.to);
    console.log("Subject:", opts.subject);
    console.log("─────────────────────────────────────────────────\n");
    return { ok: true };
  }

  try {
    await transporter.sendMail({
      from: `"UjuziLab" <${process.env.GMAIL_USER}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Email send failed:", err);
    return { ok: false, error: message };
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────

export function passwordResetEmail(resetUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">Reset your UjuziLab password</h2>
      <p>Click the button below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Reset password
      </a>
      <p style="color:#666;font-size:12px;">
        If you didn't request this, ignore this email. Your password won't change.
      </p>
    </div>
  `;
}

export function instructorApprovedEmail(fullName: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">You're approved, ${fullName}!</h2>
      <p>Your instructor application has been reviewed and approved. You can now sign in and start creating courses on UjuziLab.</p>
      <a href="${process.env.NEXTAUTH_URL}/auth/login"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Sign in
      </a>
    </div>
  `;
}

export function instructorRejectedEmail(fullName: string, reason?: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">Update on your instructor application</h2>
      <p>Hi ${fullName}, after review we're unable to approve your instructor application at this time.</p>
      ${reason ? `<p style="color:#666;">Reason: ${reason}</p>` : ""}
      <p style="color:#666;font-size:12px;">
        If you have questions, please contact UjuziLab support.
      </p>
    </div>
  `;
}

export function welcomeEmail(fullName: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">Welcome to UjuziLab, ${fullName}!</h2>
      <p>Your account is ready. Start learning Africa's future — one project at a time.</p>
      <a href="${process.env.NEXTAUTH_URL}/dashboard"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Go to dashboard
      </a>
    </div>
  `;
}

const appUrl = () => process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export function notificationEmail(opts: {
  fullName: string;
  title: string;
  message: string;
  href?: string | null;
}) {
  const link = opts.href ? `${appUrl()}${opts.href}` : `${appUrl()}/dashboard/notifications`;
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">${opts.title}</h2>
      <p>Hi ${opts.fullName},</p>
      <p>${opts.message}</p>
      <a href="${link}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        View in UjuziLab
      </a>
      <p style="color:#666;font-size:12px;">
        Manage email alerts in Settings → Notifications.
      </p>
    </div>
  `;
}

export function orgKitRequestAdminEmail(opts: {
  adminName: string;
  orgName: string;
  requesterName: string;
  kitTitle: string;
  quantity: number;
  notes?: string | null;
  reviewUrl: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#f39223">New kit procurement request</h2>
      <p>Hi ${opts.adminName},</p>
      <p><strong>${opts.requesterName}</strong> submitted a kit request for <strong>${opts.orgName}</strong>:</p>
      <ul style="line-height:1.6">
        <li><strong>Kit:</strong> ${opts.kitTitle}</li>
        <li><strong>Quantity:</strong> ${opts.quantity}</li>
        ${opts.notes ? `<li><strong>Notes:</strong> ${opts.notes}</li>` : ""}
      </ul>
      <a href="${opts.reviewUrl}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Review in org portal
      </a>
      <p style="color:#666;font-size:12px;">
        Platform admins were also notified in UjuziLab.
      </p>
    </div>
  `;
}

export function orgInviteEmail(opts: {
  orgName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
  expiresAt: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">You're invited to ${opts.orgName}</h2>
      <p>${opts.inviterName} invited you to join as <strong>${opts.role}</strong>.</p>
      <a href="${opts.acceptUrl}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Accept invitation
      </a>
      <p style="color:#666;font-size:12px;">This link expires ${opts.expiresAt}.</p>
    </div>
  `;
}

export function paymentReceiptEmail(opts: {
  fullName: string;
  orderId: string;
  total: string;
  itemSummary: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">Payment receipt</h2>
      <p>Hi ${opts.fullName},</p>
      <p>Thank you for your purchase of <strong>${opts.total}</strong>.</p>
      <p>${opts.itemSummary}</p>
      <a href="${appUrl()}/checkout/success/${opts.orderId}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        View order
      </a>
    </div>
  `;
}

export function mentorRequestEmail(opts: {
  mentorName: string;
  learnerName: string;
  goal: string;
  message: string;
  reviewUrl: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#f39223">New mentorship request</h2>
      <p>Hi ${opts.mentorName},</p>
      <p><strong>${opts.learnerName}</strong> would like your guidance:</p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;"><strong>Goal:</strong> ${opts.goal}</p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px;">${opts.message}</p>
      <a href="${opts.reviewUrl}"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        Review request
      </a>
    </div>
  `;
}

export function mentorSessionEmail(opts: {
  recipientName: string;
  mentorName: string;
  topic: string;
  scheduledAt: Date;
  meetingUrl?: string | null;
  isReminder?: boolean;
}) {
  const when = opts.scheduledAt.toLocaleString("en-TZ", {
    timeZone: "Africa/Dar_es_Salaam",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const heading = opts.isReminder ? "Mentorship session reminder" : "Mentorship session confirmed";
  const meet = opts.meetingUrl
    ? `<a href="${opts.meetingUrl}" style="color:#f39223">${opts.meetingUrl}</a>`
    : "Check your dashboard for meeting details.";
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#f39223">${heading}</h2>
      <p>Hi ${opts.recipientName},</p>
      <p>Session with <strong>${opts.mentorName}</strong></p>
      <ul style="line-height:1.8">
        <li><strong>Topic:</strong> ${opts.topic}</li>
        <li><strong>When:</strong> ${when} (EAT)</li>
        <li><strong>Join:</strong> ${meet}</li>
      </ul>
      <a href="${appUrl()}/dashboard/mentors"
         style="display:inline-block;background:#f39223;color:#fff;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
        View in dashboard
      </a>
    </div>
  `;
}

export function programRegistrationEmail(opts: {
  fullName: string;
  programTitle: string;
  programType: string;
  startDate: string;
  format: string;
  price: string;
  programUrl: string;
  dashboardUrl: string;
}) {
  const isPaid = opts.price !== "Free";
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222;">
      <div style="background:#00004D;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">ujuziPlus</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#00004D;margin-top:0;">
          ${isPaid ? "🎉 Registration Confirmed!" : "🎉 You're Registered!"}
        </h2>
        <p>Hi <strong>${opts.fullName}</strong>,</p>
        <p>
          ${isPaid
            ? `Your payment has been confirmed and you are now registered for:`
            : `You have successfully registered for:`}
        </p>
        <div style="background:#f8f9fa;border-left:4px solid #f39223;padding:16px 20px;margin:20px 0;border-radius:4px;">
          <p style="margin:0 0 6px;font-size:18px;font-weight:bold;color:#00004D;">${opts.programTitle}</p>
          <p style="margin:0;color:#555;font-size:14px;">${opts.programType}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#666;font-weight:600;">Start Date</td>
            <td style="padding:10px 0;text-align:right;">${opts.startDate}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:10px 0;color:#666;font-weight:600;">Format</td>
            <td style="padding:10px 0;text-align:right;">${opts.format}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#666;font-weight:600;">Fee</td>
            <td style="padding:10px 0;text-align:right;font-weight:bold;color:#f39223;">${opts.price}</td>
          </tr>
        </table>
        <p style="color:#555;font-size:14px;">
          You will receive further details about the program including schedules, resources,
          and joining instructions closer to the start date.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${opts.programUrl}"
             style="display:inline-block;background:#f39223;color:#fff;padding:14px 28px;
                    border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
            View Program Details
          </a>
        </div>
        <p style="text-align:center;">
          <a href="${opts.dashboardUrl}" style="color:#00004D;font-size:13px;">
            Go to My Programs Dashboard →
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#999;text-align:center;">
          ujuziPlus · Africa's innovation learning platform<br/>
          If you did not register for this program, please contact support.
        </p>
      </div>
    </div>
  `;
}

export function orgAdminCredentialsEmail(opts: {
  fullName: string;
  orgName: string;
  email: string;
  password: string;
  loginUrl: string;
}) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#222;">
      <div style="background:#00004D;padding:24px 32px;border-radius:8px 8px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">ujuziPlus</h1>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
        <h2 style="color:#00004D;margin-top:0;">Your Organisation Admin Account</h2>
        <p>Hi <strong>${opts.fullName}</strong>,</p>
        <p>
          You have been set up as an <strong>Organisation Administrator</strong> for
          <strong>${opts.orgName}</strong> on ujuziPlus.
        </p>
        <p>Here are your login credentials:</p>
        <div style="background:#f8f9fa;border:1px solid #e5e7eb;padding:20px;border-radius:6px;margin:20px 0;">
          <p style="margin:0 0 8px;"><span style="color:#666;">Email:</span> <strong>${opts.email}</strong></p>
          <p style="margin:0;"><span style="color:#666;">Temporary Password:</span> <strong style="font-size:16px;letter-spacing:1px;">${opts.password}</strong></p>
        </div>
        <p style="color:#e53e3e;font-size:13px;font-weight:600;">
          ⚠ Please change your password immediately after your first login.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${opts.loginUrl}"
             style="display:inline-block;background:#f39223;color:#fff;padding:14px 28px;
                    border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
            Login to Your Portal
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="font-size:12px;color:#999;text-align:center;">
          ujuziPlus · Africa's innovation learning platform
        </p>
      </div>
    </div>
  `;
}
