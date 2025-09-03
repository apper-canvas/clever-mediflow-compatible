import React, { useEffect, useState } from "react";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import StatusIndicator from "@/components/molecules/StatusIndicator";
import ApperIcon from "@/components/ApperIcon";
import { bedService } from "@/services/api/bedService";
import { patientService } from "@/services/api/patientService";
import { toast } from "react-toastify";
import { format } from "date-fns";

const BedModal = ({ bed, onClose }) => {
  const [patients, setPatients] = useState([])
const [selectedPatientId, setSelectedPatientId] = useState(bed?.PatientId_c || bed?.patientId || "")
  const [newStatus, setNewStatus] = useState(bed?.Status_c || bed?.status || "available")
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

const getPatientName = (patientId) => {
    if (!patientId) return null
    const patient = patients.find(p => p.Id === parseInt(patientId))
    return patient ? (patient.Name_c || patient.name) : "Unknown Patient"
  }

  const handleUpdateBed = async () => {
    try {
      setLoading(true)
const updateData = {
        status: newStatus,
        patientId: newStatus === "occupied" ? parseInt(selectedPatientId) || null : null,
        admissionDate: newStatus === "occupied" && !(bed.PatientId_c || bed.patientId) ? new Date().toISOString() : (bed.AdmissionDate_c || bed.admissionDate),
        expectedDischarge: newStatus === "occupied" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null
      }

      await bedService.update(bed.Id, updateData)
      
let message = "Bed updated successfully"
      if (newStatus === "occupied" && !(bed.PatientId_c || bed.patientId)) {
        message = "Patient admitted successfully"
      } else if (newStatus === "available" && (bed.PatientId_c || bed.patientId)) {
        message = "Patient discharged successfully"
      }
      
      toast.success(message)
      onClose()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

const availablePatients = patients.filter(patient => 
    patient.Id === parseInt(bed?.PatientId_c || bed?.patientId) || 
    !patient.currentBedId
  )

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-900 flex items-center">
            <ApperIcon name="Bed" className="w-6 h-6 mr-2" />
Bed {bed?.BedNumber_c || bed?.bedNumber}
          </h3>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <ApperIcon name="X" className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Current Status:</span>
<StatusIndicator status={bed?.Status_c || bed?.status} />
          </div>

          {(bed?.PatientId_c || bed?.patientId) && (
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 flex items-center justify-center">
                  <ApperIcon name="User" className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{getPatientName(bed.PatientId_c || bed.patientId)}</p>
                  {(bed.AdmissionDate_c || bed.admissionDate) && (
                    <p className="text-xs text-slate-600">
                      Admitted: {format(new Date(bed.AdmissionDate_c || bed.admissionDate), "MMM dd, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <FormField label="Update Status">
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="cleaning">Cleaning</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </FormField>

          {newStatus === "occupied" && (
            <FormField label="Assign Patient">
              <Select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                disabled={loadingPatients}
              >
                <option value="">Select patient</option>
{availablePatients.map(patient => (
                  <option key={patient.Id} value={patient.Id}>{patient.Name_c || patient.name}</option>
                ))}
              </Select>
              {newStatus === "occupied" && !selectedPatientId && (
                <p className="text-sm text-rose-600 mt-1">Please select a patient for admission</p>
              )}
            </FormField>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateBed} 
            disabled={loading || (newStatus === "occupied" && !selectedPatientId)}
            className="flex-1"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Updating...
              </div>
            ) : (
              <>
                <ApperIcon name="Save" className="w-4 h-4 mr-2" />
                Update Bed
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BedModal