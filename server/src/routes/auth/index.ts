import { FastifyPluginAsync } from 'fastify'
import sendOtp from './send-otp'
import verifyOtp from './verify-otp'
import adminLogin from './admin-login'
import me from './me'

const authRoutes: FastifyPluginAsync = async (app) => {
  app.register(sendOtp)
  app.register(verifyOtp)
  app.register(adminLogin)
  app.register(me)
}

export default authRoutes
