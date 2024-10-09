const Driver  = require('../models/driverModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const Bookform=require('../models/checkoutModel')
const createError = require('../middleware/error');
const createSuccess = require('../middleware/success');
const path = require('path');
const fs = require('fs');

// To create Driver
const createDriver = async (req, res, next) => {
    try {
        const role = await Role.findOne({ role: 'Driver' });
        if (!role) {
            return next(createError(400, "Role not found"));
        }
        const { name, mobileNumber, email, password, address } = req.body;

        // Check individual required fields
        if (!name) {
            return next(createError(400, "Name is required"));
        }
        if (!email) {
            return next(createError(400, "Email is required"));
        }
        if (!password) {
            return next(createError(400, "Password is required"));
        }

        // Check if email already exists
        const existingUser = await Driver.findOne({ email });
        if (existingUser) {
            return next(createError(400, "Email already exists"));
        }

        // Check if file is uploaded
        let image = null;
        if (req.file) {
            const file = req.file;
            const filename = Date.now() + path.extname(file.originalname);
            const filepath = path.join(__dirname, '../uploads', filename);
            fs.writeFileSync(filepath, file.buffer); // Save the file to the filesystem

            image = {
                filename,
                contentType: file.mimetype,
                url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
            };
        }
        // Create new user with the role assigned
        const newDriver = new Driver({ name, mobileNumber, email, password, image, address, roles: [role._id] });
        const savedDriver = await newDriver.save();

        return next(createSuccess(200, "Driver Registered Successfully", savedDriver));
    }
    catch (error) {
        console.error(error);
        return next(createError(500, "Something went wrong"));
    }
};

// Get All Drivers
const getAllDrivers = async (req, res, next) => {
    try {
        const allDrivers = await Driver.find();  // Ensure Driver model is used
        const driverWithImageURLs = allDrivers.map(driver => {
            if (driver.image) {
                // Construct image URL based on driver's image filename
                const imageURL = `${req.protocol}://${req.get('host')}/api/driver/image/${driver.image.filename}`;
                return {
                    ...driver._doc,
                    image: { ...driver.image._doc, url: imageURL }
                };
            } else {
                return { ...driver._doc, image: null };
            }
        });
        return next(createSuccess(200, "All Drivers", driverWithImageURLs));
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error!"));
    }
};

// Get Driver By Id
const getDriverById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const driverById = await Driver.findById(id);

        if (!driverById) {
            return res.status(404).json({
                success: false,
                message: "Driver Not Found"
            });
        }

        // Check if Driver has an image
        let driverWithImageURLs = { ...driverById._doc };
        if (driverById.image) {
            const imageURL = `${req.protocol}://${req.get('host')}/api/driver/image/${driverById.image.filename}`;
            driverWithImageURLs.image = { ...driverById.image._doc, url: imageURL };
        } else {
            driverWithImageURLs.image = null;
        }

        return res.status(200).json({
            success: true,
            message: "Driver found",
            driver: driverWithImageURLs
        });

    } catch (error) {
        console.error(error);  // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// Update Driver By Id
const updateDriverById = async (req, res, next) => {
    try {
        const updateDriverId = req.params.id;
        const { name, mobileNumber, email, password, address, roles } = req.body;
        
        // Find driver by id
        const updateDriver = await Driver.findById(updateDriverId);
        if (!updateDriver) {
            return next(createError(404, "Driver Not Found"));
        }

        // Handle file uploads
        let image = updateDriver.image; // Retain existing images if no new files uploaded
        if (req.file) {
            // Delete old image from the file system if it exists
            if (image) {
                const oldFilePath = path.join(__dirname, '../uploads', image.filename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            // Save new file
            const file = req.file;
            const filename = Date.now() + path.extname(file.originalname);
            const filepath = path.join(__dirname, '../uploads', filename);

            fs.writeFileSync(filepath, file.buffer); // Save the file to the filesystem

            image = {
                filename,
                contentType: file.mimetype,
                url: `${req.protocol}://${req.get('host')}/uploads/${filename}`
            };
        }

        // Update driver details
        updateDriver.name = name || updateDriver.name;
        updateDriver.mobileNumber = mobileNumber || updateDriver.mobileNumber;
        updateDriver.email = email || updateDriver.email;
        updateDriver.password = password || updateDriver.password;
        updateDriver.address = address || updateDriver.address;
        updateDriver.roles = roles || updateDriver.roles;
        updateDriver.image = image;

        // Save updated driver
        const savedDriver = await updateDriver.save();
        return next(createSuccess(200, "Driver Details Updated Successfully", savedDriver));

    } catch (error) {
        console.error(error);  // Log the error for debugging
        return next(createError(500, "Internal Server Error!"));
    }
};

// Delete Driver By Id
const deleteDriver = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleteDriver = await Driver.findByIdAndDelete(id);
        if (!deleteDriver) {
            return next(createError(404, "Driver Not Found"));
        }
        return next(createSuccess(200, "Driver Deleted", deleteDriver));
    } catch (error) {
        return next(createError(500, "Internal Server Error!"))
    }
};

// images
const getImage = (req, res) => {
    const filepath = path.join(__dirname, '../uploads', req.params.filename);
    fs.readFile(filepath, (err, data) => {
        if (err) {
            return res.status(404).json({ message: 'Image not found' });
        }
        const image = data;
        const mimeType = req.params.filename.split('.').pop();
        res.setHeader('Content-Type', `image/${mimeType}`);
        res.send(image);
    });
};

//login
const driverLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const driver = await Driver.findOne({ email });

        if (!driver) {
            return next(createError(404, "Driver Not Found"));
        }

        const isPasswordValid = await driver.comparePassword(password);
        if (!isPasswordValid) {
            return next(createError(400, "Invalid Password"));
        }

        const token = jwt.sign({ id: driver._id, roles: driver.roles }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie("access_token", token, { httpOnly: true })
            .status(200)
            .json({
                token,
                status: 200,
                message: "Login Successful",
                data: driver
            });
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error"));
    }
};


