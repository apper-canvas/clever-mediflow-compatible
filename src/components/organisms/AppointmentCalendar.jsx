import { useState, useEffect } from "react"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday } from "date-fns"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import StatusIndicator from "@/components/molecules/StatusIndicator"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { appointmentService } from "@/services/api/appointmentService"
import { patientService } from "@/services/api/patientService"
import { cn } from "@/utils/cn"

const AppointmentCalendar = ({ onAddAppointment, onEditAppointment }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll()
      ])
      setAppointments(appointmentsData)
      setPatients(patientsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

const getPatientName = (patientId) => {
    const patient = patients.find(p => p.Id === parseInt(patientId))
    return patient ? (patient.Name_c || patient.name) : "Unknown Patient"
  }

  const getAppointmentsForDay = (day) => {
return appointments.filter(appointment => 
      isSameDay(new Date(appointment.DateTime_c || appointment.dateTime), day)
    )
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  const renderCalendarDays = () => {
    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const dayAppointments = getAppointmentsForDay(currentDay)
      const isCurrentMonth = isSameMonth(currentDay, monthStart)
      const isDayToday = isToday(currentDay)

      days.push(
        <div
          key={currentDay}
          className={cn(
            "min-h-[120px] border border-slate-200 p-2 bg-white transition-colors",
            !isCurrentMonth && "bg-slate-50 text-slate-400",
            isDayToday && "bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200"
          )}
        >
          <div className={cn(
            "text-sm font-medium mb-2",
            isDayToday && "text-primary-600"
          )}>
            {format(currentDay, "d")}
            {isDayToday && (
              <span className="ml-1 text-xs bg-primary-600 text-white px-1 rounded">Today</span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment.Id}
                onClick={() => onEditAppointment(appointment)}
                className="cursor-pointer p-1.5 rounded text-xs bg-gradient-to-r from-primary-100 to-secondary-100 border border-primary-200 hover:shadow-md transition-all duration-200"
              >
<div className="font-medium text-primary-800 truncate">
                  {format(new Date(appointment.DateTime_c || appointment.dateTime), "HH:mm")} - {getPatientName(appointment.PatientId_c || appointment.patientId)}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-primary-600 truncate">{appointment.Type_c || appointment.type}</span>
                  <StatusIndicator status={appointment.Status_c || appointment.status} showIcon={false} />
                </div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-slate-500 font-medium">
                +{dayAppointments.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
      day = addDays(day, 1)
    }

    return days
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={previousMonth} className="p-2">
              <ApperIcon name="ChevronLeft" className="w-5 h-5" />
            </Button>
            <h2 className="text-2xl font-bold text-slate-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button variant="ghost" onClick={nextMonth} className="p-2">
              <ApperIcon name="ChevronRight" className="w-5 h-5" />
            </Button>
          </div>
          
          <Button onClick={onAddAppointment} className="shadow-lg">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0 border border-slate-200 rounded-lg overflow-hidden">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 text-center">
              <span className="text-sm font-semibold text-slate-700">{day}</span>
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="Calendar" className="w-5 h-5 mr-2" />
          Today's Appointments
        </h3>
        
        {appointments.filter(apt => isSameDay(new Date(apt.dateTime), new Date())).length === 0 ? (
          <p className="text-slate-500 py-4">No appointments scheduled for today</p>
        ) : (
          <div className="space-y-3">
{appointments
              .filter(apt => isSameDay(new Date(apt.DateTime_c || apt.dateTime), new Date()))
              .sort((a, b) => new Date(a.DateTime_c || a.dateTime) - new Date(b.DateTime_c || b.dateTime))
              .map((appointment) => (
                <div
                  key={appointment.Id}
                  onClick={() => onEditAppointment(appointment)}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-200 cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {getPatientName(appointment.PatientId_c || appointment.patientId)}
                      </p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(appointment.DateTime_c || appointment.dateTime), "h:mm a")} - {appointment.Type_c || appointment.type}
                      </p>
                    </div>
                  </div>
                  <StatusIndicator status={appointment.Status_c || appointment.status} />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentCalendar