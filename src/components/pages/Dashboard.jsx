import { useState, useEffect } from "react"
import StatsCard from "@/components/molecules/StatsCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import ApperChart from "react-apexcharts"
import ApperIcon from "@/components/ApperIcon"
import { patientService } from "@/services/api/patientService"
import { appointmentService } from "@/services/api/appointmentService"
import { bedService } from "@/services/api/bedService"
import { format, isToday } from "date-fns"

const Dashboard = () => {
  const [data, setData] = useState({
    patients: [],
    appointments: [],
    beds: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadDashboardData = async () => {
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
    loadDashboardData()
  }, [])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

const todayAppointments = data.appointments.filter(apt => 
    isToday(new Date(apt.DateTime_c || apt.dateTime))
  )

  const occupiedBeds = data.beds.filter(bed => (bed.Status_c || bed.status) === "occupied").length
  const totalBeds = data.beds.length
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0

  const availableBeds = data.beds.filter(bed => (bed.Status_c || bed.status) === "available").length
  // Chart data for bed occupancy trends
  const chartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false }
    },
    colors: ['#10B981', '#EF4444', '#F59E0B', '#6B7280'],
    labels: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    legend: {
      position: 'bottom'
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%'
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }

  const chartSeries = [
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
            Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Hospital overview and today's summary</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">Today</p>
          <p className="text-lg font-semibold text-slate-900">
            {format(new Date(), "MMMM dd, yyyy")}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Patients"
          value={data.patients.length}
          icon="Users"
          gradient="medical-gradient"
        />
        <StatsCard
          title="Today's Appointments"
          value={todayAppointments.length}
          icon="Calendar"
          gradient="bg-gradient-to-r from-secondary-500 to-secondary-600"
        />
        <StatsCard
          title="Occupied Beds"
          value={occupiedBeds}
          change={`${occupancyRate}% occupancy`}
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
        {/* Today's Appointments */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <ApperIcon name="Calendar" className="w-6 h-6 mr-2 text-primary-600" />
              Today's Schedule
            </h3>
            <div className="text-sm text-slate-600">
              {todayAppointments.length} appointments
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ApperIcon name="CalendarX" className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
todayAppointments
                .sort((a, b) => new Date(a.DateTime_c || a.dateTime) - new Date(b.DateTime_c || b.dateTime))
                .map((appointment) => {
                  const patient = data.patients.find(p => p.Id === parseInt(appointment.PatientId_c || appointment.patientId))
                  return (
                    <div
                      key={appointment.Id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {patient?.Name_c || patient?.name || "Unknown Patient"}
                          </p>
                          <p className="text-sm text-slate-600">
                            {format(new Date(appointment.DateTime_c || appointment.dateTime), "h:mm a")} - {appointment.Type_c || appointment.type}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (appointment.Status_c || appointment.status) === "scheduled" 
                          ? "bg-blue-100 text-blue-800" 
                          : (appointment.Status_c || appointment.status) === "completed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}>
                        {appointment.Status_c || appointment.status}
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>

        {/* Bed Occupancy Chart */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center">
              <ApperIcon name="PieChart" className="w-6 h-6 mr-2 text-primary-600" />
              Bed Occupancy
            </h3>
            <div className="text-sm text-slate-600">
              {occupancyRate}% occupied
            </div>
          </div>

          {totalBeds === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ApperIcon name="Bed" className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No beds configured</p>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <ApperChart
                options={chartOptions}
                series={chartSeries}
                type="donut"
                width="100%"
                height={300}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
          <ApperIcon name="Zap" className="w-6 h-6 mr-2 text-primary-600" />
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
            <ApperIcon name="UserPlus" className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Register Patient</p>
          </div>
          
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
            <ApperIcon name="Calendar" className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Schedule Appointment</p>
          </div>
          
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
            <ApperIcon name="Bed" className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">Manage Beds</p>
          </div>
          
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-primary-400 hover:bg-primary-50 transition-colors cursor-pointer">
            <ApperIcon name="FileText" className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-medium text-slate-700">View Reports</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard