const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");

mongoose.connect("mongodb://127.0.0.1:27017/salesDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Schema & Model
const entrySchema = new mongoose.Schema({
  date: String,
  totalSales: Number,
  totalExpenses: Number,
  profit: Number,
  products: Array
});

const Entry = mongoose.model("Entry", entrySchema);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ CREATE
app.post("/entries", async (req, res) => {
  try {
    const { date, totalSales, totalExpenses, products } = req.body;

    // Basic validation
    if (!date || totalSales == null || totalExpenses == null) {
      return res.status(400).json({
        message: "Date, Sales and Expenses are required",
      });
    }

    if (typeof totalSales !== "number" || typeof totalExpenses !== "number") {
      return res.status(400).json({
        message: "Sales and Expenses must be numbers",
      });
    }

    const newEntry = new Entry({
      date,
      totalSales,
      totalExpenses,
      profit: totalSales - totalExpenses,
      products: products || [],
    });

    await newEntry.save();
    console.log("saved:", newEntry);

    res.status(201).json(newEntry);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error saving entry" });
  }
});

// ✅ READ
app.get("/entries", async (req, res) => {
  try {
    const entries = await Entry.find();
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entries" });
  }
});

// ✅ UPDATE
app.put("/entries/:id", async (req, res) => {
  try {
    const updatedEntry = await Entry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: "Error updating entry" });
  }
});

// ✅ DELETE
app.delete("/entries/:id", async (req, res) => {
  try {
    const deletedEntry = await Entry.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting entry" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});