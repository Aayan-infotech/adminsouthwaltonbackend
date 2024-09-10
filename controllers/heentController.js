const Heent = require('../models/heentModel');

// Create a new Heent document
exports.createHeent = async (req, res) => {
    try {
        const heent = new Heent(req.body);
        await heent.save();
        res.status(201).json(heent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all Heent documents
exports.getAllHeents = async (req, res) => {
    try {
        const heents = await Heent.find();
        res.status(200).json(heents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single Heent document by ID
exports.getHeentById = async (req, res) => {
    try {
        const heent = await Heent.findById(req.params.id);
        if (!heent) {
            return res.status(404).json({ message: 'Heent not found' });
        }
        res.status(200).json(heent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a Heent document by ID
exports.updateHeentById = async (req, res) => {
    try {
        const heent = await Heent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!heent) {
            return res.status(404).json({ message: 'Heent not found' });
        }
        res.status(200).json(heent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a Heent document by ID
exports.deleteHeentById = async (req, res) => {
    try {
        const heent = await Heent.findByIdAndDelete(req.params.id);
        if (!heent) {
            return res.status(404).json({ message: 'Heent not found' });
        }
        res.status(204).json({ message: 'Heent deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
