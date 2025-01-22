"use client"

import { TrendingUp, Calendar } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  ResponsiveContainer
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/sidebar";
import useAxios from "@/utils/useAxios";
import { useEffect, useState } from "react";

export const description = "A bar chart with a label";

const chartConfig = {
  Sales: {
    label: "Value:",
    color: "rgba(255,255,255,0.3)"
  }
};

export default function BarCh() {
  const api = useAxios();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);
  const [data, setData] = useState({});
  const [chartData, setChartData] = useState([]);

  // Fetch data on component mount


  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
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
    );
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/transaction/barchart/");
        setData(response.data);
        setChartData(response.data.count); // Default view is profit
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  // Handle date search to filter data
  const handleDateSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get(
        `/transaction/barchart/?start_date=${startDate}&end_date=${endDate}`
      );
      setData(response.data);
      setChartData(response.data.profit); // Update to show profit by default
      setIsFiltered(true);
    } catch (err) {
      console.error("Failed to filter transactions by date:", err);
    }
  };

  const brandsSold = (chartData) => {
    let count = 0;
    chartData?.forEach((brand) => {
      if (brand.Sales > 0) {
        count++;
      }
    });
    return count;
  };

  const highestSold = (chartData) => {
    if (!chartData || chartData.length === 0) return "N/A";
    chartData.sort((a, b) => b.Sales - a.Sales);
    return chartData[0].Brand;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar className="w-full md:w-64" />
      <div className="flex-grow p-4 lg:ml-64 md:p-6 overflow-y-auto">
        <form
          onSubmit={handleDateSearch}
          className="flex flex-col lg:flex-row  justify-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6"
        >
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
          <Button
            type="submit"
            className="w-full lg:w-auto bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Filter by Date
          </Button>
        </form>
        <Card className="bg-gradient-to-br w-full from-slate-900 to-slate-800 text-white">
          <CardHeader>
            {!isFiltered && (
              <CardTitle className="text-center">
                Your Sales over the past month
              </CardTitle>
            )}
            <CardDescription className="text-white text-center font-serif italic">
              Brand with Sales Count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer className="w-full h-[50vh] md:h-[60vh] lg:h-[60vh]" config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
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
                    dataKey="Brand"
                    tick={<CustomXAxisTick />}
                    
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="Sales" fill="rgba(255,255,255,0.4)" radius={8}>
                    <LabelList position="top" fill="#ffffff" offset={12} fontSize={12} fontWeight={"bold"} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-start gap-4 text-sm">
            <div className="flex-col">
              <div className="flex pb-2 gap-2 font-medium leading-none">
                {brandsSold(chartData)} Brands sold {!isFiltered && <span> this month </span>}
              </div>
              <div className="leading-none flex text-white text-muted-foreground">
                <span className="font-bold mr-1 text-green-400">
                  {highestSold(chartData)}
                </span>{" "}
                was the top seller <TrendingUp className="h-4 ml-2 w-4" />
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
  );
}