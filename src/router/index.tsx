import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import OrganisationGuard from "../components/OrganisationGuard";
import { CustomerList } from "../pages/Customers/customerList";
import { CustomerAdd } from "../pages/Customers/customerAdd";
import { ItemList } from "../pages/Items/ItemList";
import { ItemAdd } from "../pages/Items/ItemAdd";
import { SalesmanList } from "../pages/Salesman/SalesmanList";
import SalesmanAdd from "../pages/Salesman/SalesmanAdd";
import SalesmanProvider from "../providers/SalesmanProvider";
import CustomerProvider from "../providers/CustomerProvider";
import ItemProvider from "../providers/ItemProvider";
import BeatProvider from "../providers/BeatProvider";
import OrderProvider from "../providers/OrderProvider";
import DeliveryProvider from "../providers/DeliveryProvider";
import InvoiceProvider from "../providers/InvoiceProvider";
import { JourneyPlanList } from "../pages/JourneyPlans/JourneyPlanList";
import { JourneyPlanAddPage } from "../pages/JourneyPlans/JourneyPlanAddPage";
import { OrderList } from "../pages/Orders/OrderList";
import { PricingList } from "../pages/Pricings/PricingList";
import { PricingAdd } from "../pages/Pricings/PricingAdd";
import { PromotionList } from "../pages/Promotion/PromotionList";
import { PromotionAdd } from "../pages/Promotion/PromotionAdd";
import { DiscountList } from "../pages/Discount/DiscountList";
import { DiscountAdd } from "../pages/Discount/DiscountAdd";
import { OrderAdd } from "../pages/Orders/OrderAdd";
import { DeliveryList } from "../pages/Deliveries/DeliveryList";
import { DeliveryAdd } from "../pages/Deliveries/DeliveryAdd";
import { InvoiceList } from "../pages/Invoices/InvoiceList";
import { InvoiceAdd } from "../pages/Invoices/InvoiceAdd";
import { CreditNoteList } from "../pages/CreditNotes/CreditNoteList";
import { CreditNoteAdd } from "../pages/CreditNotes/CreditNoteAdd";
import { DebitNoteList } from "../pages/DebitNotes/debitNoteList";
import { DebitNoteAdd } from "../pages/DebitNotes/DebitNoteAdd";
import { ReturnList } from "../pages/Returns/ReturnList";
import { CampaignList } from "../pages/Campaign/CampaignList";
import { PlanogramList } from "../pages/Planogram/PlanogramList";
import { ShelfDisplayList } from "../pages/ShelfDisplay/ShelfDisplayList";
import { AssetTrackingList } from "../pages/AssetTracking/AssetTrackingList";
import { SensorySurveyList } from "../pages/Surveys/sensorySurveyList";
import { ConsumerSurveyList } from "../pages/Surveys/consumerSurveyList";
import { SalesmanLoadList } from "../pages/SalesmanLoad/SalesmanLoadList";
import { SalesmanUnloadList } from "../pages/SalesmanUnload/SalesmanUnloadList";
import { GRNList } from "../pages/GRN/GRNList";
import { GRNAdd } from "../pages/GRN/GRNAdd";
import { PalletList } from "../pages/Pallet/PalletList";
import { Dashboard } from "../pages/Dashboard";
import { CompetitorInfoList } from "../pages/CompetitorInfos/CompetitorInfoList";
import { ComplaintFeedbackList } from "../pages/ComplaintFeedbacks/ComplaintFeedbackList";
import { StockInStoreList } from "../pages/StockInStores/StockInStoreList";
import { PortfolioManagementList } from "../pages/PortfolioManagements/PortfolioManagementList";
import { RouteItemGroupingList } from "../pages/RouteItemGroupings/RouteItemGroupingList";
import { PricingCheckList } from "../pages/PricingCheck/PricingCheckList";
import { MarketPromotionList } from "../pages/MarketPromotion/MarketPromotionList";
import { ReportsLayout } from "../pages/Reports/ReportsLayout";

