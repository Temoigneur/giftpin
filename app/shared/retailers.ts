/**
 * Where to send a registrant when the hosting store doesn't carry something:
 * plain outbound search pages, chosen by the registry's country so a shopper
 * lands on their own market's sites. `{q}` is replaced with the search term.
 *
 * Not a `.server` file: the manage page script and the create form both use it.
 *
 * No Amazon (29 Sep 2026, Ben): Amazon Associates only pays on sites the
 * publisher owns, and these links sit on merchants' storefronts, so Amazon
 * links can never earn Giftpin anything. The US list leads with Target.
 *
 * Home and kitchen first (29 Oct 2026, Ben): registries are mostly weddings,
 * so Crate & Barrel and Williams Sonoma replace Walmart. HomeSense was the
 * ask, but it has no online shop (in-store only in Canada), so there's
 * nothing to search. Linen Chest is a good Canadian fit but its search page
 * couldn't be checked (robots-blocked), so it's left out until it is.
 * Links are wrapped for affiliate credit on the manage page when
 * AFFILIATE_LINK_WRAPPER_BASE is set (see app/lib/affiliate.ts).
 *
 * 7 Nov 2026 (Ben): 13 countries, and a list per kind of product ("shelf"),
 * so a stockpot sends a shopper in Germany to German home stores and a crib to
 * German baby stores. The new countries' search URLs are written from how each
 * site's search is known to work and have NOT been checked live (cloud sessions
 * can't reach these sites): run `node scripts/check-retailer-links.mjs` from a
 * normal machine, and fix or drop any that fail (CLAUDE.md hard rule 1).
 * The IN/CN/TW/JP lists (added 7 Nov 2026) are written from knowledge of each
 * site's search and are NOT checked live: run `node scripts/check-retailer-links.mjs`.
 * 8 Nov 2026: Ben's link check found 6 broken. Fixed from the sites' own
 * indexed search pages (not a live click): Vijay Sales /search-listing?q=,
 * Yahoo!ショッピング /search/{q}/0/, Akachan Honpo's shop at shop.akachan.jp,
 * Cainz /search/?q=. Gome dropped (dead TLS cert). Otto kept as /suche/{q}/:
 * scrapers document that exact format, so its 400 looks like a bot block.
 * A shelf a country has no list for falls back to its home list.
 */

export interface Retailer {
  name: string;
  url: string;
}

export const DEFAULT_COUNTRY = "US";

/** English names, used only if the browser can't name the country itself. */
export const COUNTRIES: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "IE", label: "Ireland" },
  { code: "AU", label: "Australia" },
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

/** The kind of thing an idea is, which decides which stores we suggest. */
export const SHELVES = ["home", "baby", "toys", "tech", "pets", "garden"] as const;
export type Shelf = (typeof SHELVES)[number];

type R = [name: string, url: string];
type Shelves = Partial<Record<Shelf, R[]>> & { home: R[] };

const shop = (tld: string): R => ["Google Shopping", `https://www.google.${tld}/search?tbm=shop&q={q}`];

