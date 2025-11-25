import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, FileText } from 'lucide-react'

export default function Reports() {
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [reportName, setReportName] = useState('')
  const [reportFormat, setReportFormat] = useState('csv')

  const tables = [
    { id: 'participants', name: 'Participants', description: 'All participant data' },
    { id: 'courses', name: 'Courses', description: 'Course information and analytics' },
    { id: 'payments', name: 'Payments', description: 'Payment transactions' },
    { id: 'licenses', name: 'Licenses', description: 'Professional licenses' },
  ]

  const toggleTable = (tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    )
  }

  const handleGenerate = () => {
    // Generate report logic
    alert(`Generating ${reportFormat.toUpperCase()} report: ${reportName || 'Untitled Report'}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Generator</h1>
        <p className="text-muted-foreground mt-2">Create custom reports from your data</p>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6">
          {/* Step 1: Select Data Source */}
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Data Source</CardTitle>
              <CardDescription>Choose the tables to include in your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tables.map((table) => (
                <div key={table.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={table.id}
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={() => toggleTable(table.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={table.id} className="font-medium cursor-pointer">
                      {table.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">{table.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Step 2: Report Details */}
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Report Details</CardTitle>
              <CardDescription>Configure your report settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="My Custom Report"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={reportFormat} onValueChange={setReportFormat}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel (XLSX)</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleGenerate} disabled={selectedTables.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
              <CardDescription>Your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No saved reports yet</p>
                <p className="text-sm mt-2">Generate a report to see it here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
