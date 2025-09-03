import { useState } from "react"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import TextArea from "@/components/atoms/TextArea"
import FormField from "@/components/molecules/FormField"
import ApperIcon from "@/components/ApperIcon"
import { patientService } from "@/services/api/patientService"
import { toast } from "react-toastify"

const PatientForm = ({ patient, onSave, onCancel }) => {
const [formData, setFormData] = useState({
    name: patient?.Name_c || patient?.name || "",
    dateOfBirth: patient?.DateOfBirth_c || patient?.dateOfBirth || "",
    gender: patient?.Gender_c || patient?.gender || "",
    phone: patient?.Phone_c || patient?.phone || "",
    email: patient?.Email_c || patient?.email || "",
    address: patient?.Address_c || patient?.address || "",
    bloodType: patient?.BloodType_c || patient?.bloodType || "",
    allergies: (patient?.Allergies_c || patient?.allergies) ? 
      (Array.isArray(patient?.Allergies_c || patient?.allergies) 
        ? (patient?.Allergies_c || patient?.allergies).join(", ") 
        : (patient?.Allergies_c || patient?.allergies)) : "",
    emergencyContactName: patient?.EmergencyContactName_c || patient?.emergencyContact?.name || "",
    emergencyContactPhone: patient?.EmergencyContactPhone_c || patient?.emergencyContact?.phone || "",
    medicalHistory: (patient?.MedicalHistory_c || patient?.medicalHistory) ?
      (Array.isArray(patient?.MedicalHistory_c || patient?.medicalHistory)
        ? (patient?.MedicalHistory_c || patient?.medicalHistory).join(", ")
        : (patient?.MedicalHistory_c || patient?.medicalHistory)) : ""
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required"
    if (!formData.gender) newErrors.gender = "Gender is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.bloodType) newErrors.bloodType = "Blood type is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const patientData = {
        ...formData,
        allergies: formData.allergies.split(",").map(a => a.trim()).filter(Boolean),
        medicalHistory: formData.medicalHistory.split(",").map(h => h.trim()).filter(Boolean),
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone
        }
      }

      let savedPatient
      if (patient?.Id) {
        savedPatient = await patientService.update(patient.Id, patientData)
        toast.success("Patient updated successfully")
      } else {
        savedPatient = await patientService.create(patientData)
        toast.success("Patient registered successfully")
      }
      
      onSave(savedPatient)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="User" className="w-5 h-5 mr-2" />
          Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name" required error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter patient's full name"
              error={errors.name}
            />
          </FormField>

          <FormField label="Date of Birth" required error={errors.dateOfBirth}>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              error={errors.dateOfBirth}
            />
          </FormField>

          <FormField label="Gender" required error={errors.gender}>
            <Select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              error={errors.gender}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </FormField>

          <FormField label="Blood Type" required error={errors.bloodType}>
            <Select
              value={formData.bloodType}
              onChange={(e) => handleChange("bloodType", e.target.value)}
              error={errors.bloodType}
            >
              <option value="">Select blood type</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
          </FormField>

          <FormField label="Phone Number" required error={errors.phone}>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="(555) 123-4567"
              error={errors.phone}
            />
          </FormField>

          <FormField label="Email Address" required error={errors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="patient@email.com"
              error={errors.email}
            />
          </FormField>
        </div>

        <FormField label="Address" className="mt-4">
          <TextArea
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter complete address"
            rows={3}
          />
        </FormField>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="Phone" className="w-5 h-5 mr-2" />
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Emergency Contact Name">
            <Input
              value={formData.emergencyContactName}
              onChange={(e) => handleChange("emergencyContactName", e.target.value)}
              placeholder="Contact person name"
            />
          </FormField>

          <FormField label="Emergency Contact Phone">
            <Input
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
              placeholder="(555) 123-4567"
            />
          </FormField>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <ApperIcon name="FileText" className="w-5 h-5 mr-2" />
          Medical Information
        </h3>
        
        <div className="space-y-4">
          <FormField label="Known Allergies">
            <Input
              value={formData.allergies}
              onChange={(e) => handleChange("allergies", e.target.value)}
              placeholder="Separate multiple allergies with commas"
            />
            <p className="text-xs text-slate-500 mt-1">Example: Penicillin, Peanuts, Latex</p>
          </FormField>

          <FormField label="Medical History">
            <TextArea
              value={formData.medicalHistory}
              onChange={(e) => handleChange("medicalHistory", e.target.value)}
              placeholder="Previous conditions, surgeries, etc."
              rows={4}
            />
            <p className="text-xs text-slate-500 mt-1">Separate multiple conditions with commas</p>
          </FormField>
        </div>
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
              {patient?.Id ? "Update Patient" : "Register Patient"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default PatientForm