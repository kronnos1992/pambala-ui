'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  Plus, ChevronDown, ChevronUp, Pencil, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import {
  fetchRoles,
  fetchResponsibilities,
  createRole,
  updateRole,
  deleteRole,
  setRoleResponsibilities,
  createResponsibility,
  updateResponsibility,
  deleteResponsibility,
  getApiErrorMessage,
  type ApiRole,
  type ApiResponsibility,
} from '@/lib/api-helpers'

export default function AdminRolesPage() {
  const t = useTranslations('adminRoles')
  const tc = useTranslations('common')

  const [roles, setRoles] = React.useState<ApiRole[]>([])
  const [responsibilities, setResponsibilities] = React.useState<ApiResponsibility[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [permSaving, setPermSaving] = React.useState(false)
  const [expanded, setExpanded] = React.useState<string | null>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [roleEditKey, setRoleEditKey] = React.useState<string | null>(null)
  const [roleForm, setRoleForm] = React.useState({ key: '', name: '', description: '' })
  const [roleFormErrors, setRoleFormErrors] = React.useState<Record<string, string>>({})

  const [showPermForm, setShowPermForm] = React.useState(false)
  const [permEditKey, setPermEditKey] = React.useState<string | null>(null)
  const [permForm, setPermForm] = React.useState({ key: '', name: '', description: '' })
  const [permFormErrors, setPermFormErrors] = React.useState<Record<string, string>>({})

  const load = React.useCallback(() => {
    Promise.all([fetchRoles(), fetchResponsibilities()])
      .then(([r, c]) => {
        setRoles(r)
        setResponsibilities(c)
      })
      .catch(() => toast(t('loadError'), 'error'))
      .finally(() => setLoading(false))
  }, [t])

  React.useEffect(() => {
    load()
  }, [load])

  const openNewRole = () => {
    setRoleForm({ key: '', name: '', description: '' })
    setRoleFormErrors({})
    setRoleEditKey(null)
    setShowForm(true)
  }

  const openEditRole = (role: ApiRole) => {
    setRoleForm({ key: role.key, name: role.name, description: role.description || '' })
    setRoleFormErrors({})
    setRoleEditKey(role.key)
    setShowForm(true)
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!roleForm.key.trim()) errs.key = t('keyRequired')
    if (!roleForm.name.trim()) errs.name = t('nameRequired')
    setRoleFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      if (roleEditKey) {
        await updateRole(roleEditKey, { name: roleForm.name, description: roleForm.description || null })
        toast(t('updateSuccess'), 'success')
      } else {
        await createRole({ key: roleForm.key.trim(), name: roleForm.name, description: roleForm.description || undefined })
        toast(t('createSuccess'), 'success')
      }
      setShowForm(false)
      load()
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (role: ApiRole) => {
    if (!confirm(t('deleteRoleConfirm', { key: role.key }))) return
    try {
      await deleteRole(role.key)
      toast(t('deleteSuccess'), 'success')
      if (expanded === role.key) setExpanded(null)
      load()
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    }
  }

  const handleToggleResponsibility = async (roleKey: string, respKey: string) => {
    if (permSaving) return
    const role = roles.find((r) => r.key === roleKey)
    if (!role) return
    const current = (role.responsibilities || []).map((x) => x.key)
    const next = current.includes(respKey)
      ? current.filter((k) => k !== respKey)
      : [...current, respKey]

    setPermSaving(true)
    try {
      await setRoleResponsibilities(roleKey, next)
      toast(t('permissionsSaved'), 'success')
      setRoles((prev) =>
        prev.map((r) =>
          r.key === roleKey
            ? { ...r, responsibilities: responsibilities.filter((x) => next.includes(x.key)).map((x) => ({ key: x.key, name: x.name })) }
            : r
        )
      )
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    } finally {
      setPermSaving(false)
    }
  }

  const openNewPermission = () => {
    setPermForm({ key: '', name: '', description: '' })
    setPermFormErrors({})
    setPermEditKey(null)
    setShowPermForm(true)
  }

  const openEditPermission = (resp: ApiResponsibility) => {
    setPermForm({ key: resp.key, name: resp.name, description: resp.description || '' })
    setPermFormErrors({})
    setPermEditKey(resp.key)
    setShowPermForm(true)
  }

  const handleSavePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!permForm.key.trim()) errs.key = t('keyRequired')
    if (!permForm.name.trim()) errs.name = t('nameRequired')
    setPermFormErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSaving(true)
    try {
      if (permEditKey) {
        await updateResponsibility(permEditKey, { name: permForm.name, description: permForm.description || null })
        toast(t('permUpdateSuccess'), 'success')
      } else {
        await createResponsibility({ key: permForm.key.trim(), name: permForm.name, description: permForm.description || undefined })
        toast(t('permCreateSuccess'), 'success')
      }
      setShowPermForm(false)
      load()
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePermission = async (resp: ApiResponsibility) => {
    if (!confirm(t('deletePermConfirm', { key: resp.key }))) return
    try {
      await deleteResponsibility(resp.key)
      toast(t('permDeleteSuccess'), 'success')
      load()
    } catch (err) {
      toast(getApiErrorMessage(err) || t('saveError'), 'error')
    }
  }

  const rolePermKeys = (role: ApiRole) => new Set((role.responsibilities || []).map((x) => x.key))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
        </div>
      </div>

      {/* Roles */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('rolesSection')}</h2>
          <Button size="sm" onClick={openNewRole}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newRole')}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSaveRole} className="border-b border-gray-100 dark:border-gray-700 p-6 space-y-4 bg-gray-50/50 dark:bg-gray-800/30">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{roleEditKey ? t('editRole') : t('newRole')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('roleKey')}
                placeholder="support"
                value={roleForm.key}
                onChange={(e) => setRoleForm((p) => ({ ...p, key: e.target.value }))}
                error={roleFormErrors.key}
                disabled={!!roleEditKey}
              />
              <Input
                label={t('roleName')}
                placeholder="Suporte"
                value={roleForm.name}
                onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))}
                error={roleFormErrors.name}
              />
            </div>
            <Input
              label={t('roleDescription')}
              placeholder="Descrição da role"
              value={roleForm.description}
              onChange={(e) => setRoleForm((p) => ({ ...p, description: e.target.value }))}
            />
            <p className="text-xs text-gray-500">{t('roleKeyHint')}</p>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? tc('saving') : t('saveRole')}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setRoleEditKey(null) }}>{tc('cancel')}</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">{t('roleName')}</th>
                  <th className="px-6 py-3">{t('roleKey')}</th>
                  <th className="px-6 py-3">{t('users')}</th>
                  <th className="px-6 py-3">{t('permissions')}</th>
                  <th className="px-6 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {roles.map((role) => {
                  const perms = role.responsibilities || []
                  const isOpen = expanded === role.key
                  return (
                    <React.Fragment key={role.key}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpanded(isOpen ? null : role.key)}
                              className="text-gray-400 hover:text-emerald-600 transition-colors"
                              aria-label={isOpen ? 'collapse' : 'expand'}
                            >
                              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                            {role.isSystem && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                                {t('system')}
                              </span>
                            )}
                          </div>
                          {role.description && <p className="mt-1 text-xs text-gray-500">{role.description}</p>}
                        </td>
                        <td className="px-6 py-3">
                          <code className="text-xs font-mono text-gray-600 dark:text-gray-300">{role.key}</code>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{role.users ?? 0}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {perms.slice(0, 3).map((p) => (
                              <span key={p.key} className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                {p.name}
                              </span>
                            ))}
                            {perms.length > 3 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                +{perms.length - 3}
                              </span>
                            )}
                            {perms.length === 0 && <span className="text-xs text-gray-400">{t('none')}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditRole(role)}
                              className="rounded-md p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors dark:hover:bg-emerald-900/30"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRole(role)}
                              className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/30"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50/70 dark:bg-gray-800/40">
                            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">{t('permissions')}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {responsibilities.map((resp) => {
                                const checked = rolePermKeys(role).has(resp.key)
                                return (
                                  <label
                                    key={resp.key}
                                    className={cn(
                                      'flex items-start gap-2 rounded-lg border p-2.5 cursor-pointer transition-colors',
                                      checked
                                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      disabled={permSaving}
                                      onChange={() => handleToggleResponsibility(role.key, resp.key)}
                                      className="mt-0.5 accent-emerald-600"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">{resp.name}</p>
                                      <code className="text-xs text-gray-500 dark:text-gray-400">{resp.key}</code>
                                    </div>
                                  </label>
                                )
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {roles.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('emptyRoles')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Responsabilidades */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('permissionsSection')}</h2>
          <Button size="sm" onClick={openNewPermission}>
            <Plus className="h-4 w-4 mr-2" />
            {t('newResponsibility')}
          </Button>
        </div>

        {showPermForm && (
          <form onSubmit={handleSavePermission} className="border-b border-gray-100 dark:border-gray-700 p-6 space-y-4 bg-gray-50/50 dark:bg-gray-800/30">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {permEditKey ? t('editResponsibility') : t('newResponsibility')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('permissionKey')}
                placeholder="products.manage"
                value={permForm.key}
                onChange={(e) => setPermForm((p) => ({ ...p, key: e.target.value }))}
                error={permFormErrors.key}
                disabled={!!permEditKey}
              />
              <Input
                label={t('permissionName')}
                placeholder="Gerir produtos"
                value={permForm.name}
                onChange={(e) => setPermForm((p) => ({ ...p, name: e.target.value }))}
                error={permFormErrors.name}
              />
            </div>
            <Input
              label={t('permissionDescription')}
              placeholder="Descrição da responsabilidade"
              value={permForm.description}
              onChange={(e) => setPermForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? tc('saving') : t('saveResponsibility')}</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowPermForm(false); setPermEditKey(null) }}>{tc('cancel')}</Button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-3">{t('permissionName')}</th>
                <th className="px-6 py-3">{t('permissionKey')}</th>
                <th className="px-6 py-3">{t('permissionDescription')}</th>
                <th className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {responsibilities.map((resp) => (
                <tr key={resp.key} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{resp.name}</span>
                      {resp.isSystem && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                          {t('system')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300">{resp.key}</code>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-300">{resp.description || '-'}</td>
                  <td className="px-6 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditPermission(resp)}
                        className="rounded-md p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors dark:hover:bg-emerald-900/30"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePermission(resp)}
                        disabled={resp.isSystem}
                        className="rounded-md p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors dark:hover:bg-red-900/30 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {responsibilities.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">{t('emptyPermissions')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}