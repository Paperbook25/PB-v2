import { createAuthClient } from "better-auth/react"
import { organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  // Empty baseURL → relative URLs (/api/auth/...) → nginx routes to server
  // Do NOT use VITE_API_URL here — it's an internal Docker URL unreachable from browser
  baseURL: "",
  plugins: [organizationClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
