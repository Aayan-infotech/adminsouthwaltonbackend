const Task = require("../models/taskModel");

// Create a new task
exports.createTask = async (req, res) => {
  console.log(req.body);
  const { driverName, customerName, pickupAddress, deliveryAddress, pickupDate, deliveryDate } = req.body;

  try {
    const taskEntry = new Task({
      driverName,
      customerName,
      pickupAddress,
      deliveryAddress,
      pickupDate,
      deliveryDate
    });

    const newTask = await taskEntry.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get task by ID
exports.getTaskById = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (err) {
      console.error("Get Task Error:", err);
      res.status(500).json({ message: err.message });
    }
  };

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const updateData = {
      driverName: req.body.driverName,
      customerName: req.body.customerName,
      pickupAddress: req.body.pickupAddress,
      deliveryAddress: req.body.deliveryAddress,
      pickupDate: req.body.pickupDate,
      deliveryDate: req.body.deliveryDate
    };

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(400).json({ message: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
