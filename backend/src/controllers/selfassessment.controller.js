const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submit = async (req, res, next) => {
  try {
    const { period, ratings, overallRating, achievements, improvements, comments } = req.body;
    if (!period || !ratings) return res.status(400).json({ message: 'period and ratings required' });
    const assessment = await prisma.selfAssessment.create({
      data: {
        employeeId: req.user.id,
        period,
        ratings: typeof ratings === 'string' ? ratings : JSON.stringify(ratings),
        overallRating: overallRating ? parseFloat(overallRating) : null,
        achievements: achievements || null,
        improvements: improvements || null,
        comments: comments || null,
        status: 'SUBMITTED',
      },
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
    });
    res.status(201).json(assessment);
  } catch (e) { next(e); }
};

const review = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { hrFeedback, hrRating, status } = req.body;
    const assessment = await prisma.selfAssessment.update({
      where: { id },
      data: {
        hrFeedback: hrFeedback || null,
        hrRating: hrRating ? parseFloat(hrRating) : null,
        status: status || 'REVIEWED',
        reviewedById: req.user.id,
      },
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
    });
    res.json(assessment);
  } catch (e) { next(e); }
};

const getForEmployee = async (req, res, next) => {
  try {
    const employeeId = parseInt(req.params.employeeId);
    if (req.user.role === 'EMPLOYEE' && req.user.id !== employeeId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const assessments = await prisma.selfAssessment.findMany({
      where: { employeeId },
      include: { employee: { select: { id: true, fullName: true, department: { select: { name: true } } } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(assessments);
  } catch (e) { next(e); }
};

const getAll = async (req, res, next) => {
  try {
    const assessments = await prisma.selfAssessment.findMany({
      include: { employee: { select: { id: true, fullName: true, jobTitle: true, department: { select: { name: true } } } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json(assessments);
  } catch (e) { next(e); }
};

module.exports = { submit, review, getForEmployee, getAll };
