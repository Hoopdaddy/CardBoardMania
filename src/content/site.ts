// Editable site copy and settings. Change text here; no code changes needed.

export const site = {
  name: "Cardboard Mania",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://cardboardmania.com",
  email: "cardboardmania33@gmail.com",
  homeBase: "Middle Tennessee",
  tagline: "I Buy Wrestling Cards",
  description:
    "Cardboard Mania buys wrestling cards — WWE, WWF, WCW, AEW, ECW and more. Singles, graded slabs, autos and sealed. Find me at card shows across Middle Tennessee.",
  // Leave a link empty ("") to hide its icon.
  socials: {
    instagram: "",
    facebook: "",
    x: "",
    tiktok: "",
    youtube: "",
  },
  // Optional photo for the About page, e.g. "/about.jpg" placed in /public.
  aboutPhoto: "",
};

export const buyTiles = [
  { title: "Vintage WWF", text: "80s and 90s WWF — Topps, Classic, Merlin and more." },
  { title: "Graded slabs", text: "PSA, BGS, SGC and CGC — any grade, any era." },
  { title: "Autos & relics", text: "On-card autos, cut signatures, mat and shirt relics." },
  { title: "Rookies", text: "Key rookie cards from legends to today's roster." },
  { title: "Sealed wax", text: "Boxes, packs and cases — WWE, WCW, AEW and beyond." },
];

export const wrestlingBuys = [
  "WWE / WWF — Topps, Panini, Fleer, Classic, Merlin, Titan Sports",
  "WCW, ECW, NWA and territory-era cards",
  "AEW — Upper Deck and SkyBox",
  "TNA / Impact, NJPW, lucha and indie releases",
  "Graded cards, autographs, relics and numbered parallels",
  "Sealed boxes, packs and factory sets",
];

export const alsoBuying = [
  "Baseball, basketball, football and hockey — vintage and modern",
  "Pokémon, Marvel, Star Wars and other non-sports cards",
];

// Placeholder copy — edit to match what you actually pass on.
export const dontBuy = [
  "Heavily damaged cards (water damage, tears, writing) unless they're rare",
  "Small lots of modern base cards",
  "Reprints, customs or counterfeits",
  "Autographs without verification",
];

export const howItWorks = [
  { title: "Send photos", text: "Snap a few pictures and tell me what you have using the form." },
  { title: "Get an offer", text: "I'll review and reply with a fair, no-pressure offer — usually within a day or two." },
  { title: "Get paid", text: "Cash or trade at a show, or ship your cards and get paid fast." },
];

export const faqs = [
  {
    q: "How do you decide what to offer?",
    a: "I look at recent sold prices, condition and demand. Graded and key cards are priced individually; big lots of commons are priced by the box.",
  },
  {
    q: "How do I get paid?",
    a: "Cash at a show, PayPal, Venmo or Zelle. Trade credit is available too if you'd rather pick up cards from my table.",
  },
  {
    q: "Do I have to bring my cards to a show?",
    a: "No. You can meet me at a show, arrange a local pickup around Middle Tennessee, or ship them. I'll walk you through shipping safely.",
  },
  {
    q: "Is there any obligation once I send photos?",
    a: "None. An offer is just an offer — you're free to say no.",
  },
  {
    q: "Do you buy non-wrestling cards?",
    a: "Yes. Wrestling is my focus, but I also buy sports and non-sports cards, especially vintage and graded cards.",
  },
];

// Sister sites and resources linked from the home page and footer.
export const resources = {
  suplex: {
    name: "Suplex Trading Cards",
    url: "https://suplexcards.cardboardmania.com/",
    description:
      "The complete guide to WWF, WWE and WCW trading cards — free to use. Look up a set, check a checklist, or find out what your cards are before you sell.",
    features: ["Checklists for 200+ sets", "Every era", "Parallels guide", "Hall of Famer rookie cards", "Collection tracker"],
  },
};

// Hero carousel photos (files live in /public/cards).
export const carouselSlides = [
  {
    src: "/cards/roman-reigns-psa10-auto.jpg",
    alt: "Roman Reigns 2025 Topps x Cactus Jack Famed Phantoms autograph, PSA 10",
    caption: "Roman Reigns · Famed Phantoms Auto · PSA 10",
  },
  {
    src: "/cards/savage-martel-cut-auto-1of1.jpg",
    alt: "Macho Man Randy Savage and Sherri Martel Topps Transcendent dual cut signature, 1 of 1",
    caption: "Macho Man & Sherri Martel · Transcendent Cut Auto 1/1",
  },
  {
    src: "/cards/alexa-bliss-flawless-auto.jpg",
    alt: "Alexa Bliss Panini Flawless Finishing Moves autograph",
    caption: "Alexa Bliss · Flawless Finishing Moves Auto",
  },
  {
    src: "/cards/hogan-austin-autos.jpg",
    alt: "Hulk Hogan and Stone Cold Steve Austin autographed cards",
    caption: "Hulk Hogan & \"Stone Cold\" Steve Austin Autos",
  },
  {
    src: "/cards/lesnar-punk-ripley-autos.jpg",
    alt: "Brock Lesnar, CM Punk and Rhea Ripley autographed cards",
    caption: "Brock Lesnar, CM Punk & Rhea Ripley Autos",
  },
  {
    src: "/cards/bearer-savage-psa-autos.jpg",
    alt: "1998 WWF Paul Bearer and 1994 Action Packed Randy Savage autographs, PSA graded",
    caption: "Paul Bearer & Randy Savage · Vintage WWF PSA Autos",
  },
];
