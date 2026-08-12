import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'
import { OtpChannel } from '../types'

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

async function sendEmail(to: string, code: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@simba.ru',
    to,
    subject: 'Ваш код входа в Simba',
    text: `Ваш код для входа: ${code}\n\nКод действителен 10 минут.`,
    html: `<p>Ваш код для входа: <strong>${code}</strong></p><p>Код действителен 10 минут.</p>`,
  })
}


async function createOtp(
  prisma: PrismaClient,
  userId: string,
  channel: OtpChannel
): Promise<string> {
  const code = generateCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await prisma.otpCode.create({
    data: {
      userId,
      code: hashCode(code),
      channel,
      expiresAt,
    },
  })

  return code
}

async function verifyOtp(
  prisma: PrismaClient,
  userId: string,
  code: string
): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp || otp.code !== hashCode(code)) {
    return false
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  })

  return true
}

export const otpService = {
  generateCode,
  hashCode,
  sendEmail,
  createOtp,
  verifyOtp,
}
