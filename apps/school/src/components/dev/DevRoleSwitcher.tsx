import { useState } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Role } from '@/types/common.types'

const ROLES: { role: Role; label: string; color: string }[] = [
  { role: 'admin', label: 'Admin', color: '#ef4444' },
  { role: 'principal', label: 'Principal', color: '#f97316' },
  { role: 'teacher', label: 'Teacher', color: '#3b82f6' },
  { role: 'accountant', label: 'Accountant', color: '#8b5cf6' },
  { role: 'librarian', label: 'Librarian', color: '#06b6d4' },
  { role: 'transport_manager', label: 'Transport', color: '#84cc16' },
  { role: 'student', label: 'Student', color: '#10b981' },
  { role: 'parent', label: 'Parent', color: '#ec4899' },
]

const MOCK_USERS: Record<Role, { id: string; name: string; email: string }> = {
  admin: { id: 'dev-admin', name: 'Dev Admin', email: 'admin@school.dev' },
  principal: { id: 'dev-principal', name: 'Dr. Sharma', email: 'principal@school.dev' },
  teacher: { id: 'dev-teacher', name: 'Priya Teacher', email: 'teacher@school.dev' },
  accountant: { id: 'dev-accountant', name: 'Raj Accountant', email: 'accountant@school.dev' },
  librarian: { id: 'dev-librarian', name: 'Meena Librarian', email: 'librarian@school.dev' },
  transport_manager: { id: 'dev-transport', name: 'Suresh Transport', email: 'transport@school.dev' },
  student: { id: 'dev-student', name: 'Arjun Student', email: 'student@school.dev' },
  parent: { id: 'dev-parent', name: 'Kavita Parent', email: 'parent@school.dev' },
}

export function DevRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const { user, login } = useAuthStore()

  // Only show in development
  if (import.meta.env.PROD) return null

  const switchRole = (role: Role) => {
    const mockUser = MOCK_USERS[role]
    login({
      ...mockUser,
      role,
      ...(role === 'student' ? { studentId: 'dev-student-id', class: 'Class 10', section: 'A', rollNumber: 1 } : {}),
      ...(role === 'parent' ? { childIds: ['dev-student-id'] } : {}),
    })
    window.location.href = '/'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: '#1f2937',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        Dev Switcher
      </button>
    )
  }

  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 99999,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
        }}
      >
        <span style={{
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ROLES.find(r => r.role === user?.role)?.color || '#999',
        }} />
        <span style={{ fontWeight: 600 }}>{user?.role || 'none'}</span>
        <button onClick={() => setIsMinimized(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#999' }}>x</button>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 99999,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: 16,
        width: 280,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Dev Role Switcher</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setIsMinimized(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#999' }}>-</button>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#999' }}>x</button>
        </div>
      </div>

      {/* Role Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {ROLES.map(({ role, label, color }) => {
          const isActive = user?.role === role
          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: isActive ? `2px solid ${color}` : '1px solid #e5e7eb',
                background: isActive ? color : '#fff',
                color: isActive ? '#fff' : '#374151',
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Current User */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#6b7280' }}>
        {user ? (
          <>Logged in as <strong>{user.name}</strong> ({user.role})</>
        ) : (
          <>Not logged in</>
        )}
      </div>
    </div>
  )
}
