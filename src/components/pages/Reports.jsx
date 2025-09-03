import { useState, useEffect } from "react"
import StatsCard from "@/components/molecules/StatsCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperChart from "react-apexcharts"
import ApperIcon from "@/components/ApperIcon"
import { patientService } from "@/services/api/patientService"
import { appointmentService } from "@/services/api/appointmentService"
import { bedService } from "@/services/api/bedService"
import { format, subDays, startOfDay, endOfDay } from "date-fns"

const Reports = () => {
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    beds: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [dateRange, setDateRange] = useState(7) // Last 7 days

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError("")
      const [patients, appointments, beds] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        bedService.getAll()
      ])
      setData({ patients, appointments, beds })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReportData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadReportData} />

// Calculate metrics
  const totalPatients = data.patients.length
  const totalAppointments = data.appointments.length
  const completedAppointments = data.appointments.filter(apt => (apt.Status_c || apt.status) === "completed").length
  const cancelledAppointments = data.appointments.filter(apt => (apt.Status_c || apt.status) === "cancelled").length
  
  const totalBeds = data.beds.length
  const occupiedBeds = data.beds.filter(bed => (bed.Status_c || bed.status) === "occupied").length
  const availableBeds = data.beds.filter(bed => (bed.Status_c || bed.status) === "available").length
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  // Chart data for appointments over time
  const appointmentChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false }
    },
    colors: ['#2563EB', '#10B981', '#EF4444'],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    xaxis: {
      categories: Array.from({ length: dateRange }, (_, i) => 
        format(subDays(new Date(), dateRange - 1 - i), "MMM dd")
      )
    },
    legend: {
      position: 'top'
    }
  }

const appointmentChartSeries = [
    {
      name: 'Scheduled',
      data: Array.from({ length: dateRange }, (_, i) => {
        const date = subDays(new Date(), dateRange - 1 - i)
        return data.appointments.filter(apt => 
          new Date(apt.DateTime_c || apt.dateTime) >= startOfDay(date) && 
          new Date(apt.DateTime_c || apt.dateTime) <= endOfDay(date)
        ).length
      })
    },
    {
      name: 'Completed', 
      data: Array.from({ length: dateRange }, (_, i) => {
        const date = subDays(new Date(), dateRange - 1 - i)
        return data.appointments.filter(apt => 
          (apt.Status_c || apt.status) === "completed" &&
          new Date(apt.DateTime_c || apt.dateTime) >= startOfDay(date) && 
          new Date(apt.DateTime_c || apt.dateTime) <= endOfDay(date)
        ).length
      })
    },
    {
      name: 'Cancelled',
      data: Array.from({ length: dateRange }, (_, i) => {
        const date = subDays(new Date(), dateRange - 1 - i)
        return data.appointments.filter(apt => 
          (apt.Status_c || apt.status) === "cancelled" &&
          new Date(apt.DateTime_c || apt.dateTime) >= startOfDay(date) && 
          new Date(apt.DateTime_c || apt.dateTime) <= endOfDay(date)
        ).length
      })
    }
  ]

  // Bed occupancy pie chart
  const bedChartOptions = {
    chart: {
      type: 'pie',
      toolbar: { show: false }
    },
    colors: ['#10B981', '#EF4444', '#F59E0B', '#6B7280'],
    labels: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    legend: {
      position: 'bottom'
    }
  }

  const bedChartSeries = [
data.beds.filter(bed => (bed.Status_c || bed.status) === "available").length,
    data.beds.filter(bed => (bed.Status_c || bed.status) === "occupied").length,
    data.beds.filter(bed => (bed.Status_c || bed.status) === "cleaning").length,
    data.beds.filter(bed => (bed.Status_c || bed.status) === "maintenance").length
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-slate-600 mt-1">Hospital performance metrics and insights</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-700">Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Patients"
          value={totalPatients}
          icon="Users"
          gradient="medical-gradient"
        />
        <StatsCard
          title="Total Appointments"
          value={totalAppointments}
          change={`${completedAppointments} completed`}
          changeType="positive"
          icon="Calendar"
          gradient="bg-gradient-to-r from-secondary-500 to-secondary-600"
        />
        <StatsCard
          title="Bed Occupancy"
          value={`${occupancyRate}%`}
          change={`${occupiedBeds}/${totalBeds} beds`}
          changeType="neutral"
          icon="Bed"
          gradient="bg-gradient-to-r from-rose-500 to-rose-600"
        />
        <StatsCard
          title="Available Beds"
          value={availableBeds}
          icon="CheckCircle"
          gradient="bg-gradient-to-r from-emerald-500 to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Trends */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 mr-2 text-primary-600" />
              Appointment Trends
            </h3>
            <div className="text-sm text-slate-600">
              Last {dateRange} days
            </div>
          </div>
          
          <ApperChart
            options={appointmentChartOptions}
            series={appointmentChartSeries}
            type="line"
            width="100%"
            height={300}
          />
        </div>

        {/* Bed Status Distribution */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <ApperIcon name="PieChart" className="w-6 h-6 mr-2 text-primary-600" />
              Bed Status Distribution
            </h3>
            <div className="text-sm text-slate-600">
              Current status
            </div>
          </div>
          
          {totalBeds === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ApperIcon name="Bed" className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No beds configured</p>
            </div>
          ) : (
            <ApperChart
              options={bedChartOptions}
              series={bedChartSeries}
              type="pie"
              width="100%"
              height={300}
            />
          )}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <ApperIcon name="BarChart3" className="w-6 h-6 mr-2 text-primary-600" />
          Performance Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-200">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-600">Appointment Completion Rate</div>
            <div className="text-xs text-slate-500 mt-1">
              {completedAppointments} of {totalAppointments} completed
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {occupancyRate}%
            </div>
            <div className="text-sm text-slate-600">Average Bed Occupancy</div>
            <div className="text-xs text-slate-500 mt-1">
              {occupiedBeds} of {totalBeds} beds occupied
            </div>
          </div>
          
          <div className="text-center p-6 bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg border border-rose-200">
            <div className="text-3xl font-bold text-rose-600 mb-2">
              {totalAppointments > 0 ? Math.round((cancelledAppointments / totalAppointments) * 100) : 0}%
            </div>
            <div className="text-sm text-slate-600">Cancellation Rate</div>
            <div className="text-xs text-slate-500 mt-1">
              {cancelledAppointments} appointments cancelled
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports