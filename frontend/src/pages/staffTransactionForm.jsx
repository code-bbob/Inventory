"use client";

import React, { useState, useEffect } from "react";
import useAxios from "@/utils/useAxios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/allsidebar";
import { useParams } from "react-router-dom";

function StaffTransactionForm() {
  const api = useAxios();
  const navigate = useNavigate();
  const { branchId } = useParams();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    staff: "",
    amount: "",
    desc: "",
    branch: branchId,
  });
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openStaff, setOpenStaff] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Adjust this endpoint to match your API for staff retrieval
        const staffResponse = await api.get(`alltransaction/staff/branch/${branchId}/`);
        setStaffMembers(staffResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleStaffChange = (value) => {
    setFormData((prevState) => ({
      ...prevState,
      staff: value,
    }));
    setOpenStaff(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubLoading(true);
      // Adjust this endpoint to match your staff transaction creation URL
      const response = await api.post("alltransaction/stafftransaction/", formData);
      console.log("Response:", response.data);
      navigate("/staff-transactions/branch/" + branchId);
    } catch (err) {
      console.error("Error posting data:", err);
      setError("Failed to submit staff transaction. Please try again.");
    } finally {
      setSubLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        Loading...
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
      <div className="flex-grow p-4 lg:p-6 lg:ml-64 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate("/staff-transactions/branch/" + branchId)}
            variant="outline"
            className="mb-6 px-4 py-2 text-black border-white hover:bg-gray-700 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff Transactions
          </Button>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-white">
              Add Staff Transaction
            </h2>
            {error && <p className="text-red-400 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <Label htmlFor="date" className="text-sm font-medium text-white mb-2">
                    Date
                  </Label>
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="staff" className="text-sm font-medium text-white mb-2">
                    Staff
                  </Label>
                  <Popover open={openStaff} onOpenChange={setOpenStaff}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openStaff}
                        className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        {formData.staff
                          ? staffMembers.find(
                              (staff) => staff.id.toString() === formData.staff
                            )?.name
                          : "Select a staff..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700">
                      <Command className="bg-slate-700 border-slate-600">
                        <CommandInput placeholder="Search staff..." className="bg-slate-700 text-white" />
                        <CommandList>
                          <CommandEmpty>No staff found.</CommandEmpty>
                          <CommandGroup>
                            {staffMembers.map((staff) => (
                              <CommandItem
                                key={staff.id}
                                onSelect={() => handleStaffChange(staff.id.toString())}
                                className="text-white hover:bg-slate-600"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.staff === staff.id.toString() ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {staff.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="amount" className="text-sm font-medium text-white mb-2">
                  Amount
                </Label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="desc" className="text-sm font-medium text-white mb-2">
                  Description
                </Label>
                <Input
                  type="text"
                  id="desc"
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter description"
                  
                />
              </div>

              <Button
                type="submit"
                disabled={subLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Submit Staff Transaction
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StaffTransactionForm;
