import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, IndianRupee, AlertTriangle, Wrench, FileText, Users } from 'lucide-react'
import { useInventoryStats, useStock, usePurchaseOrders } from '../hooks/useInventory'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { PO_STATUS_LABELS } from '../types/inventory.types'
import { statusColors } from '@/lib/design-tokens'

export function InventoryPage() {
  const { data: statsResult } = useInventoryStats()
  const { data: lowStockResult } = useStock({ lowStock: true })
  const { data: poResult } = usePurchaseOrders()

  const stats = statsResult?.data
  const lowStockItems = lowStockResult?.data || []
  const pendingPOs = poResult?.data?.filter(
    (po) => po.status === 'pending_approval' || po.status === 'draft'
  ) || []

  const statCards = [
    {
      title: 'Total Assets',
      value: stats?.totalAssets || 0,
      icon: Package,
      description: formatCurrency(stats?.totalAssetValue || 0),
    },
    {
      title: 'Depreciation',
      value: formatCurrency(stats?.totalDepreciation || 0),
      icon: IndianRupee,
      description: 'Total depreciated value',
    },
    {
      title: 'Low Stock',
      value: stats?.lowStockItems || 0,
      icon: AlertTriangle,
      description: 'Items below reorder level',
      alert: (stats?.lowStockItems || 0) > 0,
    },
    {
      title: 'In Maintenance',
      value: stats?.assetsInMaintenance || 0,
      icon: Wrench,
      description: 'Assets under repair',
    },
    {
      title: 'Pending POs',
      value: stats?.pendingPOs || 0,
      icon: FileText,
      description: formatCurrency(stats?.pendingPOValue || 0),
    },
    {
      title: 'Active Vendors',
      value: stats?.activeVendors || 0,
      icon: Users,
      description: 'Registered vendors',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Manage assets, stock, and purchase orders"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Inventory' }]}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card
              key={stat.title}
              style={stat.alert ? { borderColor: statusColors.warning } : {}}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon
                  className="h-4 w-4"
                  style={{ color: stat.alert ? statusColors.warning : undefined }}
                />
              </CardHeader>
              <CardContent>
                <div
                  className="text-2xl font-bold"
                  style={stat.alert ? { color: statusColors.warning } : {}}
                >
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
              ) : (
                <div className="space-y-4">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku} • {item.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium" style={{ color: statusColors.error }}>
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Min: {item.minimumStock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Purchase Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Purchase Orders</CardTitle>
              <CardDescription>Orders awaiting approval or action</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPOs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending purchase orders</p>
              ) : (
                <div className="space-y-4">
                  {pendingPOs.slice(0, 5).map((po) => (
                    <div
                      key={po.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{po.poNumber}</p>
                        <p className="text-sm text-muted-foreground">{po.vendorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(po.totalAmount)}</p>
                        <Badge
                          variant={po.status === 'pending_approval' ? 'secondary' : 'outline'}
                        >
                          {PO_STATUS_LABELS[po.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
