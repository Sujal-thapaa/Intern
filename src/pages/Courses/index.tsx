import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Courses() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground">
          Course performance and analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Analytics</CardTitle>
          <CardDescription>
            Course list, popularity charts, and performance metrics will be implemented in Prompt #4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Courses page content will be implemented in Prompt #4
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

