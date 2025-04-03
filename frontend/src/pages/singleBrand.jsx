"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Smartphone, Search, ArrowLeft, Trash2 } from "lucide-react"
import useAxios from "../utils/useAxios"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import Sidebar from "../components/sidebar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function BrandPhones() {
  const api = useAxios()
  const { id } = useParams()
  const [phones, setPhones] = useState([])
  const [filteredPhones, setFilteredPhones] = useState([])
  const [brandName, setBrandName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()
  const [selectedPhones, setSelectedPhones] = useState([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchBrandPhones = async () => {
      try {
        const response = await api.get(`inventory/brand/?id=${id}`)
        setPhones(response.data)
        setFilteredPhones(response.data)
        setBrandName(response.data[0].brand_name)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching brand phones:", err)
        setError("Failed to load brand phones")
        setLoading(false)
      }
    }

    fetchBrandPhones()
  }, [id])

  useEffect(() => {
    const results = phones.filter((phone) => phone.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredPhones(results)
  }, [searchTerm, phones])

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleCheckboxChange = (phoneId) => {
    setSelectedPhones((prev) => (prev.includes(phoneId) ? prev.filter((id) => id !== phoneId) : [...prev, phoneId]))
  }

  const handleDeleteSelected = async () => {
    setIsDeleteDialogOpen(false)
    try {
      for (const phoneId of selectedPhones) {
        await api.delete(`inventory/deletephone/${phoneId}/`)
      }
      setPhones((prev) => prev.filter((phone) => !selectedPhones.includes(phone.id)))
      setFilteredPhones((prev) => prev.filter((phone) => !selectedPhones.includes(phone.id)))
      setSelectedPhones([])
    } catch (err) {
      console.error("Error deleting phones:", err)
      // Here you might want to show an error message to the user
    }
  }

  // Sort phones by name first
  filteredPhones.sort((a, b) => a.name.localeCompare(b.name));
  // Then sort by quantity so that lowest quantities appear at the top
  filteredPhones.sort((a, b) => b.quantity - a.quantity);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 p-4 sm:p-6 lg:p-10 lg:ml-64">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4 mb-8"
        >
          <h1 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold text-white">{brandName} Phones</h1>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search phones..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/mobile/inventory")}
                variant="outline"
                className="w-full sm:w-auto px-5 text-black border-white hover:bg-gray-700 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-3" />
                Back to Inventory
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                className="w-full sm:w-auto px-5"
                disabled={selectedPhones.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
            </div>
          </div>
        </motion.div>

        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-lg">
          <CardContent className="p-0 overflow-x-auto">
            <div className="grid grid-cols-12 gap-2 p-2 sm:p-4 text-xs sm:text-sm font-medium text-slate-300 border-b border-slate-700">
              <div className="col-span-1"></div>
              <div className="col-span-5 lg:col-span-5">Particulars</div>
              <div className="col-span-3 lg:col-span-3 text-center">Quantity</div>
              <div className="col-span-3 lg:col-span-3 text-right">Unit Price</div>
            </div>
            {filteredPhones?.map((phone) => (
              <motion.div
                key={phone.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`grid grid-cols-12 gap-2 p-2 sm:p-4 items-center hover:bg-slate-800 transition-colors duration-200 cursor-pointer ${
                  selectedPhones.includes(phone.id) ? "bg-slate-700" : ""
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  <Checkbox
                    checked={selectedPhones.includes(phone.id)}
                    onCheckedChange={() => handleCheckboxChange(phone.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-gray-400"
                  />
                </div>
                <div
                  className="col-span-5 lg:col-span-5 flex items-center"
                  onClick={() => navigate(`/mobile/phone/${phone.id}`)}
                >
                  <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-400 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-white text-xs sm:text-sm lg:text-base truncate">{phone.name}</span>
                </div>
                <div
                  className={`col-span-3 lg:col-span-3 text-center ${phone.quantity < 3 ? "text-red-500" : "text-green-500"} text-xs sm:text-sm lg:text-base`}
                >
                  {phone.quantity}
                </div>
                <div className="col-span-3 lg:col-span-3 text-right text-white text-xs sm:text-sm lg:text-base">
                  {phone.unit_price ? `RS. ${phone.unit_price.toLocaleString()}` : "N/A"}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {filteredPhones.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white mt-8"
          >
            No phones found matching your search.
          </motion.div>
        )}

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete the selected phones? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button variant="outline" className="w-full text-black sm:w-auto" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="w-full sm:w-auto" onClick={handleDeleteSelected}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

