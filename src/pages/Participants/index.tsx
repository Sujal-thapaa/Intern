import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Participants() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          Manage and analyze participant data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Participant Management</CardTitle>
          <CardDescription>
            Searchable table, filters, and charts will be implemented in Prompt #3
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Participant page content will be implemented in Prompt #3
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

