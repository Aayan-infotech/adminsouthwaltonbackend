const CustomerDamage = require('../models/customerDamagesModel');
const createError = require('../middleware/error')
const createSuccess = require('../middleware/success')




exports.getAllCustomerDamage = async (req, res,next) => {
  try {
      const customerDamage = await CustomerDamage.find();
      return next(createSuccess(200, "All Customer Damages", customerDamage));
  } catch (error) {
    return next(createError(500, "Internal Server Error!"))
  }
};

exports.deleteDamage = async (req, res, next) => {
  try {
      const { id } = req.params;
      const damage = await CustomerDamage.findByIdAndDelete(id);
      if (!damage) {
          return next(createError(404, "Damage not found"));
      }
      return next(createSuccess(200, "Damage deleted", damage));
  } catch (error) {
      return next(createError(500, "Internal Server Error1"))
  }
}

exports.getDamageById = async (req, res, next) => {
  try {
      const damage = await CustomerDamage.findById(req.params.id);
      if (!damage) {
          return next(createError(404, "Damage Not Found"));
      }
      return next(createSuccess(200, "Single Damage", damage));
  } catch (error) {
      return next(createError(500, "Internal Server Error1"))
  }
}