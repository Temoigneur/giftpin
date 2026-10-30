import { WEDDING_GIFT_CATEGORIES, type IdeaKind } from "./wedding-categories";

export type { IdeaKind };

/**
 * "Not sure what to add?" ideas guides, one per occasion (24 Sep 2026, Ben's
 * request, extending the wedding room-by-room guide to every event type).
 *
 * Every guide has the same three levels as the wedding one (group → subgroup
 * → specific item), but the top level is whatever way people actually think
 * about that occasion: birthdays by age, baby by what the baby needs, college
 * by the parts of a dorm room, anniversaries by milestone year, and so on.
 * Original lists written for Giftpin from general knowledge, same as
 * `wedding-categories.ts`.
 *
 * Deliberately NOT a `.server` module — `manage-page.ts` imports it, same
 * reasoning as `app/shared/settings.ts`.
 */

export interface GiftIdeaItem {
  /** Shown as the chip label and, unless overridden, used as the search term. */
  name: string;
  /** Only needed when the plain item name would search badly. */
  searchTerm?: string;
  /** Left out = search the merchant's store. See IdeaKind in wedding-categories.ts. */
  kind?: IdeaKind;
}

export interface GiftIdeaSubgroup {
  id: string;
  label: string;
  items: GiftIdeaItem[];
}

export interface GiftIdeaGroup {
  id: string;
  label: string;
  subcategories: GiftIdeaSubgroup[];
}

export interface IdeaGuide {
  /** The rest of the "Not sure what to add?" line, e.g. "Birthday registry ideas, by age". */
  title: string;
  /** One sentence telling the registrant how the guide is organized. */
  intro: string;
  groups: GiftIdeaGroup[];
}

/** Per-occasion starting text for the create form, so each occasion reads as its own template. */
export interface OccasionTemplate {
  /** Placeholder for the registry name. */
  title: string;
  /** Placeholder for the note to guests. */
  note: string;
}

const TEMPLATES: Record<string, OccasionTemplate> = {
  wedding: { title: "Sam & Alex's Wedding", note: "We're so grateful you'll be celebrating with us. Your presence is the real gift, but if you'd like to give something, here are a few things we'd love for our home together." },
  engagement: { title: "Sam & Alex are engaged!", note: "Thank you for celebrating our engagement with us. A few things we'd love as we start planning." },
  "bridal-shower": { title: "Sam's Bridal Shower", note: "Thank you for showering me with love! Here are a few things for our new home." },
  baby: { title: "Baby Rivera is on the way", note: "We can't wait for you to meet our little one. Here's what we still need before baby arrives." },
  christening: { title: "Noah's Christening", note: "Thank you for being part of Noah's special day. A few keepsakes and gifts we'd treasure." },
  birthday: { title: "Maya turns 5!", note: "Thanks for celebrating with us! Here are a few things Maya would love." },
  "coming-of-age": { title: "Eli's Bar Mitzvah", note: "Thank you for sharing this milestone with our family. A few ideas if you'd like to give a gift." },
  graduation: { title: "Jordan's Graduation", note: "Thank you for cheering me on! Here's what would help as I start the next chapter." },
  college: { title: "Priya's Off to College", note: "Thanks for helping me get set up for move-in day! Here's what's still on my list." },
  housewarming: { title: "Sam & Alex's New Home", note: "We'd love to have you over! If you'd like to bring something, here's what our new place still needs." },
  anniversary: { title: "Pat & Lee's 25th Anniversary", note: "Thank you for celebrating 25 years with us. Your company is gift enough, but here are a few ideas." },
  retirement: { title: "Dana's Retirement", note: "Thank you for all the years together! A few things for the next adventure." },
  holiday: { title: "The Nguyen Family Holiday List", note: "Happy holidays! Here's our wish list, so nobody doubles up." },
  "new-pet": { title: "Welcome Home, Biscuit", note: "Our new family member has arrived! Here's what Biscuit still needs." },
  fundraiser: { title: "Winter Coat Drive", note: "Thank you for supporting our cause. Every item on this list goes straight to people who need it." },
  corporate: { title: "Team Holiday Gifts 2026", note: "Our gift list for the team this year." },
  wishlist: { title: "Sam's Wish List", note: "Here's what I'd love. Anything you buy from this page gets marked as taken, so nobody doubles up." },
  other: { title: "Sam's Wish List", note: "Thanks for thinking of me! Here are a few things I'd love." },
};

