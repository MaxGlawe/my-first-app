"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { NewUserDialog } from "./NewUserDialog"

export type UserRole = "admin" | "heilpraktiker" | "physiotherapeut" | "patient"
export type UserStatus = "aktiv" | "inaktiv"

export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  status: UserStatus
  last_sign_in_at: string | null
  created_at: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  heilpraktiker: "Heilpraktiker",
  physiotherapeut: "Physiotherapeut",
  patient: "Patient",
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  heilpraktiker: "bg-purple-100 text-purple-800 border-purple-200",
  physiotherapeut: "bg-blue-100 text-blue-800 border-blue-200",
  patient: "bg-green-100 text-green-800 border-green-200",
}

export function UserListTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { supabase } = await import("@/lib/supabase")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      const { data, error: fetchError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)

      if (fetchError) {
        setError("Nutzer konnten nicht geladen werden.")
        return
      }

      setUsers(data ?? [])
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setActionError(null)
    try {
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("user_profiles")
        .update({ role: newRole })
        .eq("id", userId)

      if (error) {
        setActionError("Rolle konnte nicht geändert werden.")
        return
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
    } catch {
      setActionError("Ein unerwarteter Fehler ist aufgetreten.")
    }
  }

  const handleStatusToggle = async (user: UserProfile) => {
    setActionError(null)

    // Prevent deactivating the last admin
    if (user.role === "admin" && user.status === "aktiv") {
      const activeAdmins = users.filter(
        (u) => u.role === "admin" && u.status === "aktiv"
      )
      if (activeAdmins.length <= 1) {
        setActionError(
          "Der letzte aktive Admin kann nicht deaktiviert werden."
        )
        return
      }
    }

    // Prevent self-deactivation
    if (user.id === currentUserId && user.status === "aktiv") {
      setActionError("Du kannst deinen eigenen Account nicht deaktivieren.")
      return
    }

    const newStatus: UserStatus = user.status === "aktiv" ? "inaktiv" : "aktiv"

    try {
      const { supabase } = await import("@/lib/supabase")
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: newStatus })
        .eq("id", user.id)

      if (error) {
        setActionError("Status konnte nicht geändert werden.")
        return
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      )
    } catch {
      setActionError("Ein unerwarteter Fehler ist aufgetreten.")
    }
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Noch nie"
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {users.length} Nutzer insgesamt
        </p>
        <NewUserDialog onUserCreated={fetchUsers} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Letzter Login</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Keine Nutzer gefunden.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className={user.status === "inaktiv" ? "opacity-60" : ""}>
                  <TableCell className="font-medium">
                    {user.first_name} {user.last_name}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">(Du)</span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value as UserRole)
                      }
                      disabled={user.id === currentUserId}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue>
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role]}`}
                          >
                            {ROLE_LABELS[user.role]}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                          <SelectItem key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <Switch
                              id={`status-${user.id}`}
                              checked={user.status === "aktiv"}
                              disabled={user.id === currentUserId}
                              aria-label={`${user.first_name} ${user.last_name} ${user.status === "aktiv" ? "deaktivieren" : "aktivieren"}`}
                            />
                            <Label
                              htmlFor={`status-${user.id}`}
                              className="cursor-pointer text-sm"
                            >
                              {user.status === "aktiv" ? "Aktiv" : "Inaktiv"}
                            </Label>
                          </div>
                        </AlertDialogTrigger>
                        {user.id !== currentUserId && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Nutzer {user.status === "aktiv" ? "deaktivieren" : "aktivieren"}?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.status === "aktiv"
                                  ? `${user.first_name} ${user.last_name} wird keinen Zugang mehr zu Praxis OS haben. Ihre Daten bleiben erhalten.`
                                  : `${user.first_name} ${user.last_name} erhält wieder Zugang zu Praxis OS.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleStatusToggle(user)}
                                className={
                                  user.status === "aktiv"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                                }
                              >
                                {user.status === "aktiv" ? "Deaktivieren" : "Aktivieren"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.last_sign_in_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {formatDate(user.created_at)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
