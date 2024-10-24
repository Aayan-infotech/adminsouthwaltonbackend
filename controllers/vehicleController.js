
const Vehicle = require("../models/vehicleModel");
const upload = require("../middleware/multer"); // Importing upload middleware

// Create 
exports.createVehicle = async (req, res) => {
  const { vname, vseats, vprice } = req.body; // vprice should be an object
  const image = req.file ? req.file.filename : null;

  const vehicleEntry = new Vehicle({
    vname,
    vseats,
    vprice, // vprice is an object with monthly prices
    image,
  });

  try {
    const newVehicle = await vehicleEntry.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update Vehicle
exports.updateVehicle = async (req, res) => {
  try {
    // Prepare the update data
    const updateData = {
      vname: req.body.vname,
      vseats: req.body.vseats,
      vprice: req.body.vprice, // Ensure this is an object with monthly prices
    };

    // Check if a new image file is uploaded
    if (req.file) {
      updateData.image = req.file.filename; // Update image if new one is uploaded
    }

    // Find and update the vehicle by ID
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated document
    );

    // Handle case where vehicle is not found
    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Respond with the updated vehicle data
    res.json(updatedVehicle);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ message: err.message });
  }
};


// Get Vehicles (with full image URL)
exports.getVehicles = async (req, res) => {
  try {
    let vehicles = await Vehicle.find();

    vehicles = vehicles.map(vehicle => {
      return {
        ...vehicle._doc,
        image: vehicle.image
          ? `${req.protocol}://${req.get("host")}/uploads/${vehicle.image}`
          : null,
      };
    });

    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Vehicle
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

// Delete Vehicle
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
