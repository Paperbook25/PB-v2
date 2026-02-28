import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Users, CheckCircle, Trophy, Heart, GraduationCap } from 'lucide-react'
import { useBatchStats } from '../hooks/useAlumni'
import { Link } from 'react-router-dom'
import { BatchGraduationDialog } from '../components/BatchGraduationDialog'

export function BatchesPage() {
  const { data: batchStatsResult, isLoading } = useBatchStats()
  const [graduationDialogOpen, setGraduationDialogOpen] = useState(false)

  const batchStats = batchStatsResult?.data || []

  type BatchStatItem = typeof batchStats extends (infer U)[] ? U : never

  return (
    <div>
      <PageHeader
        title="Batches"
        description="View alumni by graduation year"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Alumni', href: '/alumni' },
          { label: 'Batches' },
        ]}
        actions={
          <Button onClick={() => setGraduationDialogOpen(true)}>
            <GraduationCap className="h-4 w-4 mr-2" />
            Graduate Batch
          </Button>
        }
      />

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Loading batches...</div>
        ) : batchStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No batch data available.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {batchStats.map((batch: BatchStatItem) => {
              const verificationRate =
                batch.totalAlumni > 0
                  ? Math.round((batch.verifiedAlumni / batch.totalAlumni) * 100)
                  : 0

              return (
                <Card key={batch.batch} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Batch of {batch.batch}</CardTitle>
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {batch.totalAlumni}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Verification Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Verification Rate</span>
                        <span className="font-medium">{verificationRate}%</span>
                      </div>
                      <Progress value={verificationRate} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-medium">{batch.totalAlumni}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Verified</p>
                          <p className="font-medium">{batch.verifiedAlumni}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Trophy className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Achievements</p>
                          <p className="font-medium">{batch.achievements}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-pink-100 rounded-lg">
                          <Heart className="h-4 w-4 text-pink-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contributions</p>
                          <p className="font-medium">{batch.contributions}</p>
                        </div>
                      </div>
                    </div>

                    {/* View Link */}
                    <Link
                      to={`/alumni?batch=${batch.batch}`}
                      className="block text-center text-sm text-primary hover:underline pt-2"
                    >
                      View all alumni from this batch →
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BatchGraduationDialog
        open={graduationDialogOpen}
        onOpenChange={setGraduationDialogOpen}
      />
    </div>
  )
}
