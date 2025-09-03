import { useState, useEffect } from "react"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import StatusIndicator from "@/components/molecules/StatusIndicator"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { bedService } from "@/services/api/bedService"
import { wardService } from "@/services/api/wardService"
import { patientService } from "@/services/api/patientService"
import { cn } from "@/utils/cn"

const BedGrid = ({ onBedAction }) => {
  const [beds, setBeds] = useState([])
  const [wards, setWards] = useState([])
  const [patients, setPatients] = useState([])
  const [selectedWard, setSelectedWard] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [bedsData, wardsData, patientsData] = await Promise.all([
        bedService.getAll(),
        wardService.getAll(),
        patientService.getAll()
      ])
      setBeds(bedsData)
      setWards(wardsData)
      setPatients(patientsData)
      if (wardsData.length > 0 && !selectedWard) {
        setSelectedWard(wardsData[0].Id.toString())
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

const getPatientName = (patientId) => {
    if (!patientId) return null
    const patient = patients.find(p => p.Id === parseInt(patientId))
    return patient ? (patient.Name_c || patient.name) : "Unknown Patient"
  }

  const getWardBeds = () => {
    if (!selectedWard) return []
return beds.filter(bed => (bed.WardId_c || bed.wardId) === parseInt(selectedWard))
  }

  const getOccupancyStats = () => {
    const wardBeds = getWardBeds()
    const total = wardBeds.length
    const occupied = wardBeds.filter(bed => bed.status === "occupied").length
    const available = wardBeds.filter(bed => bed.status === "available").length
    const cleaning = wardBeds.filter(bed => bed.status === "cleaning").length
    const maintenance = wardBeds.filter(bed => bed.status === "maintenance").length
    
    return { total, occupied, available, cleaning, maintenance }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />

  if (wards.length === 0) {
    return (
      <Empty
        title="No wards configured"
        description="Please configure wards and beds to manage occupancy."
        icon="Bed"
      />
    )
  }

  const selectedWardData = wards.find(w => w.Id === parseInt(selectedWard))
  const wardBeds = getWardBeds()
  const stats = getOccupancyStats()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">Ward:</label>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
{wards.map(ward => (
              <option key={ward.Id} value={ward.Id}>{ward.Name_c || ward.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Occupancy Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-sm text-slate-600">Total Beds</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.available}</div>
          <div className="text-sm text-slate-600">Available</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-rose-600">{stats.occupied}</div>
          <div className="text-sm text-slate-600">Occupied</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.cleaning}</div>
          <div className="text-sm text-slate-600">Cleaning</div>
        </div>
        <div className="glass-card p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-slate-600">{stats.maintenance}</div>
          <div className="text-sm text-slate-600">Maintenance</div>
        </div>
      </div>

      {/* Ward Info */}
      {selectedWardData && (
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
<h3 className="text-xl font-semibold text-slate-900">{selectedWardData.Name_c || selectedWardData.name}</h3>
              <p className="text-slate-600">
                Floor {selectedWardData.Floor_c || selectedWardData.floor} • {selectedWardData.Type_c || selectedWardData.type} • {stats.total} beds
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Occupancy Rate</div>
              <div className="text-2xl font-bold text-primary-600">
                {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
          
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Bed Grid */}
      {wardBeds.length === 0 ? (
        <Empty
          title="No beds in this ward"
          description="This ward doesn't have any beds configured yet."
          icon="Bed"
        />
      ) : (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Bed Layout</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
{wardBeds.map((bed) => {
              const patientName = getPatientName(bed.PatientId_c || bed.patientId)
              
              return (
                <div
                  key={bed.Id}
                  onClick={() => onBedAction(bed)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                    bed.status === "available" && "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
                    bed.status === "occupied" && "bg-rose-50 border-rose-200 hover:bg-rose-100",
                    bed.status === "cleaning" && "bg-amber-50 border-amber-200 hover:bg-amber-100",
                    bed.status === "maintenance" && "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <div className="text-center space-y-3">
                    <div className={cn(
                      "w-12 h-12 mx-auto rounded-lg flex items-center justify-center",
                      bed.status === "available" && "bg-emerald-200",
                      bed.status === "occupied" && "bg-rose-200",
                      bed.status === "cleaning" && "bg-amber-200",
                      bed.status === "maintenance" && "bg-slate-200"
                    )}>
                      <ApperIcon name="Bed" className={cn(
                        "w-6 h-6",
                        bed.status === "available" && "text-emerald-600",
                        bed.status === "occupied" && "text-rose-600",
                        bed.status === "cleaning" && "text-amber-600",
                        bed.status === "maintenance" && "text-slate-600"
                      )} />
                    </div>
                    
                    <div>
                      <div className="font-semibold text-slate-900">
Bed {bed.BedNumber_c || bed.bedNumber}
                      </div>
                      <StatusIndicator status={bed.Status_c || bed.status} showIcon={false} />
                    </div>
                    
                    {patientName && (
                      <div className="text-xs text-slate-600 truncate" title={patientName}>
                        {patientName}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default BedGrid