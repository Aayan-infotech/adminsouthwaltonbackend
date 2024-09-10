const Damage = require("../models/damageModel");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Create
exports.createDamage = async (req, res) => {
  const { vname, vnumber, damage, username, reason } = req.body;
  const image = req.file ? req.file.filename : null;
  const damageEntry = new Damage({
    vname,
    vnumber,
    damage,
    username,
    reason,
    image,
  });
  try {
    const newDamage = await damageEntry.save();
    res.status(201).json(newDamage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all
exports.getDamages = async (req, res) => {
  try {
    let damages = await Damage.find();
    res.json(damages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get by ID
exports.getDamageById = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }
    res.json(damage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateDamage = async (req, res) => {
  try {
    const updateData = {
      vname: req.body.vname,
      vnumber: req.body.vnumber,
      damage: req.body.damage,
      username: req.body.username,
      reason: req.body.reason,
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedDamage = await Damage.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDamage) {
      return res.status(404).json({ message: "Damage record not found" });
    }

    res.json(updatedDamage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteDamage = async (req, res) => {
  try {
    const damage = await Damage.findById(req.params.id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }
    await Damage.deleteOne({ _id: req.params.id });
    res.json({ message: "Damage record deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