/** Starting text for an occasion's create form. Falls back to the general one. */
export function occasionTemplate(eventType: string): OccasionTemplate {
  return TEMPLATES[eventType] ?? TEMPLATES.other;
}

/** An item written as "Name" or "Name|better search term". */
type ItemSpec = string;

function items(specs: ItemSpec[], kind?: IdeaKind): GiftIdeaItem[] {
  return specs.map((spec) => {
    const [name, searchTerm] = spec.split("|");
    return { name, ...(searchTerm ? { searchTerm } : {}), ...(kind ? { kind } : {}) };
  });
}

/**
 * A subgroup: its label, its items, and (for things a store doesn't stock)
 * what tapping one does instead of a store search. Ideas that fit none of
 * these, like a charity donation or a savings bond, aren't listed at all:
 * every chip has to lead somewhere (Ben, 29 Oct 2026).
 */
type SubSpec = [string, ItemSpec[]] | [string, ItemSpec[], IdeaKind];

function group(id: string, label: string, subs: SubSpec[]): GiftIdeaGroup {
  return {
    id,
    label,
    subcategories: subs.map(([subLabel, specs, kind]) => ({
      id: subLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      label: subLabel,
      items: items(specs, kind),
    })),
  };
}

const EXPERIENCES = (extra: ItemSpec[] = []) =>
  group("experiences", "Experiences & cash funds", [
    ["Experiences", ["Concert tickets", "Cooking class", "Spa day", "Museum membership", ...extra], "experience"],
    ["Funds", ["Cash fund"], "fund"],
  ]);

const WEDDING_GUIDE: IdeaGuide = {
  title: "Wedding registry ideas, room by room",
  intro: "Open a room to see what couples commonly register for.",
  groups: WEDDING_GIFT_CATEGORIES,
};

const BRIDAL_SHOWER_GUIDE: IdeaGuide = {
  ...WEDDING_GUIDE,
  title: "Bridal shower ideas, room by room",
  intro: "Showers lean toward the kitchen, bath and entertaining. Open a room to see what's commonly given.",
};

const ENGAGEMENT_GUIDE: IdeaGuide = {
  title: "Engagement gift ideas",
  intro: "Engagement gifts are usually smaller and more personal than wedding gifts. Open a section for ideas.",
  groups: [
    group("celebrate", "To celebrate", [
      ["Toasting", ["Champagne flutes", "Wine glasses", "Ice bucket", "Cocktail shaker set"]],
      ["Keepsakes", ["Ring dish", "Photo frame", "Engraved keepsake box", "Guest book"]],
    ]),
    group("planning", "For the planning", [
      ["Getting organized", ["Wedding planner book", "Wedding binder", "Stationery set", "Desk calendar"]],
      ["Self-care", ["Robe", "Candle set", "Bath set", "Sleep mask"]],
    ]),
    group("together", "For the two of them", [
      ["At home", ["Throw blanket", "Board games for two|board game", "Coffee maker", "Picnic basket"]],
      ["Getting away", ["Weekender bag", "Travel accessories|travel kit", "Passport holders|passport holder"]],
    ]),
    group("funds", "Experiences & funds", [
      ["Experiences", ["Date night", "Couples' cooking class", "Wine tasting", "Weekend getaway"], "experience"],
      ["Funds", ["Wedding fund", "Honeymoon fund", "House down-payment fund"], "fund"],
    ]),
  ],
};

const BABY_GUIDE: IdeaGuide = {
  title: "Baby registry ideas, by what baby needs",
  intro: "Organized by what you'll need and when. Open a section to see what parents commonly register for.",
  groups: [
    group("nursery", "Nursery", [
      ["Sleep", ["Crib", "Crib mattress", "Fitted crib sheets", "Bassinet", "Sleep sacks", "Sound machine", "Baby monitor"]],
      ["Furniture", ["Dresser", "Changing table", "Glider", "Bookshelf"]],
      ["Décor & storage", ["Blackout curtains", "Nightlight", "Storage baskets", "Rug"]],
    ]),
    group("feeding", "Feeding", [
      ["Nursing", ["Breast pump", "Nursing pillow", "Nursing bras", "Milk storage bags", "Nipple cream"]],
      ["Bottles", ["Bottles", "Bottle brush", "Drying rack|bottle drying rack", "Bottle warmer", "Formula dispenser"]],
      ["Starting solids", ["High chair", "Bibs", "Baby spoons", "Suction bowls", "Sippy cups"]],
    ]),
    group("diapering", "Diapering", [
      ["Changing", ["Diapers", "Wipes", "Changing pad", "Diaper pail", "Diaper cream"]],
      ["On the go", ["Diaper bag", "Portable changing pad", "Wipes case"]],
    ]),
    group("bath", "Bath & care", [
      ["Bath time", ["Baby bathtub", "Hooded towels", "Washcloths", "Baby shampoo", "Bath toys"]],
      ["Health", ["Thermometer", "Nail clippers|baby nail clippers", "Nasal aspirator", "Humidifier", "First aid kit|baby first aid kit"]],
    ]),
    group("gear", "Gear & travel", [
      ["Getting around", ["Car seat", "Stroller", "Baby carrier", "Car seat mirror"]],
      ["At home", ["Bouncer", "Swing|baby swing", "Play mat", "Playard", "Baby gates"]],
    ]),
    group("clothing", "Clothes, by size", [
      ["Newborn to 3 months", ["Onesies", "Sleepers", "Swaddles", "Socks|baby socks", "Hats|baby hats"]],
      ["3 to 12 months", ["Bodysuits", "Pajamas|baby pajamas", "Leggings|baby leggings", "Snowsuit"]],
      ["12 to 24 months", ["Toddler outfits", "First shoes", "Rain jacket|toddler rain jacket"]],
    ]),
    group("play", "Toys & books, by age", [
      ["0 to 6 months", ["Rattles", "Soft books", "Teethers", "Activity gym"]],
      ["6 to 12 months", ["Stacking cups", "Board books", "Activity cube", "Push walker"]],
      ["1 to 2 years", ["Shape sorter", "Ride-on toy", "Blocks", "Musical toys"]],
    ]),
    group("funds", "Funds & help", [
      ["Funds", ["Diaper fund", "College savings fund", "Parental leave fund"], "fund"],
      ["Help", ["Meal delivery", "Night nurse", "House cleaning", "Newborn photo shoot"], "experience"],
    ]),
  ],
};

const CHRISTENING_GUIDE: IdeaGuide = {
  title: "Baptism and christening ideas",
  intro: "Keepsakes are traditional, practical gifts are always welcome. Open a section for ideas.",
  groups: [
    group("keepsakes", "Keepsakes", [
      ["Faith", ["Children's Bible", "Cross necklace", "Rosary", "Prayer book", "Guardian angel figurine"]],
      ["Mementos", ["Silver cup|christening cup", "Engraved rattle", "Keepsake box", "Photo album", "Baby memory book"]],
    ]),
    group("occasion", "For the day", [
      ["What to wear", ["Christening gown", "Christening outfit", "White shoes|baby white shoes", "Bonnet"]],
      ["Blankets", ["Christening blanket", "Personalized blanket"]],
    ]),
    group("growing", "For growing up", [
      ["Books", ["Bedtime prayer book", "Children's storybooks", "Board books"]],
      ["Nursery", ["Nightlight", "Wall cross", "Personalized name sign", "Soft toy"]],
    ]),
    group("funds", "Funds", [
      ["Funds", ["Education savings fund"], "fund"],
    ]),
  ],
};

const BIRTHDAY_GUIDE: IdeaGuide = {
  title: "Birthday registry ideas, by age",
  intro: "Open an age group to see gifts that suit it.",
  groups: [
    group("first", "First birthday", [
      ["Play", ["Push walker", "Stacking toys", "Activity cube", "Ride-on toy", "Soft blocks"]],
      ["Keepsakes", ["First birthday outfit", "Memory book", "Personalized name puzzle"]],
      ["Books", ["Board books", "Touch-and-feel books"]],
    ]),
    group("toddler", "Toddlers (2 to 3)", [
      ["Pretend play", ["Play kitchen", "Tool bench", "Doctor kit|toy doctor kit", "Dollhouse"]],
      ["Active play", ["Balance bike", "Tricycle", "Indoor climber", "Tunnel|play tunnel"]],
      ["Learning", ["Wooden puzzles", "Duplo", "Magnetic tiles", "Picture books"]],
    ]),
    group("kids", "Kids (4 to 7)", [
      ["Building", ["LEGO sets", "Marble run", "Magnetic tiles", "Train set"]],
      ["Creative", ["Art easel", "Craft kits", "Play-Doh set", "Dress-up costumes"]],
      ["Outdoor", ["Bike", "Scooter", "Sandbox toys", "Swing set"]],
      ["Games & books", ["First board games|kids board games", "Early reader books", "Kids' audio player"]],
    ]),
    group("tweens", "Kids (8 to 12)", [
      ["STEM", ["Robotics kit", "Science kit", "Telescope", "Microscope", "Coding toy"]],
      ["Hobbies", ["Art supplies", "Musical instrument", "Sports equipment", "Chapter book series"]],
      ["Games", ["Board games", "Card games", "Video games", "Puzzles"]],
    ]),
    group("teens", "Teens (13 to 17)", [
      ["Tech", ["Headphones", "Bluetooth speaker", "Instant camera", "Phone accessories", "Gaming accessories"]],
      ["Style", ["Backpack", "Sneakers", "Jewelry", "Skincare set"]],
      ["Room", ["LED lights", "Bean bag chair", "Desk lamp", "Throw blanket"]],
    ]),
    group("adults", "Adults (18 to 39)", [
      ["Home", ["Coffee maker", "Espresso machine", "Cookware", "Plants|indoor plants", "Candles"]],
      ["Tech", ["Wireless earbuds", "Smartwatch", "E-reader", "Portable charger"]],
      ["Fitness & outdoors", ["Yoga mat", "Water bottle", "Hiking backpack", "Running shoes"]],
    ]),
    group("midlife", "Adults (40 and up)", [
      ["Relaxation", ["Massage gun", "Robe", "Weighted blanket", "Wine glasses"]],
      ["Hobbies", ["Gardening tools", "Grilling tools", "Golf accessories", "Cookbooks"]],
      ["Home upgrades", ["Smart speaker", "Air purifier", "Luxury bedding", "Digital photo frame"]],
    ]),
    group("milestone", "Milestone birthdays (18, 21, 30, 40, 50 and up)", [
      ["Keepsakes", ["Engraved watch", "Jewelry", "Personalized decanter", "Photo book"]],
      ["Celebration", ["Champagne glasses", "Whiskey glasses", "Party decorations"]],
    ]),
    EXPERIENCES(["Hot air balloon ride", "Weekend getaway"]),
  ],
};

const COMING_OF_AGE_GUIDE: IdeaGuide = {
  title: "Coming-of-age gift ideas",
  intro: "Ideas for bar and bat mitzvahs, quinceañeras and sweet 16s. Open a section to see them.",
  groups: [
    group("keepsakes", "Keepsakes & tradition", [
      ["Bar or bat mitzvah", ["Tallit", "Kippah", "Kiddush cup", "Tallit bag", "Engraved Star of David|Star of David necklace"]],
      ["Quinceañera", ["Tiara", "Last doll|quinceañera doll", "Cross necklace", "Quinceañera ring", "Keepsake Bible"]],
      ["Sweet 16", ["Charm bracelet", "Birthstone jewelry", "Jewelry box", "Personalized keepsake"]],
    ]),
    group("grown-up", "Grown-up gifts", [
      ["Accessories", ["Watch", "Wallet", "Leather journal", "Fountain pen", "Perfume or cologne|fragrance"]],
      ["Tech", ["Laptop", "Tablet", "Headphones", "Camera"]],
    ]),
    group("interests", "For their interests", [
      ["Hobbies", ["Musical instrument", "Art supplies", "Sports gear", "Books"]],
      ["Room", ["Vanity mirror", "Desk", "Bedding set", "LED lights"]],
    ]),
    group("funds", "Funds & experiences", [
      ["Funds", ["College fund", "Travel fund"], "fund"],
      ["Experiences", ["Concert tickets", "Driving lessons", "Summer camp"], "experience"],
    ]),
  ],
};

