'use client';

import React, { useState, useEffect } from 'react';
import useAxios from '@/utils/useAxios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2, Check, ChevronsUpDown, ArrowLeft } from 'lucide-react'
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Sidebar from '@/components/sidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function EditPurchaseTransactionForm() {
  const api = useAxios()
  const navigate = useNavigate()
  const { purchaseId } = useParams()
  const {branchId} = useParams()

  const [originalPurchaseData, setOriginalPurchaseData] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    purchase: [],
    vendor: '',
    bill_no: '',
    method: '',
    cheque_number: '',
    cashout_date: '',
    branch: branchId
  });
  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewPhoneDialog, setShowNewPhoneDialog] = useState(false);
  const [showNewVendorDialog, setShowNewVendorDialog] = useState(false);
  const [showNewBrandDialog, setShowNewBrandDialog] = useState(false);
  const [newPhoneData, setNewPhoneData] = useState({ name: '', brand: '' });
  const [newVendorData, setNewVendorData] = useState({ name: '', brand: '' });
  const [newBrandName, setNewBrandName] = useState('');
  const [openPhone, setOpenPhone] = useState([]);
  const [openVendor, setOpenVendor] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [subLoading, setSubLoading] = useState(false)
  const [returns, setReturns] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [phonesResponse, vendorsResponse, brandsResponse, purchaseResponse] = await Promise.all([
          api.get('inventory/phone/'),
          api.get('transaction/vendor/'),
          api.get('inventory/brand/'),
          api.get(`transaction/purchasetransaction/${purchaseId}/`)
        ]);
        setPhones(phonesResponse.data);
        setVendors(vendorsResponse.data);
        setBrands(brandsResponse.data);
        setOriginalPurchaseData(purchaseResponse.data);
        setFormData({
          date: purchaseResponse.data.date,
          purchase: purchaseResponse.data.purchase.map(p => ({
            ...p,
            phone: p.phone.toString(),
            unit_price: p.unit_price.toString()
          })),
          vendor: purchaseResponse.data.vendor.toString(),
          bill_no: purchaseResponse.data.bill_no?.toString(),
          method: purchaseResponse.data.method || '',
          cheque_number: purchaseResponse.data.cheque_number || null,
          cashout_date: purchaseResponse.data.cashout_date || null
        });
        setOpenPhone(new Array(purchaseResponse.data.purchase.length).fill(false));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [purchaseId]);

   useEffect(() => {
      const brandToDisplay = vendors?.find(
        (vendor) => vendor.id.toString() === formData.vendor.toString()
      )?.brand;
      console.log(brandToDisplay);
      const filtered = phones?.filter(
        (phone) => phone.brand === brandToDisplay
      );
      setFilteredPhones(filtered);  
    }, [vendors]);

  const handleDelete = async (e) => {
    e.preventDefault();
    await api.delete(`transaction/purchasetransaction/${purchaseId}/`);
    navigate('/mobile/purchases/branch/' + branchId);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMethodChange = (value) => {
    setFormData({ ...formData, method: value });
  };

  const handlePurchaseChange = (index, e) => {
    const { name, value } = e.target;
    const newPurchase = [...formData.purchase];
    newPurchase[index] = { ...newPurchase[index], [name]: value };
    setFormData({ ...formData, purchase: newPurchase });
  };

  const handlePhoneChange = (index, value) => {
    if (value === 'new') {
      setShowNewPhoneDialog(true);
    } else {
      const newPurchase = [...formData.purchase];
      newPurchase[index] = { ...newPurchase[index], phone: value };
      setFormData(prevState => ({
        ...prevState,
        purchase: newPurchase
      }));
    }
    const newOpenPhone = [...openPhone];
    newOpenPhone[index] = false;
    setOpenPhone(newOpenPhone);
  };

  const handleVendorChange = (value) => {
    if (value === 'new') {
      setShowNewVendorDialog(true);
    } else {
      setFormData(prevState => ({
        ...prevState,
        vendor: value
      }));
      const selectedVendor = vendors.find(vendor => vendor.id.toString() === value);
      if (selectedVendor) {
        const filteredPhones = phones.filter(phone => phone.brand === selectedVendor.brand);
        setFilteredPhones(filteredPhones);
      }
    }
    setOpenVendor(false);
  };

  const handleNewPhoneChange = (e) => {
    const { name, value } = e.target;
    setNewPhoneData({ ...newPhoneData, [name]: value });
  };

  const handleNewVendorChange = (e) => {
    const { name, value } = e.target;
    setNewVendorData({ ...newVendorData, [name]: value });
  };

  const handleNewPhoneBrandChange = (value) => {
    if (value === 'new') {
      setShowNewBrandDialog(true);
    } else {
      setNewPhoneData({ ...newPhoneData, brand: value });
    }
    setOpenBrand(false);
  };

  const handleNewVendorBrandChange = (value) => {
    if (value === 'new') {
      setShowNewBrandDialog(true);
    } else {
      setNewVendorData({ ...newVendorData, brand: value });
    }
    setOpenBrand(false);
  };

  const handleNewBrandChange = (e) => {
    setNewBrandName(e.target.value);
  };

  const handleAddPurchase = () => {
    setFormData(prevState => ({
      ...prevState,
      purchase: [...prevState.purchase, { phone: '', imei_number: '', unit_price: '' }]
    }));
    setOpenPhone(prevState => [...prevState, false]);
  };

  const handleRemovePurchase = (index) => {
    setFormData(prevState => ({
      ...prevState,
      purchase: prevState.purchase.filter((_, i) => i !== index)
    }));
    setOpenPhone(prevState => prevState.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubLoading(true)
      const response = await api.patch(`transaction/purchasetransaction/${purchaseId}/`, formData);
      console.log('Response:', response.data);
      navigate('/mobile/purchases/branch/' + branchId);
    } catch (error) {
      console.error('Error updating data:', error);
      setError('Failed to update purchase transaction. Please try again.');
    }
    finally {
      setSubLoading(false)
    }
  };

  const handleAddPhone = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('inventory/phone/', newPhoneData);
      console.log('New Phone Added:', response.data);
      setPhones(prevPhones => [...prevPhones, response.data]);
      setNewPhoneData({ name: '', brand: '' });
      setShowNewPhoneDialog(false);
    } catch (error) {
      console.error('Error adding phone:', error);
      setError('Failed to add new phone. Please try again.');
    }
  };

  const appendReturn = (id) => {
    setReturns(prevReturns => [...prevReturns, id])
    setFormData(prevState => ({
      ...prevState,
      purchase: prevState.purchase.map(purchase => 
        purchase.id === id ? { ...purchase, returned: true } : purchase
      )
    }));

    console.log(returns)
  }

  const handleAddVendor = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('transaction/vendor/', newVendorData);
      console.log('New Vendor Added:', response.data);
      setVendors(prevVendors => [...prevVendors, response.data]);
      setFormData(prevState => ({
        ...prevState,
        vendor: response.data.id.toString()
      }));
      setNewVendorData({ name: '', brand: '' });
      setShowNewVendorDialog(false);
    } catch (error) {
      console.error('Error adding vendor:', error);
      setError('Failed to add new vendor. Please try again.');
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('inventory/brand/', { name: newBrandName });
      console.log('New Brand Added:', response.data);
      setBrands(prevBrands => [...prevBrands, response.data]);
      setNewBrandName('');
      setShowNewBrandDialog(false);
      setNewPhoneData(prevData => ({ ...prevData, brand: response.data.id.toString() }));
      setNewVendorData(prevData => ({ ...prevData, brand: response.data.id.toString() }));
    } catch (error) {
      console.error('Error adding brand:', error);
      setError('Failed to add new brand. Please try again.');
    }
  };

  const handleReturn = async (e) =>{
    // e.preventDefault();
    
    try {
      setSubLoading(true);
      const response = await api.post('transaction/purchase-return/', {"purchase_ids":returns, "purchase_transaction_id":purchaseId,"branch":branchId});
      console.log('Returned:', response.data);

      
      

    } catch (error) {
      console.error('Error adding phone:', error);
      setError('Failed to add new phone. Please try again.');
    }
    finally{
      setSubLoading(false);
      navigate('/mobile/purchases/branch/' + branchId);
      
      // window.location.reload();
    }
    
  };

  const hasFormChanged = () => {
    if (!originalPurchaseData) return false;
    
    return (
      formData.date !== originalPurchaseData.date ||
      formData.vendor !== originalPurchaseData.vendor.toString() ||
      formData.bill_no !== originalPurchaseData.bill_no?.toString() ||
      formData.purchase.length !== originalPurchaseData.purchase.length ||
      formData.method !== originalPurchaseData.method ||
      formData.cheque_number !== originalPurchaseData.cheque_number ||
      formData.cashout_date !== originalPurchaseData.cashout_date ||
      formData.purchase.some((purchase, index) => {
        const originalPurchase = originalPurchaseData.purchase[index];
        return (
          purchase.phone !== originalPurchase.phone.toString() ||
          purchase.imei_number !== originalPurchase.imei_number ||
          purchase.unit_price !== originalPurchase.unit_price.toString()
        );
      })
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;
  }
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Sidebar className="hidden lg:block w-64 flex-shrink-0" />
      <div className="flex-grow p-4 lg:p-8 overflow-auto">
        <div className="max-w-4xl mx-auto lg:ml-64">
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => navigate('/mobile/purchases/branch/' + branchId)}
              variant="outline"
              className="px-4 py-2 text-black text-right border-white hover:bg-gray-700 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Purchases
            </Button>
          </div>

          <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-white">Edit Purchase Transaction</h2>
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
                  <Label htmlFor="bill_no" className="text-sm font-medium text-white mb-2">
                    Bill No.
                  </Label>
                  <Input
                    type="text"
                    id="bill_no"
                    name="bill_no"
                    placeholder="Enter bill number"
                    value={formData.bill_no}
                    onChange={handleChange}
                    className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="vendor" className="text-sm font-medium text-white mb-2">
                  Vendor
                </Label>
                <Popover open={openVendor} onOpenChange={setOpenVendor}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openVendor}
                      className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      {formData.vendor
                        ? vendors.find((vendor) => vendor.id.toString() === formData.vendor)?.name
                        : "Select a vendor..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-slate-800 border-slate-700">
                    <Command className='bg-slate-700 border-slate-600'>
                      <CommandInput placeholder="Search vendor..." className="bg-slate-700 text-white" />
                      <CommandList className="max-h-[200px] overflow-auto">
                        <CommandEmpty>No vendor found.</CommandEmpty>
                        <CommandGroup>
                          {vendors.map((vendor) => (
                            <CommandItem
                              key={vendor.id}
                              onSelect={() => handleVendorChange(vendor.id.toString())}
                              className="text-white hover:bg-slate-600"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.vendor === vendor.id.toString() ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {vendor.name}
                            </CommandItem>
                          ))}
                          <CommandItem onSelect={() => handleVendorChange('new')} className="text-white hover:bg-slate-600">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add a new vendor
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <h3 className="text-xl font-semibold mb-2 text-white">Purchases</h3>
              {formData.purchase.map((purchase, index) => (
                <div key={index} className="bg-slate-700 p-4 rounded-md shadow mb-4">
                  <div className='flex justify-between'>
                  <h4 className="text-lg font-semibold mb-4 text-white">Purchase {index + 1}</h4>
                  <Dialog>
                  <DialogTrigger asChild>
                  <Button className="bg-blue-500" disabled = {purchase.returned}>Returned</Button>
                  </DialogTrigger>
              <DialogContent className="bg-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    This action cannot be undone. This will permanently save your purchase as returned
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogClose asChild>
                <Button 
                  type="button" 
                  disabled = {subLoading}
                  className="w-full bg-red-600 mt-6 hover:bg-red-700 text-white"
                  onClick={()=>appendReturn(purchase.id)}
                >
                  Yes
                </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
                
                  </div>
                 
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <Label htmlFor={`phone-${index}`} className="text-sm font-medium text-white mb-2">
                        Phone
                      </Label>
                      <Popover open={openPhone[index]} onOpenChange={(open) => {
                        const newOpenPhone = [...openPhone];
                        newOpenPhone[index] = open;
                        setOpenPhone(newOpenPhone);
                      }}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPhone[index]}
                            className="w-full justify-between bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                          >
                            {purchase.phone
                              ? phones.find((phone) => phone.id.toString() === purchase.phone)?.name
                              : "Select a phone..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-slate-700 border-slate-600">
                          <Command className='bg-slate-700 border-slate-600'>
                            <CommandInput placeholder="Search phone..." className="bg-slate-700 text-white" />
                            <CommandList className="max-h-[200px] overflow-auto">
                              <CommandEmpty>No phone found.</CommandEmpty>
                              <CommandGroup>
                                {filteredPhones.map((phone) => (
                                  <CommandItem
                                    key={phone.id}
                                    onSelect={() => handlePhoneChange(index, phone.id.toString())}
                                    className="text-white hover:bg-slate-600"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        purchase.phone === phone.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {phone.name}
                                  </CommandItem>
                                ))}
                                <CommandItem onSelect={() => handlePhoneChange(index, 'new')} className="text-white hover:bg-slate-600">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add a new phone
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor={`imei-${index}`} className="text-sm font-medium text-white mb-2">
                        IMEI Number
                      </Label>
                      <Input
                        type="text"
                        id={`imei-${index}`}
                        name="imei_number"
                        value={purchase.imei_number}
                        onChange={(e) => handlePurchaseChange(index, e)}
                        className="bg-slate-600 border-slate-500 text-white focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter IMEI number"
                        required
                      />
                    </div>
                    <div className="flex flex-col">
                      <Label htmlFor={`price-${index}`} className="text-sm font-medium text-white mb-2">
                        Unit Price
                      </Label>
                      <Input
                        type="number"
                        id={`price-${index}`}
                        name="unit_price"
                        value={purchase.unit_price}
                        onChange={(e) => handlePurchaseChange(index, e)}
                        className="bg-slate-600 border-slate-500 text-white focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter unit price"
                        required
                      />
                    </div>
                  </div>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleRemovePurchase(index)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Purchase
                    </Button>
                  )}
                </div>
              ))}

