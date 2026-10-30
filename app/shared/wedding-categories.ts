/**
 * Suggested gift categories for wedding registries.
 *
 * Scoped to eventType === "wedding" only (see CLAUDE.md / Ben's request,
 * 23 Sep 2026) — other event types get no suggestions yet.
 *
 * This is an original taxonomy written from general knowledge of what
 * wedding registries typically contain, informed by (not copied from)
 * publicly published checklist articles from Zola and The Knot, then
 * expanded well past what either of those covers — room-by-room, with the
 * specific appliances and items couples commonly ask for under each
 * subcategory, so a bride can actually check things off rather than stare
 * at ten vague headings. Category and item names built from a handful of
 * common nouns aren't protectable expression on their own (Feist v. Rural
 * Tel.), but the structure, grouping and depth here are original to
 * Giftpin, not lifted from any source.
 *
 * Deliberately NOT a `.server` module — `manage-page.ts` (a plain render
 * file bundled for the browser, not a loader/action) imports this
 * directly, same reasoning as `app/shared/settings.ts`.
 */

export interface WeddingGiftItem {
  /** Shown as the chip label and, unless overridden, used as the search term. */
  name: string;
  /** Only needed when the plain item name would search badly (rare). */
  searchTerm?: string;
  /**
   * What tapping it does. Left out, it searches the merchant's store. "fund"
   * opens the registry's cash fund form with this name filled in (Pro, needs
   * the store's gift card product); "experience" adds it to the list by name,
   * with an optional booking link, for the guest to buy elsewhere. Neither is
   * shown when the store has that feature off, so no idea is a dead end (Ben,
   * 29 Oct 2026).
   */
  kind?: IdeaKind;
}

export type IdeaKind = "fund" | "experience";

export interface WeddingGiftSubcategory {
  id: string;
  label: string;
  items: WeddingGiftItem[];
}

export interface WeddingGiftCategory {
  id: string;
  label: string;
  subcategories: WeddingGiftSubcategory[];
}

