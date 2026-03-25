import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { organization } from "better-auth/plugins"
import { admin } from "better-auth/plugins"
import { prisma } from "../config/db.js"
import { env } from "../config/env.js"

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  user: { modelName: "BetterAuthUser" },
  account: { modelName: "BetterAuthAccount" },
  session: {
    modelName: "BetterAuthSession",
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  verification: { modelName: "BetterAuthVerification" },
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },
  trustedOrigins: [
    ...(env.isDev ? [
      'http://localhost:4173',
      'http://localhost:5173',
      'http://localhost:5174',
      `http://*.${env.APP_DOMAIN}:5173`,
      `http://*.${env.APP_DOMAIN}:5174`,
    ] : []),
    `https://*.${env.APP_DOMAIN}`,
  ],
  advanced: {
    crossSubDomainCookies: env.isProd
      ? { enabled: true, domain: `.${env.APP_DOMAIN}` }
      : { enabled: false },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        return (user as any).role === "admin"
      },
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
