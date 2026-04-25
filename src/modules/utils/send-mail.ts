import nodemailer from 'nodemailer';
import config from '../../configs/config';
import ApiError from '../errors/ApiError';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const getTransporter = () => {
  if (!config.smtp.host || !config.smtp.user || !config.smtp.pass || !config.smtp.fromEmail) {
    throw new ApiError(500, 'SMTP mail settings are not configured');
  }

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
};

export const sendMail = async ({ to, subject, html, text }: SendMailOptions) => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
    to,
    subject,
    html,
    text,
  });
};
