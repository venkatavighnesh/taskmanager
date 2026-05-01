const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, checkProjectRole } = require('../middleware/auth');

// Create Task
router.post('/:projectId', auth, checkProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    const { projectId } = req.params;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: (dueDate && !isNaN(new Date(dueDate))) ? new Date(dueDate) : null,
        projectId,
        creatorId: req.user.id,
        assigneeId
      },
      include: {
        assignee: { select: { name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Update Task Status/Details
router.patch('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, title, description, priority, dueDate, assigneeId } = req.body;

    // Check if user is member of the project the task belongs to
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: req.user.id
      }
    });

    // Allow if user is either a member OR the project owner
    if (!membership && task.project.ownerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You are not a member of this project' });
    }

    // Role-based Task Edit Permission:
    // 1. Project Admins can edit anything.
    // 2. Members can only edit tasks assigned to them or created by them.
    const isAdmin = membership?.role === 'ADMIN' || task.project.ownerId === req.user.id;
    const isOwnerOrAssignee = task.creatorId === req.user.id || task.assigneeId === req.user.id;

    if (!isAdmin && !isOwnerOrAssignee) {
      return res.status(403).json({ message: 'Access denied: You can only edit your own tasks' });
    }

    // Use a simple object for updates
    const updateData = {};
    if (status) updateData.status = status;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (priority) updateData.priority = priority;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId === "" ? null : assigneeId;
    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);
      updateData.dueDate = (dueDate && !isNaN(parsedDate.getTime())) ? parsedDate : (dueDate === null ? null : undefined);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { name: true } }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("CRITICAL BACKEND ERROR:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Task
router.delete('/:taskId', auth, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: task.projectId,
          userId: req.user.id
        }
      }
    });

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

module.exports = router;
