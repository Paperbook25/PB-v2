import { createAuthClient } from "better-auth/react"
import { adminClient, organizationClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "",
  plugins: [adminClient(), organizationClient()],
})

export const { useSession, signIn, signOut, signUp } = authClient
