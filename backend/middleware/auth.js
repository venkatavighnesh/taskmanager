const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const checkProjectRole = (roles) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required' });
      }

      const membership = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: req.user.id
          }
        }
      });

      if (!membership || !roles.includes(membership.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      req.projectRole = membership.role;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error checking permissions' });
    }
  };
};

module.exports = { auth, checkProjectRole };
