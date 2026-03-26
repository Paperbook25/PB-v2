import { PrismaClient } from '@prisma/client'
import { env } from './env.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Append connection_limit if not already set in DATABASE_URL
const dbUrl = env.DATABASE_URL.includes('connection_limit')
  ? env.DATABASE_URL
  : `${env.DATABASE_URL}${env.DATABASE_URL.includes('?') ? '&' : '?'}connection_limit=${env.isProd ? 20 : 10}`

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: env.isDev ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.isDev) {
  globalForPrisma.prisma = prisma
}
