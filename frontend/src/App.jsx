import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { useSelector } from "react-redux";
import ProtectedRoute from "./redux/protectedRoute";
import UserRegister from "./pages/userRegister";
import { InventoryPageComponent } from "./pages/inventory-page";
import BrandPhones from "./pages/singleBrand";
import PurchaseTransactions from "./pages/purchase";
import PurchaseTransactionForm from "./components/purchase-transaction-form";
import SinglePhone from "./pages/singlePhone";
import SalesTransactionForm from "./components/sales-transaction-form";
import SalesTransactions from "./pages/sales";
import SchemePageComponent from "./pages/schemes";
import BrandSchemePage from "./pages/brandscheme";
import SchemeForm from "./components/scheme-form";
import SingleScheme from "./pages/singlescheme";
import PPPageComponent from "./pages/priceprotection";
import BrandPPPage from "./pages/brandpp";
import SinglePP from "./pages/singlepp";
import PriceProtectionForm from "./components/price-protection-form";
import LandingPage from "./components/landing-page";
import { VendorPage } from "./pages/vendors";
import VendorBrand from "./pages/vendorsbrand";
import EditPurchaseTransactionForm from "./components/editpurchase";
import EditSalesTransactionForm from "./components/editsales";
import EditSchemeForm from "./components/editschemes";
import EditPriceProtectionForm from "./components/editpp";
import VendorForm from "./components/postVendors";
import VendorTransactions from "./pages/vendortransactions";
import VendorTransactionForm from "./pages/vendortransactionform";
import EditVendorTransactionForm from "./components/editvendortransaction";
import AllLandingPage from "./pages/allLandingPage";
import AllPurchaseTransactions from "./pages/allPurchase";
import AllPurchaseTransactionForm from "./components/allpurchasetransactionform";
import EditAllPurchaseTransactionForm from "./components/editallpurchase";
import {AllInventoryPageComponent} from "./pages/allInventoryPage";
import AllBrandProducts from "./pages/allsinglebrand";
import AllSalesTransactions from "./pages/allSales";
import AllSalesTransactionForm from "./components/allsalestransactionform";
import useGlobalKeyPress from "./hooks/globalKeyPress";
import AllVendorPage  from "./pages/allvendors";
import EditAllSalesTransactionForm from "./components/editallsales";
import AllVendorTransactions from "./pages/allvendortransactions";
import AllVendorTransactionForm from "./pages/allvendortransactionform";
import EditAllVendorTransactionForm from "./components/editallvendortransactions";
import PurchaseReturns from "./pages/purchaseReturn";
import SalesReturns from "./pages/salesReturns";
import SalesReport from "./pages/salesReport";
import AllSalesReport from "./pages/allSalesReport";
import AllPurchaseReturns from "./pages/allPurchaseReturn";
import InvoicePage from "./pages/invoicePage";
import EditProductForm from "./components/editProductForm";
import AllSalesReturns from "./pages/allSalesReturn";
import StaffPage from "./pages/staffs";
import BranchSelectionPage from "./pages/branchSelect";
import AllBranchSelectionPage from "./pages/allBranchSelect";
import StaffTransactions from "./pages/stafftransactions";
import StaffTransactionForm from "./pages/staffTransactionForm";
import StaffTransactionEditForm from "./pages/editStaffTransactionForm";
import EditPhoneForm from "./components/editPhoneForm";
import AllDebtorsPage from "./pages/allDebtorsPage";
import AllDebtorTransactions from "./pages/allDebtorTransactions";
import EditDebtorTransactionForm from "./pages/editAllDebtors";
import DebtorTransactionForm from "./pages/allDebtorTransactionForm";
import EMIDebtorsPage from "./pages/emiDebtors";
import EMIDebtorTransactions from "./pages/emiDebtorsTransaction";
import EMIDebtorTransactionForm from "./pages/emiDebtorsTransactionForm";
import EditEMIDebtorTransaction from "./pages/editEmiDebtorTransactions";
import AllVendorStatementPage from "./pages/allVendorStatementPage";
import AllDebtorStatementPage from "./pages/allDebtorStatementPage";


