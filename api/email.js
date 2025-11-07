import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, html, text }) {
  const transporter = nodemailer.createTransport(process.env.SMTP_URL);
  const res = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to, subject, html, text
  });
  return res;
}
