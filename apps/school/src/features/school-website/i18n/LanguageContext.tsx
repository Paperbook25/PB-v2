import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('pb-lang')
      if (stored === 'en' || stored === 'hi') return stored
    } catch {
      // SSR or localStorage unavailable
    }
    return 'en'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('pb-lang', lang)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const t = useCallback((key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
