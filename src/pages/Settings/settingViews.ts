import type { SettingField, SettingRow, SettingViewConfig } from '../shared/SettingViewDrawer';
import { getAreaDetails, getAreaList } from '../../api/AreaApi';
import { getBankDetails, getBankList } from '../../api/BankApi';
import { getBeatDetails, getBeatList } from '../../api/BeatApi';
import { getBrandDetails, getBrandList, getItemCategoryDetails, getItemCategoryList } from '../../api/ItemApi';
import { getCountryDetails, getCountryList } from '../../api/CountryApi';
import { getCreditLimitList } from '../../api/CreditLimitApi';
import { getCurrencyDetails, getCurrencyList } from '../../api/CurrencyApi';
import { getCustomerCategoryDetails, getCustomerCategoryList } from '../../api/CustomerApi';
import { getDepotDetails, getDepotList } from '../../api/DepotApi';
import { getDriverReplacementList } from '../../api/DriverReplacementApi';
import { getItemGroupDetails, getItemGroupList } from '../../api/ItemGroupApi';
import { getItemUomDetails, getItemUomList } from '../../api/ItemUomApi';
import { getMerchandiserReplacementDetails, getMerchandiserReplacementList } from '../../api/MerchandiserReplacementApi';
import { getOutletProductCodeList } from '../../api/OutletProductCodeApi';
import { getReasonDetails, getReasonList } from '../../api/ReasonApi';
import { getRegionDetails, getRegionList } from '../../api/RegionApi';
import { getRouteDetails, getRouteList } from '../../api/RouteApi';
import { getTaxDetails, getTaxList } from '../../api/TaxApi';
import { getVanDetails, getVanList } from '../../api/VanApi';
import { getWarehouseDetails, getWarehouseList } from '../../api/WarehouseApi';
import { getZoneDetails, getZoneList } from '../../api/ZoneApi';
import { getPalletDetails, getPalletList } from '../../api/PalletApi';
import { getConsumerSurveyDetails, getConsumerSurveyList, getSensorySurveyDetails, getSensorySurveyList } from '../../api/SurveyApi';
import { getRoleDetails, getRoleList } from '../../api/RoleApi';
import { getInviteUserByUuid, getInviteUserList } from '../../api/InviteUserApi';
import { getWorkFlowRuleDetails, getWorkFlowRuleList } from '../../api/WorkFlowApi';

/** A normalised list response → the left list's page. */
const page = (res: { data: object[]; meta?: { has_more_pages?: boolean } }) => ({ items: res.data as SettingRow[], hasMore: Boolean(res.meta?.has_more_pages) });

const status: SettingField = { label: 'Status', path: 'status', kind: 'status' };
const text = (label: string, path: string | string[]): SettingField => ({ label, path });
const bool = (label: string, path: string): SettingField => ({ label, path, kind: 'bool' });

export const areaView: SettingViewConfig = {
  title: 'Areas',
  queryKey: 'area',
  editPermission: 'area.edit',
  fetchPage: (p, s, n) => getAreaList(p, n, s || undefined).then(page),
  getDetails: getAreaDetails,
  name: ['areaName', 'name'],
  code: ['areaCode', 'code'],
  sections: [{ title: 'General Details', fields: [text('Area Code', ['areaCode', 'code']), text('Area Name', ['areaName', 'name']), text('Level', 'nodeLevel'), status] }],
};

export const bankView: SettingViewConfig = {
  title: 'Banks',
  queryKey: 'bank',
  editPermission: 'bank.edit',
  fetchPage: (p, s, n) => getBankList(p, n, s || undefined).then(page),
  getDetails: getBankDetails,
  name: ['bankName'],
  code: ['bankCode'],
  sections: [
    { title: 'General Details', fields: [text('Bank Name', 'bankName'), text('Bank Code', 'bankCode'), text('Branch Name', 'branchName'), text('Bank Address', 'bankAddress'), status] },
    {
      title: 'Account Details',
      fields: [
        text('Account Number', 'accountNumber'),
        text('IBAN', 'iban'),
        text('SWIFT Code', 'swiftCode'),
        text('IFSC Code', 'ifscCode'),
        text('Routing Number', 'routingNumber'),
        text('Sort Code', 'sortCode'),
      ],
    },
  ],
};