const GRADUATION_GUIDE: IdeaGuide = {
  title: "Graduation gift ideas, by what's next",
  intro: "Organized by where they're headed. Open a section to see ideas.",
  groups: [
    group("college", "Heading to college", [
      ["Study", ["Laptop", "Backpack", "Noise-cancelling headphones", "Desk lamp", "Planner"]],
      ["Dorm", ["Mattress topper", "Bedding set|twin xl bedding", "Shower caddy", "Mini fridge"]],
    ]),
    group("career", "Starting a career", [
      ["Work wardrobe", ["Briefcase", "Work bag", "Watch", "Portfolio|leather portfolio", "Blazer"]],
      ["Commute", ["Travel mug", "Laptop bag", "Umbrella", "Wireless earbuds"]],
    ]),
    group("apartment", "First apartment", [
      ["Kitchen", ["Cookware set", "Knife set", "Dinnerware set", "Coffee maker", "Air fryer"]],
      ["Home", ["Tool kit", "Vacuum", "Towel set", "Sheet set", "First aid kit"]],
    ]),
    group("keepsakes", "Keepsakes", [
      ["Memories", ["Diploma frame", "Photo album", "Class ring", "Engraved pen", "Yearbook-style scrapbook|scrapbook"]],
    ]),
    group("travel", "Travel", [
      ["Getting away", ["Luggage", "Travel backpack", "Passport holder", "Packing cubes"]],
    ]),
    group("funds", "Funds", [
      ["Funds", ["Gap year fund", "Student loan fund", "Travel fund", "First car fund"], "fund"],
    ]),
  ],
};

const COLLEGE_GUIDE: IdeaGuide = {
  title: "Off-to-college ideas, by part of the dorm",
  intro: "Open a part of the room to see what students commonly need.",
  groups: [
    group("bed", "Bed", [
      ["Sleep", ["Twin XL sheets|twin xl sheets", "Mattress topper", "Comforter", "Pillows", "Bed risers"]],
      ["Comfort", ["Throw blanket", "Backrest pillow", "Reading light|clip on reading light"]],
    ]),
    group("desk", "Desk & study", [
      ["Tech", ["Laptop", "Headphones", "Power strip", "Portable charger", "Printer"]],
      ["Supplies", ["Desk lamp", "Desk organizer", "Planner", "Backpack", "Whiteboard"]],
    ]),
    group("bath", "Bath", [
      ["Shower", ["Shower caddy", "Shower shoes", "Towel set", "Bathrobe"]],
      ["Care", ["Hair dryer", "First aid kit", "Toiletry bag"]],
    ]),
    group("storage", "Storage & laundry", [
      ["Storage", ["Under-bed storage", "Over-door organizer", "Hangers", "Storage bins"]],
      ["Laundry", ["Laundry hamper", "Laundry bag", "Steamer", "Drying rack"]],
    ]),
    group("kitchenette", "Kitchenette", [
      ["Appliances", ["Mini fridge", "Microwave", "Electric kettle", "Single-serve coffee maker"]],
      ["Eating", ["Microwave-safe dishes", "Reusable water bottle", "Snack containers", "Mug set"]],
    ]),
    group("funds", "Funds", [
      ["Funds", ["Textbook fund", "Tuition fund", "Travel-home fund", "Meal plan fund"], "fund"],
    ]),
  ],
};

