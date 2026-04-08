import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users2, Plus, Search, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react'
import { AddonGate } from '@/components/AddonGate'
import { fetchClubs, fetchClubStats, createClub, updateClub, deleteClub } from '../api/clubs.api'
import type { Club } from '../types/clubs.types'

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending_approval: 'bg-yellow-100 text-yellow-700',
}

export function ClubsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Club | null>(null)
  const [form, setForm] = useState({ name: '', description: '', category: 'academic', meetingSchedule: '' })

  const statsQ = useQuery({ queryKey: ['clubs', 'stats'], queryFn: fetchClubStats })
  const clubsQ = useQuery({
    queryKey: ['clubs', 'list', search],
    queryFn: () => fetchClubs({ search: search || undefined }),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => createClub(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clubs'] }); setShowDialog(false); resetForm() },
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: any) => updateClub(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['clubs'] }); setShowDialog(false); resetForm() },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteClub(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clubs'] }),
  })

  const resetForm = () => { setForm({ name: '', description: '', category: 'academic', meetingSchedule: '' }); setEditing(null) }

  const stats = statsQ.data?.data
  const clubs: Club[] = clubsQ.data?.data || []

  return (
    <AddonGate slug="clubs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Clubs & Activities</h1>
            <p className="text-sm text-muted-foreground">Manage extracurricular clubs and student activities</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New Club
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Clubs', value: stats.totalClubs, icon: Users2 },
              { label: 'Active', value: stats.activeClubs, icon: Users2 },
              { label: 'Members', value: stats.totalMembers, icon: Users2 },
              { label: 'Activities', value: stats.totalActivities, icon: Users2 },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs..."
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {clubsQ.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : clubsQ.isError ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> Failed to load clubs
            </div>
          ) : clubs.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No clubs found. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Advisor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Members</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clubs.map((club) => (
                    <tr key={club.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{club.name}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{club.category?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{club.advisorName || '—'}</td>
                      <td className="px-4 py-3">{(club as any).memberCount ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[club.status] || 'bg-muted text-muted-foreground'}`}>
                          {club.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => { setEditing(club); setForm({ name: club.name, description: club.description || '', category: club.category, meetingSchedule: (club as any).meetingSchedule || '' }); setShowDialog(true) }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this club?')) deleteMut.mutate(club.id) }}
                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowDialog(false); resetForm() }}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Club' : 'New Club'}</h2>
            <div className="space-y-3">
              <input
                placeholder="Club name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              >
                {['academic', 'sports', 'arts', 'music', 'technology', 'language', 'social_service', 'environment', 'other'].map((c) => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input
                placeholder="Meeting schedule (e.g. Every Friday 3pm)"
                value={form.meetingSchedule}
                onChange={(e) => setForm({ ...form, meetingSchedule: e.target.value })}
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => { setShowDialog(false); resetForm() }} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => {
                  if (!form.name.trim()) return
                  if (editing) {
                    updateMut.mutate({ id: editing.id, data: form })
                  } else {
                    createMut.mutate(form)
                  }
                }}
                disabled={!form.name.trim() || createMut.isPending || updateMut.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {(createMut.isPending || updateMut.isPending) ? 'Saving...' : (editing ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AddonGate>
  )
}
