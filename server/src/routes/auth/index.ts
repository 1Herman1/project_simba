import { FastifyPluginAsync } from 'fastify'
import sendOtp from './send-otp'
import verifyOtp from './verify-otp'
import adminLogin from './admin-login'
import me from './me'
import changePassword from './change-password'

const authRoutes: FastifyPluginAsync = async (app) => {
  app.register(sendOtp)
  app.register(verifyOtp)
  app.register(adminLogin)
  app.register(me)
  app.register(changePassword)
}

export default authRoutes
