import { toast } from 'react-toastify'

class AppointmentService {
  constructor() {
    this.tableName = 'appointment_c'
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
          {"field": {"Name": "PatientId_c"}},
          {"field": {"Name": "DoctorId_c"}},
          {"field": {"Name": "DateTime_c"}},
          {"field": {"Name": "Duration_c"}},
          {"field": {"Name": "Type_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "Notes_c"}}
        ],
        orderBy: [{"fieldName": "DateTime_c", "sorttype": "ASC"}],
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
      console.error("Error fetching appointments:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "PatientId_c"}},
          {"field": {"Name": "DoctorId_c"}},
          {"field": {"Name": "DateTime_c"}},
          {"field": {"Name": "Duration_c"}},
          {"field": {"Name": "Type_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "Notes_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response?.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(appointmentData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          PatientId_c: parseInt(appointmentData.patientId || appointmentData.PatientId_c),
          DoctorId_c: parseInt(appointmentData.doctorId || appointmentData.DoctorId_c),
          DateTime_c: appointmentData.dateTime || appointmentData.DateTime_c,
          Duration_c: parseInt(appointmentData.duration || appointmentData.Duration_c || 30),
          Type_c: appointmentData.type || appointmentData.Type_c,
          Status_c: appointmentData.status || appointmentData.Status_c || "scheduled",
          Notes_c: appointmentData.notes || appointmentData.Notes_c || ""
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
          console.error(`Failed to create ${failed.length} appointments:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error creating appointment:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, appointmentData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          Id: parseInt(id),
          PatientId_c: parseInt(appointmentData.patientId || appointmentData.PatientId_c),
          DoctorId_c: parseInt(appointmentData.doctorId || appointmentData.DoctorId_c),
          DateTime_c: appointmentData.dateTime || appointmentData.DateTime_c,
          Duration_c: parseInt(appointmentData.duration || appointmentData.Duration_c || 30),
          Type_c: appointmentData.type || appointmentData.Type_c,
          Status_c: appointmentData.status || appointmentData.Status_c,
          Notes_c: appointmentData.notes || appointmentData.Notes_c || ""
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
          console.error(`Failed to update ${failed.length} appointments:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error updating appointment:", error?.response?.data?.message || error)
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
          console.error(`Failed to delete ${failed.length} appointments:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting appointment:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const appointmentService = new AppointmentService()