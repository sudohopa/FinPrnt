const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    const { fullName, email, username, password, jobTitle, role, gender, departmentId } = req.body;
    if (!fullName || !email || !username || !password) {
      return res.status(400).json({ message: 'fullName, email, username, and password are required' });
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
    res.status(201).json({ message: 'User created', user: safeUser });
  } catch (e) { next(e); }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    const user = await prisma.user.findUnique({
      where: { username },
      include: { department: true },
    });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName, email: user.email, departmentId: user.departmentId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (e) { next(e); }
};

const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { department: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (e) { next(e); }
};

module.exports = { register, login, me };
