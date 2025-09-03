import { useState, useEffect } from "react"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import TextArea from "@/components/atoms/TextArea"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import { appointmentService } from "@/services/api/appointmentService"
import { patientService } from "@/services/api/patientService"
import { toast } from "react-toastify"
import { format } from "date-fns"

const AppointmentForm = ({ appointment, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    patientId: appointment?.PatientId_c || appointment?.patientId || "",
    doctorId: appointment?.DoctorId_c || appointment?.doctorId || "1",
    date: appointment ? format(new Date(appointment.DateTime_c || appointment.dateTime), "yyyy-MM-dd") : "",
    time: appointment ? format(new Date(appointment.DateTime_c || appointment.dateTime), "HH:mm") : "",
    duration: appointment?.Duration_c || appointment?.duration || 30,
    type: appointment?.Type_c || appointment?.type || "",
    status: appointment?.Status_c || appointment?.status || "scheduled",
    notes: appointment?.Notes_c || appointment?.notes || ""
  })
  
  const [patients, setPatients] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingPatients, setLoadingPatients] = useState(true)

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoadingPatients(true)
      const patientsData = await patientService.getAll()
      setPatients(patientsData)
    } catch (error) {
      toast.error("Failed to load patients")
    } finally {
      setLoadingPatients(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.patientId) newErrors.patientId = "Patient is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.type) newErrors.type = "Appointment type is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const appointmentData = {
        ...formData,
        dateTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctorId),
        duration: parseInt(formData.duration)
      }

      let savedAppointment
      if (appointment?.Id) {
        savedAppointment = await appointmentService.update(appointment.Id, appointmentData)
        toast.success("Appointment updated successfully")
      } else {
        savedAppointment = await appointmentService.create(appointmentData)
        toast.success("Appointment scheduled successfully")
      }
      
      onSave(savedAppointment)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const appointmentTypes = [
    "Consultation",
    "Follow-up",
    "Check-up",
    "Procedure",
    "Surgery",
    "Emergency",
    "Vaccination",
    "Lab Test"
  ]

  const doctors = [
    { Id: 1, name: "Dr. Sarah Wilson" },
    { Id: 2, name: "Dr. Michael Johnson" },
    { Id: 3, name: "Dr. Emily Davis" },
    { Id: 4, name: "Dr. Robert Brown" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="Calendar" className="w-5 h-5 mr-2" />
          Appointment Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Patient" required error={errors.patientId}>
            <Select
              value={formData.patientId}
              onChange={(e) => handleChange("patientId", e.target.value)}
              error={errors.patientId}
              disabled={loadingPatients}
            >
              <option value="">Select patient</option>
{patients.map(patient => (
                <option key={patient.Id} value={patient.Id}>{patient.Name_c || patient.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Doctor" required>
            <Select
              value={formData.doctorId}
              onChange={(e) => handleChange("doctorId", e.target.value)}
            >
              {doctors.map(doctor => (
                <option key={doctor.Id} value={doctor.Id}>{doctor.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Date" required error={errors.date}>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
            />
          </FormField>

          <FormField label="Time" required error={errors.time}>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange("time", e.target.value)}
              error={errors.time}
            />
          </FormField>

          <FormField label="Appointment Type" required error={errors.type}>
            <Select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              error={errors.type}
            >
              <option value="">Select type</option>
              {appointmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Duration (minutes)">
            <Select
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </Select>
          </FormField>
        </div>

        {appointment && (
          <div className="mt-4">
            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </Select>
            </FormField>
          </div>
        )}

        <FormField label="Notes" className="mt-4">
          <TextArea
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Additional notes or instructions"
            rows={3}
          />
        </FormField>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </div>
          ) : (
            <>
              <ApperIcon name="Save" className="w-4 h-4 mr-2" />
              {appointment?.Id ? "Update Appointment" : "Schedule Appointment"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default AppointmentForm