export const beatView: SettingViewConfig = {
  title: 'Beats',
  queryKey: 'beat',
  editPermission: 'beat.edit',
  fetchPage: (p, s, n) => getBeatList(p, n, s || undefined).then(page),
  getDetails: getBeatDetails,
  name: ['beatName', 'name'],
  code: ['beatCode', 'code'],
  sections: [
    { title: 'General Details', fields: [text('Beat Code', ['beatCode', 'code']), text('Beat Name', ['beatName', 'name']), text('Area', 'area.name'), text('Area Code', 'area.code'), status] },
  ],
};

export const brandView: SettingViewConfig = {
  title: 'Brands',
  queryKey: 'brand',
  editPermission: 'brand.edit',
  fetchPage: (p, s, n) => getBrandList(p, n, s || undefined).then(page),
  getDetails: getBrandDetails,
  name: ['brandName'],
  sections: [{ title: 'General Details', fields: [text('Brand Name', 'brandName'), text('Description', 'description'), text('Level', 'nodeLevel'), status] }],
};

export const countryView: SettingViewConfig = {
  title: 'Countries',
  queryKey: 'country',
  editPermission: 'country.edit',
  fetchPage: (p, s, n) => getCountryList(p, n, s || undefined).then(page),
  getDetails: getCountryDetails,
  name: ['name'],
  code: ['countryCode'],
  sections: [
    { title: 'General Details', fields: [text('Country Name', 'name'), text('Country Code', 'countryCode'), text('Dial Code', 'dialCode'), status] },
    { title: 'Currency', fields: [text('Currency', 'currency'), text('Currency Code', 'currencyCode'), text('Currency Symbol', 'currencySymbol')] },
  ],
};

export const creditLimitView: SettingViewConfig = {
  title: 'Credit Limits',
  queryKey: 'credit-limit',
  editPermission: 'user-credit-limit.edit',
  fetchPage: (p, _s, n) => getCreditLimitList(p, n).then(page),
  name: ['user.name'],
  sections: [{ title: 'General Details', fields: [text('User', 'user.name'), { label: 'Credit Limit Type', path: 'creditLimitType', kind: 'map', map: { '1': 'Customer Base', '2': 'LOB' } }] }],
};

export const currencyView: SettingViewConfig = {
  title: 'Currencies',
  queryKey: 'currency',
  editPermission: 'currency.edit',
  fetchPage: (p, s, n) => getCurrencyList(p, n, s || undefined).then(page),
  getDetails: getCurrencyDetails,
  name: ['name'],
  code: ['code'],
  sections: [
    {
      title: 'General Details',
      fields: [
        text('Name', 'name'),
        text('Code', 'code'),
        text('Symbol', 'symbol'),
        text('Plural Name', 'namePlural'),
        text('Native Symbol', 'symbolNative'),
        bool('Default Currency', 'defaultCurrency'),
      ],
    },
    { title: 'Formatting', fields: [text('Decimal Digits', 'decimalDigits'), text('Rounding', 'rounding'), text('Format', 'format')] },
  ],
};

export const customerCategoryView: SettingViewConfig = {
  title: 'Customer Categories',
  queryKey: 'customer-category',
  editPermission: 'customer-category.edit',
  fetchPage: (p, s, n) => getCustomerCategoryList(p, n, s || undefined).then(page),
  getDetails: getCustomerCategoryDetails,
  name: ['categoryName', 'customerCategoryName'],
  code: ['customerCategoryCode'],
  sections: [
    { title: 'General Details', fields: [text('Category Code', 'customerCategoryCode'), text('Category Name', ['categoryName', 'customerCategoryName']), text('Level', 'nodeLevel'), status] },
  ],
};

