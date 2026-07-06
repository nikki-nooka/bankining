import { PrismaClient } from '@prisma/client'

import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const rawConnectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || ''
  if (!rawConnectionString) {
    throw new Error("CRITICAL VERCEL ERROR: Supabase Environment Variables are MISSING! Make sure you saved them for the 'Production' environment and REDEPLOYED.")
  }
  
  // pg-connection-string overrides the `ssl` object if sslmode is present in the URL.
  // We remove it so our `ssl: { rejectUnauthorized: false }` is respected.
  const connectionString = rawConnectionString.replace('?sslmode=require', '?').replace('&sslmode=require', '')
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
