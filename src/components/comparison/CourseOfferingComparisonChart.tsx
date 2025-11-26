import { useMemo, useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCoursesOfferedByYear,
  useAvailableCourseYears,
} from '@/hooks/useCoursesOfferedByYear'

export interface YearOverYearCourseOfferingData {
  month: string
  year1: number
  year2: number
}

export function CourseOfferingComparisonChart() {
  const [year1, setYear1] = useState<number | null>(null)
  const [year2, setYear2] = useState<number | null>(null)

  // Fetch available years
  const {
    data: availableYears = [],
    isLoading: isLoadingYears,
  } = useAvailableCourseYears()

  // Fetch course offering data for both years
  const {
    data: year1Data = [],
    isLoading: isLoadingYear1,
  } = useCoursesOfferedByYear(year1)

  const {
    data: year2Data = [],
    isLoading: isLoadingYear2,
  } = useCoursesOfferedByYear(year2)

  // Merge data for chart
  const chartData = useMemo<YearOverYearCourseOfferingData[]>(() => {
    if (!year1Data.length || !year2Data.length) return []

    return year1Data.map((item, index) => ({
      month: item.month,
      year1: item.count,
      year2: year2Data[index]?.count || 0,
    }))
  }, [year1Data, year2Data])

  const isLoading = isLoadingYear1 || isLoadingYear2
  const hasData = chartData.length > 0 && year1 !== null && year2 !== null

  // Set default years (most recent two years)
  useEffect(() => {
    if (availableYears.length >= 2 && !year1 && !year2) {
      setYear1(availableYears[0])
      setYear2(availableYears[1])
    } else if (availableYears.length === 1 && !year1) {
      setYear1(availableYears[0])
    }
  }, [availableYears, year1, year2])

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Year-over-Year Course Offering Comparison</CardTitle>
        <CardDescription>
          User-selected years | course_location_date.Begin Date
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Year Selection Dropdowns */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Year 1</label>
            {isLoadingYears ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={year1?.toString() || ''}
                onValueChange={(value) => setYear1(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year 1" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Year 2</label>
            {isLoadingYears ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={year2?.toString() || ''}
                onValueChange={(value) => setYear2(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year 2" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : !hasData ? (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            {year1 === null || year2 === null
              ? 'Please select both years to view the comparison'
              : 'No course offering data available for the selected years'}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">{payload[0].payload.month}</p>
                        {payload.map((entry, index) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name === 'year1' ? `Year ${year1}` : `Year ${year2}`}:{' '}
                            {entry.value?.toLocaleString() || 0} courses
                          </p>
                        ))}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'year1') return `Year ${year1}`
                  if (value === 'year2') return `Year ${year2}`
                  return value
                }}
              />
              <Line
                type="monotone"
                dataKey="year1"
                stroke="#FF8042"
                strokeWidth={2}
                name="year1"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="year2"
                stroke="#FFBB28"
                strokeWidth={2}
                name="year2"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

