const mongoose = require('mongoose');
const Driver  = require('../models/driverModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const Bookform = require('../models/checkoutModel');
const Reservation = require('../models/reserveModel');
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

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(updateDriverId)) {
            return next(createError(400, "Invalid Driver ID"));
        }
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
        res.status(200).json({status:200, message: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        return next(createError(500, "Internal Server Error"));
    }
};

//assign driver 
const assignDriverToBooking = async (req, res) => {
    const { bookingId, driverId, paymentId } = req.body;
  
    console.log("Received driverId:", driverId);
    console.log("Received bookingId:", bookingId);
    console.log("Received paymentId:", paymentId);
  
    // Validate driverId and bookingId
    if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, status: 400, message: 'Invalid Driver or Booking ID' });
    }
  
    try {
      // Fetch the booking
      const booking = await Bookform.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, status: 404, message: 'Booking not found' });
      }
  
      // Ensure valid paymentId
      if (paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
        booking.paymentId = paymentId;
      } else {
        booking.paymentId = null;  // Set to null if no valid paymentId
      }
  
      // Fetch the driver
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(400).json({ success: false, status: 400, message: 'Driver not found' });
      }
  
      // Assign driver to booking
      booking.driver = driver._id;
      booking.status = 'PENDING';
      await booking.save();
  
      // Update driver's bookings
      driver.bookings.push(booking._id);
      driver.status = 'Booked';
      await driver.save();
  
      return res.status(200).json({ success: true, message: 'Driver assigned successfully', booking, driver });
    } catch (error) {
      console.error("Error in assigning driver:", error);
      return res.status(500).json({ success: false, status: 500, message: 'Server error', error: error.message });
    }
};


const getDriverBookings = async (req, res) => {
    const { driverId } = req.params;

    try {
        // Fetch the driver with the provided driverId and populate the bookings
        const driver = await Driver.findById(driverId).populate('bookings'); // Populate bookings directly

        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        // Check if there are bookings
        if (driver.bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found for this driver' });
        }

        // Map through the bookings to get detailed information
        const bookingsWithDetails = await Promise.all(driver.bookings.map(async (booking) => {
            if (!booking) return null; // Skip if booking not found
            
            // Fetch the reservation using the reservationId from the booking
            const reservation = await Reservation.findById(booking.reservationId);
            
            // Log the booking and reservation for debugging
            console.log(`Booking ID: ${booking._id}, Reservation ID: ${booking.reservationId}, Reservation:`, reservation);

            return {
                id: booking._id,
                name: booking.bname, // Ensure these fields exist in the Bookform schema
                phone: booking.bphone,
                email: booking.bemail,
                size: booking.bsize,
                address: booking.baddress,
                addressh: booking.baddressh,
                reservationId: booking.reservationId,
     
                pickup: reservation ? reservation.pickup : 'Pickup not specified',
                drop: reservation ? reservation.drop : 'Drop not specified',
                pickDate: reservation ? reservation.pickdate : 'Pick Date not specified',
                dropDate: reservation ? reservation.dropdate : 'Drop Date not specified',
                status: booking.status,
            };
        }));

        // Filter out any null bookings (in case some were not found)
        const filteredBookings = bookingsWithDetails.filter(booking => booking !== null);

        // Respond with the driver information and bookings
        res.json({
            success: true,
            message: "All Booking of this driver",
            driver: {
                name: driver.name,
                mobileNumber: driver.mobileNumber,
                email: driver.email,
                address: driver.address,
                bookings: filteredBookings,
            }
        });
    } catch (error) {
        console.error("Error fetching driver bookings:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Update Booking Status
const updateBookingStatus = async (req, res) => {
    const { driverId, bookingId, status } = req.body; // Get driverId and bookingId from request body

    // Validate status
    const validStatuses = ['PENDING', 'DELIVERED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
        // Find the driver by ID
        const driver = await Driver.findById(driverId).populate('bookings');
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        // Extract the booking ID
        const booking = driver.bookings.find(b => b._id.toString() === bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found for this driver' });
        }

        // Find booking by ID and update status
        const bookingToUpdate = await Bookform.findById(bookingId);
        if (!bookingToUpdate) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Update the booking status
        bookingToUpdate.status = status;
        await bookingToUpdate.save();

        return res.status(200).json({ success: true, message: 'Booking status updated successfully', booking: bookingToUpdate });
    } catch (error) {
        console.error('Error updating booking status:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getFilteredBookings = async (req, res, next) => {
    const { status } = req.query;  // Status: PENDING, DELIVERED, COMPLETED
    try {
        // Fetch bookings based on status
        const bookings = await Bookform.find({ status }).populate('driver');

        if (!bookings.length) {
            return next(createError(404, "No bookings found with the given status"));
        }

        // Map through the bookings to get the required booking and reservation details
        const detailedBookings = await Promise.all(bookings.map(async (booking) => {
            const reservation = await Reservation.findById(booking.reservationId);
            if (!reservation) {
                return null; // Skip if reservation is not found
            }

            return {
                bookingId: booking._id,
                bname: booking.bname,
                bphone: booking.bphone,
                bemail: booking.bemail,
                baddress: booking.baddress,
                baddressh: booking.baddressh,
                reservationId: reservation._id,
                pickup: reservation.pickup,
                drop: reservation.drop,
                userId: reservation.userId,
                pickdate: reservation.pickdate,
                dropdate: reservation.dropdate,
                status: booking.status,
                driver: booking.driver ? {
                    name: booking.driver.name,
                    mobileNumber: booking.driver.mobileNumber,
                    email: booking.driver.email,
                } : null
            };
        }));

        // Filter out any null bookings (in case reservation wasn't found)
        const validBookings = detailedBookings.filter(booking => booking !== null);

        return next(createSuccess(200, `Bookings with status: ${status}`, validBookings));
    } catch (error) {
        console.error(error);
        return next(createError(500, "Something went wrong while fetching bookings"));
    }
};



module.exports = { updateBookingStatus,getFilteredBookings, createDriver,assignDriverToBooking,  getAllDrivers, getDriverById, updateDriverById, deleteDriver, getImage,driverLogin, driverLogout , getDriverBookings  };