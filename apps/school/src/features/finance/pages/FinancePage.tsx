import { useSearchParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/PageHeader'

// Import all finance components
import { FinanceStats } from '../components/FinanceStats'
import { FeeTypeList } from '../components/FeeTypeList'
import { FeeStructureTable } from '../components/FeeStructureTable'
import { PaymentCollectionForm } from '../components/PaymentCollectionForm'
import { RecentPaymentsTable } from '../components/RecentPaymentsTable'
import { OutstandingDuesTable } from '../components/OutstandingDuesTable'
import { ExpenseList } from '../components/ExpenseList'
import { LedgerTable } from '../components/LedgerTable'
import { BalanceSummaryCard } from '../components/BalanceSummaryCard'
import { CollectionReportView } from '../components/CollectionReportView'
import { DueReportView } from '../components/DueReportView'

export function FinancePage() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'collection'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance"
        description="Manage fees, payments, expenses, and financial reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Finance' }]}
        moduleColor="finance"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} title="Print / Export page">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <FinanceStats />

      {/* Content — switched by sidebar ?tab= param */}
      <div className="space-y-4">
        {activeTab === 'collection' && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PaymentCollectionForm />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
              <RecentPaymentsTable />
            </div>
          </div>
        )}

        {activeTab === 'outstanding' && (
          <OutstandingDuesTable />
        )}

        {activeTab === 'fee-management' && (
          <Tabs defaultValue="types">
            <TabsList variant="secondary" className="flex flex-wrap w-full">
              <TabsTrigger variant="secondary" value="types">Fee Types</TabsTrigger>
              <TabsTrigger variant="secondary" value="structures">Fee Structures</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="types" className="mt-0">
                <FeeTypeList />
              </TabsContent>
              <TabsContent value="structures" className="mt-0">
                <FeeStructureTable />
              </TabsContent>
            </div>
          </Tabs>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList />
        )}

        {activeTab === 'ledger' && (
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <BalanceSummaryCard />
            </div>
            <div className="lg:col-span-3">
              <LedgerTable />
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <Tabs defaultValue="collection-report">
            <TabsList variant="secondary" className="flex flex-wrap w-full">
              <TabsTrigger variant="secondary" value="collection-report">Collection Report</TabsTrigger>
              <TabsTrigger variant="secondary" value="due-report">Outstanding Report</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="collection-report" className="mt-0">
                <CollectionReportView />
              </TabsContent>
              <TabsContent value="due-report" className="mt-0">
                <DueReportView />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </div>
  )
}
