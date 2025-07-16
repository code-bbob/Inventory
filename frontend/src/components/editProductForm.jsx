// EditProductForm.jsx
"use client";

import React, { useState, useEffect } from "react";
import useAxios from "@/utils/useAxios";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./allsidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import ReactSelect from "react-select";
import { cn } from "@/lib/utils";

const EditProductForm = () => {
  const { productId } = useParams();
  const api = useAxios();
  const navigate = useNavigate();

  // ------------------------------------------------------------------
  // Form state now includes vendor_ids array
  const [formData, setFormData] = useState({
    name: "",
    uid: "",
    cost_price: "",
    selling_price: "",
    vendor: [],        // ← new
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Vendors list for select
  const [vendors, setVendors] = useState([]);

  // ------------------------------------------------------------------
  // Fetch product and vendor lists
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prodRes, venRes] = await Promise.all([
          api.get(`allinventory/product/${productId}/`),
          api.get("alltransaction/vendor/"),
        ]);

        // Load product into form
        setFormData({
          name: prodRes.data.name || "",
          uid: prodRes.data.uid || "",
          cost_price: prodRes.data.cost_price ?? "",
          selling_price: prodRes.data.selling_price ?? "",
          vendor: prodRes.data.vendor || [],    // assumes API returns vendor_ids[]
        });

        // Load vendors for selection
        setVendors(venRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load product or vendors.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  // ------------------------------------------------------------------
  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleVendorSelect = (selectedOptions) => {
    setFormData((f) => ({
      ...f,
      vendor: selectedOptions
        ? selectedOptions.map((o) => o.value)
        : [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    //check if the barcode is 12 digits, if not set error
    if (formData.uid.length !== 12) {
      setError("Barcode ID must be exactly 12 digits.");
      setLoading(false);
      return;
    }
    try {
      await api.patch(`allinventory/product/${productId}/`, formData);
      navigate("/"); 
    } catch (err) {
      console.error("Error updating product", err);
      setError("Error updating product.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // react-select styling to match your theme
  const vendorSelectClasses = {
    control: ({ isFocused }) =>
      cn(
        "bg-slate-700 border border-slate-600 rounded px-2 py-1",
        isFocused && "ring-2 ring-purple-500"
      ),
    input: () => "[&_input:focus]:ring-0",
    placeholder: () => "text-sm text-slate-500",
    menu: () => "bg-slate-700 border border-slate-600 rounded mt-1 z-50",
    option: ({ isFocused, isSelected }) =>
      cn(
        "px-3 py-2 cursor-pointer",
        isFocused && "bg-slate-600",
        isSelected && "bg-purple-600 text-white"
      ),
  };

  // Map vendors for react-select
  const vendorOptions = vendors.map((v) => ({
    value: v.id,
    label: v.name,
  }));

  // Current selected values
  const vendorValue = vendorOptions.filter((o) =>
    formData.vendor.includes(o.value)
  );

  // ------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white text-lg">
        Loading...
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar />
      <Button
        onClick={() => navigate("/")}
        variant="outline"
        className="mb-4 w-48 md:ml-80 px-5 my-4 text-black border-white hover:bg-gray-700 hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-3" />
        Back to Dashboard
      </Button>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 mx-10 my-10 md:ml-80 p-5 bg-slate-800"
      >
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Name */}
          <div className="flex flex-col">
            <Label
              htmlFor="name"
              className="text-lg font-medium text-white mb-2"
            >
              Product Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          {/* Barcode */}
          <div className="flex flex-col">
            <Label
              htmlFor="uid"
              className="text-lg font-medium text-white mb-2"
            >
              Barcode Id
            </Label>
            <Input
              type="text"
              id="uid"
              name="uid"
              value={formData.uid}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          {/* Cost Price */}
          <div className="flex flex-col">
            <Label
              htmlFor="cost_price"
              className="text-lg font-medium text-white mb-2"
            >
              Cost Price
            </Label>
            <Input
              type="number"
              id="cost_price"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
          {/* Selling Price */}
          <div className="flex flex-col">
            <Label
              htmlFor="selling_price"
              className="text-lg font-medium text-white mb-2"
            >
              Selling Price
            </Label>
            <Input
              type="number"
              id="selling_price"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Vendors Multi‑Select */}
        <div className="flex flex-col">
          <Label
            htmlFor="vendors"
            className="text-lg font-medium text-white mb-2"
          >
            Vendors
          </Label>
          <ReactSelect
            id="vendors"
            isMulti
            unstyled
            options={vendorOptions}
            value={vendorValue}
            onChange={handleVendorSelect}
            classNames={vendorSelectClasses}
            className="text-white"
            placeholder="Select one or more vendors..."
          />
        </div>

        <Button type="submit" className="w-full hover:bg-black" disabled={loading}>
          Submit
        </Button>
      </form>
    </div>
  );
};

export default EditProductForm;
