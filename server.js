require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns=require("dns");
dns.setServers(['1.1.1.1', '8.8.8.8'])
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env.MONGO_URI)
// ─── CONNECT TO MONGODB ───────────────────────────────────────────────────
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1); // connection fail ho toh server band karo
  }
};
connectDB()

// ─── USER MODEL ───────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ─── SERVICE MODEL ────────────────────────────────────────────────────────
const serviceSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, required: true },
  description: { type: String },
  address:     { type: String, required: true },
  phone:       { type: String, required: true },
  provider:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

serviceSchema.index({ name: "text", category: "text", description: "text" });

const Service = mongoose.model("Service", serviceSchema);

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || "mysupersecretkey123";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// ─── REGISTER ─────────────────────────────────────────────────────────────
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, phone, password: hashed });
    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, name: user.name, phone: user.phone, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL SERVICES ─────────────────────────────────────────────────────
app.get("/services", async (req, res) => {
  try {
    const services = await Service.find().populate("provider", "name email phone");
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET MY SERVICES (logged in user only) ────────────────────────────────
app.get("/my-services", authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.userId });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── SEARCH SERVICES ──────────────────────────────────────────────────────
app.get("/search", async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = {};
    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    const results = await Service.find(query).populate("provider", "name email phone");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET SINGLE SERVICE ───────────────────────────────────────────────────
app.get("/services/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate("provider", "name email phone");
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADD SERVICE ──────────────────────────────────────────────────────────
app.post("/add-service", authMiddleware, async (req, res) => {
  try {
    const { name, category, description, address, phone } = req.body;
    const service = await Service.create({
      name, category, description, address, phone,
      provider: req.user.userId,
    });
    res.status(201).json({ message: "Service added successfully", service });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE SERVICE ───────────────────────────────────────────────────────
app.put("/update-service/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only edit your own services" });
    }
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Service updated", service: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE SERVICE ───────────────────────────────────────────────────────
app.delete("/delete-service/:id", authMiddleware, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.provider.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own services" });
    }
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: "Service deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TEST ROUTE ───────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ─── START SERVER ─────────────────────────────────────────────────────────
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});