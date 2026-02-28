import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Filter, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { GenerateReportDialog } from '../components/GenerateReportDialog'
import { useReportTemplates, useReportDefinitions } from '../hooks/useReports'
import {
  REPORT_CATEGORIES,
  type ReportTemplate,
  type ReportDefinition,
  type ReportCategory,
} from '../types/reports.types'

export function NewReportPage() {
  const navigate = useNavigate()
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [selectedDefinition, setSelectedDefinition] = useState<ReportDefinition | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'templates' | 'definitions'>('templates')

  const { data: templatesData, isLoading: templatesLoading } = useReportTemplates(categoryFilter)
  const { data: definitionsData, isLoading: definitionsLoading } = useReportDefinitions({
    category: categoryFilter,
    search: searchQuery,
  })

  const templates = templatesData?.data || []
  const definitions = definitionsData?.data || []

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template)
    setSelectedDefinition(null)
    setGenerateDialogOpen(true)
  }

  const handleSelectDefinition = (definition: ReportDefinition) => {
    setSelectedDefinition(definition)
    setSelectedTemplate(null)
    setGenerateDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Create New Report"
        description="Select a template or definition to generate a report"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'New Report' },
        ]}
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'templates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </Button>
        <Button
          variant={activeTab === 'definitions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('definitions')}
        >
          Report Definitions
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as ReportCategory | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {REPORT_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No templates found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="capitalize shrink-0">
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="secondary">
                      Select Template
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Definitions Tab */}
      {activeTab === 'definitions' && (
        <>
          {definitionsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : definitions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No report definitions found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {definitions.map((definition) => (
                <Card
                  key={definition.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleSelectDefinition(definition)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{definition.name}</CardTitle>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="capitalize shrink-0">
                          {definition.category}
                        </Badge>
                        {definition.isSystem && (
                          <Badge variant="secondary" className="shrink-0">
                            System
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {definition.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{definition.fields.length} fields</span>
                      {definition.chartType && (
                        <span className="capitalize">{definition.chartType} chart</span>
                      )}
                    </div>
                    <Button className="w-full" variant="secondary">
                      Generate Report
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <GenerateReportDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        template={selectedTemplate}
        definition={selectedDefinition}
      />
    </div>
  )
}
