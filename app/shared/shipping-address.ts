/**
 * The registrant's ship-to address: the form fields on the manage page and
 * the shape handed to `orderUpdate`'s `shippingAddress` (MailingAddressInput).
 *
 * Not a `.server` file: the manage page renders the province lists and the
 * proxy action parses the form, so both sides share this (CLAUDE.md rule 2).
 *
 * The registrant types this into Giftpin's own form. Nothing here is ever read
 * from a Shopify order; see purchase.server.ts::applyShipToRegistrant.
 */

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  /** Shopify province code ("ON", "NY", "NSW"). Absent for GB. */
  provinceCode?: string;
  countryCode: string;
  zip: string;
  phone?: string;
}

export const SHIPPING_COUNTRIES: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "IE", label: "Ireland" },
  { code: "NZ", label: "New Zealand" },
  { code: "DE", label: "Germany" },
  { code: "AT", label: "Austria" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "PT", label: "Portugal" },
  { code: "MX", label: "Mexico" },
  { code: "BR", label: "Brazil" },
  { code: "IN", label: "India" },
  { code: "CN", label: "China" },
  { code: "TW", label: "Taiwan" },
  { code: "JP", label: "Japan" },
];

type Region = { code: string; label: string };

export const PROVINCES: Record<string, { label: string; regions: Region[] }> = {
  US: {
    label: "State",
    regions: [
      ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"],
      ["CA", "California"], ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"],
      ["DC", "District of Columbia"], ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"],
      ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"], ["IA", "Iowa"],
      ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
      ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
      ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"],
      ["NV", "Nevada"], ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"],
      ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"],
      ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
      ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"],
      ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"],
      ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
    ].map(([code, label]) => ({ code, label })),
  },
  CA: {
    label: "Province",
    regions: [
      ["AB", "Alberta"], ["BC", "British Columbia"], ["MB", "Manitoba"], ["NB", "New Brunswick"],
      ["NL", "Newfoundland and Labrador"], ["NT", "Northwest Territories"], ["NS", "Nova Scotia"],
      ["NU", "Nunavut"], ["ON", "Ontario"], ["PE", "Prince Edward Island"], ["QC", "Quebec"],
      ["SK", "Saskatchewan"], ["YT", "Yukon"],
    ].map(([code, label]) => ({ code, label })),
  },
  AU: {
    label: "State",
    regions: [
      ["ACT", "Australian Capital Territory"], ["NSW", "New South Wales"], ["NT", "Northern Territory"],
      ["QLD", "Queensland"], ["SA", "South Australia"], ["TAS", "Tasmania"], ["VIC", "Victoria"],
      ["WA", "Western Australia"],
    ].map(([code, label]) => ({ code, label })),
  },
  // Codes below are ISO 3166-2 (IE, NZ, ES, BR) or Shopify's own (MX, IN, CN, JP): NOT yet
  // checked against a live orderUpdate, see CLAUDE.md. IN, CN and JP are from memory too.
  IE: {
    label: "County",
    regions: [
      ["CW", "Carlow"],
      ["CN", "Cavan"],
      ["CE", "Clare"],
      ["CO", "Cork"],
      ["DL", "Donegal"],
      ["D", "Dublin"],
      ["G", "Galway"],
      ["KY", "Kerry"],
      ["KE", "Kildare"],
      ["KK", "Kilkenny"],
      ["LS", "Laois"],
      ["LM", "Leitrim"],
      ["LK", "Limerick"],
      ["LD", "Longford"],
      ["LH", "Louth"],
      ["MO", "Mayo"],
      ["MH", "Meath"],
      ["MN", "Monaghan"],
      ["OY", "Offaly"],
      ["RN", "Roscommon"],
      ["SO", "Sligo"],
      ["TA", "Tipperary"],
      ["WD", "Waterford"],
      ["WH", "Westmeath"],
      ["WX", "Wexford"],
      ["WW", "Wicklow"],
    ].map(([code, label]) => ({ code, label })),
  },
  NZ: {
    label: "Region",
    regions: [
      ["AUK", "Auckland"],
      ["BOP", "Bay of Plenty"],
      ["CAN", "Canterbury"],
      ["GIS", "Gisborne"],
      ["HKB", "Hawke's Bay"],
      ["MWT", "Manawatu-Wanganui"],
      ["MBH", "Marlborough"],
      ["NSN", "Nelson"],
      ["NTL", "Northland"],
      ["OTA", "Otago"],
      ["STL", "Southland"],
      ["TKI", "Taranaki"],
      ["TAS", "Tasman"],
      ["WKO", "Waikato"],
      ["WGN", "Wellington"],
      ["WTC", "West Coast"],
    ].map(([code, label]) => ({ code, label })),
  },
  ES: {
    label: "Province",
    regions: [
      ["C", "A Coruña"],
      ["VI", "Álava"],
      ["AB", "Albacete"],
      ["A", "Alicante"],
      ["AL", "Almería"],
      ["O", "Asturias"],
      ["AV", "Ávila"],
      ["BA", "Badajoz"],
      ["PM", "Balears"],
      ["B", "Barcelona"],
      ["BU", "Burgos"],
      ["CC", "Cáceres"],
      ["CA", "Cádiz"],
      ["S", "Cantabria"],
      ["CS", "Castellón"],
      ["CR", "Ciudad Real"],
      ["CO", "Córdoba"],
      ["CU", "Cuenca"],
      ["GI", "Girona"],
      ["GR", "Granada"],
      ["GU", "Guadalajara"],
      ["SS", "Gipuzkoa"],
      ["H", "Huelva"],
      ["HU", "Huesca"],
      ["J", "Jaén"],
      ["LO", "La Rioja"],
      ["GC", "Las Palmas"],
      ["LE", "León"],
      ["L", "Lleida"],
      ["LU", "Lugo"],
      ["M", "Madrid"],
      ["MA", "Málaga"],
      ["MU", "Murcia"],
      ["NA", "Navarra"],
      ["OR", "Ourense"],
      ["P", "Palencia"],
      ["PO", "Pontevedra"],
      ["SA", "Salamanca"],
      ["TF", "Santa Cruz de Tenerife"],
      ["SG", "Segovia"],
      ["SE", "Sevilla"],
      ["SO", "Soria"],
      ["T", "Tarragona"],
      ["TE", "Teruel"],
      ["TO", "Toledo"],
      ["V", "Valencia"],
      ["VA", "Valladolid"],
      ["BI", "Bizkaia"],
      ["ZA", "Zamora"],
      ["Z", "Zaragoza"],
      ["CE", "Ceuta"],
      ["ML", "Melilla"],
    ].map(([code, label]) => ({ code, label })),
  },
  MX: {
    label: "State",
    regions: [
      ["AGS", "Aguascalientes"],
      ["BC", "Baja California"],
      ["BCS", "Baja California Sur"],
      ["CAMP", "Campeche"],
      ["CHIS", "Chiapas"],
      ["CHIH", "Chihuahua"],
      ["CDMX", "Ciudad de México"],
      ["COAH", "Coahuila"],
      ["COL", "Colima"],
      ["DGO", "Durango"],
      ["GTO", "Guanajuato"],
      ["GRO", "Guerrero"],
      ["HGO", "Hidalgo"],
      ["JAL", "Jalisco"],
      ["MEX", "Estado de México"],
      ["MICH", "Michoacán"],
      ["MOR", "Morelos"],
      ["NAY", "Nayarit"],
      ["NL", "Nuevo León"],
      ["OAX", "Oaxaca"],
      ["PUE", "Puebla"],
      ["QRO", "Querétaro"],
      ["Q ROO", "Quintana Roo"],
      ["SLP", "San Luis Potosí"],
      ["SIN", "Sinaloa"],
      ["SON", "Sonora"],
      ["TAB", "Tabasco"],
      ["TAMPS", "Tamaulipas"],
      ["TLAX", "Tlaxcala"],
      ["VER", "Veracruz"],
      ["YUC", "Yucatán"],
      ["ZAC", "Zacatecas"],
    ].map(([code, label]) => ({ code, label })),
  },
  BR: {
    label: "State",
    regions: [
      ["AC", "Acre"],
      ["AL", "Alagoas"],
      ["AP", "Amapá"],
      ["AM", "Amazonas"],
      ["BA", "Bahia"],
      ["CE", "Ceará"],
      ["DF", "Distrito Federal"],
      ["ES", "Espírito Santo"],
      ["GO", "Goiás"],
      ["MA", "Maranhão"],
      ["MT", "Mato Grosso"],
      ["MS", "Mato Grosso do Sul"],
      ["MG", "Minas Gerais"],
      ["PA", "Pará"],
      ["PB", "Paraíba"],
      ["PR", "Paraná"],
      ["PE", "Pernambuco"],
      ["PI", "Piauí"],
      ["RJ", "Rio de Janeiro"],
      ["RN", "Rio Grande do Norte"],
      ["RS", "Rio Grande do Sul"],
      ["RO", "Rondônia"],
      ["RR", "Roraima"],
      ["SC", "Santa Catarina"],
      ["SP", "São Paulo"],
      ["SE", "Sergipe"],
      ["TO", "Tocantins"],
    ].map(([code, label]) => ({ code, label })),
  },
  IN: {
    label: "State",
    regions: [
      ["AN", "Andaman and Nicobar Islands"],
      ["AP", "Andhra Pradesh"],
      ["AR", "Arunachal Pradesh"],
      ["AS", "Assam"],
      ["BR", "Bihar"],
      ["CH", "Chandigarh"],
      ["CG", "Chhattisgarh"],
      ["DN", "Dadra and Nagar Haveli and Daman and Diu"],
      ["DL", "Delhi"],
      ["GA", "Goa"],
      ["GJ", "Gujarat"],
      ["HR", "Haryana"],
      ["HP", "Himachal Pradesh"],
      ["JK", "Jammu and Kashmir"],
      ["JH", "Jharkhand"],
      ["KA", "Karnataka"],
      ["KL", "Kerala"],
      ["LA", "Ladakh"],
      ["LD", "Lakshadweep"],
      ["MP", "Madhya Pradesh"],
      ["MH", "Maharashtra"],
      ["MN", "Manipur"],
      ["ML", "Meghalaya"],
      ["MZ", "Mizoram"],
      ["NL", "Nagaland"],
      ["OR", "Odisha"],
      ["PY", "Puducherry"],
      ["PB", "Punjab"],
      ["RJ", "Rajasthan"],
      ["SK", "Sikkim"],
      ["TN", "Tamil Nadu"],
      ["TS", "Telangana"],
      ["TR", "Tripura"],
      ["UP", "Uttar Pradesh"],
      ["UK", "Uttarakhand"],
      ["WB", "West Bengal"],
    ].map(([code, label]) => ({ code, label })),
  },
  CN: {
    label: "Province",
    regions: [
      ["CN-11", "Beijing"],
      ["CN-12", "Tianjin"],
      ["CN-13", "Hebei"],
      ["CN-14", "Shanxi"],
      ["CN-15", "Inner Mongolia"],
      ["CN-21", "Liaoning"],
      ["CN-22", "Jilin"],
      ["CN-23", "Heilongjiang"],
      ["CN-31", "Shanghai"],
      ["CN-32", "Jiangsu"],
      ["CN-33", "Zhejiang"],
      ["CN-34", "Anhui"],
      ["CN-35", "Fujian"],
      ["CN-36", "Jiangxi"],
      ["CN-37", "Shandong"],
      ["CN-41", "Henan"],
      ["CN-42", "Hubei"],
      ["CN-43", "Hunan"],
      ["CN-44", "Guangdong"],
      ["CN-45", "Guangxi"],
      ["CN-46", "Hainan"],
      ["CN-50", "Chongqing"],
      ["CN-51", "Sichuan"],
      ["CN-52", "Guizhou"],
      ["CN-53", "Yunnan"],
      ["CN-54", "Tibet"],
      ["CN-61", "Shaanxi"],
      ["CN-62", "Gansu"],
      ["CN-63", "Qinghai"],
      ["CN-64", "Ningxia"],
      ["CN-65", "Xinjiang"],
    ].map(([code, label]) => ({ code, label })),
  },
  JP: {
    label: "Prefecture",
    regions: [
      ["JP-01", "Hokkaido"],
      ["JP-02", "Aomori"],
      ["JP-03", "Iwate"],
      ["JP-04", "Miyagi"],
      ["JP-05", "Akita"],
      ["JP-06", "Yamagata"],
      ["JP-07", "Fukushima"],
      ["JP-08", "Ibaraki"],
      ["JP-09", "Tochigi"],
      ["JP-10", "Gunma"],
      ["JP-11", "Saitama"],
      ["JP-12", "Chiba"],
      ["JP-13", "Tokyo"],
      ["JP-14", "Kanagawa"],
      ["JP-15", "Niigata"],
      ["JP-16", "Toyama"],
      ["JP-17", "Ishikawa"],
      ["JP-18", "Fukui"],
      ["JP-19", "Yamanashi"],
      ["JP-20", "Nagano"],
      ["JP-21", "Gifu"],
      ["JP-22", "Shizuoka"],
      ["JP-23", "Aichi"],
      ["JP-24", "Mie"],
      ["JP-25", "Shiga"],
      ["JP-26", "Kyoto"],
      ["JP-27", "Osaka"],
      ["JP-28", "Hyogo"],
      ["JP-29", "Nara"],
      ["JP-30", "Wakayama"],
      ["JP-31", "Tottori"],
      ["JP-32", "Shimane"],
      ["JP-33", "Okayama"],
      ["JP-34", "Hiroshima"],
      ["JP-35", "Yamaguchi"],
      ["JP-36", "Tokushima"],
      ["JP-37", "Kagawa"],
      ["JP-38", "Ehime"],
      ["JP-39", "Kochi"],
      ["JP-40", "Fukuoka"],
      ["JP-41", "Saga"],
      ["JP-42", "Nagasaki"],
      ["JP-43", "Kumamoto"],
      ["JP-44", "Oita"],
      ["JP-45", "Miyazaki"],
      ["JP-46", "Kagoshima"],
      ["JP-47", "Okinawa"],
    ].map(([code, label]) => ({ code, label })),
  },
};

