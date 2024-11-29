
const mongoose = require('mongoose');
const Driver  = require('../models/driverModel');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const Role = require('../models/roleModel');
const Bookform = require('../models/checkoutModel');
const Reservation = require('../models/reserveModel');
const Payment = require('../models/PaymentModel');
const createError = require('../middleware/error');
const createSuccess = require('../middleware/success');
const path = require('path');
const fs = require('fs');




const createDriver = async (req, res, next) => {
    try {
        const role = await Role.findOne({ role: 'Driver' });
        if (!role) {
            return next(createError(400, "Role not found"));
        }

        const { name, mobileNumber, email, password, address } = req.body;
        const images = req.fileLocations;


        if (!name) {
            return next(createError(400, "Name is required"));
        }
        if (!email) {
            return next(createError(400, "Email is required"));
        }
        if (!password) {
            return next(createError(400, "Password is required"));
        }

        // Check if the email already exists
        const existingUser = await Driver.findOne({ email });
        if (existingUser) {
            return next(createError(400, "Email already exists"));
        }

        const newDriver = new Driver({
            name,
            mobileNumber,
            email,
            password,
            address,
            images, 
            roles: [role._id],
        });

        const savedDriver = await newDriver.save();

        return next(createSuccess(200, "Driver Registered Successfully", savedDriver));
    } catch (error) {
        console.error("Error creating driver:", error);
        return next(createError(500, "Something went wrong"));
    }
};



const getAllDrivers = async (req, res, next) => {
    try {
        const allDrivers = await Driver.find();  // Ensure Driver model is used
        const driverWithImageURLs = allDrivers.map(driver => {
  
            if (driver.images && driver.images.length > 0) {
              
                return {
                    ...driver._doc,
                    images: driver.images  
                };
            } else {
                
                const { image, ...driverWithoutImages } = driver._doc;
                return driverWithoutImages;
            }
        });
        
        // Respond with the drivers including the images array (if available)
        return res.status(200).json({
            success: true,
            message: "All Drivers",
            drivers: driverWithImageURLs
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        });
    }
};


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

        // Directly return the images array as is, no need to modify it
        let driverWithImages = { ...driverById._doc };
        driverWithImages.images = driverById.images; // Use the 'images' array as is

        return res.status(200).json({
            success: true,
            message: "Driver found",
            driver: driverWithImages
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




  const updateDriverById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate driverId
      if (!id) {
        return res.status(400).json({ message: 'Driver ID is required' });
      }
  
      // Find the driver
      const driver = await Driver.findById(id);
      if (!driver) {
        return res.status(404).json({ message: 'Driver not found' });
      }
  
      // Update the images if uploaded
      if (req.fileLocations && req.fileLocations.length > 0) {
        driver.images = req.fileLocations; // Replace existing images
      }
  
      // Save the updated driver
      await driver.save();
  
      return res.status(200).json({
        message: 'Driver updated successfully',
        driver,
      });
    } catch (error) {
      console.error('Error updating driver:', error.message);
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message,
      });
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
  
    if (!mongoose.Types.ObjectId.isValid(driverId) || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, status: 400, message: 'Invalid Driver or Booking ID' });
    }
  
    try {
    
      const booking = await Bookform.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, status: 404, message: 'Booking not found' });
      }
  
      if (paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
        booking.paymentId = paymentId;
      } else {
        booking.paymentId = null;  
      }
  
      const driver = await Driver.findById(driverId);
      if (!driver) {
        return res.status(400).json({ success: false, status: 400, message: 'Driver not found' });
      }
  
   
      booking.driver = driver._id;
      booking.status = 'PENDING';
      await booking.save();
  
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
        // Fetch the driver and populate bookings
        const driver = await Driver.findById(driverId).populate('bookings');
        
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        if (!driver.bookings || driver.bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'No bookings found for this driver' });
        }

        // Map bookings to fetch nested payment and reservation details
        const bookingsWithDetails = await Promise.all(driver.bookings.map(async (booking) => {
            if (!booking) return null;

            // Fetch payment details using booking.paymentId
            const payment = await Payment.findById(booking.paymentId);
            if (!payment) return null;

            const reservation = await Reservation.findById(payment.reservation);
            if (!reservation) return null;

           
            return {
                bookingId: booking._id,
                bname: booking.bname,
                bemail: booking.bemail,
                bsize: booking.bsize,
                baddress: booking.baddress,
                baddressh: booking.baddressh,
                paymentId: payment._id,
                transactionId: payment.transactionId,
                amount: payment.amount,
                pickup: reservation.pickup,
                drop: reservation.drop,
                pickDate: reservation.pickdate,
                dropDate: reservation.dropdate,
            };
        }));

        // Remove null or invalid bookings
        const validBookings = bookingsWithDetails.filter(booking => booking);

        // Respond with detailed driver and booking information
        res.json({
            success: true,
            message: 'All bookings of this driver',
            driver: {
                name: driver.name,
                mobileNumber: driver.mobileNumber,
                email: driver.email,
                address: driver.address,
                bookings: validBookings,
            }
        });
    } catch (error) {
        console.error('Error fetching driver bookings:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};


//update status
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