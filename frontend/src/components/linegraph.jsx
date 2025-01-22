"use client"

import { TrendingUp, Calendar } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer,LabelList, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import useAxios from "@/utils/useAxios"
import { useEffect, useState } from "react"

const chartConfig = {
  count: {
    label: "Count",
    color: "#ffffff"
  }
}

export default function LineGraph() {
  const [data,setData] = useState({})
  const [chartData, setChartData] = useState([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isFiltered, setIsFiltered] = useState(false)
  const api = useAxios()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("transaction/linegraph/")
        setData(response.data)
        setChartData(response.data.amount)
      } catch (err) {
        console.log("Failed to fetch line graph data", err)
      }
    }
    fetchData()
  }, [])

  const handleDateSearch = async (e) => {
    e.preventDefault()
    try {
      const response = await api.get(
        `/transaction/linegraph/?start_date=${startDate}&end_date=${endDate}`
      )
      setChartData(response.data)
      setIsFiltered(true)
    } catch (err) {
      console.error("Failed to filter transactions by date:", err)
    }
  }

  const CustomXAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle"
        style={{ fill: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}
      >
        {payload.value}
      </text>
    </g>
  )
  const CustomYAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dx={-50} 
        style={{ fill: "#FFFFFF", fontSize: 13, fontWeight: "bold" }}
      >
        {payload.value}
      </text>
    </g>
  )
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar className="w-full md:w-64" />
      <div className="flex-grow p-4 lg:ml-64 md:p-6 overflow-y-auto">
        
        <Card className="bg-gradient-to-br w-full from-slate-900 to-slate-800 text-white">
          <CardHeader>
            <CardTitle className="text-center">
              {isFiltered ? "Filtered Transaction Count" : "Daily Transaction Count"}
            </CardTitle>
            <CardDescription className="text-white text-center font-serif italic">
              {isFiltered ? "Custom Date Range" : "Last 7 Days"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="w-full h-[50vh] md:h-[60vh] lg:h-[60vh]" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 20
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={<CustomXAxisTick />}
                    
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={<CustomYAxisTick />}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    type="linear"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    
                    activeDot={{
                        r: 6,
                      }}
                  >
                    <LabelList

                position="top"
                offset={12}
                className="fill-foreground font-bold"
                style={{ fill: "#ffffff" }}
                fontSize={12}
              />
              </Line>
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex justify-between items-start gap-2 text-sm">
            <div className="flex flex-col">
            <div className="flex gap-2 font-medium leading-none">
              Line Graph for {isFiltered ? "in this period" : "this week"} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Showing total transactions for the {isFiltered ? "selected period" : "last 7 days"}
            </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="hover:bg-purple-600" onClick={() => setChartData(data.count)}>Count</Button>
              <Button className="hover:bg-purple-600" onClick={() => setChartData(data.amount)}>Amount</Button>
              <Button className="hover:bg-purple-600" onClick={() => setChartData(data.profit)}>Profit</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}