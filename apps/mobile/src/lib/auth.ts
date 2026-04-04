import { useState, useEffect } from 'react'
import * as SecureStore from 'expo-secure-store'
import { api, setAuthToken } from './api'

interface User {
  id: string
  name: string
  email: string
  role: string
  organizationId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, schoolSlug: string) => Promise<void>
  logout: () => Promise<void>
}

const TOKEN_KEY = 'pb_auth_token'
const USER_KEY = 'pb_user'

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStoredAuth()
  }, [])

  async function loadStoredAuth() {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY)
      const userJson = await SecureStore.getItemAsync(USER_KEY)
      if (token && userJson) {
        setAuthToken(token)
        setUser(JSON.parse(userJson))
      }
    } catch (e) {
      console.error('Failed to load auth:', e)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string, schoolSlug: string) {
    const result = await api.login(email, password)
    if (result.loginToken) {
      setAuthToken(result.loginToken)
      await SecureStore.setItemAsync(TOKEN_KEY, result.loginToken)
      const userData = result.user || { id: '', name: '', email, role: 'user' }
      setUser(userData)
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData))
    }
  }

  async function logout() {
    setAuthToken(null)
    setUser(null)
    await SecureStore.deleteItemAsync(TOKEN_KEY)
    await SecureStore.deleteItemAsync(USER_KEY)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