<div className="flex flex-col">
          <Label htmlFor="method" className="text-sm font-medium text-white mb-2">
            Payment Method
          </Label>
          <Select onValueChange={handleMethodChange} value={formData.method}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="cash" className="text-white">Cash</SelectItem>
              <SelectItem value="cheque" className="text-white">Cheque</SelectItem>
              <SelectItem value="credit" className="text-white">Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.method === "cheque" && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className="flex flex-col">
              <Label htmlFor="cheque_number" className="text-sm font-medium text-white mb-2">
                Cheque Number
              </Label>
              <Input
                type="text"
                id="cheque_number"
                name="cheque_number"
                value={formData.cheque_number}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="cashout_date" className="text-sm font-medium text-white mb-2">
                Cheque Date
              </Label>
              <Input
                type="date"
                id="cashout_date"
                name="cashout_date"
                value={formData.cashout_date}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
        )}


              <Button type="button" onClick={handleAddPurchase} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Another Purchase
              </Button>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!hasFormChanged() || subLoading}
              >
                Update Purchase Transaction
              </Button>

              

            </form>

            <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white mt-5"
                onClick={(e)=>{handleReturn(e)}}
                disabled={returns.length === 0 || subLoading}
              >
                Return Purchase
              </Button>


            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  className="w-full bg-red-600 mt-6 hover:bg-red-700 text-white"
                >
                  Delete Transaction
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    This action cannot be undone. This will permanently delete your transaction
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <Button 
                  type="button" 
                  className="w-full bg-red-600 mt-6 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Delete Transaction
                </Button>
              </DialogContent>
            </Dialog>

            

            {/* Add New Phone Dialog */}
            <Dialog open={showNewPhoneDialog} onOpenChange={setShowNewPhoneDialog}>
              <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Phone</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Enter the details of the new phone you want to add.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPhoneName" className="text-right text-white">
                      Name
                    </Label>
                    <Input
                      id="newPhoneName"
                      name="name"
                      value={newPhoneData.name}
                      onChange={handleNewPhoneChange}
                      className="col-span-3 bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter phone name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newPhoneBrand" className="text-right text-white">
                      Brand
                    </Label>
                    <div className="col-span-3">
                      <Popover open={openBrand} onOpenChange={setOpenBrand}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openBrand}
                            className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          >
                            {newPhoneData.brand
                              ? brands.find((brand) => brand.id.toString() === newPhoneData.brand)?.name
                              : "Select a brand..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-slate-700 border-slate-600">
                          <Command className="bg-slate-700 border-slate-600">
                            <CommandInput placeholder="Search brand..." className="bg-slate-700 text-white" />
                            <CommandList className="max-h-[200px] overflow-auto">
                              <CommandEmpty>No brand found.</CommandEmpty>
                              <CommandGroup>
                                {brands.map((brand) => (
                                  <CommandItem
                                    key={brand.id}
                                    onSelect={() => handleNewPhoneBrandChange(brand.id.toString())}
                                    className="text-white hover:bg-slate-600"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        newPhoneData.brand === brand.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {brand.name}
                                  </CommandItem>
                                ))}
                                <CommandItem onSelect={() => handleNewPhoneBrandChange('new')} className="text-white hover:bg-slate-600">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add a new brand
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
                  <Button type="button" onClick={handleAddPhone} className="bg-green-600 hover:bg-green-700 text-white">Add Phone</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add New Vendor Dialog */}
            <Dialog open={showNewVendorDialog} onOpenChange={setShowNewVendorDialog}>
              <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Vendor</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Enter the details of the new vendor you want to add.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newVendorName" className="text-right text-white">
                      Name
                    </Label>
                    <Input
                      id="newVendorName"
                      name="name"
                      value={newVendorData.name}
                      onChange={handleNewVendorChange}
                      className="col-span-3 bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter vendor name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="newVendorBrand" className="text-right text-white">
                      Brand
                    </Label>
                    <div className="col-span-3">
                      <Popover open={openBrand} onOpenChange={setOpenBrand}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openBrand}
                            className="w-full justify-between bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          >
                            {newVendorData.brand
                              ? brands.find((brand) => brand.id.toString() === newVendorData.brand)?.name
                              : "Select a brand..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 bg-slate-700 border-slate-600">
                          <Command className="bg-slate-700 border-slate-600">
                            <CommandInput placeholder="Search brand..." className="bg-slate-700 text-white" />
                            <CommandList className="max-h-[200px] overflow-auto">
                              <CommandEmpty>No brand found.</CommandEmpty>
                              <CommandGroup>
                                {brands.map((brand) => (
                                  <CommandItem
                                    key={brand.id}
                                    onSelect={() => handleNewVendorBrandChange(brand.id.toString())}
                                    className="text-white hover:bg-slate-600"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        newVendorData.brand === brand.id.toString() ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {brand.name}
                                  </CommandItem>
                                ))}
                                <CommandItem onSelect={() => handleNewVendorBrandChange('new')} className="text-white hover:bg-slate-600">
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add a new brand
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
                  <Button type="button" onClick={handleAddVendor} className="bg-green-600 hover:bg-green-700 text-white">Add Vendor</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add New Brand Dialog */}
            <Dialog open={showNewBrandDialog} onOpenChange={setShowNewBrandDialog}>
              <DialogContent className="sm:max-w-[425px] bg-slate-800 text-white">
                <DialogHeader>
                  <DialogTitle>Add New Brand</DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Enter the name of the new brand you want to add.
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
                      onChange={handleNewBrandChange}
                      className="col-span-3 bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleAddBrand} className="bg-green-600 hover:bg-green-700 text-white">Add Brand</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPurchaseTransactionForm;