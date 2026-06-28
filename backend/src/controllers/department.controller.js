const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const depts = await prisma.department.findMany({
      include: { employees: { select: { id: true, fullName: true, jobTitle: true, role: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(depts);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'name is required' });
    const dept = await prisma.department.create({
      data: { name },
      include: { employees: true },
    });
    res.status(201).json(dept);
  } catch (e) { next(e); }
};

const assignEmployee = async (req, res, next) => {
  try {
    const { departmentId, employeeId } = req.params;
    const user = await prisma.user.update({
      where: { id: parseInt(employeeId) },
      data: { departmentId: parseInt(departmentId) },
      include: { department: true },
    });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { next(e); }
};

module.exports = { getAll, create, assignEmployee };
