const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const create = async (req, res, next) => {
  try {
    const { courseName, courseCode, description, startDate, endDate, departmentId, maxEnrolled } = req.body;
    if (!courseName || !courseCode || !startDate || !endDate || !departmentId) {
      return res.status(400).json({ message: 'courseName, courseCode, startDate, endDate, departmentId required' });
    }
    const training = await prisma.training.create({
      data: {
        courseName, courseCode, description: description || null,
        startDate: new Date(startDate), endDate: new Date(endDate),
        departmentId: parseInt(departmentId),
        maxEnrolled: maxEnrolled ? parseInt(maxEnrolled) : 30,
      },
      include: { department: true, enrollments: { include: { employee: { select: { id: true, fullName: true } } } } },
    });
    res.status(201).json(training);
  } catch (e) { next(e); }
};

const assign = async (req, res, next) => {
  try {
    const { employeeId, trainingId } = req.body;
    const enrollment = await prisma.trainingEnrollment.create({
      data: { employeeId: parseInt(employeeId), trainingId: parseInt(trainingId) },
      include: { employee: { select: { id: true, fullName: true } }, training: true },
    });
    res.status(201).json(enrollment);
  } catch (e) { next(e); }
};

const updateProgress = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { progress, status } = req.body;
    const enrollment = await prisma.trainingEnrollment.update({
      where: { id },
      data: { progress: parseFloat(progress), status: status || (parseFloat(progress) >= 100 ? 'Completed' : 'In Progress') },
    });
    res.json(enrollment);
  } catch (e) { next(e); }
};

const getForEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    const enrollments = await prisma.trainingEnrollment.findMany({
      where: { employeeId },
      include: { training: { include: { department: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(enrollments);
  } catch (e) { next(e); }
};

const getForDept = async (req, res, next) => {
  try {
    const departmentId = parseInt(req.params.departmentId);
    const trainings = await prisma.training.findMany({
      where: { departmentId },
      include: { enrollments: { include: { employee: { select: { id: true, fullName: true } } } }, department: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(trainings);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const trainings = await prisma.training.findMany({
      include: {
        department: true,
        enrollments: { include: { employee: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(trainings);
  } catch (e) { next(e); }
};

module.exports = { create, assign, updateProgress, getForEmployee, getForDept, getAll };
