// scripts/seedData.js
// Run: node scripts/seedData.js

const mongoose = require("mongoose");
const dotenv   = require("dotenv");
dotenv.config();

const Package     = require("../models/Package");
const SiteContent = require("../models/SiteContent");
const Testimonial = require("../models/Testimonial");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
};

// ── Default Packages ─────────────────────────────────────────────────────────
const packages = [
  {
    name:        "Silver",
    description: "Perfect for intimate gatherings",
    price:       75000,
    features:    ["Basic Decoration", "Catering for 100 guests", "1 Hall", "Basic Lighting", "Parking for 50 cars"],
    capacity:    { min: 50, max: 150 },
    isActive:    true,
    isFeatured:  false,
    sortOrder:   1,
  },
  {
    name:        "Gold",
    description: "Our most popular package",
    price:       150000,
    features:    ["Premium Decoration", "Catering for 300 guests", "Main Hall + Garden", "LED Lighting", "DJ Sound System", "Parking for 150 cars", "Dedicated Event Manager"],
    capacity:    { min: 150, max: 400 },
    isActive:    true,
    isFeatured:  true,
    sortOrder:   2,
  },
  {
    name:        "Platinum",
    description: "The ultimate luxury experience",
    price:       300000,
    features:    ["Luxury Decoration", "Catering for 800 guests", "Full Venue", "Professional Lighting", "Live Music", "Bridal Suite", "Photography & Videography", "Valet Parking", "Dedicated Coordinator"],
    capacity:    { min: 400, max: 1000 },
    isActive:    true,
    isFeatured:  false,
    sortOrder:   3,
  },
];

// ── Default Site Content ──────────────────────────────────────────────────────
const siteContent = [
  {
    section:     "hero",
    title:       "Where Every Celebration Becomes a Timeless Memory",
    subtitle:    "Kalawati Marriage Lawn",
    description: "A majestic venue in the heart of Kanpur, where traditions meet elegance and every dream wedding comes to life.",
    buttonText:  "Book Your Date",
    isVisible:   true,
    extraData:   {},
  },
  {
    section:     "about",
    title:       "15 Years of Creating Perfect Celebrations",
    description: "Kalawati Marriage Lawn has been Kanpur's most trusted wedding venue since 2009. With lush green lawns, grand banquet halls, world-class catering, and a dedicated team of event professionals, we ensure every celebration is a masterpiece. From intimate family gatherings to grand weddings with 1000+ guests, we handle every detail with care and elegance.",
    isVisible:   true,
    extraData:   {},
  },
  {
    section:     "cta",
    title:       "Ready to Plan Your Perfect Wedding?",
    description: "Book your date today and let our expert team make your dream celebration a reality. Limited dates available.",
    buttonText:  "Book Now",
    isVisible:   true,
    extraData:   {},
  },
  {
    section:     "contact",
    title:       "Get In Touch",
    isVisible:   true,
    extraData: {
      address: "123, Marriage Lawn Road, Kanpur, Uttar Pradesh - 208001",
      phone:   "+91 99999 99999",
      email:   "info@kalawati.com",
      hours:   "Monday to Sunday: 9:00 AM – 9:00 PM",
      mapLink: "https://maps.google.com",
    },
  },
];

// ── Default Testimonials ──────────────────────────────────────────────────────
const testimonials = [
  {
    name:      "Rahul & Priya Sharma",
    message:   "Kalawati Marriage Lawn made our wedding day absolutely magical. The decoration was breathtaking and the staff was incredibly helpful throughout. Highly recommended!",
    rating:    5,
    eventType: "Wedding",
    isVisible: true,
    sortOrder: 1,
  },
  {
    name:      "Amit Gupta",
    message:   "We hosted our daughter's engagement ceremony here and it was a grand success. The catering was excellent and the venue looked stunning. Thank you Kalawati team!",
    rating:    5,
    eventType: "Engagement",
    isVisible: true,
    sortOrder: 2,
  },
  {
    name:      "Sunita Verma",
    message:   "Professional, elegant and affordable. The team went above and beyond to ensure our reception was perfect. Every guest complimented the venue and arrangements.",
    rating:    5,
    eventType: "Reception",
    isVisible: true,
    sortOrder: 3,
  },
];

// ── Run Seed ──────────────────────────────────────────────────────────────────
const seedData = async () => {
  await connectDB();

  // Packages
  const pkgCount = await Package.countDocuments();
  if (pkgCount === 0) {
    await Package.insertMany(packages);
    console.log("✅ 3 default packages seeded");
  } else {
    console.log(`ℹ️  Packages already exist (${pkgCount}), skipping`);
  }

  // Site Content
  for (const content of siteContent) {
    await SiteContent.findOneAndUpdate(
      { section: content.section },
      { $setOnInsert: content },
      { upsert: true, new: true }
    );
  }
  console.log("✅ Site content seeded (hero, about, cta, contact)");

  // Testimonials
  const tesCount = await Testimonial.countDocuments();
  if (tesCount === 0) {
    await Testimonial.insertMany(testimonials);
    console.log("✅ 3 default testimonials seeded");
  } else {
    console.log(`ℹ️  Testimonials already exist (${tesCount}), skipping`);
  }

  console.log("\n🎉 Seed complete! Your site is ready.");
  process.exit(0);
};

seedData().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
