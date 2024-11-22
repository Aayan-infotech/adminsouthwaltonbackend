const Vehicle = require("../models/vehicleModel");
const mongoose = require('mongoose');

// Create 
exports.createVehicle = async (req, res) => {
  const { vname, passenger, vprice } = req.body;
  const images = req.fileLocations;

  try {
    if (!vname || !passenger || !vprice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse vprice from the request body (assuming it's an array of objects)
    const parsedVPrice = JSON.parse(vprice);

    const latestVehicle = await Vehicle.findOne().sort({ createdAt: -1 }).select('vehicleID');
    const newIdNumber = latestVehicle && latestVehicle.vehicleID ? parseInt(latestVehicle.vehicleID.split('-')[1]) + 1 : 1000000000;
    const vehicleID = `VEH-${newIdNumber}`;

    const vehicleEntry = new Vehicle({
      vehicleID,
      vname,
      passenger,
      vprice: parsedVPrice, // Save parsed vprice
      image: images,
    });

    const newVehicle = await vehicleEntry.save();

    res.status(201).json({
      id: newVehicle._id,
      vehicleID: newVehicle.vehicleID,
      vname: newVehicle.vname,
      passenger: newVehicle.passenger,
      vprice: newVehicle.vprice,
      image: newVehicle.image,
      createdAt: newVehicle.createdAt,
      updatedAt: newVehicle.updatedAt,
    });
  } catch (err) {
    console.error("Error creating vehicle:", err);
    res.status(400).json({ message: err.message });
  }
};

// Update 
exports.updateVehicle = async (req, res) => {
  const { vname, passenger, vprice } = req.body;
  const updateData = { vname, passenger }; // Do not include damagePrice

  try {
    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Parse vprice from the request body (assuming it's an array of objects)
    if (vprice) {
      updateData.vprice = JSON.parse(vprice); // Update vprice if provided
    } else {
      updateData.vprice = existingVehicle.vprice; // Keep existing vprice if not provided
    }

    if (req.fileLocations && req.fileLocations.length > 0) {
      updateData.image = req.fileLocations;
    } else {
      updateData.image = existingVehicle.image;
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.json(updatedVehicle);
  } catch (err) {
    console.error("Error updating vehicle:", err);
    res.status(400).json({ message: err.message });
  }
};

// getAll
exports.getVehicles = async (req, res) => {
  try {
    let vehicles = await Vehicle.find();

    // Format the response if needed
    const formattedVehicles = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      image: vehicle.image,
    }));

    res.status(200).json(formattedVehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: err.message });
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

// Get  by Season and Day
exports.getVehiclesBySeasonAndDay = async (req, res) => {
  const { season, day } = req.query;

 
  if (!season || !day) {
    return res.status(400).json({ message: "Season and day are required" });
  }

  try {
   
    const vehicles = await Vehicle.find({
      "vprice.season": season, 
      "vprice.day": day,       
    });

    if (vehicles.length === 0) {
      return res.status(404).json({ message: "No vehicles found for the selected season and day" });
    }

    const formattedVehicles = vehicles.map(vehicle => {
      const priceEntry = vehicle.vprice.find(
        price => price.season === season && price.day === day
      );

      return {
        _id: vehicle._id,
        vname: vehicle.vname,
        passenger: vehicle.passenger,
        season,
        day,
        price: priceEntry ? priceEntry.price : null,
        image: vehicle.image,
      };
    });

    res.status(200).json(formattedVehicles);
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get price 
exports.getVehiclePrice = async (req, res) => {
  const { vehicleID } = req.params;
  const { season, day } = req.query;

  if (!season || !day) {
    return res.status(400).json({ message: "Season and day are required" });
  }

  try {
    const vehicle = await Vehicle.findOne({
      _id: vehicleID,
      "vprice.season": season,
      "vprice.day": day,
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Find the price for the specific season and day
    const priceEntry = vehicle.vprice.find(
      (price) => price.season === season && price.day === day
    );

    if (priceEntry) {
      return res.status(200).json({
        _id: vehicle._id,
        vehicleID: vehicle.vehicleID,
        vname: vehicle.vname,
        season: season,
        day: day,
        price: priceEntry.price,
        passenger: vehicle.passenger,
        image: vehicle.image,
      });
    } else {
      return res.status(404).json({ message: "Price not set for the selected season and day" });
    }
  } catch (err) {
    console.error("Error fetching vehicle price:", err);
    res.status(500).json({ message: err.message });
  }
};




