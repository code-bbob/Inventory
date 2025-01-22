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
import { AllVendorPage } from "./pages/allvendors";
import AllVendorBrand from "./pages/allvendorsbrand";
import EditAllSalesTransactionForm from "./components/editallsales";
import AllVendorTransactions from "./pages/allvendortransactions";
import AllVendorTransactionForm from "./pages/allvendortransactionform";
import EditAllVendorTransactionForm from "./components/editallvendortransactions";
import BarCh from "./components/barchart";
import LineGraph from "./components/linegraph";
import SalesDashboard from "./components/salesdashboard";
// import VendorTransactionForm from './pages/transaction-vendors';
import Portfolio from "./pages/portfolio";

function App() {
  const { isAuthenticated } = useSelector((state) => state.root);
  useGlobalKeyPress();
  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        {/* All Landing Page */}
        <Route path="/" element={<AllLandingPage />} />

        <Route path="/purchases" element={<AllPurchaseTransactions />} />
        <Route path="/purchases/form" element={<AllPurchaseTransactionForm />} />
        <Route path="purchases/editform/:purchaseId" element={<EditAllPurchaseTransactionForm />} />

        <Route path="inventory" element={<AllInventoryPageComponent />} />

        <Route path="brand/:id" element={<AllBrandProducts />} />

        <Route path="sales" element={<AllSalesTransactions />} />
        <Route path="sales/form" element={<AllSalesTransactionForm />} />
        <Route path="sales/editform/:salesId" element={<EditAllSalesTransactionForm />} />


        <Route path="vendors" element={<AllVendorPage />} />
        <Route path="vendors/brand/:id" element={<AllVendorBrand />} />

        
        <Route path="vendor-transactions" element={<AllVendorTransactions />}/>
        <Route path="vendor-transactions/form" element={<AllVendorTransactionForm />} />
        <Route path="vendor-transactions/editform/:vendorTransactionId" element={<EditAllVendorTransactionForm />} />

        
        <Route path = "bar" element={<BarCh/>}/>
        <Route path = "line" element={<LineGraph/>}/>
        <Route path = "charts" element = {<SalesDashboard/>}/>

        <Route path = "portfolio" element = {<Portfolio/>}/>




        {/* Mobile Section */}
        <Route path="/mobile" >
          <Route path="" element={<LandingPage />} />
          <Route path="inventory" element={<InventoryPageComponent />} />
          <Route path="brand/:id" element={<BrandPhones />} />
          <Route path="phone/:id" element={<SinglePhone />} />

          {/* Purchases Section */}
          <Route path="purchases" element={<PurchaseTransactions />} />
          <Route path="purchases/form" element={<PurchaseTransactionForm />} />
          <Route path="purchases/editform/:purchaseId" element={<EditPurchaseTransactionForm />} />

          {/* Sales Section */}
          <Route path="sales" element={<SalesTransactions />} />
          <Route path="sales/form" element={<SalesTransactionForm />} />
          <Route path="sales/editform/:salesId" element={<EditSalesTransactionForm />} />

          {/* Schemes Section */}
          <Route path="schemes" element={<SchemePageComponent />} />
          <Route path="schemes/brand/:id" element={<BrandSchemePage />} />
          <Route path="schemes/new" element={<SchemeForm />} />
          <Route path="schemes/:id" element={<SingleScheme />} />
          <Route path="schemes/editform/:schemeId" element={<EditSchemeForm />} />

          {/* Price Protection Section */}
          <Route path="price-protection" element={<PPPageComponent />} />
          <Route path="price-protection/brand/:id" element={<BrandPPPage />} />
          <Route path="price-protection/:id" element={<SinglePP />} />
          <Route path="price-protection/new" element={<PriceProtectionForm />} />
          <Route path="price-protection/editform/:priceProtectionId" element={<EditPriceProtectionForm />} />

          {/* Vendors Section */}
          <Route path="vendors" element={<VendorPage />} />
          <Route path="vendors/brand/:id" element={<VendorBrand />} />

          <Route path="vendor-transactions" element={<VendorTransactions />}/>
          <Route path="vendor-transactions/form" element={<VendorTransactionForm />} />
          <Route path="vendor-transactions/editform/:vendorTransactionId" element={<EditVendorTransactionForm />} />
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