const HOUSEWARMING_GUIDE: IdeaGuide = {
  title: "Housewarming ideas, room by room",
  intro: "Open a room to see what people commonly need in a new place.",
  groups: [
    group("kitchen", "Kitchen", [
      ["Cooking", ["Cookware set", "Knife set", "Cutting boards", "Dutch oven"]],
      ["Appliances", ["Coffee maker", "Blender", "Air fryer", "Toaster"]],
    ]),
    group("entertaining", "Entertaining", [
      ["Hosting", ["Wine glasses", "Serving platter", "Cheese board", "Bar cart", "Cocktail set"]],
    ]),
    group("living", "Living room", [
      ["Comfort", ["Throw blanket", "Throw pillows", "Area rug", "Floor lamp"]],
      ["Décor", ["Wall art", "Mirror", "Vase", "Indoor plants", "Candles"]],
    ]),
    group("bed-bath", "Bedroom & bath", [
      ["Bedroom", ["Sheet set", "Duvet cover", "Pillows", "Blackout curtains"]],
      ["Bath", ["Towel set", "Bath mat", "Shower curtain", "Bathroom storage"]],
    ]),
    group("essentials", "Home essentials", [
      ["Tools & cleaning", ["Tool kit", "Cordless drill", "Vacuum", "Step ladder", "Fire extinguisher"]],
      ["Smart home", ["Smart speaker", "Video doorbell", "Smart plugs", "Smart thermostat"]],
    ]),
    group("outdoor", "Outdoor", [
      ["Yard", ["Patio furniture", "Grill", "Garden tools", "Planters", "String lights"]],
    ]),
  ],
};

const ANNIVERSARY_GUIDE: IdeaGuide = {
  title: "Anniversary ideas, by milestone year",
  intro: "Each year has a traditional theme. Open a milestone to see gifts that fit it.",
  groups: [
    group("early", "Years 1 to 5", [
      ["1st: paper", ["Custom map print", "Photo book", "Framed vows|vow print", "Concert tickets"]],
      ["2nd: cotton", ["Cotton bedding", "Robe set", "Hammock", "Quilt"]],
      ["3rd: leather", ["Leather wallet", "Leather bag", "Leather journal", "Watch strap"]],
      ["4th: fruit & flowers", ["Fruit tree", "Flower subscription", "Botanical print"]],
      ["5th: wood", ["Wooden cutting board", "Wooden photo frame", "Wooden watch", "Wooden serving board"]],
    ]),
    group("middle", "Years 6 to 15", [
      ["6th: iron", ["Cast iron skillet", "Iron wall art", "Fire pit"]],
      ["7th: wool or copper", ["Wool blanket", "Copper mugs", "Copper cookware"]],
      ["10th: tin or aluminum", ["Tin keepsake box", "Aluminum wall art", "Cocktail shaker"]],
      ["15th: crystal", ["Crystal glasses", "Crystal decanter", "Crystal vase"]],
    ]),
    group("milestones", "Big milestones", [
      ["20th: china", ["Fine china", "Porcelain vase", "Tea set"]],
      ["25th: silver", ["Silver jewelry", "Silver frame", "Silver serving tray"]],
      ["40th: ruby", ["Ruby jewelry", "Red wine glasses"]],
      ["50th: gold", ["Gold jewelry", "Gold-rimmed glasses", "Keepsake album"]],
    ]),
    group("vow-renewal", "Vow renewal", [
      ["Keepsakes", ["Engraved rings", "Photo album", "Vow book", "Champagne flutes"]],
    ]),
    group("experiences", "Experiences & funds", [
      ["Together", ["Anniversary trip", "Couples' massage", "Dinner out"], "experience"],
      ["Funds", ["Second honeymoon fund"], "fund"],
    ]),
  ],
};

const RETIREMENT_GUIDE: IdeaGuide = {
  title: "Retirement gift ideas, by new pastime",
  intro: "Organized by how they'll spend their time. Open a section for ideas.",
  groups: [
    group("travel", "Travel", [
      ["On the road", ["Luggage set", "Travel pillow", "Travel journal", "Packing cubes", "Scratch-off world map"]],
    ]),
    group("garden", "Garden & outdoors", [
      ["Gardening", ["Gardening tools", "Raised garden bed", "Kneeling pad|garden kneeler", "Bird feeder"]],
      ["Outdoors", ["Hiking poles", "Binoculars", "Camping chair", "Fishing gear"]],
    ]),
    group("hobbies", "Hobbies", [
      ["Creative", ["Painting set", "Knitting kit", "Pottery kit", "Woodworking tools"]],
      ["Games & reading", ["Golf accessories", "Puzzles", "E-reader", "Chess set"]],
    ]),
    group("relaxation", "Relaxation", [
      ["Home comfort", ["Recliner", "Massage chair pad", "Robe and slippers|robe", "Hammock", "Espresso machine"]],
    ]),
    group("keepsakes", "Keepsakes", [
      ["Memories", ["Engraved watch", "Memory book", "Personalized clock", "Framed photo"]],
    ]),
    EXPERIENCES(["Cruise", "Golf lessons"]),
  ],
};

