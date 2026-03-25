import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'

const API_BASE = 'http://localhost:3001/api'

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ALL test accounts — seed wipes the DB, so we must recreate every role
const TEST_ACCOUNTS = [
  { email: 'admin@paperbook.in', password: 'Demo@123456', name: 'Admin User' },
  { email: 'teacher@paperbook.in', password: 'Demo@123456', name: 'Priya Nair' },
  { email: 'student@paperbook.in', password: 'Demo@123456', name: 'Aarav Patel' },
  { email: 'accounts@paperbook.in', password: 'Demo@123456', name: 'Rahul Accounts' },
  { email: 'parent@paperbook.in', password: 'Demo@123456', name: 'Rajesh Patel' },
]

async function ensureBetterAuthAccounts() {
  for (const account of TEST_ACCOUNTS) {
    try {
      // Try sign-in first to check if account exists with our expected password
      const signInRes = await fetch(`${API_BASE}/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password }),
      })
      const signInText = await signInRes.text()
      let signInData: { user?: { email?: string }; error?: string } = {}
      try { signInData = JSON.parse(signInText) } catch { /* not JSON */ }

      if (signInData?.user?.email) {
        console.log(`[Global Setup] Account ${account.email} OK (exists with expected password)`)
        await sleep(500) // Small delay to avoid rate limiting
        continue
      }

      // Account may not exist — try sign-up
      await sleep(500)
      const signUpRes = await fetch(`${API_BASE}/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })
      const signUpText = await signUpRes.text()
      let signUpData: { user?: { email?: string }; message?: string; error?: string } = {}
      try { signUpData = JSON.parse(signUpText) } catch { /* not JSON */ }

      if (signUpData?.user?.email) {
        console.log(`[Global Setup] Created ${account.email}`)
      } else {
        // Account may exist with a different password — that's OK, auth.setup.ts will try multiple
        console.warn(`[Global Setup] ${account.email}: ${signUpData?.message ?? signUpData?.error ?? 'exists with different password'}`)
      }
    } catch (error) {
      console.warn(`[Global Setup] Error with ${account.email}:`, (error as Error).message)
    }
    await sleep(500) // Delay between accounts to avoid rate limiting
  }
}

async function globalSetup() {
  console.log('[Global Setup] Starting...')

  // Seed the legacy database (server/ directory)
  const serverDir = path.join(process.cwd(), 'server')
  if (fs.existsSync(serverDir)) {
    loadEnvFile(path.join(serverDir, '.env'))
    try {
      execSync('npm run db:seed', {
        stdio: 'inherit',
        cwd: serverDir,
        timeout: 60_000,
        env: { ...process.env },
      })
      console.log('[Global Setup] Legacy database seeded.')
    } catch (error) {
      console.warn('[Global Setup] Legacy seed skipped (may not be configured):', (error as Error).message)
    }
  }

  // Ensure all test accounts exist in better-auth (apps/server)
  console.log('[Global Setup] Creating better-auth test accounts...')
  await ensureBetterAuthAccounts()

  console.log('[Global Setup] Done.')
}

export default globalSetup
