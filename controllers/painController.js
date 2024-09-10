const Pain = require('../models/painModel'); // Update the path as per your project structure

// Create a new pain entry
exports.createPain = async (req, res) => {
    try {
        const pain = new Pain(req.body);
        await pain.save();
        res.status(201).json(pain);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all pain entries
exports.getAllPains = async (req, res) => {
    try {
        const pains = await Pain.find();
        res.status(200).json(pains);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a pain entry by ID
exports.getPainById = async (req, res) => {
    try {
        const pain = await Pain.findById(req.params.id);
        if (!pain) {
            return res.status(404).json({ message: 'Pain entry not found' });
        }
        res.status(200).json(pain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a pain entry by ID
exports.updatePainById = async (req, res) => {
    try {
        const pain = await Pain.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!pain) {
            return res.status(404).json({ message: 'Pain entry not found' });
        }
        res.status(200).json(pain);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a pain entry by ID
exports.deletePainById = async (req, res) => {
    try {
        const pain = await Pain.findByIdAndDelete(req.params.id);
        if (!pain) {
            return res.status(404).json({ message: 'Pain entry not found' });
        }
        res.status(200).json({ message: 'Pain entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
