import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Search, Loader2, AlertCircle } from 'lucide-react'
import { AddonGate } from '@/components/AddonGate'
import { fetchFacilities, fetchFacilitiesDashboard, createFacility } from '../api/facilities.api'
import type { Facility } from '../types/facilities.types'

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-blue-100 text-blue-700',
  under_maintenance: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-600',
}

export function FacilitiesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'classroom',
    building: '',
    floor: '0',
    roomNumber: '',
    capacity: '',
    description: '',
  })

  const dashQ = useQuery({ queryKey: ['facilities', 'dashboard'], queryFn: fetchFacilitiesDashboard })
  const facilitiesQ = useQuery({
    queryKey: ['facilities', 'list', search],
    queryFn: () => fetchFacilities({ search: search || undefined } as any),
  })

  const createMut = useMutation({
    mutationFn: (data: any) => createFacility({ ...data, floor: Number(data.floor), capacity: Number(data.capacity) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] })
      setShowDialog(false)
      setForm({ name: '', code: '', type: 'classroom', building: '', floor: '0', roomNumber: '', capacity: '', description: '' })
    },
  })

  const stats = dashQ.data?.data
  const facilities: Facility[] = facilitiesQ.data?.data || []

  return (
    <AddonGate slug="operations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Facilities</h1>
            <p className="text-sm text-muted-foreground">Manage school facilities, rooms, and bookings</p>
          </div>
          <button
            onClick={() => setShowDialog(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Facility
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Total Facilities', value: stats.totalFacilities },
              { label: 'Available', value: stats.availableFacilities },
              { label: 'Under Maintenance', value: stats.underMaintenance },
              { label: "Today's Bookings", value: stats.todayBookings },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border bg-card p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold mt-1">{s.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <div className="p-4 border-b flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search facilities..."
                className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm"
              />
            </div>
          </div>

          {facilitiesQ.isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : facilitiesQ.isError ? (
            <div className="flex h-48 items-center justify-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" /> Failed to load facilities
            </div>
          ) : facilities.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Building2 className="h-10 w-10 opacity-30" />
              <p className="text-sm">No facilities yet. Add one to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Capacity</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((f) => (
                    <tr key={f.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{f.code}</div>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{f.type?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[f.building, f.roomNumber ? `Room ${f.roomNumber}` : null, f.floor != null ? `Floor ${f.floor}` : null].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">{f.capacity || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[(f as any).status] || 'bg-muted text-muted-foreground'}`}>
                          {((f as any).status || 'available').replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-card rounded-xl shadow-lg w-full max-w-md p-6 border" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Add Facility</h2>
            <div className="space-y-3">
              <input placeholder="Facility name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <input placeholder="Code (e.g. LAB-101) *" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm">
                {['classroom', 'laboratory', 'computer_lab', 'library', 'auditorium', 'sports_court', 'playground', 'cafeteria', 'medical_room', 'conference_room', 'other'].map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Building" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                <input placeholder="Room number" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
                <input type="number" placeholder="Capacity *" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="h-9 w-full rounded-lg border bg-background px-3 text-sm" />
              </div>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[60px]" />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowDialog(false)} className="px-4 py-2 text-sm text-muted-foreground">Cancel</button>
              <button
                onClick={() => { if (!form.name.trim() || !form.code.trim() || !form.capacity) return; createMut.mutate(form) }}
                disabled={!form.name.trim() || !form.code.trim() || !form.capacity || createMut.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {createMut.isPending ? 'Adding...' : 'Add Facility'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AddonGate>
  )
}
