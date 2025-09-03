import { toast } from 'react-toastify'

class WardService {
  constructor() {
    this.tableName = 'ward_c'
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
          {"field": {"Name": "Type_c"}},
          {"field": {"Name": "TotalBeds_c"}},
          {"field": {"Name": "Floor_c"}}
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
      console.error("Error fetching wards:", error?.response?.data?.message || error)
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
          {"field": {"Name": "Type_c"}},
          {"field": {"Name": "TotalBeds_c"}},
          {"field": {"Name": "Floor_c"}}
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response?.data) {
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching ward ${id}:`, error?.response?.data?.message || error)
      return null
    }
  }

  async create(wardData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          Name_c: wardData.name || wardData.Name_c,
          Type_c: wardData.type || wardData.Type_c,
          TotalBeds_c: parseInt(wardData.totalBeds || wardData.TotalBeds_c || 0),
          Floor_c: parseInt(wardData.floor || wardData.Floor_c || 1)
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
          console.error(`Failed to create ${failed.length} wards:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error creating ward:", error?.response?.data?.message || error)
      return null
    }
  }

  async update(id, wardData) {
    try {
      if (!this.apperClient) this.initializeClient()
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name_c: wardData.name || wardData.Name_c,
          Type_c: wardData.type || wardData.Type_c,
          TotalBeds_c: parseInt(wardData.totalBeds || wardData.TotalBeds_c || 0),
          Floor_c: parseInt(wardData.floor || wardData.Floor_c || 1)
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
          console.error(`Failed to update ${failed.length} wards:`, failed)
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`))
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0 ? successful[0].data : null
      }
      
      return null
    } catch (error) {
      console.error("Error updating ward:", error?.response?.data?.message || error)
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
          console.error(`Failed to delete ${failed.length} wards:`, failed)
          failed.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successful.length > 0
      }
      
      return false
    } catch (error) {
      console.error("Error deleting ward:", error?.response?.data?.message || error)
      return false
    }
  }
}

export const wardService = new WardService()