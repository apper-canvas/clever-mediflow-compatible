import { toast } from 'react-toastify'

class PatientService {
  constructor() {
    this.tableName = 'patient_c'
    this.apperClient = null
    this.initializeClient()
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name_c"}},
          {"field": {"Name": "DateOfBirth_c"}},
          {"field": {"Name": "Gender_c"}},
          {"field": {"Name": "Phone_c"}},
          {"field": {"Name": "Email_c"}},
          {"field": {"Name": "Address_c"}},
          {"field": {"Name": "BloodType_c"}},
          {"field": {"Name": "Allergies_c"}},
          {"field": {"Name": "EmergencyContactName_c"}},
          {"field": {"Name": "EmergencyContactPhone_c"}},
          {"field": {"Name": "MedicalHistory_c"}}
        ],
        orderBy: [{"fieldName": "Name_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error("Error fetching patients:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name_c"}},
          {"field": {"Name": "DateOfBirth_c"}},
          {"field": {"Name": "Gender_c"}},
          {"field": {"Name": "Phone_c"}},
          {"field": {"Name": "Email_c"}},
          {"field": {"Name": "Address_c"}},
          {"field": {"Name": "BloodType_c"}},
          {"field": {"Name": "Allergies_c"}},
          {"field": {"Name": "EmergencyContactName_c"}},
          {"field": {"Name": "EmergencyContactPhone_c"}},
          {"field": {"Name": "MedicalHistory_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response?.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(patientData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      // Only include updateable fields
      const params = {
        records: [{
          Name_c: patientData.name || patientData.Name_c,
          DateOfBirth_c: patientData.dateOfBirth || patientData.DateOfBirth_c,
          Gender_c: patientData.gender || patientData.Gender_c,
          Phone_c: patientData.phone || patientData.Phone_c,
          Email_c: patientData.email || patientData.Email_c,
          Address_c: patientData.address || patientData.Address_c,
          BloodType_c: patientData.bloodType || patientData.BloodType_c,
          Allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || patientData.Allergies_c),
          EmergencyContactName_c: patientData.emergencyContact?.name || patientData.emergencyContactName || patientData.EmergencyContactName_c,
          EmergencyContactPhone_c: patientData.emergencyContact?.phone || patientData.emergencyContactPhone || patientData.EmergencyContactPhone_c,
          MedicalHistory_c: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(', ') : (patientData.medicalHistory || patientData.MedicalHistory_c)
        }]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} patients:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error creating patient:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, patientData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      // Only include updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name_c: patientData.name || patientData.Name_c,
          DateOfBirth_c: patientData.dateOfBirth || patientData.DateOfBirth_c,
          Gender_c: patientData.gender || patientData.Gender_c,
          Phone_c: patientData.phone || patientData.Phone_c,
          Email_c: patientData.email || patientData.Email_c,
          Address_c: patientData.address || patientData.Address_c,
          BloodType_c: patientData.bloodType || patientData.BloodType_c,
          Allergies_c: Array.isArray(patientData.allergies) ? patientData.allergies.join(', ') : (patientData.allergies || patientData.Allergies_c),
          EmergencyContactName_c: patientData.emergencyContact?.name || patientData.emergencyContactName || patientData.EmergencyContactName_c,
          EmergencyContactPhone_c: patientData.emergencyContact?.phone || patientData.emergencyContactPhone || patientData.EmergencyContactPhone_c,
          MedicalHistory_c: Array.isArray(patientData.medicalHistory) ? patientData.medicalHistory.join(', ') : (patientData.medicalHistory || patientData.MedicalHistory_c)
        }]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} patients:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error updating patient:", error?.response?.data?.message || error)
      return null
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = { 
        RecordIds: [parseInt(id)]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} patients:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting patient:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const patientService = new PatientService()