const HOLIDAY_GUIDE: IdeaGuide = {
  title: "Holiday wish list ideas, by who it's for",
  intro: "Open a section to see gift ideas for everyone on the list.",
  groups: [
    group("kids", "For kids", [
      ["Toys", ["LEGO sets", "Board games", "Art kits", "Plush toys", "Remote control car"]],
      ["Outdoor", ["Sled", "Bike", "Scooter", "Snow gear"]],
    ]),
    group("teens", "For teens", [
      ["Tech", ["Headphones", "Gaming gift card|gaming", "Instant camera", "Bluetooth speaker"]],
      ["Style", ["Hoodie", "Sneakers", "Jewelry", "Skincare set"]],
    ]),
    group("adults", "For adults", [
      ["Cozy", ["Slippers", "Robe", "Throw blanket", "Pajama set", "Candles"]],
      ["Food & drink", ["Coffee sampler", "Tea set", "Wine accessories", "Gourmet gift basket"]],
      ["Tech", ["Smartwatch", "E-reader", "Wireless earbuds", "Digital photo frame"]],
    ]),
    group("home", "For the home", [
      ["Seasonal", ["Ornaments", "Advent calendar", "Holiday dinnerware", "Wreath", "Stockings"]],
      ["Hosting", ["Serving platter", "Cheese board", "Wine glasses", "Table linens"]],
    ]),
    group("stockings", "Stocking stuffers", [
      ["Small gifts", ["Socks", "Lip balm", "Card games", "Hand warmers", "Mini puzzles", "Chocolate"]],
    ]),
    EXPERIENCES(["Ski day", "Holiday show tickets"]),
  ],
};

const NEW_PET_GUIDE: IdeaGuide = {
  title: "New pet ideas, by kind of pet",
  intro: "Open a section to see what new pet owners commonly need.",
  groups: [
    group("dogs", "Dogs & puppies", [
      ["Home", ["Dog bed", "Crate", "Dog gate", "Food and water bowls|dog bowls"]],
      ["Walks", ["Leash", "Collar", "Harness", "Poop bags", "Dog coat"]],
      ["Play & training", ["Chew toys", "Puzzle feeder", "Training treats", "Treat pouch"]],
      ["Care", ["Dog brush", "Dog shampoo", "Nail clippers|dog nail clippers", "Dental chews"]],
    ]),
    group("cats", "Cats & kittens", [
      ["Home", ["Cat bed", "Cat tree", "Scratching post", "Food and water bowls|cat bowls", "Water fountain|cat water fountain"]],
      ["Litter", ["Litter box", "Litter mat", "Litter scoop"]],
      ["Play", ["Wand toy", "Catnip toys", "Tunnel|cat tunnel", "Window perch"]],
      ["Care & travel", ["Cat carrier", "Cat brush", "Nail clippers|cat nail clippers"]],
    ]),
    group("small", "Small pets, birds & fish", [
      ["Small pets", ["Small pet cage|small animal cage", "Hideaway", "Exercise wheel", "Bedding|small animal bedding"]],
      ["Birds", ["Bird cage", "Perches", "Bird toys"]],
      ["Fish", ["Aquarium", "Aquarium filter", "Aquarium heater", "Water conditioner"]],
    ]),
    group("funds", "Funds & training", [
      ["Funds", ["Vet bills fund", "Pet insurance fund", "Adoption fee fund"], "fund"],
      ["Training", ["Training classes"], "experience"],
    ]),
  ],
};