const LIMIT = 120;

export type ShippingAddressError = "country" | "missing" | "region";

/** Keyed by code so the redirect carries a code, never free text, in its URL. */
export const SHIPPING_ADDRESS_ERRORS: Record<ShippingAddressError, string> = {
  country: "Please choose a country for your shipping address.",
  missing: "Please fill in your name, street address, city and postal code.",
  region: "Please choose a state or province for your shipping address.",
};

function field(form: { get(name: string): unknown }, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value.trim().slice(0, LIMIT) : "";
}

/**
 * Validates the manage page's address form. Returns the address to store, or
 * an error code (see SHIPPING_ADDRESS_ERRORS for the wording). Every required field must be present: a half-typed
 * address written onto an order is worse than no rewrite at all.
 */
export function parseShippingAddressForm(
  form: { get(name: string): unknown },
): { address: ShippingAddress } | { error: ShippingAddressError } {
  const countryCode = field(form, "countryCode").toUpperCase();
  if (!SHIPPING_COUNTRIES.some((c) => c.code === countryCode)) {
    return { error: "country" };
  }

  const address: ShippingAddress = {
    firstName: field(form, "firstName"),
    lastName: field(form, "lastName"),
    address1: field(form, "address1"),
    city: field(form, "city"),
    countryCode,
    zip: field(form, "zip").toUpperCase(),
  };

  if (!address.firstName || !address.lastName || !address.address1 || !address.city || !address.zip) {
    return { error: "missing" };
  }

  const regions = PROVINCES[countryCode];
  if (regions) {
    const provinceCode = field(form, "provinceCode").toUpperCase();
    if (!regions.regions.some((r) => r.code === provinceCode)) {
      return { error: "region" };
    }
    address.provinceCode = provinceCode;
  }

  const address2 = field(form, "address2");
  if (address2) address.address2 = address2;
  const phone = field(form, "phone");
  if (phone) address.phone = phone;

  return { address };
}

/**
 * The stored address as `orderUpdate` wants it. Also accepts the older
 * `countryCodeV2` key (the Order *output* field name) in case an address was
 * saved by hand in that shape before this form existed.
 */
export function toMailingAddressInput(stored: Record<string, string>): Record<string, string> {
  const input: Record<string, string> = {};
  for (const key of ["firstName", "lastName", "address1", "address2", "city", "provinceCode", "zip", "phone"]) {
    if (stored[key]) input[key] = stored[key];
  }
  const country = stored.countryCode || stored.countryCodeV2;
  if (country) input.countryCode = country;
  return input;
}
