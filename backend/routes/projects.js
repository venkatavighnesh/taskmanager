const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, checkProjectRole } = require('../middleware/auth');

// Create Project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      },
      include: {
        members: true
      }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
});

// Get User Projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { tasks: true, members: true } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Get Single Project
router.get('/:projectId', auth, checkProjectRole(['ADMIN', 'MEMBER']), async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.projectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, createdAt: true } }
          }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } }
          }
        },
        owner: { select: { name: true, email: true } }
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
});

// Add Member to Project
router.post('/:projectId/members', auth, checkProjectRole(['ADMIN']), async (req, res) => {
  try {
    const { email, role } = req.body;
    const userToAdd = await prisma.user.findUnique({ where: { email } });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.projectId,
          userId: userToAdd.id
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: req.params.projectId,
        userId: userToAdd.id,
        role: role || 'MEMBER'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member' });
  }
});

module.exports = router;
