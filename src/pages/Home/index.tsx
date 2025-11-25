import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useParticipants } from '@/hooks/useParticipants'
import { usePayments } from '@/hooks/usePayments'
import { useCourseLocationData } from '@/hooks/useCourses'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const { data: participants, isLoading: participantsLoading } = useParticipants()
  const { data: payments, isLoading: paymentsLoading } = usePayments()
  const { data: courseLocations, isLoading: coursesLoading } = useCourseLocationData()

  const totalParticipants = participants?.length || 0
  const totalRevenue =
    payments?.reduce((sum, payment) => sum + (payment.Amount || 0), 0) || 0

  const upcomingCourses = courseLocations
    ?.filter((course) => {
      const beginDate = new Date(course['Begin Date'])
      return beginDate >= new Date()
    })
    .sort((a, b) => {
      const dateA = new Date(a['Begin Date'])
      const dateB = new Date(b['Begin Date'])
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 5) || []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of DAS Company metrics and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            {participantsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{totalParticipants.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{upcomingCourses.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{courseLocations?.length || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Courses</CardTitle>
          <CardDescription>Next 5 scheduled course instances</CardDescription>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : upcomingCourses.length > 0 ? (
            <div className="space-y-4">
              {upcomingCourses.map((course) => (
                <div
                  key={course['Location Date ID']}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.Location}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(course['Begin Date']).toLocaleDateString()} -{' '}
                      {new Date(course['End Date']).toLocaleDateString()}
                    </p>
                    {course.Instructor && (
                      <p className="text-sm text-muted-foreground">
                        Instructor: {course.Instructor}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming courses scheduled</p>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for charts - will be filled in Prompt #2 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations Last 30 Days</CardTitle>
            <CardDescription>Line chart placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be implemented in Prompt #2
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Per Month</CardTitle>
            <CardDescription>Bar chart placeholder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Chart will be implemented in Prompt #2
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participants Per State</CardTitle>
          <CardDescription>Heatmap placeholder</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Heatmap will be implemented in Prompt #2
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

