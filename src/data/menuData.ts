export interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}

export const sidebarMenu: MenuSection[] = [
  {
    section: "Main",
    items: [{ name: "Dashboard", path: "/dashboard", icon: "dashboard" }],
  },
  {
    section: "Master",
    items: [
      { name: "Customer", path: "/customer", icon: "users" },
      // { name: 'Customer Branch Plant', path: '/master/customer-branch-plant', icon: 'building' },
      // { name: 'Customer Region', path: '/master/customer-region', icon: 'map' },
      // { name: 'Customer Supervisor', path: '/master/customer-supervisor', icon: 'user-check' },
      // { name: 'Customer KSM/KAM Mapping', path: '/master/customer-ksm-kam', icon: 'users' },
      { name: "Item", path: "/item", icon: "package" },
      { name: "Salesman", path: "/salesman", icon: "user-cog" },
      { name: "Journey Plan", path: "/journey-plan", icon: "map" },
    ],
  },
  {
    section: "Pricing",
    items: [
      { name: "Pricing", path: "/pricing", icon: "dollar-sign" },
      { name: "Promotion", path: "/promotion", icon: "gift" },
      { name: "Discount", path: "/discount", icon: "percent" },
    ],
  },
  {
      section: "Sales Transaction",
      items: [
        { name: "Order", path: "/order", icon: "shopping-cart" },
        { name: "Delivery", path: "/delivery", icon: "truck" },
        { name: "Invoice", path: "/invoice", icon: "receipt" },
      { name: "Credit Note", path: "/credit-note", icon: "file-text" },
      { name: "Debit Note", path: "/debit-note", icon: "file-text" },
      { name: "Return", path: "/return", icon: "shopping-cart" },
      {
        name: "Route Item Grouping",
        path: "/route-item-grouping",
        icon: "layers",
      },
      {
        name: "Portfolio Management",
        path: "/portfolio-management",
        icon: "briefcase",
      },
      { name: "Stock In Store", path: "/stock-in-store", icon: "archive" },
      {
        name: "Complaint Feedback",
        path: "/complaint-feedback",
        icon: "message-circle",
      },
      { name: "Competitor Info", path: "/competitor-info", icon: "activity" },
    ],
  },
  {
    section: "Merchandising",
    items: [
      { name: "Campaign", path: "/campaign", icon: "megaphone" },
      { name: "Planogram", path: "/planogram", icon: "layout" },
      { name: "Shelf Display", path: "/shelf-display", icon: "grid" },
      { name: "Product Catalog", path: "/product-catalog", icon: "book-open" },
    ],
  },
  {
    section: "Survey",
    items: [
      { name: "Sensory Survey", path: "/sensory-survey", icon: "clipboard" },
      { name: "Consumer Survey", path: "/consumer-survey", icon: "users" },
    ],
  },
  {
    section: "SOS",
    items: [
      { name: "Share Of Shelf", path: "/share-of-shelf", icon: "pie-chart" },
      { name: "Pricing Check", path: "/pricing-check", icon: "tag" },
      {
        name: "Market Promotion",
        path: "/market-promotion",
        icon: "trending-up",
      },
    ],
  },
  {
    section: "Sales Operations",
    items: [
      { name: "Sales Target", path: "/sales-target", icon: "target" },
      { name: "Collection", path: "/collection", icon: "wallet" },
      { name: "Salesman Load", path: "/salesman-load", icon: "truck" },
      { name: "Salesman Unload", path: "/salesman-unload", icon: "truck" },
      { name: "Load Request", path: "/load-request", icon: "clipboard-list" },
      { name: "GRN", path: "/grn", icon: "file-check" },
      { name: "Cashier Receipt", path: "/cashier-receipt", icon: "receipt" },
      { name: "PDC", path: "/pdc", icon: "calendar-check" },
      {
        name: "Session Endorsement",
        path: "/session-endorsement",
        icon: "check-circle",
      },
    ],
  },
  {
    section: "Logistics",
    items: [
      { name: "Consolidated Load", path: "/consolidated-load", icon: "boxes" },
      {
        name: "Consolidated Load Return",
        path: "/consolidated-load-return",
        icon: "undo",
      },
      {
        name: "Loading Chart By Warehouse",
        path: "/loading-chart-warehouse",
        icon: "bar-chart",
      },
      {
        name: "Loading Chart Final By Route",
        path: "/loading-chart-route",
        icon: "bar-chart",
      },
      { name: "Truck Utilisation", path: "/truck-utilisation", icon: "truck" },
      { name: "Load Sheet", path: "/load-sheet", icon: "clipboard" },
      { name: "Pallet", path: "/pallet", icon: "box" },
    ],
  },
];

