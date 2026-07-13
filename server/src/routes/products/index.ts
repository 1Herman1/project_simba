import { FastifyInstance } from 'fastify'
import list from './list'
import single from './single'

export default async function productRoutes(app: FastifyInstance) {
  await app.register(list)
  await app.register(single)
}