export const depotView: SettingViewConfig = {
  title: 'Depots',
  queryKey: 'depot',
  editPermission: 'depot.edit',
  fetchPage: (p, s, n) => getDepotList(p, n, s || undefined).then(page),
  getDetails: getDepotDetails,
  name: ['depotName'],
  code: ['depotCode'],
  sections: [
    { title: 'General Details', fields: [text('Depot Code', 'depotCode'), text('Depot Name', 'depotName'), text('Region', 'region.name'), text('Area', 'area.name'), status] },
    { title: 'Manager', fields: [text('Manager', 'depotManager'), text('Manager Contact', 'depotManagerContact')] },
  ],
};

export const driverReplacementView: SettingViewConfig = {
  title: 'Driver Replacements',
  queryKey: 'driver-replacement',
  editPermission: 'driver-replacement.edit',
  fetchPage: (p, _s, n) => getDriverReplacementList(p, n).then(page),
  name: ['newSalesman.name'],
  sections: [
    { title: 'Replacement', fields: [text('Date', 'date'), text('Reason', 'reason.name')] },
    { title: 'Driver', fields: [text('Old Driver', 'oldSalesman.name'), text('New Driver', 'newSalesman.name')] },
    { title: 'Van', fields: [text('Old Van', ['oldVan.vanCode']), text('Old Van Plate', 'oldVan.plateNumber'), text('New Van', 'newVan.vanCode'), text('New Van Plate', 'newVan.plateNumber')] },
  ],
};

export const itemCategoryView: SettingViewConfig = {
  title: 'Item Categories',
  queryKey: 'item-category',
  editPermission: 'item-category.edit',
  fetchPage: (p, s, n) => getItemCategoryList(p, n, s || undefined).then(page),
  getDetails: getItemCategoryDetails,
  name: ['categoryName', 'name'],
  sections: [{ title: 'General Details', fields: [text('Category Name', ['categoryName', 'name']), text('Description', 'description'), status] }],
};

export const itemGroupView: SettingViewConfig = {
  title: 'Item Groups',
  queryKey: 'item-group',
  editPermission: 'item-group.edit',
  fetchPage: (p, s, n) => getItemGroupList(p, n, s || undefined).then(page),
  getDetails: getItemGroupDetails,
  name: ['name'],
  code: ['code'],
  sections: [{ title: 'General Details', fields: [text('Group Code', 'code'), text('Group Name', 'name'), status] }],
};

export const itemUomView: SettingViewConfig = {
  title: 'Units of Measure',
  queryKey: 'item-uom',
  editPermission: 'item-uom.edit',
  fetchPage: (p, s, n) => getItemUomList(p, n, s || undefined).then(page),
  getDetails: getItemUomDetails,
  name: ['name'],
  code: ['code'],
  sections: [{ title: 'General Details', fields: [text('UOM Code', 'code'), text('UOM Name', 'name'), status] }],
};

export const merchandiserReplacementView: SettingViewConfig = {
  title: 'Merchandiser Replacements',
  queryKey: 'merchandiser-replacement',
  editPermission: 'merchandiser-replacement.edit',
  fetchPage: (p, _s, n) => getMerchandiserReplacementList(p, n).then(page),
  getDetails: getMerchandiserReplacementDetails,
  name: ['newSalesman.name'],
  sections: [{ title: 'Replacement', fields: [text('Type', 'type'), text('Added On', 'addedOn'), text('Old Merchandiser', 'oldSalesman.name'), text('New Merchandiser', 'newSalesman.name')] }],
};

export const outletProductCodeView: SettingViewConfig = {
  title: 'Outlet Product Codes',
  queryKey: 'outlet-product-code',
  editPermission: 'outlet-product-code.edit',
  fetchPage: (p, s, n) => getOutletProductCodeList(p, n, s || undefined).then(page),
  name: ['name'],
  code: ['code'],
  sections: [{ title: 'General Details', fields: [text('Code', 'code'), text('Name', 'name')] }],
};

export const reasonView: SettingViewConfig = {
  title: 'Reasons',
  queryKey: 'reason',
  editPermission: 'reason-type.edit',
  fetchPage: (p, s, n) => getReasonList(p, n, s || undefined).then(page),
  getDetails: getReasonDetails,
  name: ['name'],
  code: ['code'],
  sections: [{ title: 'General Details', fields: [text('Reason Code', 'code'), text('Reason Name', 'name'), text('Type', 'type'), status] }],
};