// Reports menu - separate from main sidebar menu
export interface ReportMenuItem {
  name: string;
  path: string;
}

export const reportsMenu: ReportMenuItem[] = [
  { name: "Consolidated Load", path: "/reports/consolidated-load" },
  {
    name: "Consolidated Load Return",
    path: "/reports/consolidated-load-return",
  },
  {
    name: "Loading Chart By Warehouse",
    path: "/reports/loading-chart-warehouse",
  },
  { name: "Order Details", path: "/reports/order-details" },
  { name: "Daily Operation", path: "/reports/daily-operation" },
  { name: "Time Sheets", path: "/reports/time-sheets" },
  { name: "Salesman Performance", path: "/reports/salesman-performance" },
  { name: "Truck Utilisation", path: "/reports/truck-utilisation" },
  { name: "Daily CRF", path: "/reports/daily-crf" },
  { name: "Sales Vs GRV", path: "/reports/sales-vs-grv" },
  { name: "DIFOT", path: "/reports/difot" },
  {
    name: "Loading Chart Final By Route",
    path: "/reports/loading-chart-route",
  },
  { name: "Daily GRV Report", path: "/reports/daily-grv" },
  { name: "Daily Spot Return", path: "/reports/daily-spot-return" },
  { name: "Driver Loaded Qty", path: "/reports/driver-loaded-qty" },
  { name: "Daily Cancel Order", path: "/reports/daily-cancel-order" },
  { name: "Monthly KPI", path: "/reports/monthly-kpi" },
  { name: "YTD KPI", path: "/reports/ytd-kpi" },
  { name: "Geo Approval", path: "/reports/geo-approval" },
  { name: "Delivery Export Report", path: "/reports/delivery-export" },
];

export interface SettingsMenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
}

export const settingsMenu: SettingsMenuItem[] = [
  {
    id: 1,
    name: "Organisation",
    path: "/settings/organisation",
    icon: "building",
  },
  {
    id: 2,
    name: "Users & Roles",
    path: "/settings/users-roles",
    icon: "users",
  },
  {
    id: 4,
    name: "Preferences",
    path: "/settings/preferences",
    icon: "sliders",
  },
  { id: 5, name: "Taxes", path: "/settings/taxes", icon: "percent" },
  { id: 6, name: "Currency", path: "/settings/currency", icon: "dollar-sign" },
  { id: 7, name: "Bank", path: "/settings/bank", icon: "landmark" },
  { id: 8, name: "Warehouse", path: "/settings/warehouse", icon: "warehouse" },
  { id: 9, name: "Country", path: "/settings/country", icon: "globe" },
  { id: 10, name: "Region", path: "/settings/region", icon: "map-pin" },
  {
    id: 11,
    name: "Branch/Depot",
    path: "/settings/branch-depot",
    icon: "home",
  },
  { id: 12, name: "Van Master", path: "/settings/van-master", icon: "truck" },
  { id: 13, name: "Route", path: "/settings/route", icon: "navigation" },
  { id: 3, name: "Beats", path: "/settings/beat", icon: "navigation" },
  {
    id: 14,
    name: "Customer Category",
    path: "/settings/customer-category",
    icon: "tag",
  },
  {
    id: 15,
    name: "Credit Limits",
    path: "/settings/credit-limits",
    icon: "credit-card",
  },
  {
    id: 16,
    name: "Outlet Product Code",
    path: "/settings/outlet-product-code",
    icon: "qr-code",
  },
  { id: 17, name: "Item Group", path: "/settings/item-group", icon: "folder" },
  { id: 18, name: "UOM", path: "/settings/uom", icon: "ruler" },
  {
    id: 19,
    name: "Merchandiser Replacement",
    path: "/settings/merchandiser-replacement",
    icon: "refresh-cw",
  },
  { id: 20, name: "Reason", path: "/settings/reason", icon: "help-circle" },
  {
    id: 21,
    name: "Driver Replacement",
    path: "/settings/driver-replacement",
    icon: "user-check",
  },
  { id: 23, name: "Zone", path: "/settings/zone", icon: "map" },
];
