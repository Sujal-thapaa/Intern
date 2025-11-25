import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CourseLocationDate } from '@/types/course.types'
import { formatDate } from '@/utils/dateFormatter'
import { Calendar, MapPin, User, Clock } from 'lucide-react'

interface CourseScheduleProps {
  locations: CourseLocationDate[]
  isLoading: boolean
}

export function CourseSchedule({ locations, isLoading }: CourseScheduleProps) {
  const [showSchedule, setShowSchedule] = useState(false)

  if (!showSchedule) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Schedule</CardTitle>
            <Button onClick={() => setShowSchedule(true)} variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Show Schedule
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // Filter upcoming courses
  const upcomingCourses = locations
    .filter((loc) => {
      if (!loc['Begin Date']) return false
      const beginDate = new Date(loc['Begin Date'])
      return beginDate >= new Date()
    })
    .sort((a, b) => {
      const dateA = new Date(a['Begin Date'] || '')
      const dateB = new Date(b['Begin Date'] || '')
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 20) // Show top 20

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Schedule</CardTitle>
          <Button onClick={() => setShowSchedule(false)} variant="outline" size="sm">
            Hide Schedule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : upcomingCourses.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No upcoming courses scheduled</p>
        ) : (
          <div className="space-y-4">
            {upcomingCourses.map((location) => (
              <div
                key={location['Location Date ID']}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{location.Location || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(location['Begin Date'])} - {formatDate(location['End Date'])}
                      </div>
                      {location.Instructor && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {location.Instructor}
                        </div>
                      )}
                      {location['Begin Time'] && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {location['Begin Time']}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {location['Home Study'] === -1 && (
                      <Badge variant="secondary">Home Study</Badge>
                    )}
                    <Badge variant="outline">Course ID: {location['Course ID']}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

