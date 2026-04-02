const Task = require("../models/Task");

// ✅ Create Task (Admin only)
exports.createTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { title, description } = req.body;

    const task = new Task({
      title,
      description,
      status: "pending",
      createdBy: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Tasks (Admin → all, User → own tasks)
exports.getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({ assignedTo: req.user.id });
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Task Status (User/Admin)
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Only assigned user or admin can update
    if (
      req.user.role !== "admin" &&
      task.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.status = status; // pending, in_progress, completed
    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Basic Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const pending = await Task.countDocuments({ status: "pending" });
    const inProgress = await Task.countDocuments({ status: "in_progress" });
    const completed = await Task.countDocuments({ status: "completed" });

    const completionRate =
      total === 0 ? 0 : ((completed / total) * 100).toFixed(2);

    res.json({
      total,
      pending,
      inProgress,
      completed,
      completionRate: `${completionRate}%`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
