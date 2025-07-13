"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  ArrowLeft,
  BookUser,
  Plus,
  Check,
  ChevronsUpDown,
  Trash2,
} from "lucide-react";
import useAxios from "../utils/useAxios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "../components/allsidebar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function AllVendorPage() {
  const api = useAxios();
  const { branchId, id } = useParams();
  const navigate = useNavigate();

  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState([]);
  const [openBrand, setOpenBrand] = useState(false);
  const [showNewBrandDialog, setShowNewBrandDialog] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showNewVendorDialog, setShowNewVendorDialog] = useState(false);
  const [newVendorData, setNewVendorData] = useState({
    name: "",
    due: 0,
    brand: "",
    branch: branchId,
  });
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const phoneRes = await api.get(
          `alltransaction/vendor/branch/${branchId}/`
        );
        const brandRes = await api.get(
          `allinventory/brand/branch/${branchId}/`
        );
        setPhones(phoneRes.data);
        setFilteredPhones(phoneRes.data);
        setBrandName(phoneRes?.data[0]?.brand_name || "");
        setBrands(brandRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load");
        setLoading(false);
      }
    };
    fetchData();
  }, [branchId]);

  useEffect(() => {
    const results = phones.filter((phone) =>
      phone.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPhones(results);
  }, [searchTerm, phones]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleNewVendorChange = (e) => {
    const { name, value } = e.target;
    setNewVendorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("alltransaction/vendor/", newVendorData);
      setPhones((prev) => [...prev, response.data]);
      setFilteredPhones((prev) => [...prev, response.data]);
      setNewVendorData({ name: "", due: 0, brand: "", branch: branchId });
      setShowNewVendorDialog(false);
    } catch (err) {
      console.error("Error adding vendor:", err);
      setError("Failed to add new vendor");
    }
  };

  const handleAddBrand = async () => {
    try {
      const response = await api.post("allinventory/brand/", {
        name: newBrandName,
        branch: branchId,
      });
      setBrands((prev) => [...prev, response.data]);
      setNewBrandName("");
      setShowNewBrandDialog(false);
      setNewVendorData((prev) => ({
        ...prev,
        brand: response.data.id.toString(),
      }));
    } catch (err) {
      console.error("Error adding brand:", err);
      setError("Failed to add new brand");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedVendors((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleteDialogOpen(false);
    try {
      for (const id of selectedVendors) {
        await api.delete(`alltransaction/vendor/${id}/`);
      }
      const updatedList = phones.filter(
        (vendor) => !selectedVendors.includes(vendor.id)
      );
      setPhones(updatedList);
      setFilteredPhones(updatedList);
      setSelectedVendors([]);
    } catch (err) {
      console.error("Error deleting vendors:", err);
    }
  };

  filteredPhones.sort((a, b) => a.name.localeCompare(b.name));

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-red-500">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row">
      <Sidebar className="w-full lg:w-64 md:min-h-screen" />
      <div className="w-full lg:ml-64 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            {brandName} Vendors
          </h1>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full bg-slate-700 text-white border-gray-600"
              />
            </div>
            <Button
              onClick={() => navigate("/" )}
              variant="outline"
              className="w-full sm:w-auto px-5 text-slate-900 border-white hover:bg-gray-500"
            >
              <ArrowLeft className="mr-2 h-4 w-3" /> Back to Dashboard
            </Button>
            <Button
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={selectedVendors.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
            </Button>
          </div>
        </motion.div>

        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-lg">
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-slate-300 border-b border-slate-700">
              <div className="col-span-1"></div>
              <div className="col-span-5">Vendors</div>
              <div className="col-span-3">Brand</div>
              <div className="col-span-3 text-right">Due Amount</div>
            </div>
            {filteredPhones.map((vendor) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-700"
                onClick={() => {
                  navigate(`/vendors/statement/${vendor.id}`);
                }}
              >
                <div className="col-span-1 flex items-center justify-center checkbox-wrapper">
                  <Checkbox
                    checked={selectedVendors.includes(vendor.id)}
                    onCheckedChange={() => handleCheckboxChange(vendor.id)}
                    className="border-gray-400"
                  />
                </div>
                <div className="col-span-5 flex items-center">
                  <BookUser className="h-5 w-5 text-purple-400 mr-2" />
                  <span className="text-white truncate">{vendor.name}</span>
                </div>
                <div className="col-span-3 text-white">
                  {vendor.brand_name || "N/A"}
                </div>
                <div className="col-span-3 text-right text-white">
                  {vendor.due ? `RS. ${vendor.due.toLocaleString()}` : "N/A"}
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
            No vendors found matching your search.
          </motion.div>
        )}
      </div>

      <Button
        onClick={() => setShowNewVendorDialog(true)}
        className="fixed bottom-8 right-8 rounded-full w-14 h-14 lg:w-16 lg:h-16 shadow-lg bg-purple-600 hover:bg-purple-700 text-white"
      >
        <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
      </Button>

      {/* New Vendor Dialog */}
      <Dialog open={showNewVendorDialog} onOpenChange={setShowNewVendorDialog}>
        <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription className="text-slate-300">
              Enter details for the new vendor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendorName" className="text-right text-white">
                Name
              </Label>
              <Input
                id="vendorName"
                name="name"
                value={newVendorData.name}
                onChange={handleNewVendorChange}
                className="col-span-3 bg-slate-700 border-slate-600 text-white"
                placeholder="Enter vendor name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendorDue" className="text-right text-white">
                Due
              </Label>
              <Input
                id="vendorDue"
                name="due"
                type="number"
                value={newVendorData.due}
                onChange={handleNewVendorChange}
                className="col-span-3 bg-slate-700 border-slate-600 text-white"
                placeholder="Enter due amount"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vendorBrand" className="text-right text-white">
                Brand
              </Label>
              <div className="col-span-3">
                <Popover open={openBrand} onOpenChange={setOpenBrand}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openBrand}
                      className="w-full justify-between bg-slate-700 border-slate-600 text-white"
                    >
                      {newVendorData.brand
                        ? brands.find(
                            (b) => b.id.toString() === newVendorData.brand
                          )?.name
                        : "Select a brand..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-slate-700 border-slate-600">
                    <Command className="bg-slate-700">
                      <CommandInput
                        placeholder="Search brand..."
                        className="bg-slate-700 text-white"
                      />
                      <CommandList>
                        <CommandEmpty>No brand found.</CommandEmpty>
                        <CommandGroup>
                          {brands.map((brand) => (
                            <CommandItem
                              key={brand.id}
                              onSelect={() => {
                                setNewVendorData((prev) => ({
                                  ...prev,
                                  brand: brand.id.toString(),
                                }));
                                setOpenBrand(false);
                              }}
                              className="text-white hover:bg-slate-600"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  newVendorData.brand === brand.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {brand.name}
                            </CommandItem>
                          ))}
                          <CommandItem
                            onSelect={() => {
                              setShowNewBrandDialog(true);
                              setOpenBrand(false);
                            }}
                            className="text-white hover:bg-slate-600"
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add a new brand
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleAddVendor}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Brand Dialog */}
      <Dialog open={showNewBrandDialog} onOpenChange={setShowNewBrandDialog}>
        <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
            <DialogDescription className="text-slate-300">
              Enter the name of the new brand to add it to the list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="newBrandName" className="text-right text-white">
                Brand Name
              </Label>
              <Input
                id="newBrandName"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                className="col-span-3 bg-slate-700 border-slate-600 text-white"
                placeholder="Enter brand name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleAddBrand}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to delete the selected vendors? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="text-black"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSelected}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
