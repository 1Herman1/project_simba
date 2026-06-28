import { FastifyInstance } from 'fastify'
import list from './list'
import single from './single'
import adminCrud from './admin-crud'

export default async function productRoutes(app: FastifyInstance) {
  await app.register(list)
  await app.register(single)
  await app.register(adminCrud)
}
