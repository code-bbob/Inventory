"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import useAxios from "@/utils/useAxios";
import Sidebar from "@/components/allsidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, ArrowLeft, PackageOpen, ShoppingCart, Search } from "lucide-react";

export default function AllProductReport() {
  const api = useAxios();
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [report, setReport] = useState(null);

  // Fetch report with optional filters
  const fetchReport = async (params = {}) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams(params).toString();
      const url = qs
        ? `allinventory/report/product/${productId}/?${qs}`
        : `allinventory/report/product/${productId}/`;
      const response = await api.get(url);
      setReport(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch product report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [productId]);

  const handleDateSearch = async (e) => {
    e.preventDefault();
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (searchTerm) params.search = searchTerm;
    fetchReport(params);
  };

  const handleTextSearch = async (e) => {
    e.preventDefault();
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    fetchReport(params);
  };

  // Normalize movements: expect API to return arrays like purchases and sales or a combined list
  const movements = useMemo(() => {
    if (!report) return [];
    // Try to support both shapes:
    // 1) report.movements: [{date, type: 'purchase'|'sale', quantity, desc, bill_no}]
    // 2) separate arrays: report.purchases, report.sales
    let rows = [];
    if (Array.isArray(report.transactions)) {
      rows = report.transactions;
    } else {
      const p = (report.purchases || []).map((x) => ({ ...x, type: "purchase" }));
      const s = (report.sales || []).map((x) => ({ ...x, type: "sales" }));
      rows = [...p, ...s];
    }
    // sort by date asc
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));
    return rows;
  }, [report]);

  // Running remaining count: add on purchase, subtract on sale
  const rowsWithBalance = useMemo(() => {
    let remaining = report?.opening_quantity ?? 0;
    return movements.map((m, idx) => {
      const qty = Number(m.quantity ?? m.qty ?? 0);
      if ((m.type) === "purchase") {
        remaining += qty;
        console.log("Purchase", qty, "->", remaining);
      } else {
        remaining -= qty;
      }
      return { ...m, qty, remaining };
    });
  }, [movements, report?.opening_quantity]);

  const totals = useMemo(() => {
    const purchased = rowsWithBalance
      .filter((r) => (r.type || r.transaction_type) === "purchase")
      .reduce((sum, r) => sum + r.qty, 0);
    const sold = rowsWithBalance
      .filter((r) => (r.type || r.transaction_type) === "sale")
      .reduce((sum, r) => sum + r.qty, 0);
    const remaining = rowsWithBalance.length
      ? rowsWithBalance[rowsWithBalance.length - 1].remaining
      : report?.opening_quantity ?? 0;
    return { purchased, sold, remaining };
  }, [rowsWithBalance, report?.opening_quantity]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        Loading product report...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar className="hidden lg:block w-64 flex-shrink-0" />
      <div className="flex-grow p-4 px-8 lg:p-6 lg:ml-64">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-0">
            Product Movement Report
          </h1>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full lg:w-auto px-5 text-black border-white hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-3" />
            Back
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:flex-wrap lg:items-center lg:gap-4">
          <form onSubmit={handleTextSearch} className="w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by bill, party, or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-64 bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </form>

          <form
            onSubmit={handleDateSearch}
            className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4"
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
            <Button type="submit" className="w-full lg:w-auto bg-purple-600 hover:bg-purple-700 text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </Button>
          </form>
        </div>

        {/* Table */}
        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-lg">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-green-400" />
              Purchases & Sales
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-700">
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Type</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                    <TableHead className="text-white text-right">Quantity</TableHead>
                    <TableHead className="text-white text-right">Remaining</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowsWithBalance?.map((row, idx) => (
                    <TableRow
                      key={`${row.id || idx}-${row.date}`}
                      className={`${idx % 2 === 0 ? "bg-slate-800" : "bg-slate-750"}`}
                    >
                      <TableCell className="text-white">
                        {row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell className={`${(row.type || row.transaction_type) === "purchase" ? "text-green-400" : "text-blue-400"} font-medium`}>
                        {(row.type || row.transaction_type) === "purchase" ? "Purchase" : "Sale"}
                      </TableCell>
                      <TableCell className="text-white max-w-xs truncate" title={row.desc || row.note || "-"}>
                        {row.desc || row.note || "-"}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${(row.type || row.transaction_type) === "purchase" ? "text-green-400" : "text-blue-400"}`}>
                        {(row.type || row.transaction_type) === "purchase" ? "+" : "-"}
                        {Number(row.qty ?? row.quantity ?? 0)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-white">
                        {Number(row.remaining).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rowsWithBalance.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-6">
                        No movements found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-6 flex justify-end">
          <div className="w-full lg:w-96 bg-slate-800 p-6 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Opening Quantity</span>
                <span className="font-semibold text-white">{Number(report?.opening_quantity ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Purchased</span>
                <span className="font-semibold text-green-400">+ {totals.purchased}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Sold</span>
                <span className="font-semibold text-red-400">- {totals.sold}</span>
              </div>
              <hr className="border-slate-600" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-white">Remaining</span>
                <span className="text-xl font-bold text-blue-400">{totals.remaining}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
