import { YearOverYearEnrollmentChart } from '@/components/comparison/YearOverYearEnrollmentChart'
import { CourseOfferingComparisonChart } from '@/components/comparison/CourseOfferingComparisonChart'
import { RevenueComparisonChart } from '@/components/comparison/RevenueComparisonChart'

export default function Comparison() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <nav className="text-sm text-muted-foreground mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Comparison</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Comparison</h1>
        <p className="text-muted-foreground mt-2">
          Compare course enrollment trends, course offerings, and revenue across different years
        </p>
      </div>

      {/* Year-over-Year Enrollment Chart */}
      <YearOverYearEnrollmentChart />

      {/* Year-over-Year Course Offering Chart */}
      <CourseOfferingComparisonChart />

      {/* Year-over-Year Revenue Comparison Chart */}
      <RevenueComparisonChart />
    </div>
  )
}

