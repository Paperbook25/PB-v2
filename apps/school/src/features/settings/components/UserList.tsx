import { useState } from 'react'
import { Users, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useUsers, useDeleteUser, useToggleUserStatus } from '../hooks/useSettings'
import { UserForm } from './UserForm'
import type { SystemUser } from '../types/settings.types'

const ROLE_LABELS: Record<SystemUser['role'], string> = {
  admin: 'Administrator',
  principal: 'Principal',
  teacher: 'Teacher',
  accountant: 'Accountant',
  librarian: 'Librarian',
  receptionist: 'Receptionist',
}

const ROLE_COLORS: Record<SystemUser['role'], string> = {
  admin: 'bg-red-100 text-red-800',
  principal: 'bg-purple-100 text-purple-800',
  teacher: 'bg-blue-100 text-blue-800',
  accountant: 'bg-green-100 text-green-800',
  librarian: 'bg-yellow-100 text-yellow-800',
  receptionist: 'bg-gray-100 text-gray-800',
}

export function UserList() {
  const { toast } = useToast()
  const { data, isLoading } = useUsers()
  const deleteUser = useDeleteUser()
  const toggleStatus = useToggleUserStatus()

  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleToggleStatus = (user: SystemUser) => {
    toggleStatus.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: user.isActive ? 'User Deactivated' : 'User Activated',
          description: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}.`,
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to toggle user status',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDelete = () => {
    if (!deleteId) return

    deleteUser.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: 'User Deleted',
          description: 'The user has been deleted.',
        })
        setDeleteId(null)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete user',
          variant: 'destructive',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  const users = data?.data || []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              System Users
            </CardTitle>
            <CardDescription>Manage user accounts and permissions</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={ROLE_COLORS[user.role]} variant="secondary">
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(user)}
                          disabled={toggleStatus.isPending || user.role === 'admin'}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(user.id)}
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowForm(false)
            setEditingUser(null)
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
