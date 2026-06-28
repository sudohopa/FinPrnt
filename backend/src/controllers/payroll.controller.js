const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res, next) => {
  try {
    const { employeeId, baseSalary, bonus, allowances, deductions, payPeriod } = req.body;
    if (!employeeId || !baseSalary || !payPeriod) {
      return res.status(400).json({ message: 'employeeId, baseSalary, payPeriod required' });
    }
    const b = parseFloat(baseSalary);
    const bo = parseFloat(bonus || 0);
    const al = parseFloat(allowances || 0);
    const de = parseFloat(deductions || 0);
    const netSalary = b + bo + al - de;

    const payroll = await prisma.payroll.create({
      data: {
        employeeId: parseInt(employeeId),
        baseSalary: b, bonus: bo, allowances: al, deductions: de, netSalary,
        payPeriod, status: 'Paid',
      },
      include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } },
    });
    res.status(201).json(payroll);
  } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { baseSalary, bonus, allowances, deductions, payPeriod, status } = req.body;
    const data = {};
    if (baseSalary !== undefined) data.baseSalary = parseFloat(baseSalary);
    if (bonus !== undefined) data.bonus = parseFloat(bonus);
    if (allowances !== undefined) data.allowances = parseFloat(allowances);
    if (deductions !== undefined) data.deductions = parseFloat(deductions);
    if (payPeriod) data.payPeriod = payPeriod;
    if (status) data.status = status;
    if (data.baseSalary || data.bonus || data.allowances || data.deductions) {
      const cur = await prisma.payroll.findUnique({ where: { id } });
      data.netSalary = (data.baseSalary||cur.baseSalary) + (data.bonus||cur.bonus) + (data.allowances||cur.allowances) - (data.deductions||cur.deductions);
    }
    const payroll = await prisma.payroll.update({
      where: { id }, data,
      include: { employee: { select: { id: true, fullName: true } } },
    });
    res.json(payroll);
  } catch (e) { next(e); }
};

const getForEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const payrolls = await prisma.payroll.findMany({
      where: { employeeId },
      include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payrolls);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const payrolls = await prisma.payroll.findMany({
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payrolls);
  } catch (e) { next(e); }
};

module.exports = { create, update, getForEmployee, getAll };
