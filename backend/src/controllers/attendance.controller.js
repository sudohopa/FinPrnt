const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const today = () => new Date().toISOString().split('T')[0];

const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const date = today();
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date },
    });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }
    const record = await prisma.attendance.create({
      data: { employeeId, date, checkIn: new Date(), status: 'PRESENT' },
      include: { employee: { select: { id: true, fullName: true } } },
    });
    res.status(201).json(record);
  } catch (e) { next(e); }
};

const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const date = today();
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date },
    });
    if (!existing) return res.status(400).json({ message: 'Not clocked in today' });
    if (existing.checkOut) return res.status(400).json({ message: 'Already clocked out today' });

    const checkOut = new Date();
    const hours = (checkOut - new Date(existing.checkIn)) / 3600000;
    const record = await prisma.attendance.update({
      where: { id: existing.id },
      data: { checkOut, totalHours: Math.round(hours * 100) / 100 },
      include: { employee: { select: { id: true, fullName: true } } },
    });
    res.json(record);
  } catch (e) { next(e); }
};

const getForEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const records = await prisma.attendance.findMany({
      where: { employeeId },
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: true } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
    res.json(records);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const records = await prisma.attendance.findMany({
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(records);
  } catch (e) { next(e); }
};

const getTodayStatus = async (req, res, next) => {
  try {
    const employeeId = req.user.id;
    const date = today();
    const record = await prisma.attendance.findFirst({ where: { employeeId, date } });
    res.json({ record, clockedIn: !!(record && record.checkIn && !record.checkOut) });
  } catch (e) { next(e); }
};

module.exports = { checkIn, checkOut, getForEmployee, getAll, getTodayStatus };
