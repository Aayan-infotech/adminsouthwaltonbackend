const Vehicle = require("../models/vehicleModel");
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
exports.createVehicle = async (req, res) => {
  console.log(req.body);
  const {  vname,  vseats, vprice } = req.body;
  const image = req.file ? req.file.filename : null;
  const vehicleEntry = new Vehicle({
   
    vname,
    
   
    vseats,
    vprice,
   
    image,
  });
  try {
    const newVehicle = await vehicleEntry.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get
exports.getVehicles = async (req, res) => {
  try {
    let vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateVehicle = async (req, res) => {
  try {
    const updateData = {
      
      vname: req.body.vname,
     
     
      vseats: req.body.vseats,
      vprice: req.body.vprice,
    
    };
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(updatedVehicle);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    await Vehicle.deleteOne({ _id: req.params.id });
    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
