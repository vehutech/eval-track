import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@evaltrack.edu.ng";

export async function sendWelcomeEmail(to: string, name: string, tempPassword: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to EvalTrack",
    html: `<p>Hi ${name},</p><p>Your account has been created. Your temporary password is: <strong>${tempPassword}</strong></p><p>Please log in and change your password.</p>`,
  });
}

export async function sendEvaluationOpenEmail(to: string, name: string, periodTitle: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Evaluation Period Open: ${periodTitle}`,
    html: `<p>Hi ${name},</p><p>The evaluation period <strong>${periodTitle}</strong> is now open. Please log in to submit your evaluations.</p>`,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset Your EvalTrack Password",
    html: `<p>Click the link below to reset your password (valid for 1 hour):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
}