const DATA: Record<string, Shelves> = {
  US: {
    home: [
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Crate & Barrel", "https://www.crateandbarrel.com/search?query={q}"],
      ["Williams Sonoma", "https://www.williams-sonoma.com/search/results.html?words={q}"],
      ["Wayfair", "https://www.wayfair.com/keyword.php?keyword={q}"],
      ["Etsy", "https://www.etsy.com/search?q={q}"],
      shop("com"),
    ],
    baby: [
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Walmart", "https://www.walmart.com/search?q={q}"],
      ["Pottery Barn Kids", "https://www.potterybarnkids.com/search/results.html?words={q}"],
      ["Wayfair", "https://www.wayfair.com/keyword.php?keyword={q}"],
      ["Etsy", "https://www.etsy.com/search?q={q}"],
      shop("com"),
    ],
    toys: [
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Walmart", "https://www.walmart.com/search?q={q}"],
      ["Kohl's", "https://www.kohls.com/search.jsp?search={q}"],
      ["Etsy", "https://www.etsy.com/search?q={q}"],
      shop("com"),
    ],
    tech: [
      ["Best Buy", "https://www.bestbuy.com/site/searchpage.jsp?st={q}"],
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Walmart", "https://www.walmart.com/search?q={q}"],
      ["B&H Photo", "https://www.bhphotovideo.com/c/search?q={q}"],
      ["Newegg", "https://www.newegg.com/p/pl?d={q}"],
      shop("com"),
    ],
    pets: [
      ["Chewy", "https://www.chewy.com/s?query={q}"],
      ["Petco", "https://www.petco.com/shop/en/petcostore/s/{q}"],
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Walmart", "https://www.walmart.com/search?q={q}"],
      shop("com"),
    ],
    garden: [
      ["Home Depot", "https://www.homedepot.com/s/{q}"],
      ["Lowe's", "https://www.lowes.com/search?searchTerm={q}"],
      ["Walmart", "https://www.walmart.com/search?q={q}"],
      ["Target", "https://www.target.com/s?searchTerm={q}"],
      ["Wayfair", "https://www.wayfair.com/keyword.php?keyword={q}"],
      shop("com"),
    ],
  },
  CA: {
    home: [
      ["Crate & Barrel", "https://www.crateandbarrel.ca/search?query={q}"],
      ["Williams Sonoma", "https://www.williams-sonoma.ca/search/results.html?words={q}"],
      ["Wayfair.ca", "https://www.wayfair.ca/keyword.php?keyword={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Etsy", "https://www.etsy.com/ca/search?q={q}"],
      shop("ca"),
    ],
    baby: [
      ["Walmart", "https://www.walmart.ca/en/search?q={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Well.ca", "https://well.ca/searchresult.html?keyword={q}"],
      ["Indigo", "https://www.indigo.ca/en-ca/search/?keywords={q}"],
      ["Wayfair.ca", "https://www.wayfair.ca/keyword.php?keyword={q}"],
      shop("ca"),
    ],
    toys: [
      ["Walmart", "https://www.walmart.ca/en/search?q={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Indigo", "https://www.indigo.ca/en-ca/search/?keywords={q}"],
      ["Best Buy", "https://www.bestbuy.ca/en-ca/search?search={q}"],
      ["Etsy", "https://www.etsy.com/ca/search?q={q}"],
      shop("ca"),
    ],
    tech: [
      ["Best Buy", "https://www.bestbuy.ca/en-ca/search?search={q}"],
      ["Walmart", "https://www.walmart.ca/en/search?q={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Staples", "https://www.staples.ca/search?query={q}"],
      shop("ca"),
    ],
    pets: [
      ["Walmart", "https://www.walmart.ca/en/search?q={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Well.ca", "https://well.ca/searchresult.html?keyword={q}"],
      shop("ca"),
    ],
    garden: [
      ["Home Depot", "https://www.homedepot.ca/search?q={q}"],
      ["Canadian Tire", "https://www.canadiantire.ca/en/search-results.html?q={q}"],
      ["Walmart", "https://www.walmart.ca/en/search?q={q}"],
      ["Wayfair.ca", "https://www.wayfair.ca/keyword.php?keyword={q}"],
      shop("ca"),
    ],
  },
  GB: {
    home: [
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["John Lewis", "https://www.johnlewis.com/search?search-term={q}"],
      ["Wayfair.co.uk", "https://www.wayfair.co.uk/keyword.php?keyword={q}"],
      ["Etsy", "https://www.etsy.com/uk/search?q={q}"],
      shop("co.uk"),
    ],
    baby: [
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["John Lewis", "https://www.johnlewis.com/search?search-term={q}"],
      ["Boots", "https://www.boots.com/sitesearch?searchTerm={q}"],
      ["Mamas & Papas", "https://www.mamasandpapas.com/en-gb/search?q={q}"],
      ["Etsy", "https://www.etsy.com/uk/search?q={q}"],
      shop("co.uk"),
    ],
    toys: [
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["Smyths Toys", "https://www.smythstoys.com/uk/en-gb/search/?text={q}"],
      ["John Lewis", "https://www.johnlewis.com/search?search-term={q}"],
      ["The Entertainer", "https://www.thetoyshop.com/search?text={q}"],
      ["Etsy", "https://www.etsy.com/uk/search?q={q}"],
      shop("co.uk"),
    ],
    tech: [
      ["Currys", "https://www.currys.co.uk/search?q={q}"],
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["John Lewis", "https://www.johnlewis.com/search?search-term={q}"],
      ["AO", "https://ao.com/l/search?search={q}"],
      shop("co.uk"),
    ],
    pets: [
      ["Pets at Home", "https://www.petsathome.com/shop/en/pets/search?q={q}"],
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["Zooplus", "https://www.zooplus.co.uk/shop/search?q={q}"],
      ["B&M", "https://www.bmstores.co.uk/search?query={q}"],
      shop("co.uk"),
    ],
    garden: [
      ["B&Q", "https://www.diy.com/search?term={q}"],
      ["Argos", "https://www.argos.co.uk/search/{q}/"],
      ["Wickes", "https://www.wickes.co.uk/search?text={q}"],
      shop("co.uk"),
    ],
  },
  IE: {
    home: [
      ["Argos", "https://www.argos.ie/search/{q}/"],
      ["Brown Thomas", "https://www.brownthomas.com/search/?q={q}"],
      ["IKEA", "https://www.ikea.com/ie/en/search/?q={q}"],
      ["Harvey Norman", "https://www.harveynorman.ie/catalogsearch/result/?q={q}"],
      shop("ie"),
    ],
    baby: [
      ["Argos", "https://www.argos.ie/search/{q}/"],
      ["Smyths Toys", "https://www.smythstoys.com/ie/en-ie/search/?text={q}"],
      ["IKEA", "https://www.ikea.com/ie/en/search/?q={q}"],
      shop("ie"),
    ],
    toys: [
      ["Smyths Toys", "https://www.smythstoys.com/ie/en-ie/search/?text={q}"],
      ["Argos", "https://www.argos.ie/search/{q}/"],
      shop("ie"),
    ],
    tech: [
      ["Harvey Norman", "https://www.harveynorman.ie/catalogsearch/result/?q={q}"],
      ["Currys", "https://www.currys.ie/search?q={q}"],
      ["Argos", "https://www.argos.ie/search/{q}/"],
      ["DID Electrical", "https://www.did.ie/search?q={q}"],
      shop("ie"),
    ],
    pets: [
      ["Maxi Zoo", "https://www.maxizoo.ie/search/?q={q}"],
      ["Zooplus", "https://www.zooplus.ie/shop/search?q={q}"],
      ["Argos", "https://www.argos.ie/search/{q}/"],
      shop("ie"),
    ],
    garden: [
      ["Argos", "https://www.argos.ie/search/{q}/"],
      ["IKEA", "https://www.ikea.com/ie/en/search/?q={q}"],
      shop("ie"),
    ],
  },
  AU: {
    home: [
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      ["Myer", "https://www.myer.com.au/search?query={q}"],
      ["Target Australia", "https://www.target.com.au/search?text={q}"],
      ["Etsy", "https://www.etsy.com/au/search?q={q}"],
      shop("com.au"),
    ],
    baby: [
      ["Baby Bunting", "https://www.babybunting.com.au/search?q={q}"],
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      ["Target Australia", "https://www.target.com.au/search?text={q}"],
      ["Myer", "https://www.myer.com.au/search?query={q}"],
      shop("com.au"),
    ],
    toys: [
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      ["Target Australia", "https://www.target.com.au/search?text={q}"],
      ["Toyworld", "https://www.toyworld.com.au/search?q={q}"],
      ["Myer", "https://www.myer.com.au/search?query={q}"],
      shop("com.au"),
    ],
    tech: [
      ["JB Hi-Fi", "https://www.jbhifi.com.au/search?query={q}"],
      ["Harvey Norman", "https://www.harveynorman.com.au/catalogsearch/result/?q={q}"],
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      shop("com.au"),
    ],
    pets: [
      ["Pet Circle", "https://www.petcircle.com.au/search?q={q}"],
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      shop("com.au"),
    ],
    garden: [
      ["Bunnings", "https://www.bunnings.com.au/search/products?q={q}"],
      ["Kmart", "https://www.kmart.com.au/search/?searchTerm={q}"],
      ["Big W", "https://www.bigw.com.au/search?q={q}"],
      ["Target Australia", "https://www.target.com.au/search?text={q}"],
      shop("com.au"),
    ],
  },
  NZ: {
    home: [
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["Briscoes", "https://www.briscoes.co.nz/search?q={q}"],
      ["Farmers", "https://www.farmers.co.nz/search?q={q}"],
      ["Kmart", "https://www.kmart.co.nz/search/?searchTerm={q}"],
      ["Etsy", "https://www.etsy.com/search?q={q}"],
      shop("co.nz"),
    ],
    baby: [
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["Farmers", "https://www.farmers.co.nz/search?q={q}"],
      ["Kmart", "https://www.kmart.co.nz/search/?searchTerm={q}"],
      ["Briscoes", "https://www.briscoes.co.nz/search?q={q}"],
      shop("co.nz"),
    ],
    toys: [
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["Kmart", "https://www.kmart.co.nz/search/?searchTerm={q}"],
      ["Farmers", "https://www.farmers.co.nz/search?q={q}"],
      ["Briscoes", "https://www.briscoes.co.nz/search?q={q}"],
      shop("co.nz"),
    ],
    tech: [
      ["Noel Leeming", "https://www.noelleeming.co.nz/search?q={q}"],
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["JB Hi-Fi", "https://www.jbhifi.co.nz/search?query={q}"],
      shop("co.nz"),
    ],
    pets: [
      ["Animates", "https://www.animates.co.nz/search?q={q}"],
      ["Petstock", "https://www.petstock.co.nz/search?q={q}"],
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["Farmers", "https://www.farmers.co.nz/search?q={q}"],
      shop("co.nz"),
    ],
    garden: [
      ["Mitre 10", "https://www.mitre10.co.nz/search?q={q}"],
      ["Bunnings", "https://www.bunnings.co.nz/search/products?q={q}"],
      ["The Warehouse", "https://www.thewarehouse.co.nz/search?q={q}"],
      ["Kmart", "https://www.kmart.co.nz/search/?searchTerm={q}"],
      shop("co.nz"),
    ],
  },
  DE: {
    home: [
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["IKEA", "https://www.ikea.com/de/de/search/?q={q}"],
      ["Kaufland", "https://www.kaufland.de/s/?search_value={q}"],
      ["Etsy", "https://www.etsy.com/de/search?q={q}"],
      shop("de"),
    ],
    baby: [
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["dm", "https://www.dm.de/search?query={q}"],
      ["Kaufland", "https://www.kaufland.de/s/?search_value={q}"],
      ["IKEA", "https://www.ikea.com/de/de/search/?q={q}"],
      ["Etsy", "https://www.etsy.com/de/search?q={q}"],
      shop("de"),
    ],
    toys: [
      ["Smyths Toys", "https://www.smythstoys.com/de/de-de/search/?text={q}"],
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["Thalia", "https://www.thalia.de/suche?sq={q}"],
      ["Kaufland", "https://www.kaufland.de/s/?search_value={q}"],
      ["Etsy", "https://www.etsy.com/de/search?q={q}"],
      shop("de"),
    ],
    tech: [
      ["MediaMarkt", "https://www.mediamarkt.de/de/search.html?query={q}"],
      ["Saturn", "https://www.saturn.de/de/search.html?query={q}"],
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["Kaufland", "https://www.kaufland.de/s/?search_value={q}"],
      shop("de"),
    ],
    pets: [
      ["Zooplus", "https://www.zooplus.de/shop/search?q={q}"],
      ["Fressnapf", "https://www.fressnapf.de/search/?q={q}"],
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["Kaufland", "https://www.kaufland.de/s/?search_value={q}"],
      shop("de"),
    ],
    garden: [
      ["Hornbach", "https://www.hornbach.de/s/{q}"],
      ["OBI", "https://www.obi.de/search/{q}/"],
      ["Bauhaus", "https://www.bauhaus.info/suche/produkte?text={q}"],
      ["Otto", "https://www.otto.de/suche/{q}/"],
      ["IKEA", "https://www.ikea.com/de/de/search/?q={q}"],
      shop("de"),
    ],
  },
  AT: {
    home: [
      ["IKEA", "https://www.ikea.com/at/de/search/?q={q}"],
      ["XXXLutz", "https://www.xxxlutz.at/search?q={q}"],
      ["mömax", "https://www.moemax.at/search?q={q}"],
      ["MediaMarkt", "https://www.mediamarkt.at/de/search.html?query={q}"],
      ["Etsy", "https://www.etsy.com/de/search?q={q}"],
      shop("at"),
    ],
    baby: [
      ["dm", "https://www.dm.at/search?query={q}"],
      ["IKEA", "https://www.ikea.com/at/de/search/?q={q}"],
      ["XXXLutz", "https://www.xxxlutz.at/search?q={q}"],
      shop("at"),
    ],
    toys: [
      ["Thalia", "https://www.thalia.at/suche?sq={q}"],
      ["Smyths Toys", "https://www.smythstoys.com/at/de-at/search/?text={q}"],
      ["MediaMarkt", "https://www.mediamarkt.at/de/search.html?query={q}"],
      shop("at"),
    ],
    tech: [
      ["MediaMarkt", "https://www.mediamarkt.at/de/search.html?query={q}"],
      ["Saturn", "https://www.saturn.at/de/search.html?query={q}"],
      ["Interspar", "https://www.interspar.at/shop/lebensmittel/search/?q={q}"],
      shop("at"),
    ],
    pets: [
      ["Fressnapf", "https://www.fressnapf.at/search/?q={q}"],
      ["Zooplus", "https://www.zooplus.at/shop/search?q={q}"],
      ["dm", "https://www.dm.at/search?query={q}"],
      shop("at"),
    ],
    garden: [
      ["Hornbach", "https://www.hornbach.at/s/{q}"],
      ["OBI", "https://www.obi.at/search/{q}/"],
      ["Bauhaus", "https://www.bauhaus.at/suche/produkte?text={q}"],
      ["IKEA", "https://www.ikea.com/at/de/search/?q={q}"],
      shop("at"),
    ],
  },
  FR: {
    home: [
      ["La Redoute", "https://www.laredoute.fr/psrch/psrch.aspx?kwd={q}"],
      ["IKEA", "https://www.ikea.com/fr/fr/search/?q={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      ["Etsy", "https://www.etsy.com/fr/search?q={q}"],
      shop("fr"),
    ],
    baby: [
      ["La Redoute", "https://www.laredoute.fr/psrch/psrch.aspx?kwd={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      ["Auchan", "https://www.auchan.fr/recherche?text={q}"],
      ["Etsy", "https://www.etsy.com/fr/search?q={q}"],
      shop("fr"),
    ],
    toys: [
      ["La Grande Récré", "https://www.lagranderecre.fr/catalogsearch/result/?q={q}"],
      ["Fnac", "https://www.fnac.com/SearchResult/ResultList.aspx?Search={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      shop("fr"),
    ],
    tech: [
      ["Fnac", "https://www.fnac.com/SearchResult/ResultList.aspx?Search={q}"],
      ["Darty", "https://www.darty.com/nav/recherche?text={q}"],
      ["Boulanger", "https://www.boulanger.com/resultats?tr={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      shop("fr"),
    ],
    pets: [
      ["Zooplus", "https://www.zooplus.fr/shop/search?q={q}"],
      ["Maxi Zoo", "https://www.maxizoo.fr/search/?q={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      ["Auchan", "https://www.auchan.fr/recherche?text={q}"],
      shop("fr"),
    ],
    garden: [
      ["Leroy Merlin", "https://www.leroymerlin.fr/produits/?q={q}"],
      ["Castorama", "https://www.castorama.fr/search?term={q}"],
      ["Cdiscount", "https://www.cdiscount.com/search/10/{q}.html"],
      ["IKEA", "https://www.ikea.com/fr/fr/search/?q={q}"],
      shop("fr"),
    ],
  },
  ES: {
    home: [
      ["El Corte Inglés", "https://www.elcorteingles.es/search-nwx/?s={q}"],
      ["IKEA", "https://www.ikea.com/es/es/search/?q={q}"],
      ["Carrefour", "https://www.carrefour.es/?q={q}"],
      ["Etsy", "https://www.etsy.com/es/search?q={q}"],
      shop("es"),
    ],
    baby: [
      ["El Corte Inglés", "https://www.elcorteingles.es/search-nwx/?s={q}"],
      ["Carrefour", "https://www.carrefour.es/?q={q}"],
      ["IKEA", "https://www.ikea.com/es/es/search/?q={q}"],
      shop("es"),
    ],
    toys: [
      ["El Corte Inglés", "https://www.elcorteingles.es/search-nwx/?s={q}"],
      ["Juguettos", "https://www.juguettos.com/busqueda?controller=search&s={q}"],
      ["Carrefour", "https://www.carrefour.es/?q={q}"],
      ["Fnac", "https://www.fnac.es/SearchResult/ResultList.aspx?Search={q}"],
      shop("es"),
    ],
    tech: [
      ["MediaMarkt", "https://www.mediamarkt.es/es/search.html?query={q}"],
      ["PcComponentes", "https://www.pccomponentes.com/buscar/?query={q}"],
      ["Fnac", "https://www.fnac.es/SearchResult/ResultList.aspx?Search={q}"],
      ["El Corte Inglés", "https://www.elcorteingles.es/search-nwx/?s={q}"],
      shop("es"),
    ],
    pets: [
      ["Zooplus", "https://www.zooplus.es/shop/search?q={q}"],
      ["Carrefour", "https://www.carrefour.es/?q={q}"],
      shop("es"),
    ],
    garden: [
      ["Leroy Merlin", "https://www.leroymerlin.es/search?q={q}"],
      ["Bricomart", "https://www.bricomart.es/search?q={q}"],
      ["IKEA", "https://www.ikea.com/es/es/search/?q={q}"],
      ["Carrefour", "https://www.carrefour.es/?q={q}"],
      shop("es"),
    ],
  },
  PT: {
    home: [
      ["IKEA", "https://www.ikea.com/pt/pt/search/?q={q}"],
      ["El Corte Inglés", "https://www.elcorteingles.pt/search-nwx/?s={q}"],
      ["Worten", "https://www.worten.pt/search?query={q}"],
      ["Continente", "https://www.continente.pt/pesquisa/?q={q}"],
      ["Etsy", "https://www.etsy.com/search?q={q}"],
      shop("pt"),
    ],
    baby: [
      ["El Corte Inglés", "https://www.elcorteingles.pt/search-nwx/?s={q}"],
      ["Continente", "https://www.continente.pt/pesquisa/?q={q}"],
      ["IKEA", "https://www.ikea.com/pt/pt/search/?q={q}"],
      ["Worten", "https://www.worten.pt/search?query={q}"],
      shop("pt"),
    ],
    toys: [
      ["Continente", "https://www.continente.pt/pesquisa/?q={q}"],
      ["El Corte Inglés", "https://www.elcorteingles.pt/search-nwx/?s={q}"],
      ["Fnac", "https://www.fnac.pt/SearchResult/ResultList.aspx?Search={q}"],
      ["Worten", "https://www.worten.pt/search?query={q}"],
      shop("pt"),
    ],
    tech: [
      ["Worten", "https://www.worten.pt/search?query={q}"],
      ["Fnac", "https://www.fnac.pt/SearchResult/ResultList.aspx?Search={q}"],
      ["El Corte Inglés", "https://www.elcorteingles.pt/search-nwx/?s={q}"],
      shop("pt"),
    ],
    pets: [
      ["Zooplus", "https://www.zooplus.pt/shop/search?q={q}"],
      ["Continente", "https://www.continente.pt/pesquisa/?q={q}"],
      ["El Corte Inglés", "https://www.elcorteingles.pt/search-nwx/?s={q}"],
      shop("pt"),
    ],
    garden: [
      ["Leroy Merlin", "https://www.leroymerlin.pt/pesquisa?q={q}"],
      ["IKEA", "https://www.ikea.com/pt/pt/search/?q={q}"],
      ["Continente", "https://www.continente.pt/pesquisa/?q={q}"],
      shop("pt"),
    ],
  },
  MX: {
    home: [
      ["Liverpool", "https://www.liverpool.com.mx/tienda?s={q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      ["Home Depot", "https://www.homedepot.com.mx/s/{q}"],
      shop("com.mx"),
    ],
    baby: [
      ["Liverpool", "https://www.liverpool.com.mx/tienda?s={q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      shop("com.mx"),
    ],
    toys: [
      ["Liverpool", "https://www.liverpool.com.mx/tienda?s={q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      shop("com.mx"),
    ],
    tech: [
      ["Liverpool", "https://www.liverpool.com.mx/tienda?s={q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      shop("com.mx"),
    ],
    pets: [
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      shop("com.mx"),
    ],
    garden: [
      ["Home Depot", "https://www.homedepot.com.mx/s/{q}"],
      ["Walmart", "https://www.walmart.com.mx/search?q={q}"],
      ["Mercado Libre", "https://listado.mercadolibre.com.mx/{q}"],
      ["Costco", "https://www.costco.com.mx/search?text={q}"],
      shop("com.mx"),
    ],
  },
  BR: {
    home: [
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Casas Bahia", "https://www.casasbahia.com.br/{q}/b"],
      ["Americanas", "https://www.americanas.com.br/busca/{q}"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
    baby: [
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Casas Bahia", "https://www.casasbahia.com.br/{q}/b"],
      ["Americanas", "https://www.americanas.com.br/busca/{q}"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
    toys: [
      ["Ri Happy", "https://www.rihappy.com.br/{q}"],
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Americanas", "https://www.americanas.com.br/busca/{q}"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
    tech: [
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Casas Bahia", "https://www.casasbahia.com.br/{q}/b"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
    pets: [
      ["Petz", "https://www.petz.com.br/busca?q={q}"],
      ["Cobasi", "https://www.cobasi.com.br/pesquisa?terms={q}"],
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
    garden: [
      ["Leroy Merlin", "https://www.leroymerlin.com.br/search?term={q}"],
      ["Magazine Luiza", "https://www.magazineluiza.com.br/busca/{q}/"],
      ["Casas Bahia", "https://www.casasbahia.com.br/{q}/b"],
      ["Mercado Livre", "https://lista.mercadolivre.com.br/{q}"],
      shop("com.br"),
    ],
  },
  IN: {
    home: [
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      ["Pepperfry", "https://www.pepperfry.com/site_product/search?q={q}"],
      ["Urban Ladder", "https://www.urbanladder.com/products?q={q}"],
      ["IKEA", "https://www.ikea.com/in/en/search/?q={q}"],
      ["Myntra", "https://www.myntra.com/{q}"],
      shop("co.in"),
    ],
    baby: [
      ["FirstCry", "https://www.firstcry.com/search?q={q}"],
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      ["Nykaa", "https://www.nykaa.com/search/result/?q={q}"],
      ["Myntra", "https://www.myntra.com/{q}"],
      shop("co.in"),
    ],
    toys: [
      ["Hamleys", "https://www.hamleys.in/search?q={q}"],
      ["FirstCry", "https://www.firstcry.com/search?q={q}"],
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      shop("co.in"),
    ],
    tech: [
      ["Croma", "https://www.croma.com/searchB?q={q}"],
      ["Reliance Digital", "https://www.reliancedigital.in/search?q={q}"],
      ["Vijay Sales", "https://www.vijaysales.com/search-listing?q={q}"],
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      shop("co.in"),
    ],
    pets: [
      ["Supertails", "https://supertails.com/search?q={q}"],
      ["Heads Up For Tails", "https://headsupfortails.com/search?q={q}"],
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      shop("co.in"),
    ],
    garden: [
      ["Ugaoo", "https://www.ugaoo.com/search?q={q}"],
      ["Flipkart", "https://www.flipkart.com/search?q={q}"],
      ["Pepperfry", "https://www.pepperfry.com/site_product/search?q={q}"],
      ["IKEA", "https://www.ikea.com/in/en/search/?q={q}"],
      shop("co.in"),
    ],
  },
  CN: {
    home: [
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Taobao", "https://s.taobao.com/search?q={q}"],
      ["Pinduoduo", "https://mobile.yangkeduo.com/search_result.html?search_key={q}"],
      ["Suning", "https://search.suning.com/{q}/"],
      shop("com.hk"),
    ],
    baby: [
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Taobao", "https://s.taobao.com/search?q={q}"],
      ["Pinduoduo", "https://mobile.yangkeduo.com/search_result.html?search_key={q}"],
      shop("com.hk"),
    ],
    toys: [
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Taobao", "https://s.taobao.com/search?q={q}"],
      ["Pinduoduo", "https://mobile.yangkeduo.com/search_result.html?search_key={q}"],
      shop("com.hk"),
    ],
    tech: [
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["Suning", "https://search.suning.com/{q}/"],
      shop("com.hk"),
    ],
    pets: [
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Taobao", "https://s.taobao.com/search?q={q}"],
      ["Pinduoduo", "https://mobile.yangkeduo.com/search_result.html?search_key={q}"],
      shop("com.hk"),
    ],
    garden: [
      ["JD.com", "https://search.jd.com/Search?keyword={q}"],
      ["Tmall", "https://list.tmall.com/search_product.htm?q={q}"],
      ["Taobao", "https://s.taobao.com/search?q={q}"],
      ["Pinduoduo", "https://mobile.yangkeduo.com/search_result.html?search_key={q}"],
      shop("com.hk"),
    ],
  },
  TW: {
    home: [
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["IKEA", "https://www.ikea.com.tw/zh/search/?q={q}"],
      ["Costco", "https://www.costco.com.tw/search?text={q}"],
      shop("com.tw"),
    ],
    baby: [
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["Costco", "https://www.costco.com.tw/search?text={q}"],
      shop("com.tw"),
    ],
    toys: [
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["Costco", "https://www.costco.com.tw/search?text={q}"],
      shop("com.tw"),
    ],
    tech: [
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["Costco", "https://www.costco.com.tw/search?text={q}"],
      shop("com.tw"),
    ],
    pets: [
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["Costco", "https://www.costco.com.tw/search?text={q}"],
      shop("com.tw"),
    ],
    garden: [
      ["momo", "https://www.momoshop.com.tw/search/searchShop.jsp?keyword={q}"],
      ["PChome 24h", "https://24h.pchome.com.tw/search/?q={q}"],
      ["Shopee", "https://shopee.tw/search?keyword={q}"],
      ["IKEA", "https://www.ikea.com.tw/zh/search/?q={q}"],
      shop("com.tw"),
    ],
  },
  JP: {
    home: [
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      ["Yahoo!ショッピング", "https://shopping.yahoo.co.jp/search/{q}/0/"],
      ["Nitori", "https://www.nitori-net.jp/store/ja/ec/search?q={q}"],
      ["Muji", "https://www.muji.com/jp/ja/search?q={q}"],
      ["Francfranc", "https://www.francfranc.com/search?keyword={q}"],
      shop("co.jp"),
    ],
    baby: [
      ["Akachan Honpo", "https://shop.akachan.jp/shop/goods/search.aspx?q={q}&search=x"],
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      ["Yahoo!ショッピング", "https://shopping.yahoo.co.jp/search/{q}/0/"],
      ["Nitori", "https://www.nitori-net.jp/store/ja/ec/search?q={q}"],
      shop("co.jp"),
    ],
    toys: [
      ["Toys\"R\"Us Japan", "https://www.toysrus.co.jp/search/?q={q}"],
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      ["Yahoo!ショッピング", "https://shopping.yahoo.co.jp/search/{q}/0/"],
      ["Akachan Honpo", "https://shop.akachan.jp/shop/goods/search.aspx?q={q}&search=x"],
      shop("co.jp"),
    ],
    tech: [
      ["Yodobashi", "https://www.yodobashi.com/?word={q}"],
      ["Bic Camera", "https://www.biccamera.com/bc/category/?q={q}"],
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      ["Yahoo!ショッピング", "https://shopping.yahoo.co.jp/search/{q}/0/"],
      shop("co.jp"),
    ],
    pets: [
      ["Cainz", "https://www.cainz.com/search/?q={q}"],
      ["Kohnan", "https://www.kohnan-eshop.com/shop/goods/search.aspx?keyword={q}"],
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      ["Yahoo!ショッピング", "https://shopping.yahoo.co.jp/search/{q}/0/"],
      shop("co.jp"),
    ],
    garden: [
      ["Cainz", "https://www.cainz.com/search/?q={q}"],
      ["Kohnan", "https://www.kohnan-eshop.com/shop/goods/search.aspx?keyword={q}"],
      ["Nitori", "https://www.nitori-net.jp/store/ja/ec/search?q={q}"],
      ["Rakuten Ichiba", "https://search.rakuten.co.jp/search/mall/{q}/"],
      shop("co.jp"),
    ],
  },
};

const toList = (rows: R[]): Retailer[] => rows.map(([name, url]) => ({ name, url }));

/** A supported country code, or the default. Accepts any case; never throws. */
export function normalizeCountry(value: unknown): string {
  const code = String(value ?? "").trim().toUpperCase();
  return code in DATA ? code : DEFAULT_COUNTRY;
}

/** Stores to try for this kind of product in this country (the home list when it has none). */
export function retailerSearchLinks(country: unknown, shelf: Shelf = "home"): Retailer[] {
  const data = DATA[normalizeCountry(country)];
  return toList(data[shelf] ?? data.home);
}

/** Every shelf's stores for a country, for the manage page's script. */
export function retailersByShelf(country: unknown): Record<Shelf, Retailer[]> {
  return Object.fromEntries(SHELVES.map((s) => [s, retailerSearchLinks(country, s)])) as Record<Shelf, Retailer[]>;
}

/**
 * Which shelf an idea belongs to, from its occasion and its (English) group and
 * subgroup labels. Anything unrecognised is "home", the broadest list.
 */
export function shelfForIdea(eventType: string, groupLabel: string, subLabel: string): Shelf {
  if (eventType === "baby" || eventType === "christening") return "baby";
  if (eventType === "new-pet") return "pets";
  const text = `${groupLabel} ${subLabel}`;
  if (/\b(dogs?|cats?|pets?|birds?|fish|aquarium|animal)\b/i.test(text)) return "pets";
  if (/\b(nursery|baby|diaper|newborn)\b/i.test(text)) return "baby";
  if (/\b(tech|audio|video|camera|cameras|gaming|smart home|e-reader|gadgets|laptop|phone)\b/i.test(text)) return "tech";
  if (/\b(kids?|toys?|children|dolls?|play|teens?)\b/i.test(text)) return "toys";
  if (/\b(garden|gardening|outdoors?|patio|yard|grilling|camping)\b/i.test(text)) return "garden";
  return "home";
}
