const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({ message: 'leaveType, startDate, endDate required' });
    }
    const leave = await prisma.leave.create({
      data: {
        employeeId: req.user.id,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
        status: 'PENDING',
      },
      include: { employee: { select: { id: true, fullName: true, department: true } } },
    });
    res.status(201).json(leave);
  } catch (e) { next(e); }
};

const review = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status, responseNote } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'status must be APPROVED or REJECTED' });
    }
    const leave = await prisma.leave.update({
      where: { id },
      data: { status, reviewedById: req.user.id, reviewedAt: new Date() },
      include: { employee: { select: { id: true, fullName: true, department: true } } },
    });
    res.json(leave);
  } catch (e) { next(e); }
};

const getForEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const leaves = await prisma.leave.findMany({
      where: { employeeId },
      include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaves);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const leaves = await prisma.leave.findMany({
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leaves);
  } catch (e) { next(e); }
};

module.exports = { create, review, getForEmployee, getAll };
