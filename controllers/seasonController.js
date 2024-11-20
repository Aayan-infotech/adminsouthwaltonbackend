const Season = require('../models/seasonModel');

// Create 
exports.createSeason = async (req, res) => {
    try {
        const { seasonName, offSeason, secondarySeason, peakSeason } = req.body;

        // Create a new season instance
        const newSeason = new Season({
            seasonName,
            offSeason,
            secondarySeason,
            peakSeason
        });

        // Save the season to the database
        const savedSeason = await newSeason.save();
        res.status(201).json({ message: 'Season created successfully', season: savedSeason });
    } catch (error) {
        res.status(500).json({ message: 'Error creating season', error: error.message });
    }
};

// add a new entry
exports.addSeasonEntry = async (req, res) => {
    const { seasonType, month, dateFrom, dateTo } = req.body;
    const { seasonId } = req.params;

    try {
        // Find season document
        const season = await Season.findById(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        // Validate season type
        const validSeasonTypes = ['offSeason', 'secondarySeason', 'peakSeason'];
        if (!validSeasonTypes.includes(seasonType)) {
            return res.status(400).json({ message: `Invalid season type. Must be one of: ${validSeasonTypes.join(', ')}` });
        }

        // Create new entry
        const newEntry = {
            month,
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
        };

        // Push new entry into the appropriate seasonType array
        season[seasonType].push(newEntry);

        // Save the updated season document
        await season.save();

        res.status(201).json({
            message: `New entry added to ${seasonType} successfully.`,
            updatedSeason: season[seasonType], // Return updated array only
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding season entry', error: error.message });
    }
};

// GetAll
exports.getAllSeasons = async (req, res) => {
    try {
        const seasons = await Season.find();
        res.status(200).json(seasons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching seasons', error: error.message });
    }
};

// GetbyId
exports.getSeasonById = async (req, res) => {
    try {
        const season = await Season.findById(req.params.id);

        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        res.status(200).json(season);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching season', error: error.message });
    }
};

//update
exports.updateSeasonEntry = async (req, res) => {
    const { seasonType, month, dateFrom, dateTo } = req.body;
    const { seasonId, entryId } = req.params;

    try {
        // Find the season document
        const season = await Season.findById(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        // Validate the season type
        const validSeasonTypes = ['offSeason', 'secondarySeason', 'peakSeason'];
        if (!validSeasonTypes.includes(seasonType)) {
            return res.status(400).json({ message: `Invalid season type. Must be one of: ${validSeasonTypes.join(', ')}` });
        }

        // Find the index of the entry to update
        const entryIndex = season[seasonType].findIndex(entry => entry._id.toString() === entryId);
        if (entryIndex === -1) {
            return res.status(404).json({ message: 'Season entry not found' });
        }

        // Update the entry
        season[seasonType][entryIndex] = { 
            _id: entryId, 
            month, 
            dateFrom: new Date(dateFrom), 
            dateTo: new Date(dateTo)
        };

        // Save the updated season document
        await season.save();

        res.status(200).json({
            message: `Entry updated successfully in ${seasonType}`,
            updatedEntry: season[seasonType][entryIndex], // Return updated entry
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating season entry', error: error.message });
    }
};

//delete    
exports.deleteSeasonEntry = async (req, res) => {
    const { seasonType } = req.params; // 'offSeason', 'secondarySeason', or 'peakSeason'
    const { seasonId, entryId } = req.params;

    try {
        // Find the season document
        const season = await Season.findById(seasonId);
        if (!season) {
            return res.status(404).json({ message: 'Season not found' });
        }

        // Validate the season type
        const validSeasonTypes = ['offSeason', 'secondarySeason', 'peakSeason'];
        if (!validSeasonTypes.includes(seasonType)) {
            return res.status(400).json({ message: `Invalid season type. Must be one of: ${validSeasonTypes.join(', ')}` });
        }

        // Find the index of the entry to delete
        const entryIndex = season[seasonType].findIndex(entry => entry._id.toString() === entryId);
        if (entryIndex === -1) {
            return res.status(404).json({ message: 'Season entry not found' });
        }

        // Remove the entry
        season[seasonType].splice(entryIndex, 1);

        // Save the updated season document
        await season.save();

        res.status(200).json({
            message: `Entry deleted successfully from ${seasonType}`,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting season entry', error: error.message });
    }
};