export const regionView: SettingViewConfig = {
  title: 'Regions',
  queryKey: 'region',
  editPermission: 'region.edit',
  fetchPage: (p, s, n) => getRegionList(p, n, s || undefined).then(page),
  getDetails: getRegionDetails,
  name: ['regionName'],
  code: ['regionCode'],
  sections: [{ title: 'General Details', fields: [text('Region Code', 'regionCode'), text('Region Name', 'regionName'), status] }],
};

export const routeView: SettingViewConfig = {
  title: 'Routes',
  queryKey: 'route',
  editPermission: 'route.edit',
  fetchPage: (p, s, n) => getRouteList(p, n, s || undefined).then(page),
  getDetails: getRouteDetails,
  name: ['name', 'routeName'],
  code: ['code', 'routeCode'],
  sections: [
    { title: 'General Details', fields: [text('Route Code', ['code', 'routeCode']), text('Route Name', ['name', 'routeName']), text('Area', 'area.name'), text('Depot', 'depot.name'), status] },
  ],
};

export const taxView: SettingViewConfig = {
  title: 'Taxes',
  queryKey: 'tax',
  editPermission: 'tax-rate.edit',
  fetchPage: (p, s, n) => getTaxList(p, n, s || undefined).then(page),
  getDetails: getTaxDetails,
  name: ['name'],
  sections: [{ title: 'General Details', fields: [text('Tax Name', 'name'), text('Rate', 'rate'), text('Type', 'type'), text('Region', 'region'), bool('Default', 'isDefault'), text('Description', 'description')] }],
};

export const vanView: SettingViewConfig = {
  title: 'Vans',
  queryKey: 'van',
  editPermission: 'van.edit',
  fetchPage: (p, s, n) => getVanList(p, n, s || undefined).then(page),
  getDetails: getVanDetails,
  name: ['vanCode'],
  sections: [
    {
      title: 'General Details',
      fields: [text('Van Code', 'vanCode'), text('Plate Number', 'plateNumber'), text('Capacity', 'capacity'), text('Reading', 'reading'), text('Description', 'description'), status],
    },
    { title: 'Classification', fields: [text('Van Type', 'vanType.name'), text('Van Category', 'vanCategory.name'), text('Area', 'area.name')] },
  ],
};

export const warehouseView: SettingViewConfig = {
  title: 'Warehouses',
  queryKey: 'warehouse',
  editPermission: 'warehouse.edit',
  fetchPage: (p, s, n) => getWarehouseList(p, n, s || undefined).then(page),
  getDetails: getWarehouseDetails,
  name: ['name'],
  code: ['code'],
  sections: [
    { title: 'General Details', fields: [text('Warehouse Code', 'code'), text('Warehouse Name', 'name'), text('Location Type', 'locType'), bool('Main Warehouse', 'isMain'), status] },
    { title: 'Contact & Location', fields: [text('Address', 'address'), text('Manager', 'manager'), text('Manager Phone', 'managerPhone'), text('Latitude', 'lat'), text('Longitude', 'lang')] },
  ],
};

export const zoneView: SettingViewConfig = {
  title: 'Zones',
  queryKey: 'zone',
  editPermission: 'zone.edit',
  fetchPage: (p, s, n) => getZoneList(p, n, s || undefined).then(page),
  getDetails: getZoneDetails,
  name: ['name'],
  code: ['zoneCode'],
  sections: [{ title: 'General Details', fields: [text('Zone Code', 'zoneCode'), text('Zone Name', 'name'), status] }],
};

/** The Survey / Pallet / Users / Roles / Work-flow lists answer with a plain {data, lastPage} instead of {data, meta}. */
const paged = (p: number) => (res: { data: object[]; lastPage: number }) => ({ items: res.data as SettingRow[], hasMore: p < res.lastPage });

