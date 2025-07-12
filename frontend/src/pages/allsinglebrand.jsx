"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Container, Search, ArrowLeft, Trash2, Plus, List } from "lucide-react";
import useAxios from "../utils/useAxios";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Sidebar from "../components/allsidebar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Label } from "@/components/ui/label";

export default function AllBrandProducts() {
  const api = useAxios();
  const { branchId, id } = useParams(); // id is the brand id, branchId is the current branch
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [barcode, setBarcode] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [branch, setBranch] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // State for branch details
  const [branchData, setBranchData] = useState({});

  // New Product Dialog states – default branch is set to branchData.id once loaded
  const [showNewProductDialog, setShowNewProductDialog] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: "",
    brand: id,
    cost_price: "",
    selling_price: "",
    branch: branchId, // Will be set to branchData.id once branchData is fetched
  });

  const handleImportProducts = async (selectedBranchId) => {
    try {
      console.log("MERGING ................")
      await api.post(`allinventory/product/branch/${branchId}/brand/${id}/merge/${selectedBranchId}/`);
      setIsImportDialogOpen(false);
      // Refresh products list
      const response = await api.get(`allinventory/brand/${id}/`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error("Error importing products:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Existing brand products fetch
        const response = await api.get(`allinventory/brand/${id}/`);
        setProducts(response.data);
        setFilteredProducts(response.data);
        setBrandName(response.data[0]?.brandName || "Brand");

        // Fetch branch list
        const branchResponse = await api.get(`enterprise/branch/`);
        setBranch(branchResponse.data);

        // Fetch current branch details using branchId
        const currentBranchResponse = await api.get(`enterprise/branch/${branchId}/`);
        setBranchData(currentBranchResponse.data);
        setNewProductData((prev) => ({
          ...prev,
          branch: currentBranchResponse.data.id.toString(),
        }));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, branchId]);

  useEffect(() => {
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchBarcode = async (productId) => {
    try {
      const response = await api.get(`allinventory/barcode/${productId}/`);
      setBarcode(response.data);
    } catch (err) {
      console.error("Error fetching barcode:", err);
      setBarcode("");
    }
  };

  const handleProductClick = (product, e) => {
    if (!e.target.closest(".checkbox-wrapper")) {
      setSelectedProduct(product);
      fetchBarcode(product.id);
    }
  };

  const handleEdit = (product) => {
    navigate(`/inventory/branch/${product.branch}/editproduct/${product.id}`);
  };

  const handlePrintBarcode = () => {
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
          <style>
            body { text-align: center; margin: 20px; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          <div>${barcode}</div>
        </body>
      </html>
    `);
    newWindow.document.close();
    newWindow.print();
  };

  const handleCheckboxChange = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDeleteSelected = async () => {
    setIsDeleteDialogOpen(false);
    try {
      for (const productId of selectedProducts) {
        await api.delete(`allinventory/deleteproduct/${productId}/`);
      }
      setProducts((prev) =>
        prev.filter((product) => !selectedProducts.includes(product.id))
      );
      setFilteredProducts((prev) =>
        prev.filter((product) => !selectedProducts.includes(product.id))
      );
      setSelectedProducts([]);
    } catch (err) {
      console.error("Error deleting products:", err);
    }
  };

  // --- New Product Dialog functions ---
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("allinventory/product/", newProductData);
      setProducts((prev) => [...prev, response.data]);
      setFilteredProducts((prev) => [...prev, response.data]);
      // Reset new product data – ensure branch is set to current branch id
      setNewProductData({
        name: "",
        brand: "",
        cost_price: "",
        selling_price: "",
        branch: branchId,
      });
      setShowNewProductDialog(false);
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white text-lg">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-red-500 text-lg">
        {error}
      </div>
    );
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
          <div className="flex justify-between">
          < div className="flex justify-center items-center w-full">
          <h1 className="text-xl sm:text-2xl lg:text-4xl text-center font-bold text-white">
            {brandName} Products
          </h1>
          </div>
          <div className="md:hidden">
          <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  
                    <List className="h-6 w-6 text-white"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Import From Branch</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {branch?.map((b) => (
                          <DropdownMenuItem
                            key={b.id}
                            onClick={() => {
                              setSelectedBranch(b);
                              setIsImportDialogOpen(true);
                            }}
                          >
                            {b.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full bg-slate-700 text-white border-gray-600 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/inventory")}
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
                disabled={selectedProducts.length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected
              </Button>
              <div className="hidden md:block">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  
                    <List className="h-8 w-6 text-white"/>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Import From Branch</DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        {branch?.map((b) => (
                          <DropdownMenuItem
                            key={b.id}
                            onClick={() => {
                              setSelectedBranch(b);
                              setIsImportDialogOpen(true);
                            }}
                          >
                            {b.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </div>
        </motion.div>

        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-lg">
          <CardContent className="p-0 overflow-x-auto">
            <div className="grid grid-cols-12 gap-2 p-2 sm:p-4 text-xs sm:text-sm font-medium text-slate-300 border-b border-slate-700">
              <div className="col-span-1"></div>
              <div className="col-span-4 lg:col-span-4">Particulars</div>
              <div className="col-span-2 lg:col-span-2 text-center">Quantity</div>
              <div className="col-span-2 lg:col-span-2 text-right">Unit Price</div>
              <div className="col-span-3 lg:col-span-3 text-right">Stock Price</div>
            </div>
            {filteredProducts?.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`grid grid-cols-12 gap-2 p-2 sm:p-4 items-center hover:bg-slate-800 transition-colors duration-200 cursor-pointer ${
                  selectedProducts.includes(product.id) ? "bg-slate-700" : ""
                }`}
                onClick={(e) => handleProductClick(product, e)}
              >
                <div className="col-span-1 flex items-center justify-center checkbox-wrapper">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => handleCheckboxChange(product.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-gray-400"
                  />
                </div>
                <div className="col-span-4 lg:col-span-4 flex items-center">
                  <Container className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-purple-400 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="text-white text-xs sm:text-sm lg:text-base truncate">
                    {product.name}
                  </span>
                </div>
                <div
                  className={`col-span-2 lg:col-span-2 text-center ${
                    product.count < 3 ? "text-red-500" : "text-green-500"
                  } text-xs sm:text-sm lg:text-base`}
                >
                  {product.count}
                </div>
                <div className="col-span-2 lg:col-span-2 text-right text-white text-xs sm:text-sm lg:text-base">
                  {product.selling_price
                    ? `RS. ${product.selling_price.toLocaleString()}`
                    : "N/A"}
                </div>
                <div className="col-span-3 lg:col-span-3 text-right text-white text-xs sm:text-sm lg:text-base">
                  {product.stock
                    ? `RS. ${product.stock.toLocaleString()}`
                    : "N/A"}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {filteredProducts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center text-white mt-8 text-sm sm:text-base"
          >
            No products found matching your search.
          </motion.div>
        )}

        {/* Dialog for Product Details */}
        <Dialog
          open={!!selectedProduct}
          onOpenChange={() => setSelectedProduct(null)}
        >
          <DialogTrigger asChild>
            <span className="hidden" />
          </DialogTrigger>
          <DialogContent className="w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex justify-between mt-2">
                <div>Product Details</div>
                <Button
                  className="hover:scale-105"
                  onClick={() => handleEdit(selectedProduct)}
                >
                  Edit
                </Button>
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Details for {selectedProduct?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm sm:text-base">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{selectedProduct?.name}</p>
              </div>
              <div>
                <p className="font-semibold">Quantity:</p>
                <p>{selectedProduct?.count}</p>
              </div>
              <div>
                <p className="font-semibold">Cost Price:</p>
                <p>
                  {selectedProduct?.cost_price
                    ? `RS. ${selectedProduct.cost_price.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Selling Price:</p>
                <p>
                  {selectedProduct?.selling_price
                    ? `RS. ${selectedProduct.selling_price.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Stock Price:</p>
                <p>
                  {selectedProduct?.stock
                    ? `RS. ${selectedProduct.stock.toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-semibold mb-2 text-sm sm:text-base">
                Barcode:
              </p>
              {barcode ? (
                <div
                  dangerouslySetInnerHTML={{ __html: barcode }}
                  className="w-full h-full cursor-pointer"
                  onClick={handlePrintBarcode}
                />
              ) : (
                <p className="text-sm sm:text-base">No barcode available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="w-full max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete the selected products? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                className="w-full text-black sm:w-auto"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleDeleteSelected}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Products Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="bg-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="my-2">
                {`Are you sure you want to import products from ${selectedBranch?.name}?`}
              </DialogTitle>
              <DialogDescription className="text-slate-300">
                This action will import all products from the selected branch for this brand. Existing products will be merged or updated.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={() => handleImportProducts(selectedBranch.id)}
                className="w-full bg-purple-600 hover:scale-105 hover:bg-purple-700 text-white"
              >
                Import Products
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Plus Button to trigger New Product Dialog */}
        <Button
          className="fixed bottom-8 right-8 rounded-full w-14 h-14 lg:w-16 lg:h-16 shadow-lg bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setShowNewProductDialog(true)}
        >
          <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
        </Button>

        {/* Inline New Product Dialog */}
        <Dialog open={showNewProductDialog} onOpenChange={setShowNewProductDialog}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription className="text-slate-300">
                Enter the details of the new product you want to add.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Product Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductName" className="text-right text-white">
                  Name
                </Label>
                <Input
                  id="newProductName"
                  name="name"
                  value={newProductData.name}
                  onChange={handleNewProductChange}
                  className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter product name"
                />
              </div>
              {/* Cost Price */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductCostPrice" className="text-right text-white">
                  Cost Price
                </Label>
                <Input
                  id="newProductCostPrice"
                  name="cost_price"
                  value={newProductData.cost_price}
                  onChange={handleNewProductChange}
                  className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter cost price"
                />
              </div>
              {/* Selling Price */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newProductSellingPrice" className="text-right text-white">
                  Selling Price
                </Label>
                <Input
                  id="newProductSellingPrice"
                  name="selling_price"
                  value={newProductData.selling_price}
                  onChange={handleNewProductChange}
                  className="col-span-3 bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter selling price"
                />
              </div>
              {/* Branch Select */}
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleAddProduct}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
