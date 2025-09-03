import { toast } from 'react-toastify'

class BedService {
  constructor() {
    this.tableName = 'bed_c'
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
          {"field": {"Name": "BedNumber_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "WardId_c"}},
          {"field": {"Name": "PatientId_c"}},
          {"field": {"Name": "AdmissionDate_c"}},
          {"field": {"Name": "ExpectedDischarge_c"}}
        ],
        orderBy: [{"fieldName": "BedNumber_c", "sorttype": "ASC"}],
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
      console.error("Error fetching beds:", error?.response?.data?.message || error)
      return []
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "BedNumber_c"}},
          {"field": {"Name": "Status_c"}},
          {"field": {"Name": "WardId_c"}},
          {"field": {"Name": "PatientId_c"}},
          {"field": {"Name": "AdmissionDate_c"}},
          {"field": {"Name": "ExpectedDischarge_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response?.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching bed ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(bedData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          BedNumber_c: bedData.bedNumber || bedData.BedNumber_c,
          Status_c: bedData.status || bedData.Status_c || "available",
          WardId_c: parseInt(bedData.wardId || bedData.WardId_c),
          PatientId_c: bedData.patientId ? parseInt(bedData.patientId) : (bedData.PatientId_c ? parseInt(bedData.PatientId_c) : null),
          AdmissionDate_c: bedData.admissionDate || bedData.AdmissionDate_c,
          ExpectedDischarge_c: bedData.expectedDischarge || bedData.ExpectedDischarge_c
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
          console.error(`Failed to create ${failed.length} beds:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error creating bed:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, bedData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          Id: parseInt(id),
          BedNumber_c: bedData.bedNumber || bedData.BedNumber_c,
          Status_c: bedData.status || bedData.Status_c,
          WardId_c: parseInt(bedData.wardId || bedData.WardId_c),
          PatientId_c: bedData.patientId ? parseInt(bedData.patientId) : (bedData.PatientId_c ? parseInt(bedData.PatientId_c) : null),
          AdmissionDate_c: bedData.admissionDate || bedData.AdmissionDate_c,
          ExpectedDischarge_c: bedData.expectedDischarge || bedData.ExpectedDischarge_c
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
          console.error(`Failed to update ${failed.length} beds:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error updating bed:", error?.response?.data?.message || error)
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
          console.error(`Failed to delete ${failed.length} beds:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting bed:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const bedService = new BedService()