'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Key, 
  Users, 
  DollarSign, 
  Activity, 
  Database,
  Shield,
  Zap,
  Chrome,
  Download
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/auth'
import { toast } from 'sonner'

interface AdminConfig {
  id: string
  openai_api_key: string
  supabase_url: string
  supabase_anon_key: string
  stripe_public_key: string
  stripe_secret_key: string
  extension_version: string
  auto_update_enabled: boolean
  max_users: number
  pricing_tiers: PricingTier[]
}

interface PricingTier {
  id: string
  name: string
  price: number
  features: string[]
  stripe_price_id: string
}

interface UserStats {
  total_users: number
  active_subscriptions: number
  monthly_revenue: number
  extension_installs: number
}

export default function AdminPanel() {
  const { data: session } = useSession()
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadAdminData()
    }
  }, [session])

  const loadAdminData = async () => {
    try {
      // Load admin configuration
      const { data: configData } = await supabase
        .from('admin_config')
        .select('*')
        .single()

      // Load user statistics
      const { data: statsData } = await supabase
        .from('admin_stats')
        .select('*')
        .single()

      setConfig(configData)
      setUserStats(statsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    if (!config) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('admin_config')
        .upsert(config)

      if (error) throw error

      toast.success('Configuration saved successfully')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const generateExtensionPackage = async () => {
    try {
      const response = await fetch('/api/admin/generate-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: config?.extension_version,
          config: {
            supabase_url: config?.supabase_url,
            supabase_anon_key: config?.supabase_anon_key,
          }
        })
      })

      if (!response.ok) throw new Error('Failed to generate extension')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bonsai-extension-v${config?.extension_version}.zip`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Extension package generated successfully')
    } catch (error) {
      console.error('Error generating extension:', error)
      toast.error('Failed to generate extension package')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session?.user || session.user.email !== 'admin@bonsaisat.com') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access the admin panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage Bonsai SAT platform configuration</p>
        </div>
      </div>

      {/* Stats Overview */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.active_subscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${userStats.monthly_revenue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Extension Installs</CardTitle>
              <Chrome className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.extension_installs}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="extension">Extension</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage API keys and external service configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={config?.openai_api_key || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, openai_api_key: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    value={config?.supabase_url || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, supabase_url: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                  <Input
                    id="supabase-key"
                    type="password"
                    value={config?.supabase_anon_key || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, supabase_anon_key: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-public">Stripe Public Key</Label>
                  <Input
                    id="stripe-public"
                    value={config?.stripe_public_key || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, stripe_public_key: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                  <Input
                    id="stripe-secret"
                    type="password"
                    value={config?.stripe_secret_key || ''}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, stripe_secret_key: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-users">Max Users</Label>
                  <Input
                    id="max-users"
                    type="number"
                    value={config?.max_users || 0}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, max_users: parseInt(e.target.value) } : null)}
                  />
                </div>
              </div>

              <Button onClick={saveConfig} disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extension" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="w-5 h-5" />
                Extension Management
              </CardTitle>
              <CardDescription>
                Manage browser extension versions and distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extension-version">Current Version</Label>
                  <Input
                    id="extension-version"
                    value={config?.extension_version || '1.0.0'}
                    onChange={(e) => setConfig(prev => prev ? { ...prev, extension_version: e.target.value } : null)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Update</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically update user extensions
                    </p>
                  </div>
                  <Badge variant={config?.auto_update_enabled ? "default" : "secondary"}>
                    {config?.auto_update_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <Button onClick={generateExtensionPackage} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Extension Package
                </Button>
                
                <Button variant="outline" className="flex-1">
                  <Zap className="w-4 h-4 mr-2" />
                  Deploy to Chrome Store
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Tiers
              </CardTitle>
              <CardDescription>
                Manage subscription plans and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {config?.pricing_tiers?.map((tier, index) => (
                  <div key={tier.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{tier.name}</h3>
                      <Badge>${tier.price}/month</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Stripe Price ID: {tier.stripe_price_id}
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Features:</div>
                      <ul className="text-sm text-muted-foreground">
                        {tier.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage user accounts and subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">User management interface coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}