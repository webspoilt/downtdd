import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Initialization wrapper
const getDb = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = prismaClientSingleton()
  }
  return globalForPrisma.prisma
}

// Export a proxy that forwards all calls to the instance returned by getDb()
export const db = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    const client = getDb()
    return (client as any)[prop]
  }
})

if (process.env.NODE_ENV !== 'production') {
  // Pre-initialize in dev for better DX, but wrap in try-catch just in case
  try {
    getDb()
  } catch (e) {
    console.warn('Failed to pre-initialize Prisma in dev:', e)
  }
}