const FUNDRAISER_GUIDE: IdeaGuide = {
  title: "Charity and fundraiser ideas, by kind of cause",
  intro: "Most causes need donated items as much as money. Open a section to see what's commonly asked for.",
  groups: [
    group("shelters", "Shelters & food banks", [
      ["Food bank", ["Canned goods", "Pasta", "Rice", "Peanut butter", "Baby formula"]],
      ["Shelter", ["Blankets", "Socks", "Toiletries", "Winter coats", "Sleeping bags"]],
    ]),
    group("animals", "Animal rescue", [
      ["Supplies", ["Pet food", "Cat litter", "Pet beds", "Towels", "Dog toys"]],
    ]),
    group("schools", "Schools & kids", [
      ["Classroom", ["School supplies", "Backpacks", "Books", "Art supplies", "Headphones"]],
      ["Play", ["Sports equipment", "Board games", "Toys"]],
    ]),
    group("community", "Community & health", [
      ["Care packages", ["Hygiene kits", "First aid kits", "Care package items", "Reusable water bottles"]],
    ]),
    // Cash, monthly and matching donations, sponsorships and volunteer hours
    // were listed here until 29 Oct 2026. A fund is paid in this store's gift
    // cards, so the honest money idea is a fund to buy more of what's needed.
    group("funds", "Funds", [
      ["Money", ["Supplies fund"], "fund"],
    ]),
  ],
};

const CORPORATE_GUIDE: IdeaGuide = {
  title: "Corporate gift ideas, by recipient",
  intro: "Open a section to see gifts that suit who you're thanking.",
  groups: [
    group("employees", "Employees", [
      ["Everyday", ["Insulated tumbler", "Desk organizer", "Wireless charger", "Notebook set", "Tote bag"]],
      ["Wellness", ["Water bottle", "Blanket hoodie", "Candle set", "Tea sampler"]],
    ]),
    group("clients", "Clients & partners", [
      ["Premium", ["Gourmet gift basket", "Wine set", "Leather portfolio", "Engraved pen", "Coffee gift set"]],
    ]),
    group("teams", "Teams & offices", [
      ["Shared", ["Snack box", "Espresso machine", "Board games", "Office plants"]],
    ]),
    group("milestones", "Milestones", [
      ["Occasions", ["Work anniversary award|engraved award", "Retirement gift", "Welcome kit|new hire kit", "Farewell card"]],
    ]),
    group("experiences", "Experiences & gift cards", [
      ["Together", ["Team lunch", "Team building activity"], "experience"],
      ["Gift cards", ["Gift card"]],
    ]),
  ],
};

const GENERAL_GUIDE: IdeaGuide = {
  title: "Gift ideas, by category",
  intro: "Open a category to see what people commonly put on a wish list.",
  groups: [
    group("home", "Home", [
      ["Kitchen", ["Coffee maker", "Cookware set", "Knife set", "Air fryer"]],
      ["Comfort", ["Throw blanket", "Sheet set", "Towel set", "Candles"]],
    ]),
    group("tech", "Tech", [
      ["Gadgets", ["Headphones", "Smartwatch", "E-reader", "Bluetooth speaker", "Portable charger"]],
    ]),
    group("style", "Style & self-care", [
      ["Accessories", ["Watch", "Wallet", "Bag", "Jewelry"]],
      ["Self-care", ["Skincare set", "Robe", "Massage gun"]],
    ]),
    group("hobbies", "Hobbies & outdoors", [
      ["Hobbies", ["Books", "Board games", "Art supplies", "Musical instrument"]],
      ["Outdoors", ["Camping gear", "Hiking backpack", "Bike accessories"]],
    ]),
    EXPERIENCES(),
  ],
};

const GUIDES: Record<string, IdeaGuide> = {
  wedding: WEDDING_GUIDE,
  engagement: ENGAGEMENT_GUIDE,
  "bridal-shower": BRIDAL_SHOWER_GUIDE,
  baby: BABY_GUIDE,
  christening: CHRISTENING_GUIDE,
  birthday: BIRTHDAY_GUIDE,
  "coming-of-age": COMING_OF_AGE_GUIDE,
  graduation: GRADUATION_GUIDE,
  college: COLLEGE_GUIDE,
  housewarming: HOUSEWARMING_GUIDE,
  anniversary: ANNIVERSARY_GUIDE,
  retirement: RETIREMENT_GUIDE,
  holiday: HOLIDAY_GUIDE,
  "new-pet": NEW_PET_GUIDE,
  fundraiser: FUNDRAISER_GUIDE,
  corporate: CORPORATE_GUIDE,
  other: GENERAL_GUIDE,
};

/** The ideas guide for an event type. Falls back to the general one for an unrecognized value. */
export function ideaGuideFor(eventType: string): IdeaGuide {
  return GUIDES[eventType] ?? GENERAL_GUIDE;
}
