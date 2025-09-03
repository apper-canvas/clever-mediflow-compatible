import React, { useEffect, useState } from "react";
import { patientService } from "@/services/api/patientService";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
const PatientList = ({ onSelectPatient, onAddPatient }) => {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await patientService.getAll()
      setPatients(data)
      setFilteredPatients(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients)
    } else {
const filtered = patients.filter(patient =>
        (patient.Name_c || patient.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.Phone_c || patient.phone).includes(searchTerm) ||
        (patient.Email_c || patient.email).toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPatients(filtered)
    }
  }, [searchTerm, patients])

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadPatients} />

  if (patients.length === 0) {
    return (
      <Empty
        title="No patients registered"
        description="Start by registering your first patient to begin managing their care."
        icon="UserPlus"
        action={
          <Button onClick={onAddPatient} className="shadow-lg">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Register New Patient
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          placeholder="Search patients by name, phone, or email..."
          onSearch={setSearchTerm}
          className="flex-1 max-w-md"
        />
        <Button onClick={onAddPatient} className="shadow-lg">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {filteredPatients.length === 0 ? (
        <Empty
          title="No patients found"
          description={`No patients match "${searchTerm}". Try adjusting your search terms.`}
          icon="Search"
        />
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.Id}
              onClick={() => onSelectPatient(patient)}
              className="glass-card p-6 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                    <ApperIcon name="User" className="w-6 h-6 text-white" />
                  </div>
                  <div>
<h3 className="text-lg font-semibold text-slate-900">{patient.Name_c || patient.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <span className="flex items-center">
                        <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
{format(new Date(patient.DateOfBirth_c || patient.dateOfBirth), "MMM dd, yyyy")}
                      </span>
                      <span className="flex items-center">
<ApperIcon name="Phone" className="w-4 h-4 mr-1" />
                        {patient.Phone_c || patient.phone}
                      </span>
<span className="flex items-center">
                        <ApperIcon name="Mail" className="w-4 h-4 mr-1" />
                        {patient.Email_c || patient.email}
                      </span>
                    </div>
                  </div>
                </div>
                
<div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">Blood Type</p>
                    <p className="text-lg font-bold text-rose-600">{patient.BloodType_c || patient.bloodType}</p>
                  </div>
                </div>
                
{(patient.Allergies_c || patient.allergies) && (patient.Allergies_c || patient.allergies).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="AlertTriangle" className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-slate-700">Allergies:</span>
                      <span className="text-sm text-slate-600">
                        {Array.isArray(patient.Allergies_c || patient.allergies) 
                          ? (patient.Allergies_c || patient.allergies).join(", ")
                          : (patient.Allergies_c || patient.allergies)
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
)}
    </div>
  )
}

export default PatientList