function App() {
  const { isAuthenticated } = useSelector((state) => state.root);
  useGlobalKeyPress();
  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        {/* All Landing Page */}
        <Route path="/" element={<AllLandingPage />} />

        <Route path="/purchases" element={<AllBranchSelectionPage pageName="purchases" />} />
        <Route path="/purchases/branch/:branchId" element={<AllPurchaseTransactions />} />

        <Route path="/purchases/form/branch/:branchId" element={<AllPurchaseTransactionForm />} />
        <Route path="purchases/branch/:branchId/editform/:purchaseId" element={<EditAllPurchaseTransactionForm />} />

        <Route path = "purchase-returns" element = {<AllBranchSelectionPage pageName="purchase-returns" />}/>
        <Route path = "purchase-returns/branch/:branchId" element = {<AllPurchaseReturns/>}/>


        <Route path="inventory" element={<AllBranchSelectionPage pageName="inventory" />} />
        <Route path="inventory/branch/:branchId" element={<AllInventoryPageComponent />} />

        <Route path="inventory/branch/:branchId/brand/:id" element={<AllBrandProducts />} />
        <Route path="/inventory/branch/:branchId/editproduct/:productId" element={<EditProductForm/>} />



        <Route path="brand/:id" element={<AllBrandProducts />} />

        <Route path="sales" element={<AllBranchSelectionPage pageName="sales" />} />
        <Route path="sales/branch/:branchId" element={<AllSalesTransactions />} />

        <Route path="sales/form/branch/:branchId" element={<AllSalesTransactionForm />} />
        <Route path="sales/branch/:branchId/editform/:salesId" element={<EditAllSalesTransactionForm />} />

        <Route path = "sales-returns" element = {<AllBranchSelectionPage pageName="sales-returns" />}/>
        <Route path = "sales-returns/branch/:branchId" element = {<AllSalesReturns/>}/>

        <Route path = "sales-report" element = {<AllBranchSelectionPage pageName="sales-report" />}/>
        <Route path = "sales-report/branch/:branchId" element = {<AllSalesReport/>}/>

        <Route path = "staff" element = {<AllBranchSelectionPage pageName="staff" />}/>
        <Route path = "staff/branch/:branchId" element = {<StaffPage/>}/>




        <Route path="vendors/" element={<AllBranchSelectionPage pageName="vendors" />} />
        <Route path="vendors/statement/:vendorId" element={<AllVendorStatementPage />} />
        <Route path="vendors/branch/:branchId" element={<AllVendorPage />} />
        {/* <Route path="vendors/branch/:branchId/brand/:id" element={<AllVendorBrand />} /> */}

        <Route path="invoice/:transactionId" element={<InvoicePage />} />


        <Route path="vendor-transactions" element={<AllBranchSelectionPage pageName="vendor-transactions" />} />

        <Route path="vendor-transactions/branch/:branchId" element={<AllVendorTransactions />}/>
        <Route path="vendor-transactions/branch/:branchId/form" element={<AllVendorTransactionForm />} />
        <Route path="vendor-transactions/branch/:branchId/editform/:vendorTransactionId" element={<EditAllVendorTransactionForm />} />

        <Route path = "staff-transactions" element = {<AllBranchSelectionPage pageName="staff-transactions" />}/>
        <Route path = "staff-transactions/branch/:branchId" element = {<StaffTransactions />}/>
        <Route path = "staff-transactions/:id" element = {<StaffTransactions />}/> 
        <Route path = "staff-transactions/branch/:branchId/form" element = {<StaffTransactionForm />}/>
        <Route path = "staff-transactions/branch/:branchId/editform/:id" element = {<StaffTransactionEditForm />}/> 

        <Route path="debtors" element={<AllBranchSelectionPage pageName="debtors" />} />
        <Route path="debtors/branch/:branchId" element={<AllDebtorsPage />} />
        <Route path="debtor-transactions" element={<AllBranchSelectionPage pageName="debtor-transactions" />} />
        <Route path="debtor-transactions/branch/:branchId" element={<AllDebtorTransactions />} />
        <Route path="debtor-transactions/branch/:branchId/form" element={<DebtorTransactionForm />} />
        <Route path="debtor-transactions/branch/:branchId/editform/:debtorTransactionId" element={<EditDebtorTransactionForm />} />
        <Route path="debtors/statement/:debtorId" element={<AllDebtorStatementPage />} />


        {/* Mobile Section */}
        <Route path="/mobile" >
          <Route path="" element={<LandingPage />} />
          <Route path="inventory" element={<BranchSelectionPage pageName="inventory" />} />
          <Route path="inventory/branch/:branchId" element={<InventoryPageComponent />} />
          {/* <Route path="inventory" element={<InventoryPageComponent />} /> */}
          <Route path="inventory/branch/:branchId/brand/:id" element={<BrandPhones />} />
          {/* <Route path="brand/:id" element={<BrandPhones />} /> */}
          <Route path="phone/:id" element={<SinglePhone />} />
          <Route path="inventory/edit-phone/:phoneId" element={<EditPhoneForm />} />

          {/* Purchases Section */}
          <Route path="purchases" element={<BranchSelectionPage pageName="purchases" />} />
          <Route path="purchases/branch/:branchId" element={<PurchaseTransactions />} />
          <Route path="purchases/form/branch/:branchId" element={<PurchaseTransactionForm />} />
          <Route path="purchases/branch/:branchId/editform/:purchaseId" element={<EditPurchaseTransactionForm />} />

          <Route path="purchase-returns" element={<BranchSelectionPage pageName="purchase-returns" />} />
          <Route path="purchase-returns/branch/:branchId" element={<PurchaseReturns />} />

          {/* Sales Section */}
          <Route path="sales" element={<BranchSelectionPage pageName="sales" />} />
          <Route path="sales/branch/:branchId" element={<SalesTransactions />} />
          <Route path="sales/form/branch/:branchId" element={<SalesTransactionForm />} />
          <Route path="sales/branch/:branchId/editform/:salesId" element={<EditSalesTransactionForm />} />

          <Route path="sales-returns" element={<BranchSelectionPage pageName="sales-returns" />} />
          <Route path="sales-returns/branch/:branchId" element={<SalesReturns />} />

          {/* Schemes Section */}
          <Route path="schemes" element={<BranchSelectionPage pageName="schemes" />} />
          <Route path="schemes/branch/:branchId" element={<SchemePageComponent />} />
          <Route path="schemes/branch/:branchId/brand/:id" element={<BrandSchemePage />} />
          <Route path="schemes/branch/:branchId/new" element={<SchemeForm />} />
          <Route path="schemes/:id" element={<SingleScheme />} />
          <Route path="schemes/branch/:branchId/editform/:schemeId" element={<EditSchemeForm />} />
        
          {/* <Route path="schemes/brand/:id" element={<BrandSchemePage />} />
          <Route path="schemes/new" element={<SchemeForm />} />
          <Route path="schemes/:id" element={<SingleScheme />} />
          <Route path="schemes/editform/:schemeId" element={<EditSchemeForm />} /> */}

          {/* Price Protection Section */}

          <Route path="price-protection" element={<BranchSelectionPage pageName="price-protection" />} />
          <Route path="price-protection/branch/:branchId" element={<PPPageComponent />} />
          <Route path="price-protection/branch/:branchId/brand/:id" element={<BrandPPPage />} />
          <Route path="price-protection/:id" element={<SinglePP />} />
          <Route path="price-protection/branch/:branchId/new" element={<PriceProtectionForm />} />
          <Route path="price-protection/editform/:priceProtectionId" element={<EditPriceProtectionForm />} />

          {/* Vendors Section */}
          <Route path="vendors" element={<BranchSelectionPage pageName="vendors" />} />
          <Route path="vendors/branch/:branchId" element={<VendorPage />} />
          
          <Route path="vendors/branch/:branchId/brand/:id" element={<VendorBrand />} />

          <Route path="vendor-transactions" element={<BranchSelectionPage pageName="vendor-transactions" />} />
          <Route path="vendor-transactions/branch/:branchId" element={<VendorTransactions />} />
          <Route path="vendor-transactions/branch/:branchId/form" element={<VendorTransactionForm />} />
          <Route path="vendor-transactions/branch/:branchId/editform/:vendorTransactionId" element={<EditVendorTransactionForm />} />

          <Route path="emi" element={<BranchSelectionPage pageName="emi" />} />
          <Route path="emi/branch/:branchId" element={<EMIDebtorsPage />} />

          <Route path = "emi-transactions" element = {<BranchSelectionPage pageName="emi-transactions" />}/>
          <Route path = "emi-transactions/branch/:branchId" element = {<EMIDebtorTransactions/>}/>
          <Route path="emi-transactions/branch/:branchId/form" element={<EMIDebtorTransactionForm />} />
          <Route path="emi-transactions/branch/:branchId/editform/:transactionId" element={<EditEMIDebtorTransaction />} />

          <Route path = "sales-report" element = {<BranchSelectionPage pageName="sales-report" />}/>
          <Route path = "sales-report/branch/:branchId" element = {<SalesReport/>}/>
          </Route>

     
      </Route>

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<UserRegister />} />
    </Routes>
  );
}

export default App;
