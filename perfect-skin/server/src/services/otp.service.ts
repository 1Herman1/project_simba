import bcryptjs from 'bcryptjs'
const { hash, compare } = bcryptjs
import { db } from '../lib/db.js'
import { ApiError } from '../lib/errors.js'

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const OTP_FAILED_ATTEMPTS_LIMIT = 5
const OTP_BLOCK_DURATION_MINUTES = 15

export class OtpService {
  async generateAndStoreCode(phone: string): Promise<string> {
    // Generate 6-digit code
    const code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0')
    const codeHash = await hash(code, 10)

    await db.otpCode.create({
      data: {
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    })

    return code
  }

  async verifyCode(phone: string, code: string): Promise<void> {
    const user = await db.user.findFirst({
      where: { phone, deletedAt: null },
    })

    if (!user) {
      throw new ApiError(400, 'OTP_INVALID', 'Неверный или истёкший код входа')
    }

    // Check if user is blocked
    if (user.otpBlockedUntil && user.otpBlockedUntil > new Date()) {
      throw new ApiError(
        429,
        'OTP_BLOCKED',
        'Слишком много неудачных попыток. Попробуйте позже',
        { blockedUntil: user.otpBlockedUntil.toISOString() }
      )
    }

    // Find latest OTP code for this phone
    const otpRecord = await db.otpCode.findFirst({
      where: {
        userId: user.id,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otpRecord) {
      // Increment failed attempts
      await db.user.update({
        where: { id: user.id },
        data: {
          otpFailedCount: { increment: 1 },
          ...(user.otpFailedCount + 1 >= OTP_FAILED_ATTEMPTS_LIMIT && {
            otpBlockedUntil: new Date(Date.now() + OTP_BLOCK_DURATION_MINUTES * 60 * 1000),
          }),
        },
      })
      throw new ApiError(400, 'OTP_INVALID', 'Неверный или истёкший код входа')
    }

    // Verify code with bcrypt
    const isValid = await compare(code, otpRecord.codeHash)

    if (!isValid) {
      // Increment failed attempts
      await db.user.update({
        where: { id: user.id },
        data: {
          otpFailedCount: { increment: 1 },
          ...(user.otpFailedCount + 1 >= OTP_FAILED_ATTEMPTS_LIMIT && {
            otpBlockedUntil: new Date(Date.now() + OTP_BLOCK_DURATION_MINUTES * 60 * 1000),
          }),
        },
      })
      throw new ApiError(400, 'OTP_INVALID', 'Неверный или истёкший код входа')
    }

    // Mark code as used and reset failed attempts
    await db.$transaction([
      db.otpCode.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
      db.user.update({
        where: { id: user.id },
        data: {
          otpFailedCount: 0,
          otpBlockedUntil: null,
        },
      }),
    ])
  }

  async findOrCreateUser(phone: string, name?: string): Promise<any> {
    let user = await db.user.findFirst({
      where: { phone, deletedAt: null },
    })

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          name: name || phone,
          role: 'customer',
        },
      })
    }

    return user
  }
}

export const otpService = new OtpService()
