import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'

type AuthContextType = {
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthProvider: Initializing...')
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider: Initial session check:', { session: !!session, error })
      if (error) {
        console.error('AuthProvider: Error getting session:', error)
        setError(error.message)
      } else {
        setSession(session)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', { event: _event, session: !!session })
      setSession(session)
    })

    return () => {
      console.log('AuthProvider: Cleaning up...')
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting sign up...')
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        console.error('AuthProvider: Sign up error:', error)
        throw error
      }
      console.log('AuthProvider: Sign up successful')
    } catch (err) {
      console.error('AuthProvider: Sign up error:', err)
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthProvider: Attempting sign in...')
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('AuthProvider: Sign in error:', error)
        throw error
      }
      console.log('AuthProvider: Sign in successful')
    } catch (err) {
      console.error('AuthProvider: Sign in error:', err)
      throw err
    }
  }

  const signOut = async () => {
    try {
      console.log('AuthProvider: Attempting sign out...')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('AuthProvider: Sign out error:', error)
        throw error
      }
      console.log('AuthProvider: Sign out successful')
    } catch (err) {
      console.error('AuthProvider: Sign out error:', err)
      throw err
    }
  }

  if (error) {
    console.error('AuthProvider: Error state:', error)
  }

  return (
    <AuthContext.Provider value={{ session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 