// Settings Imports
import { UsersRolesList } from "../pages/Settings/UsersRoles/UsersRolesList";
import { TaxesList } from "../pages/Settings/Taxes/TaxesList";
import { CurrencyList } from "../pages/Settings/Currency/CurrencyList";
import { BankList } from "../pages/Settings/Bank/BankList";
import { WarehouseList } from "../pages/Settings/Warehouse/WarehouseList";
import { CountryList } from "../pages/Settings/Country/CountryList";
import { RegionList } from "../pages/Settings/Region/RegionList";
import { DepotList } from "../pages/Settings/Depot/DepotList";
import { VanList } from "../pages/Settings/Van/VanList";
import { RouteList } from "../pages/Settings/Route/RouteList";
import { OutletProductCodeList } from "../pages/Settings/OutletProductCode/OutletProductCodeList";
import { ItemGroupList } from "../pages/Settings/ItemGroup/ItemGroupList";
import { ItemUomList } from "../pages/ItemUom/ItemUomList";
import { ReasonList } from "../pages/Settings/Reason/ReasonList";
import { ZoneList } from "../pages/Settings/Zone/ZoneList";
import { MerchandiserReplacementList } from "../pages/Settings/MerchandiserReplacement/MerchandiserReplacementList";
import { DriverReplacementList } from "../pages/Settings/DriverReplacement/DriverReplacementList";
import { BeatList } from "../pages/Beats/BeatList";
import CreditLimitList from "../pages/Settings/CreditLimit/CreditLimitList";
import TaxProvider from '../providers/TaxProvider';
import CurrencyProvider from '../providers/CurrencyProvider';
import BankProvider from '../providers/BankProvider';
import CountryProvider from '../providers/CountryProvider';
import RegionProvider from '../providers/RegionProvider';
import VanProvider from '../providers/VanProvider';
import DepotProvider from '../providers/DepotProvider';
import RouteProvider from '../providers/RouteProvider';
import ItemGroupProvider from '../providers/ItemGroupProvider';
import ReasonProvider from '../providers/ReasonProvider';
import ZoneProvider from '../providers/ZoneProvider';
import ItemUomProvider from '../providers/ItemUomProvider';
import WarehouseProvider from '../providers/WarehouseProvider';
import OutletProductCodeProvider from '../providers/OutletProductCodeProvider';
import MerchandiserReplacementProvider from '../providers/MerchandiserReplacementProvider';
import DriverReplacementProvider from '../providers/DriverReplacementProvider';
import CreditLimitProvider from '../providers/CreditLimitProvider';
import Login from "../pages/Authentication/Login";
import Register from "../pages/Authentication/Register";
import { OrganisationAdd } from "../pages/Organisation/OrganisationAdd";
import { OrganisationView } from "../pages/Organisation/OrganisationView";
// import { OrderAdd } from "../pages/Orders/orderAdd";
// import { OrderList } from "../pages/Orders/orderList";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: (
      <OrganisationGuard>
        <Layout>
          <Dashboard />
        </Layout>
      </OrganisationGuard>
    ),
  },
  // Master
  {
    path: "/customer",
    element: (
      <Layout>
        <CustomerProvider>
          <CustomerList />
        </CustomerProvider>
      </Layout>
    ),
  },
  {
    path: "/customer/add",
    element: (
      <Layout>
        <CustomerProvider>
          <CustomerAdd
            isOpen={true}
            onClose={() => window.history.back()}
            onEvent={(event) => {
              if (event.eventType === 'CustomerSaved') {
                window.history.back();
              }
            }}
          />
        </CustomerProvider>
      </Layout>
    ),
  },
  {
    path: "/item",
    element: (
      <Layout>
        <ItemProvider>
          <ItemList />
        </ItemProvider>
      </Layout>
    ),
  },
  {
    path: "/item/add",
    element: (
      <Layout>
        <ItemProvider>
          <ItemAdd
            isOpen={true}
            onClose={() => window.history.back()}
            onSubmit={(data) => console.log('Item data:', data)}
          />
        </ItemProvider>
      </Layout>
    ),
  },
  {
    path: "/salesman",
    element: (
      <Layout>
        <SalesmanProvider>
          <SalesmanList />
        </SalesmanProvider>
      </Layout>
    ),
  },
  {
    path: "/salesman/add",
    element: (
      <Layout>
        <SalesmanProvider>
          <SalesmanAdd
            isOpen={true}
            onClose={() => window.history.back()}
            onEvent={(event) => {
              if (event.eventType === 'SalesmanSaved') {
                console.log('Salesman data:', event.salesman);
                window.history.back();
              }
            }}
          />
        </SalesmanProvider>
      </Layout>
    ),
  },
  {
    path: "/journey-plan",
    element: (
      <Layout>
        <JourneyPlanList />
      </Layout>
    ),
  },
  {
    path: "/journey-plan/add",
    element: (
      <Layout>
        <JourneyPlanAddPage />
      </Layout>
    ),
  },
  {
    path: "/beat",
    element: (
      <Layout>
        <BeatProvider>
          <BeatList />
        </BeatProvider>
      </Layout>
    ),
  },
  // Pricing
  {
    path: "/pricing",
    element: (
      <Layout>
        <PricingList />
      </Layout>
    ),
  },
  {
    path: "/pricing/add",
    element: (
      <Layout>
        <PricingAdd />
      </Layout>
    ),
  },
  {
    path: "/promotion",
    element: (
      <Layout>
        <PromotionList />
      </Layout>
    ),
  },
  {
    path: "/promotion/add",
    element: (
      <Layout>
        <PromotionAdd />
      </Layout>
    ),
  },
  {
    path: "/discount",
    element: (
      <Layout>
        <DiscountList />
      </Layout>
    ),
  },
  {
    path: "/discount/add",
    element: (
      <Layout>
        <DiscountAdd />
      </Layout>
    ),
  },
  // Sales Transaction
  {
    path: "/order",
    element: (
      <Layout>
        <OrderProvider>
          <OrderList />
        </OrderProvider>
      </Layout>
    ),
  },
  {
    path: "/order/add",
    element: (
      <Layout>
        <OrderProvider>
          <OrderAdd />
        </OrderProvider>
      </Layout>
    ),
  },
  {
    path: "/delivery",
    element: (
      <Layout>
        <DeliveryProvider>
          <DeliveryList />
        </DeliveryProvider>
      </Layout>
    ),
  },
  {
    path: "/delivery/add",
    element: (
      <Layout>
        <DeliveryProvider>
          <DeliveryAdd />
        </DeliveryProvider>
      </Layout>
    ),
  },
  {
    path: "/invoice",
    element: (
      <Layout>
        <InvoiceProvider>
          <InvoiceList />
        </InvoiceProvider>
      </Layout>
    ),
  },
  {
    path: "/invoice/add",
    element: (
      <Layout>
        <InvoiceProvider>
          <InvoiceAdd />
        </InvoiceProvider>
      </Layout>
    ),
  },
  {
    path: "/credit-note",
    element: (
      <Layout>
        <CreditNoteList />
      </Layout>
    ),
  },
  {
    path: "/credit-note/add",
    element: (
      <Layout>
        <CreditNoteAdd />
      </Layout>
    ),
  },
  {
    path: "/debit-note",
    element: (
      <Layout>
        <DebitNoteList />
      </Layout>
    ),
  },
  {
    path: "/debit-note/add",
    element: (
      <Layout>
        <DebitNoteAdd />
      </Layout>
    ),
  },
  {
    path: "/return",
    element: (
      <Layout>
        <ReturnList />
      </Layout>
    ),
  },
  {
    path: "/route-item-grouping",
    element: (
      <Layout>
        <RouteItemGroupingList />
      </Layout>
    ),
  },
  {
    path: "/portfolio-management",
    element: (
      <Layout>
        <PortfolioManagementList />
      </Layout>
    ),
  },
  {
    path: "/stock-in-store",
    element: (
      <Layout>
        <StockInStoreList />
      </Layout>
    ),
  },
  {
    path: "/complaint-feedback",
    element: (
      <Layout>
        <ComplaintFeedbackList />
      </Layout>
    ),
  },
  {
    path: "/competitor-info",
    element: (
      <Layout>
        <CompetitorInfoList />
      </Layout>
    ),
  },
  // Merchandising
  {
    path: "/campaign",
    element: (
      <Layout>
        <CampaignList />
      </Layout>
    ),
  },
  {
    path: "/planogram",
    element: (
      <Layout>
        <PlanogramList />
      </Layout>
    ),
  },
  {
    path: "/shelf-display",
    element: (
      <Layout>
        <ShelfDisplayList />
      </Layout>
    ),
  },
  {
    path: "/asset-tracking",
    element: (
      <Layout>
        <AssetTrackingList />
      </Layout>
    ),
  },
  // Survey
  {
    path: "/sensory-survey",
    element: (
      <Layout>
        <SensorySurveyList />
      </Layout>
    ),
  },
  {
    path: "/consumer-survey",
    element: (
      <Layout>
        <ConsumerSurveyList />
      </Layout>
    ),
  },
  // SOS
  {
    path: "/pricing-check",
    element: (
      <Layout>
        <PricingCheckList />
      </Layout>
    ),
  },
  {
    path: "/market-promotion",
    element: (
      <Layout>
        <MarketPromotionList />
      </Layout>
    ),
  },
  // Sales Operations
  {
    path: "/salesman-load",
    element: (
      <Layout>
        <SalesmanLoadList />
      </Layout>
    ),
  },
  {
    path: "/salesman-unload",
    element: (
      <Layout>
        <SalesmanUnloadList />
      </Layout>
    ),
  },
  {
    path: "/grn",
    element: (
      <Layout>
        <GRNList />
      </Layout>
    ),
  },
  {
    path: "/grn/add",
    element: (
      <Layout>
        <GRNAdd />
      </Layout>
    ),
  },
  // Settings
  {
    path: "/settings/users-roles",
    element: (
      <Layout>
        <UsersRolesList />
      </Layout>
    ),
  },
  {
    path: "/settings/beat",
    element: (
      <Layout>
        <BeatProvider>
          <BeatList />
        </BeatProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/taxes",
    element: (
      <Layout>
        <TaxProvider>
          <TaxesList />
        </TaxProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/currency",
    element: (
      <Layout>
        <CurrencyProvider>
          <CurrencyList />
        </CurrencyProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/bank",
    element: (
      <Layout>
        <BankProvider>
          <BankList />
        </BankProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/warehouse",
    element: (
      <Layout>
        <WarehouseProvider>
          <WarehouseList />
        </WarehouseProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/country",
    element: (
      <Layout>
        <CountryProvider>
          <CountryList />
        </CountryProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/region",
    element: (
      <Layout>
        <RegionProvider>
          <RegionList />
        </RegionProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/branch-depot",
    element: (
      <Layout>
        <DepotProvider>
          <DepotList />
        </DepotProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/van-master",
    element: (
      <Layout>
        <VanProvider>
          <VanList />
        </VanProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/route",
    element: (
      <Layout>
        <RouteProvider>
          <RouteList />
        </RouteProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/outlet-product-code",
    element: (
      <Layout>
        <OutletProductCodeProvider>
          <OutletProductCodeList />
        </OutletProductCodeProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/item-group",
    element: (
      <Layout>
        <ItemGroupProvider>
          <ItemGroupList />
        </ItemGroupProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/uom",
    element: (
      <Layout>
        <ItemUomProvider>
          <ItemUomList />
        </ItemUomProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/reason",
    element: (
      <Layout>
        <ReasonProvider>
          <ReasonList />
        </ReasonProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/zone",
    element: (
      <Layout>
        <ZoneProvider>
          <ZoneList />
        </ZoneProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/merchandiser-replacement",
    element: (
      <Layout>
        <MerchandiserReplacementProvider>
          <MerchandiserReplacementList />
        </MerchandiserReplacementProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/driver-replacement",
    element: (
      <Layout>
        <DriverReplacementProvider>
          <DriverReplacementList />
        </DriverReplacementProvider>
      </Layout>
    ),
  },
  {
    path: "/settings/credit-limits",
    element: (
      <Layout>
        <CreditLimitProvider>
          <CreditLimitList />
        </CreditLimitProvider>
      </Layout>
    ),
  },
  // Logistics
  {
    path: "/pallet",
    element: (
      <Layout>
        <PalletList />
      </Layout>
    ),
  },
  // Reports - Nested Routes (No Layout - full width with own sidebar)
  {
    path: "/reports/*",
    element: <ReportsLayout />,
  },
  // Authentication (No Layout - standalone pages)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  // Organisation Setup (Protected but no organisation completion check)
  {
    path: "/organisation/add",
    element: (
      <ProtectedRoute>
        <OrganisationAdd />
      </ProtectedRoute>
    ),
  },
  {
    path: "/organisation/view",
    element: (
      <Layout>
        <OrganisationView />
      </Layout>
    ),
  },
  // Placeholder routes
  {
    path: "/*",
    element: (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Page Coming Soon</h1>
          <p className="text-[var(--text-secondary)] mt-2">This page is under construction.</p>
        </div>
      </Layout>
    ),
  },
])