export const palletView: SettingViewConfig = {
  title: 'Pallets',
  queryKey: 'pallet',
  editPermission: 'pallet.edit',
  fetchPage: (p, _s, n) => getPalletList(p, n).then(paged(p)),
  getDetails: getPalletDetails,
  name: ['item'],
  sections: [
    { title: 'General Details', fields: [text('Item', 'item'), text('Date', 'date'), text('Quantity', 'qty'), text('Pallet Type', 'palletType'), text('Division', 'divisionName'), status] },
  ],
};

export const consumerSurveyView: SettingViewConfig = {
  title: 'Consumer Surveys',
  queryKey: 'consumer-survey',
  editPermission: 'consumer-survey.edit',
  fetchPage: (p, s, n) => getConsumerSurveyList(p, s || undefined, n).then(paged(p)),
  getDetails: getConsumerSurveyDetails,
  name: ['surveyName'],
  code: ['surveyCode'],
  sections: [
    { title: 'General Details', fields: [text('Survey Code', 'surveyCode'), text('Survey Name', 'surveyName'), text('Merchandiser', 'merchandiserName'), text('Date', 'date'), text('Status', 'status')] },
    { title: 'Questions', fields: [{ label: 'Questions', path: 'questions', kind: 'list', itemPath: ['question', 'text', 'name'] }] },
  ],
};

export const sensorySurveyView: SettingViewConfig = {
  title: 'Sensory Surveys',
  queryKey: 'sensory-survey',
  editPermission: 'sensory-survey.edit',
  fetchPage: (p, s, n) => getSensorySurveyList(p, s || undefined, n).then(paged(p)),
  getDetails: getSensorySurveyDetails,
  name: ['surveyName'],
  code: ['surveyCode'],
  sections: [
    { title: 'General Details', fields: [text('Survey Code', 'surveyCode'), text('Survey Name', 'surveyName'), text('Merchandiser', 'merchandiserName'), text('Date', 'date'), text('Status', 'status')] },
    { title: 'Ratings', fields: [text('Appearance', 'appearance'), text('Aroma', 'aroma'), text('Taste', 'taste'), text('Texture', 'texture'), text('Overall Rating', 'overallRating')] },
    { title: 'Comments', fields: [text('Comments', 'comments')] },
  ],
};

export const roleView: SettingViewConfig = {
  title: 'Roles',
  queryKey: 'role',
  editPermission: 'users-roles.edit',
  fetchPage: (p, s, n) => getRoleList(p, s || undefined, n).then(paged(p)),
  getDetails: getRoleDetails,
  name: ['name'],
  code: ['code'],
  sections: [
    { title: 'General Details', fields: [text('Role Code', 'code'), text('Role Name', 'name'), text('Description', 'description'), status] },
    { title: 'Permissions', fields: [{ label: 'Granted permissions', path: 'permissions', kind: 'list' }] },
  ],
};

export const userView: SettingViewConfig = {
  title: 'Users',
  queryKey: 'invite-user',
  editPermission: 'users-roles.edit',
  fetchPage: (p, s, n) => getInviteUserList(p, s || undefined, n).then(paged(p)),
  getDetails: getInviteUserByUuid,
  name: ['firstname lastname'],
  code: ['email'],
  sections: [
    { title: 'General Details', fields: [text('Name', 'firstname lastname'), text('Email', 'email'), text('Mobile', 'mobile'), text('Role', 'role.name'), status] },
  ],
};

export const workFlowView: SettingViewConfig = {
  title: 'Approval Rules',
  queryKey: 'work-flow-rule',
  editPermission: 'preferences.edit',
  fetchPage: (p, s, n) => getWorkFlowRuleList(p, n, s || undefined).then(paged(p)),
  getDetails: getWorkFlowRuleDetails,
  name: ['name'],
  sections: [
    { title: 'General Details', fields: [text('Rule Name', 'name'), text('Module', 'module'), text('Trigger', 'eventTrigger'), text('Description', 'description'), status] },
    { title: 'Approvers', fields: [{ label: 'Approvers', path: 'approvers', kind: 'list', itemPath: ['roleName', 'userName'] }] },
  ],
};
