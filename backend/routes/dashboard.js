const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const assignedTasks = await prisma.task.findMany({
      where: { assigneeId: userId },
      include: { project: { select: { name: true } } }
    });

    const stats = {
      total: assignedTasks.length,
      todo: assignedTasks.filter(t => t.status === 'TODO').length,
      inProgress: assignedTasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: assignedTasks.filter(t => t.status === 'COMPLETED').length,
      overdue: assignedTasks.filter(t => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < new Date()).length
    };

    const recentProjects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      take: 5,
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ stats, recentTasks: assignedTasks.slice(0, 5), recentProjects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
