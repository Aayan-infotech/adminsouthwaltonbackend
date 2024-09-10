const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Route to get all tasks
router.get('/', taskController.getTasks);

// Route to get a task by ID
router.get('/:id', taskController.getTaskById);

// Route to create a new task
router.post('/add', taskController.createTask);

// Route to update a task by ID
router.put('/:id', taskController.updateTask);

// Route to delete a task by ID
router.delete('/:id', taskController.deleteTask);

module.exports = router;
