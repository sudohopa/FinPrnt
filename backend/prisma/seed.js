const { PrismaClient } = require('@prisma/client');
const path = require('path');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const prisma = new PrismaClient();

function excelToDate(serial) {
  if (!serial || isNaN(serial)) return null;
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info;
}

async function main() {
  console.log('🌱 Seeding database from Excel spreadsheet...');

  const filePath = path.join(__dirname, '../data', 'grad data final isa (1).xlsx');
  const workbook = XLSX.readFile(filePath);

  // Load sheets
  const hrData = XLSX.utils.sheet_to_json(workbook.Sheets['HR Data']);
  const departmentsData = XLSX.utils.sheet_to_json(workbook.Sheets['Departments']);

  console.log(`🧹 Cleaning old database records...`);
  await prisma.notification.deleteMany();
  await prisma.selfAssessment.deleteMany();
  await prisma.trainingEnrollment.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.training.deleteMany();
  await prisma.department.deleteMany();

  // Hash a default password for all users
  const defaultPasswordHash = await bcrypt.hash('123456', 10);

  // 1. Seed Departments
  console.log('📋 Seeding departments...');
  const deptMap = new Map(); // Name -> Department object
  const deptHeads = new Map(); // Dept name -> Head of Dept name

  for (const dept of departmentsData) {
    const createdDept = await prisma.department.create({
      data: {
        name: dept['Department'],
        managerId: null, // set later
      },
    });
    deptMap.set(dept['Department'].toLowerCase().trim(), createdDept);
    if (dept['Head of Department']) {
      deptHeads.set(dept['Department'].toLowerCase().trim(), dept['Head of Department'].trim());
    }
  }
  console.log(`✅ ${deptMap.size} departments created`);

  // 2. Seed Employees / Users
  console.log('👥 Seeding employees...');
  const usersCreated = [];
  const userMapByFullName = new Map(); // Name -> User object

  for (const row of hrData) {
    const fullName = row['Full Name'] ? row['Full Name'].trim() : '';
    if (!fullName) continue;

    // Auto-generate username and email
    const username = fullName.toLowerCase().replace(/\s+/g, '');
    const email = `${fullName.toLowerCase().replace(/\s+/g, '.')}@company.com`;

    // Determine role based on management or specific designation
    let role = 'EMPLOYEE';
    const jobTitle = row['Job Title'] ? row['Job Title'].trim() : '';
    const deptNameKey = row['Department'] ? row['Department'].toLowerCase().trim() : '';

    if (fullName.toLowerCase() === 'mahmoud ali' || jobTitle.toLowerCase().includes('hr manager')) {
      role = 'HR';
    } else if (deptHeads.has(deptNameKey) && deptHeads.get(deptNameKey).toLowerCase() === fullName.toLowerCase()) {
      role = 'MANAGER';
    } else if (jobTitle.toLowerCase().includes('manager') || jobTitle.toLowerCase().includes('head')) {
      role = 'MANAGER';
    }

    const hireDateVal = row['Hire Date'];
    const dobVal = row['Date of birth '];

    const departmentObj = deptMap.get(deptNameKey);

    const createdUser = await prisma.user.create({
      data: {
        fullName,
        email,
        username,
        password: defaultPasswordHash,
        jobTitle: jobTitle || 'Staff',
        role,
        gender: row['Gender'] ? row['Gender'].toUpperCase() : null,
        departmentId: departmentObj ? departmentObj.id : null,
        phone: row['Phone'] ? String(row['Phone']) : '01000000000',
        location: row['Address'] || 'Cairo, Egypt',
        hireDate: hireDateVal ? excelToDate(hireDateVal) : new Date('2023-01-01'),
      },
    });

    usersCreated.push({ user: createdUser, row });
    userMapByFullName.set(fullName.toLowerCase(), createdUser);
  }
  console.log(`✅ ${usersCreated.length} employees created`);

  // 2b. Add System Admin User
  console.log('👑 Seeding System Admin...');
  const adminPasswordHash = await bcrypt.hash('123456', 10);
  const createdAdmin = await prisma.user.create({
    data: {
      fullName: 'System Admin',
      email: 'admin@finprint.app',
      username: 'admin',
      password: adminPasswordHash,
      jobTitle: 'System Administrator',
      role: 'ADMIN',
      gender: 'MALE',
      phone: '+1 (555) 000-0001',
      location: 'Cairo, Egypt',
      hireDate: new Date('2019-01-01'),
    }
  });
  usersCreated.push({ user: createdAdmin, row: {} });
  userMapByFullName.set('system admin', createdAdmin);

  // 3. Link Department Managers
  console.log('🔗 Updating department managers...');
  for (const [deptNameKey, headName] of deptHeads.entries()) {
    const userObj = userMapByFullName.get(headName.toLowerCase());
    const deptObj = deptMap.get(deptNameKey);
    if (userObj && deptObj) {
      await prisma.department.update({
        where: { id: deptObj.id },
        data: { managerId: userObj.id },
      });
    }
  }
  console.log('✅ Department managers updated');

  // 4. Seed Payroll, Leaves, Attendance, Trainings & Self-Assessments
  console.log('🔄 Seeding transactional data for employees...');
  const payPeriod = 'May 2026';
  const fallbackDept = await prisma.department.findFirst();
  const fallbackDeptId = fallbackDept ? fallbackDept.id : 1;

  for (const { user, row } of usersCreated) {
    // 4.1 Payroll
    const basicSalary = parseFloat(row['Basic Salary']) || 4000;
    const bonus = parseFloat(row['Bonus']) || 0;
    const allowances = parseFloat(row['Allowances']) || 0;
    const deductions = parseFloat(row['Deductions']) || 0;
    const netSalary = parseFloat(row['Net Salary']) || (basicSalary + bonus + allowances - deductions);

    await prisma.payroll.create({
      data: {
        employeeId: user.id,
        baseSalary: basicSalary,
        bonus,
        allowances,
        deductions,
        netSalary,
        payPeriod,
        status: 'Paid',
      },
    });

    // 4.2 Leaves (generate records matching the quantities in Excel)
    const annualLeaveDays = parseInt(row['Annual Leave']) || 0;
    const casualLeaveDays = parseInt(row['Casual leave']) || 0;
    const sickLeaveDays = parseInt(row['Sick Leave']) || 0;

    if (annualLeaveDays > 0) {
      await prisma.leave.create({
        data: {
          employeeId: user.id,
          leaveType: 'Annual',
          startDate: new Date('2026-03-01'),
          endDate: new Date(`2026-03-0${Math.min(annualLeaveDays, 9)}`),
          reason: 'Annual family holiday',
          status: 'APPROVED',
        },
      });
    }
    if (casualLeaveDays > 0) {
      await prisma.leave.create({
        data: {
          employeeId: user.id,
          leaveType: 'Casual',
          startDate: new Date('2026-04-10'),
          endDate: new Date(`2026-04-1${Math.min(casualLeaveDays, 9)}`),
          reason: 'Personal urgent emergency',
          status: 'APPROVED',
        },
      });
    }
    if (sickLeaveDays > 0) {
      await prisma.leave.create({
        data: {
          employeeId: user.id,
          leaveType: 'Sick',
          startDate: new Date('2026-02-15'),
          endDate: new Date(`2026-02-1${Math.min(sickLeaveDays, 9)}`),
          reason: 'Medical rest requested by doctor',
          status: 'APPROVED',
        },
      });
    }

    // 4.3 Attendance Rate simulation
    // We populate past 15 working days matching the exact rate
    const attRate = parseFloat(row['Attendance Rate']) || 0.90;
    const totalDays = 15;
    for (let day = 1; day <= totalDays; day++) {
      const isWeekend = day % 7 === 5 || day % 7 === 6; // Friday/Saturday
      if (isWeekend) continue;

      const dateStr = `2026-05-${day < 10 ? '0' + day : day}`;
      const present = Math.random() <= attRate;

      if (present) {
        await prisma.attendance.create({
          data: {
            employeeId: user.id,
            date: dateStr,
            checkIn: new Date(`${dateStr}T09:00:00.000Z`),
            checkOut: new Date(`${dateStr}T17:00:00.000Z`),
            totalHours: 8,
            status: 'PRESENT',
          },
        });
      } else {
        await prisma.attendance.create({
          data: {
            employeeId: user.id,
            date: dateStr,
            checkIn: null,
            checkOut: null,
            totalHours: 0,
            status: 'ABSENT',
          },
        });
      }
    }

    // 4.4 Trainings / Courses
    const coursesStr = row['Courses '];
    if (coursesStr && coursesStr.trim()) {
      const coursesList = coursesStr.split(/[,&]/).map(c => c.trim()).filter(Boolean);
      for (const courseName of coursesList) {
        const courseCode = courseName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10);
        
        let trainingObj = await prisma.training.findUnique({
          where: { courseCode },
        });

        if (!trainingObj) {
          trainingObj = await prisma.training.create({
            data: {
              courseName,
              courseCode,
              description: `Professional skills training: ${courseName}`,
              startDate: new Date('2026-01-10'),
              endDate: new Date('2026-05-30'),
              departmentId: user.departmentId || fallbackDeptId,
              maxEnrolled: 40,
            },
          });
        }

        await prisma.trainingEnrollment.create({
          data: {
            employeeId: user.id,
            trainingId: trainingObj.id,
            progress: Math.floor(Math.random() * 40) + 60, // 60% to 100%
            status: 'In Progress',
          },
        }).catch(() => {}); // ignore duplicates
      }
    }

    // 4.5 Self-Assessments
    const perfScore = parseFloat(row['Performance Score']) || 75;
    const satScore = parseFloat(row['Emp satisfaction']) || 80;
    
    await prisma.selfAssessment.create({
      data: {
        employeeId: user.id,
        period: 'Q1 2026',
        ratings: JSON.stringify({ performance: perfScore / 20, satisfaction: satScore / 20 }),
        overallRating: perfScore / 20,
        achievements: 'Completed all core targets outlined for the current business period.',
        improvements: 'Focus on advancing specialized tools and technical excellence.',
        comments: 'Highly satisfied with team environment and collaborative workspace.',
        status: 'APPROVED',
        hrRating: perfScore / 20,
        hrFeedback: 'Excellent outputs, keep up the fantastic work and contributions!',
      },
    });
  }

  // 5. Reset Sequences
  const tables = [
    'Department',
    'User',
    'Training',
    'Attendance',
    'Leave',
    'Payroll',
    'TrainingEnrollment',
    'SelfAssessment',
    'Notification'
  ];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(MAX(id), 1)) FROM "${table}";`
      );
    } catch (e) {}
  }

  console.log('\n🎉 Seed complete!');
  console.log('   Log in with a seeded username and your configured dev password.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
