"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download, ChevronDown, Search, Calendar, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useAxios from "@/utils/useAxios"
import { useNavigate } from "react-router-dom"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { useParams } from "react-router-dom"
import useRole from "../hooks/useRole"
const AllSalesReport = () => {
  const { branchId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const api = useAxios()
  const navigate = useNavigate()
  const { isAdmin } = useRole()

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async (params = {}) => {
    setLoading(true)
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await api.get(`alltransaction/sales-report/branch/${branchId}/?${queryString}`)
      const salesData = {
        sales: response.data.slice(0, -1),
        ...response.data[response.data.length - 1],
      }
      setData(salesData)
    } catch (err) {
      setError("Failed to fetch sales data")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    const params = { search: searchTerm }
    if (startDate) params.start_date = startDate
    if (endDate) params.end_date = endDate
    fetchSalesData(params)
  }

  const handleDateSearch = async (e) => {
    e.preventDefault()
    const params = { start_date: startDate, end_date: endDate }
    if (searchTerm) params.search = searchTerm
    fetchSalesData(params)
  }

  const handlePrint = () => {
    window.print()
  }
  const handleDownloadCSV = () => {
    if (!data || !data.sales.length) {
      console.warn("No data available for CSV export")
      return
    }
  
    // Create CSV header
    let csvContent = "Date,Product,Brand,quantity,Unit Price\n"
  
    // Convert each sale into a CSV row
    data.sales.forEach((item) => {
      const row = `${item.date},${item.product},${item.brand},${item.imei_number},${item.unit_price},${item.total_price}\n`
      csvContent += row + "\n"
    })
  
    // Add summary row
    csvContent += `\nTotal Sales: ,,,${data.total_sales}\n`
    if (isAdmin && data.total_profit !== undefined) {
      csvContent += `Total Profit: ,,,${data.total_profit}\n`
    }
    csvContent += `Total Transactions: ,,,${data.count}\n`
  
    // Create a downloadable CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "Sales_Report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const handleDownloadPDF = () => {
    if (!data || !data.sales.length) {
      console.warn("No data available for PDF export")
      return
    }
  
    const doc = new jsPDF()
    doc.text("Sales Report", 14, 10)
  
    // Table Headers
  const headers = [["Date", "Product", "Brand", "Quantity", "Unit Price", "Total Price"]]
  
    // Table Data
    const tableData = data.sales.map((item) => [
      item.date,
      item.product,
      item.brand,
      item.quantity,
      item.unit_price,
      item.total_price,
    ])
  
    // Add Summary Row
    tableData.push(["", "", "", "Total Sales", data.total_sales])
    if (isAdmin && data.total_profit !== undefined) {
      tableData.push(["", "", "", "Total Profit", data.total_profit])
    }
    tableData.push(["", "", "", "Total Transactions", data.count])
  
    // Generate table
    doc.autoTable({
      head: headers,
      body: tableData,
      startY: 20,
    })
  
    // Save PDF
    doc.save("Sales_Report.pdf")
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        Loading...
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-red-500">
        {error}
      </div>
    )
  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 lg:px-8 print:bg-white print:p-0">
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="w-full lg:w-auto px-5 mb-4 text-black border-white print:hidden hover:bg-gray-700 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-3" />
        Back to Dashboard
      </Button>
      <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-lg print:shadow-none print:bg-white">
        <CardHeader className="border-b border-slate-700 print:border-gray-200">
          <CardTitle className="text-2xl lg:text-3xl font-bold text-white print:text-black">Sales Report</CardTitle>
          <p className="text-sm text-gray-400 print:text-gray-600">{format(new Date(), "MMMM d, yyyy")}</p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:items-center lg:gap-4 print:hidden">
            <form onSubmit={handleSearch} className="w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full lg:w-64 bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </form>

            <form onSubmit={handleDateSearch} className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="startDate" className="text-white whitespace-nowrap">
                  Start:
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="endDate" className="text-white whitespace-nowrap">
                  End:
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <Button type="submit" className="w-full lg:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Filter by Date
              </Button>
            </form>

            <div className="flex space-x-2">
              <Button onClick={handlePrint} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-green-500 hover:bg-green-600 text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleDownloadPDF}>Download as PDF</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDownloadCSV}>Download as CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px] text-white print:text-black">Date</TableHead>
                <TableHead className="w-[180px] text-white print:text-black">Product</TableHead>
                <TableHead className="text-white print:text-black">Brand</TableHead>
                <TableHead className="text-white print:text-black">Quantity</TableHead>
                <TableHead className="text-white print:text-black">Method</TableHead>
                <TableHead className="text-right text-white print:text-black">Unit Price</TableHead>
                <TableHead className="text-right text-white print:text-black">Total Price</TableHead>
                <TableHead className="text-right text-white print:text-black">Sold By:</TableHead>
                {isAdmin && (
                  <TableHead className="text-right text-white print:text-black">Profit</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.sales.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-white print:text-black">{item.date}</TableCell>
                  <TableCell className="font-medium text-white print:text-black">{item.product}</TableCell>
                  <TableCell className="text-white print:text-black">{item.brand}</TableCell>
                  <TableCell className="text-white print:text-black">{item.quantity}</TableCell>
                  <TableCell className="text-white print:text-black">{item.method}</TableCell>
                  <TableCell className="text-right text-white print:text-black">
                    {item.unit_price.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                  </TableCell>
                  <TableCell className="text-right text-white print:text-black">
                    {item.total_price.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                  </TableCell>
                  <TableCell className="text-right text-white print:text-black">{item.person}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right text-white print:text-black">
                      {item.profit.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-end">
            <div className="w-64 bg-slate-800 p-4 rounded-lg print:bg-gray-100">
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-white print:text-black">Subtotal Sales:</span>
                <span className="text-white print:text-black">
                  {data?.subtotal_sales?.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-white print:text-black">Total Sales Count:</span>
                <span className="text-white print:text-black">{data.count}</span>
              </div>
              {isAdmin && data?.total_profit !== undefined && (
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-white print:text-black">Total Profit:</span>
                  <span className="text-white print:text-black">
                    {data?.total_profit?.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                  </span>
                </div>
              )}
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-white print:text-black">Total Discount:</span>
                <span className="text-white print:text-black">
                  {data?.total_discount.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold text-white print:text-black">Net Sales:</span>
                <span className="text-white print:text-black">
                  {data?.total_sales?.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                </span>
              </div>
              {isAdmin && data?.net_profit !== undefined && (
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-white print:text-black">Net Profit:</span>
                  <span className="text-white print:text-black">
                    {data?.net_profit?.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                  </span>
                </div>
              )}
              {/* <div className="flex justify-between font-bold text-lg">
                 <span className="text-white print:text-black">Cash Sales:</span>
                <span className="text-white print:text-black">
                  {data?.cash_sales?.toLocaleString("en-US", { style: "currency", currency: "NPR" })}
                </span> 
              </div> */}
           
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400 print:text-gray-600">
            <p>This report is auto-generated and does not require a signature.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AllSalesReport