export const WEDDING_GIFT_CATEGORIES: WeddingGiftCategory[] = [
  {
    id: "kitchen",
    label: "Kitchen",
    subcategories: [
      {
        id: "cookware",
        label: "Cookware",
        items: [
          { name: "Stockpot" },
          { name: "Saucepan set" },
          { name: "Skillet" },
          { name: "Dutch oven" },
          { name: "Sheet pans" },
          { name: "Cast iron pan" },
        ],
      },
      {
        id: "appliances",
        label: "Small appliances",
        items: [
          { name: "Stand mixer" },
          { name: "Hand mixer" },
          { name: "Blender" },
          { name: "Food processor" },
          { name: "Air fryer" },
          { name: "Toaster" },
          { name: "Coffee maker" },
          { name: "Electric kettle" },
          { name: "Slow cooker" },
          { name: "Rice cooker" },
        ],
      },
      {
        id: "prep",
        label: "Prep & tools",
        items: [
          { name: "Knife set" },
          { name: "Cutting boards" },
          { name: "Mixing bowls" },
          { name: "Measuring cups & spoons", searchTerm: "measuring cups" },
          { name: "Kitchen shears" },
          { name: "Colander" },
        ],
      },
    ],
  },
  {
    id: "dining",
    label: "Tabletop & dining",
    subcategories: [
      {
        id: "everyday-dinnerware",
        label: "Everyday dinnerware",
        items: [
          { name: "Dinner plates" },
          { name: "Side plates" },
          { name: "Bowls" },
          { name: "Mugs" },
        ],
      },
      {
        id: "formal-dinnerware",
        label: "Special-occasion dinnerware",
        items: [{ name: "Fine china set" }, { name: "Serving platter" }],
      },
      {
        id: "flatware-glassware",
        label: "Flatware & glassware",
        items: [
          { name: "Flatware set" },
          { name: "Wine glasses" },
          { name: "Water glasses" },
          { name: "Champagne flutes" },
        ],
      },
      {
        id: "serving",
        label: "Serving",
        items: [
          { name: "Serving bowls" },
          { name: "Salad servers" },
          { name: "Pitcher" },
          { name: "Cheese board" },
        ],
      },
    ],
  },
  {
    id: "bedding",
    label: "Bedding",
    subcategories: [
      {
        id: "sheets",
        label: "Sheets & pillows",
        items: [
          { name: "Sheet set (queen)", searchTerm: "queen sheet set" },
          { name: "Sheet set (king)", searchTerm: "king sheet set" },
          { name: "Pillows" },
          { name: "Pillow protectors" },
        ],
      },
      {
        id: "comforters",
        label: "Comforters & covers",
        items: [
          { name: "Comforter or duvet insert", searchTerm: "duvet insert" },
          { name: "Duvet cover" },
          { name: "Quilt" },
          { name: "Throw blanket" },
        ],
      },
      {
        id: "mattress",
        label: "Mattress care",
        items: [{ name: "Mattress protector" }, { name: "Mattress topper" }],
      },
    ],
  },
  {
    id: "bath",
    label: "Bath",
    subcategories: [
      {
        id: "towels",
        label: "Towels",
        items: [
          { name: "Bath towels" },
          { name: "Hand towels" },
          { name: "Washcloths" },
        ],
      },
      {
        id: "bath-essentials",
        label: "Bath essentials",
        items: [
          { name: "Bath mat" },
          { name: "Shower curtain & liner", searchTerm: "shower curtain" },
          { name: "Robes" },
        ],
      },
      {
        id: "bath-organization",
        label: "Organization",
        items: [
          { name: "Bathroom storage bins", searchTerm: "bathroom storage" },
          { name: "Soap dispenser set" },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Home & décor",
    subcategories: [
      {
        id: "furniture",
        label: "Furniture",
        items: [
          { name: "Sofa" },
          { name: "Dining table & chairs", searchTerm: "dining table" },
          { name: "Bed frame" },
          { name: "Nightstands" },
        ],
      },
      {
        id: "decor",
        label: "Décor",
        items: [
          { name: "Throw pillows" },
          { name: "Wall art" },
          { name: "Area rug" },
          { name: "Mirror" },
          { name: "Vases" },
        ],
      },
      {
        id: "lighting-smart",
        label: "Lighting & smart home",
        items: [
          { name: "Table lamp" },
          { name: "Smart speaker" },
          { name: "Robot vacuum" },
          { name: "Video doorbell" },
        ],
      },
    ],
  },
  {
    id: "outdoor",
    label: "Outdoor & patio",
    subcategories: [
      {
        id: "outdoor-furniture",
        label: "Furniture",
        items: [
          { name: "Patio set" },
          { name: "Outdoor lounge chairs" },
          { name: "Patio umbrella" },
        ],
      },
      {
        id: "grilling",
        label: "Grilling",
        items: [
          { name: "Grill" },
          { name: "Grill tool set" },
          { name: "Smoker" },
        ],
      },
      {
        id: "yard",
        label: "Yard & games",
        items: [
          { name: "Garden tools" },
          { name: "Planters" },
          { name: "Lawn games" },
        ],
      },
    ],
  },
  {
    id: "tech",
    label: "Tech & entertainment",
    subcategories: [
      {
        id: "audio-video",
        label: "Audio & video",
        items: [
          { name: "Bluetooth speaker" },
          { name: "Soundbar" },
          { name: "Headphones" },
          { name: "Streaming device" },
        ],
      },
      {
        id: "games",
        label: "Gaming & games",
        items: [{ name: "Games console" }, { name: "Board games" }],
      },
      {
        id: "cameras",
        label: "Cameras",
        items: [{ name: "Instant camera" }, { name: "Digital camera" }],
      },
    ],
  },
  {
    id: "travel",
    label: "Travel & luggage",
    subcategories: [
      {
        id: "luggage",
        label: "Luggage",
        items: [
          { name: "Carry-on suitcase" },
          { name: "Checked suitcase" },
          { name: "Duffel bag" },
        ],
      },
      {
        id: "packing",
        label: "Packing",
        items: [
          { name: "Packing cubes" },
          { name: "Toiletry bag" },
          { name: "Luggage tags" },
        ],
      },
      {
        id: "on-the-go",
        label: "On the go",
        items: [{ name: "Travel pillow" }, { name: "Portable charger" }],
      },
    ],
  },
  {
    id: "experiences",
    label: "Experiences",
    subcategories: [
      {
        id: "classes",
        label: "Classes & tastings",
        items: [
          { name: "Cooking class", kind: "experience" },
          { name: "Wine tasting", kind: "experience" },
          { name: "Dance lessons", kind: "experience" },
        ],
      },
      {
        id: "getaways",
        label: "Getaways",
        items: [
          { name: "Weekend trip", kind: "experience" },
          { name: "Spa day", kind: "experience" },
          { name: "Hot air balloon ride", kind: "experience" },
        ],
      },
    ],
  },
  // "Charitable donation in the couple's name" was here until 29 Oct 2026.
  // Removed: a fund is paid in this store's gift cards, so Giftpin has no way
  // to send money to a charity.
  {
    id: "funds",
    label: "Cash & honeymoon funds",
    subcategories: [
      {
        id: "funds-main",
        label: "Funds",
        items: [
          { name: "Honeymoon fund", kind: "fund" },
          { name: "Home down-payment fund", kind: "fund" },
          { name: "“New home” fund", kind: "fund" },
        ],
      },
    ],
  },
];
