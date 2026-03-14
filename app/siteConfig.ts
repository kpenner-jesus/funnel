export const SITE_CONFIG = {

  // ── VENUE ──────────────────────────────────────────────
  venueName: "Wilderness Edge Retreat & Conference Centre",
  venueTagline: "Manitoba's premier waterfront venue",
  venueAddress: "Box 100, Whiteshell, MB, Canada",
  venuePhone: "(204) 000-0000",
  venueEmail: "info@wildernessedge.ca",
  heroImageUrl: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656924da1d90492a10511_64d168dd2b8dffcaee1f7621_Frame20427319192-min-min.webp",

  // ── TAXES ──────────────────────────────────────────────
  taxes: [
    { name: "GST", rate: 0.05 },
    { name: "PST", rate: 0.07 },
  ],

  // ── ROOMS ──────────────────────────────────────────────
  rooms: [
    {
      name: "Bachelor Suite",
      pricePerNight: 89,
      description: "Perfect for solo travelers. Includes a workspace.",
      maxQty: 20,
      imageUrl: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656b232f87d8b032bbfec_64f5314887a8d9a399fc5123_firepit-p-800.webp",
    },
    {
      name: "Couples Suite",
      pricePerNight: 119,
      description: "A cozy, private space for two.",
      maxQty: 20,
      imageUrl: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/65396c9f6b39d1b64f3d2f2c_Couples-Suite-1-p-500.webp",
    },
    {
      name: "Family Suite",
      pricePerNight: 139,
      description: "Spacious enough for the whole family with a kitchenette.",
      maxQty: 20,
      imageUrl: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca55a8/657311f217211ce3d9e762c0_family-gathering-campfire.webp",
    },
    {
      name: "Two-Bedroom Suite",
      pricePerNight: 159,
      description: "Premium space with separate sleeping areas and a living room.",
      maxQty: 20,
      imageUrl: "https://cdn.prod.website-files.com/64cd635258e0dd2d44ca5585/64f656924da1d90492a10511_64d168dd2b8dffcaee1f7621_Frame20427319192-min-min.webp",
    },
  ],

  // ── ACTIVITIES ─────────────────────────────────────────
  activities: [
    { name: "Canoe Rental",             price: 25,  unit: "canoe / 2 hrs" },
    { name: "Tubing & Rafting",         price: 15,  unit: "per person" },
    { name: "Pontoon Boat Experience",  price: 150, unit: "per group" },
    { name: "Hoopla Island Obstacle",   price: 20,  unit: "per person" },
    { name: "Bannock Bake Activity",    price: 10,  unit: "per person" },
    { name: "Firepit with S'mores",     price: 5,   unit: "per person" },
    { name: "Wolf Howl Hike (Guided)",  price: 12,  unit: "per person" },
    { name: "Petroforms Guided Tour",   price: 15,  unit: "per person" },
  ],

  // ── MEALS ──────────────────────────────────────────────
  meals: {
    minimumGuestsForCatering: 20,
    adultBreakfastPrice: 16.50,
    adultLunchPrice: 21.99,
    adultSupperPrice: 23.99,
    childMealRatePerYear: 1.50, // price per meal = this × child's avg age
  },

  // ── EVENT SEGMENTS ─────────────────────────────────────
  eventSegments: [
    {
      name: "Group Retreat",
      desc: "(Church, Corporate, Youth...)",
      types: ["Church / Faith-based", "Marriage / Couples", "Women's / Ladies'", "Men's Retreat", "Youth / School", "Corporate / Business", "Wellness / Personal Growth", "Other"],
    },
    {
      name: "Group Conference",
      desc: "(Business, Gov, Non-Profit...)",
      types: ["Corporate / Business", "Government / Department", "Non-Profit Organization", "Church / Faith-based", "First Nations / Indigenous", "College / University", "Other"],
    },
    {
      name: "Family Gathering",
      desc: "(Reunion, Holiday, Milestone)",
      types: ["Family Reunion", "Family Holiday", "Milestone Anniversary", "Milestone Birthday", "Retirement Celebration", "Other"],
    },
    {
      name: "Wedding",
      desc: "(Ceremony, Reception, or Both)",
      types: ["Ceremony & Reception", "Ceremony Only", "Reception Only"],
    },
    {
      name: "Individual Guest",
      desc: "(Solo, Couple, Small Group)",
      types: [],
    },
  ],
};
