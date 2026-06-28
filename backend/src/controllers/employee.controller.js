const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      include: { department: true },
      orderBy: { fullName: 'asc' },
    });
    res.json(users.map(({ password, ...u }) => u));
  } catch (e) { next(e); }
};

const getOne = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    // Employees can only see their own profile
    if (req.user.role === 'EMPLOYEE' && req.user.id !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await prisma.user.findUnique({
      where: { id },
      include: { department: true },
    });
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    const { fullName, email, username, password, jobTitle, role, gender, departmentId } = req.body;
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: 'fullName, email, username, password required' });
    }
    const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (exists) return res.status(409).json({ message: 'Email or username already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName, email, username, password: hash,
        jobTitle: jobTitle || null,
        role: role || 'EMPLOYEE',
        gender: gender || null,
        departmentId: departmentId ? parseInt(departmentId) : null,
      },
      include: { department: true },
    });
    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { fullName, email, jobTitle, role, gender, departmentId, phone, location } = req.body;
    const data = {};
    if (fullName) data.fullName = fullName;
    if (email) data.email = email;
    if (jobTitle) data.jobTitle = jobTitle;
    if (role) data.role = role;
    if (gender) data.gender = gender;
    if (departmentId !== undefined) data.departmentId = departmentId ? parseInt(departmentId) : null;
    if (phone) data.phone = phone;
    if (location) data.location = location;

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { department: true },
    });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Employee deleted' });
  } catch (e) { next(e); }
};

module.exports = { getAll, getOne, create, update, remove };