// Logout
const driverLogout = (req, res, next) => {
    try {
        res.clearCookie("access_token");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error"));
    }
};

//assign driver 
const assignDriver = async (req, res, next) => {
    try {
        const { id } = req.params; // Extract the driver ID from the route parameters
        const { clientId, pickDate, dropDate } = req.body; // Extract relevant data from request body

        // Create the new driver status object
        const newStatus = {
            clientId: clientId,
            pickDate: new Date(pickDate), // Ensure dates are properly formatted
            dropDate: new Date(dropDate)
        };

        // Find and update the driver by ID, pushing the new status
        const driverData = await Driver.findByIdAndUpdate(
            id,  // Search by driver _id
            { $push: { driverStatus: newStatus } },  // Push new driver status
            { new: true }  // Return the updated document after modification
        );

        // If driver not found, return a 404 error
        if (!driverData) {
            return res.status(404).json({ message: "Driver not found" });
        }

        const bookingData =  await Bookform.findByIdAndUpdate(clientId,
            {driver:id},
            {new: true}
        );

        // Return success response
        res.status(200).json({ message: "Driver assigned successfully", driverData });

    } catch (error) {
        // Log and handle any errors
        console.error("Error occurred:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getDriverBookings = async (req, res) => {
    const { driverId } = req.params;

    try {
        // Fetch the driver with populated bookings
        const driver = await Driver.findById(driverId)
        const clientIds = driver.driverStatus.map(booking => booking.clientId);
        const bookings = await Bookform.find({_id: { $in: clientIds } }).sort({bdropDate:-1});

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json({
            success: true,
            driver: {
                name: driver.name,
                mobileNumber: driver.mobileNumber,
                email: driver.email,
                address: driver.address,
                bookings: bookings.map(booking => ({
                    id: booking._id,
                    name: booking.bname,
                    phone: booking.bphone,
                    email: booking.bemail,
                    size: booking.bsize,
                    pickup: booking.bpickup,
                    drop: booking.bdrop,
                    pickDate: booking.bpickDate,
                    dropDate: booking.bdropDate,
                    status: booking.status  // Include the status here
                }))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Update Booking Status
const updateBookingStatus = async (req, res) => {
    const { driverId, bookingId } = req.params; 
    const { inputStatus } = req.body; 

    try {
        // Step 1: Find the driver
        const driver = await Driver.findById(driverId);
        if (!driver) {
            console.log(`Driver with ID ${driverId} not found.`);
            return res.status(404).json({ message: "Driver not found" });
        }

        // Step 2: Find the booking based on bookingId
        const booking = await Bookform.findById(bookingId);
        if (!booking) {
            console.log(`Booking with ID ${bookingId} not found.`);
            return res.status(404).json({ message: "Booking not found" });
        }

        // Step 3: Update the booking status
        booking.status = inputStatus; // Update the status with the provided input
        const updatedBooking = await booking.save(); // Save the changes to the database

        // Step 4: Return success response
        res.status(200).json({
            message: "Booking status updated successfully",
            booking: {
                id: updatedBooking._id,
                status: updatedBooking.status,
                // Add other booking fields as needed
            }
        });
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

const getFilteredBookings = async (req, res) => {
    const { driverId } = req.params; // Get driver ID from URL
    const { status } = req.query; // Get status from query parameter

    try {
        // Construct the query based on driver ID and status
        const query = {
            driverId: driverId,
        };

        // Log the incoming status to see what we're filtering by
        console.log('Incoming status:', status);

        if (status) {
            query.status = status; // Filter by status if provided
        }

        // Fetch filtered bookings
        const bookings = await Bookform.find(query);

        // Log the query and the result for debugging
        console.log('Query:', query);
        console.log('Filtered bookings:', bookings); // Check what bookings are being returned

        // Return only the filtered bookings
        return res.status(200).json({
            success: true,
            bookings: bookings, // Return only the filtered bookings
        });
    } catch (error) {
        console.error('Error fetching bookings:', error); // Log error details
        return res.status(500).json({ message: 'Error fetching bookings', error });
    }
};


module.exports = { updateBookingStatus,getFilteredBookings, createDriver,assignDriver,  getAllDrivers, getDriverById, updateDriverById, deleteDriver, getImage,driverLogin, driverLogout , getDriverBookings  };