'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const router = useRouter();
  
  // Auth & User State
  const [token, setToken] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');
  const [userTitle, setUserTitle] = useState('Senior Specialist');
  const [userDept, setUserDept] = useState('General');
  
  // App Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('');

  // Clock state
  const [clockTime, setClockTime] = useState('--:-- --');
  const [clockDate, setClockDate] = useState('');
  const [clockedIn, setClockedIn] = useState(false);

  // Model & List Data States
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [trainingStatsData, setTrainingStatsData] = useState({ active: 12, completed: 156, progress: 48, certs: 89 });
  const [analyticsData, setAnalyticsData] = useState(null);

  // Filters
  const [empSearch, setEmpSearch] = useState('');
  const [empDeptFilter, setEmpDeptFilter] = useState('');
  const [empRoleFilter, setEmpRoleFilter] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
  const [attSearch, setAttSearch] = useState('');

  // Modals state
  const [modals, setModals] = useState({
    employee: false,
    department: false,
    leave: false,
    course: false,
    payroll: false,
  });

  // Modal Form Inputs
  const [newEmp, setNewEmp] = useState({ name: '', email: '', username: '', password: '', jobTitle: '', role: 'EMPLOYEE', gender: 'MALE', deptId: '' });
  const [newDept, setNewDept] = useState({ name: '' });
  const [newLeave, setNewLeave] = useState({ type: 'Annual Leave', start: '', end: '', reason: '' });
  const [newCourse, setNewCourse] = useState({ name: '', code: '', start: '', end: '', deptId: '' });
  const [newPayroll, setNewPayroll] = useState({ empId: '', base: '8500', period: 'May 2026' });

  // Self assessment state
  const [achievements, setAchievements] = useState('');
  const [improvements, setImprovements] = useState('');
  const [comments, setComments] = useState('');
  const [ratings, setRatings] = useState({
    'Communication Skills': 0,
    'Team Collaboration': 0,
    'Problem Solving': 0,
    'Time Management': 0,
    'Technical Expertise': 0,
    'Leadership': 0,
  });

  // References for Charts
  const hrAttChartRef = useRef(null);
  const hrDeptChartRef = useRef(null);
  const empAttChartRef = useRef(null);
  const deptOverviewChartRef = useRef(null);
  const analyticsAttChartRef = useRef(null);
  const analyticsPerfChartRef = useRef(null);
  const analyticsHeadChartRef = useRef(null);
  const salaryTrendsChartRef = useRef(null);
  const trainingChartRef = useRef(null);
  const aiAnalyticsChartRef = useRef(null);

  // Chart instances trackers
  const chartInstances = useRef({});

  // AI Analytics State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiChartData, setAiChartData] = useState(null);

  // Load previous results on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAiResult(localStorage.getItem('gemini_ai_result') || '');
      const savedData = localStorage.getItem('gemini_ai_chart_data');
      if (savedData) {
        try {
          setAiChartData(JSON.parse(savedData));
        } catch (e) {}
      }
    }
  }, []);

  // AI Analytics Chart Render Effect
  useEffect(() => {
    if (activeTab === 'analytics' && aiChartData && aiAnalyticsChartRef.current) {
      if (chartInstances.current.aiAnalytics) {
        chartInstances.current.aiAnalytics.destroy();
      }

      const ctx = aiAnalyticsChartRef.current;
      chartInstances.current.aiAnalytics = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: aiChartData.departments.map(d => d.name),
          datasets: [
            {
              label: 'Workforce Efficacy (%)',
              data: aiChartData.departments.map(d => d.efficacy),
              backgroundColor: '#4F6EF5',
              borderRadius: 6
            },
            {
              label: 'Turnover Risk (%)',
              data: aiChartData.departments.map(d => d.turnoverRisk),
              backgroundColor: '#ef4444',
              borderRadius: 6
            },
            {
              label: 'Employee Satisfaction (%)',
              data: aiChartData.departments.map(d => d.satisfaction || 80),
              backgroundColor: '#10b981',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: 'rgba(0,0,0,0.05)' }
            },
            x: {
              grid: { display: false }
            }
          },
          plugins: {
            legend: { position: 'top' }
          }
        }
      });
    }
  }, [aiChartData, activeTab]);

  // 1. Initial Authentication & User Details Fetching
  useEffect(() => {
    const t = localStorage.getItem('hr_token') || sessionStorage.getItem('hr_token');
    if (!t) {
      router.replace('/login');
      return;
    }
    setToken(t);

    const r = localStorage.getItem('hr_role') || sessionStorage.getItem('hr_role') || 'EMPLOYEE';
    const uid = localStorage.getItem('hr_userId') || sessionStorage.getItem('hr_userId') || '';
    const name = localStorage.getItem('hr_name') || sessionStorage.getItem('hr_name') || 'User';
    
    setRole(r);
    setUserId(uid);
    setUserName(name);

    // Fetch own profile details if user id exists
    if (uid) {
      fetchData(`/employees/${uid}`, t)
        .then(u => {
          if (u) {
            setUserEmail(u.email || '');
            setUserTitle(u.jobTitle || 'Specialist');
            setUserDept(u.department?.name || 'Operations');
          }
        })
        .catch(() => {});
    }

    // Set active clock date/time timer
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Refresh Data when Active Tab changes
  useEffect(() => {
    if (!token) return;
    refreshDataForTab(activeTab);
  }, [activeTab, token]);

  // 3. Render and Re-render tab specific Charts
  useEffect(() => {
    if (!token) return;
    renderTabCharts();
    return () => {
      // Clean up charts
      Object.keys(chartInstances.current).forEach(key => {
        if (chartInstances.current[key]) {
          chartInstances.current[key].destroy();
        }
      });
      chartInstances.current = {};
    };
  }, [activeTab, employees, departments, attendance, payroll]);

  const updateClock = () => {
    const now = new Date();
    setClockTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setClockDate(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  };

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMsg('');
    }, 3000);
  };

  // Safe API Fetcher
  const fetchData = async (path, customToken = token) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
    const headers = { 'Content-Type': 'application/json' };
    const activeTok = customToken || token;
    if (activeTok) headers['Authorization'] = `Bearer ${activeTok}`;
    
    const res = await fetch(`${API_BASE}${path}`, { headers });
    if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
    return res.json();
  };

  const dispatchAction = async (path, method = 'POST', body = null) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
    return data;
  };

  const isHR = () => ['HR', 'ADMIN', 'MANAGER'].includes(role);

  const refreshDataForTab = async (tab) => {
    try {
      if (tab === 'dashboard') {
        if (isHR()) {
          const stats = await fetchData('/analytics');
          setAnalyticsData(stats);
          const emps = await fetchData('/employees');
          setEmployees(emps);
        } else {
          if (userId) {
            const att = await fetchData(`/attendance/employee/${userId}`);
            setAttendance(att);
            const lv = await fetchData(`/leave/employee/${userId}`);
            setLeaves(lv);
          }
        }
      } else if (tab === 'employees') {
        const emps = await fetchData('/employees');
        setEmployees(emps);
        const depts = await fetchData('/departments');
        setDepartments(depts);
      } else if (tab === 'departments') {
        const depts = await fetchData('/departments');
        setDepartments(depts);
        const emps = await fetchData('/employees');
        setEmployees(emps);
      } else if (tab === 'leave') {
        if (isHR()) {
          const lv = await fetchData('/leave');
          setLeaves(lv);
        } else if (userId) {
          const lv = await fetchData(`/leave/employee/${userId}`);
          setLeaves(lv);
        }
      } else if (tab === 'attendance') {
        if (isHR()) {
          const att = await fetchData('/attendance');
          setAttendance(att);
        } else if (userId) {
          const att = await fetchData(`/attendance/employee/${userId}`);
          setAttendance(att);
        }
      } else if (tab === 'analytics') {
        const stats = await fetchData('/analytics');
        setAnalyticsData(stats);
      } else if (tab === 'payroll') {
        if (userId) {
          const pr = await fetchData(`/payroll/employee/${userId}`);
          setPayroll(Array.isArray(pr) ? pr : pr ? [pr] : []);
        }
        if (isHR()) {
          const emps = await fetchData('/employees');
          setEmployees(emps);
        }
      } else if (tab === 'training') {
        const depts = await fetchData('/departments');
        setDepartments(depts);
      }
    } catch (err) {
      console.warn(`Error updating tab data ${tab}:`, err.message);
    }
  };

  const renderTabCharts = () => {
    // Destroy existing charts to rebuild
    Object.keys(chartInstances.current).forEach(key => {
      if (chartInstances.current[key]) {
        chartInstances.current[key].destroy();
        chartInstances.current[key] = null;
      }
    });

    if (activeTab === 'dashboard') {
      if (isHR() && analyticsData) {
        // HR Attendance Trend
        const attCtx = hrAttChartRef.current;
        if (attCtx) {
          chartInstances.current.hrAtt = new Chart(attCtx, {
            type: 'line',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              datasets: [{
                label: 'Attendance Rate',
                data: [95, 88, 92, 87, 94],
                borderColor: '#4F6EF5',
                backgroundColor: 'rgba(79,110,245,.08)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
              }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
          });
        }
        // HR Dept Headcount
        const deptCtx = hrDeptChartRef.current;
        if (deptCtx) {
          const deptCount = {};
          employees.forEach(e => {
            const name = e.department?.name || 'Other';
            deptCount[name] = (deptCount[name] || 0) + 1;
          });
          const labels = Object.keys(deptCount).length ? Object.keys(deptCount) : ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
          const data = Object.keys(deptCount).length ? Object.values(deptCount) : [12, 8, 5, 3, 4];
          chartInstances.current.hrDept = new Chart(deptCtx, {
            type: 'bar',
            data: {
              labels,
              datasets: [{
                data,
                backgroundColor: '#7C3AED',
                borderRadius: 5
              }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
          });
        }
      } else {
        // Employee Attendance Chart
        const empAttCtx = empAttChartRef.current;
        if (empAttCtx) {
          chartInstances.current.empAtt = new Chart(empAttCtx, {
            type: 'bar',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              datasets: [{
                data: [8.2, 8.5, 7.8, 8.0, 8.3],
                backgroundColor: '#4F6EF5',
                borderRadius: 4
              }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
          });
        }
      }
    } else if (activeTab === 'departments') {
      const deptCtx = deptOverviewChartRef.current;
      if (deptCtx) {
        const labels = departments.map(d => d.name);
        const data = departments.map(d => {
          return employees.filter(e => e.departmentId === d.id).length || Math.floor(Math.random() * 8) + 2;
        });
        chartInstances.current.deptOverview = new Chart(deptCtx, {
          type: 'bar',
          data: {
            labels: labels.length ? labels : ['Engineering', 'Sales', 'Marketing', 'HR'],
            datasets: [{
              data: data.length ? data : [14, 8, 6, 3],
              backgroundColor: '#4F6EF5',
              borderRadius: 6
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
    } else if (activeTab === 'analytics') {
      const attCtx = analyticsAttChartRef.current;
      if (attCtx) {
        chartInstances.current.analyticsAtt = new Chart(attCtx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            datasets: [{
              data: [92, 88, 95, 87, 91],
              borderColor: '#4F6EF5',
              backgroundColor: 'rgba(79,110,245,.05)',
              fill: true,
              tension: 0.4
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
      const perfCtx = analyticsPerfChartRef.current;
      if (perfCtx) {
        chartInstances.current.analyticsPerf = new Chart(perfCtx, {
          type: 'bar',
          data: {
            labels: ['4.5-5.0', '4.0-4.5', '3.5-4.0', '3.0-3.5', '<3.0'],
            datasets: [{
              data: [15, 28, 12, 5, 2],
              backgroundColor: ['#22c55e', '#4F6EF5', '#3b82f6', '#f59e0b', '#ef4444'],
              borderRadius: 5
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
      const headCtx = analyticsHeadChartRef.current;
      if (headCtx) {
        chartInstances.current.analyticsHead = new Chart(headCtx, {
          type: 'bar',
          data: {
            labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
            datasets: [{
              data: [45, 32, 28, 12, 18],
              backgroundColor: 'rgba(124, 58, 237, 0.85)',
              borderRadius: 5
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
    } else if (activeTab === 'payroll') {
      const salCtx = salaryTrendsChartRef.current;
      if (salCtx) {
        chartInstances.current.salaryTrends = new Chart(salCtx, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              data: [8100, 8250, 8300, 8500, 8600, 8850],
              borderColor: '#4F6EF5',
              backgroundColor: 'rgba(79,110,245,.06)',
              fill: true,
              tension: 0.4
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
    } else if (activeTab === 'training') {
      const trainCtx = trainingChartRef.current;
      if (trainCtx) {
        chartInstances.current.training = new Chart(trainCtx, {
          type: 'bar',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [{
              data: [12, 18, 22, 28, 24],
              backgroundColor: '#4F6EF5',
              borderRadius: 5
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
    }
  };

  const handleLogout = () => {
    ['hr_token', 'hr_role', 'hr_userId', 'hr_name', 'hr_user'].forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    router.replace('/login');
  };

  const toggleModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: !prev[modalName] }));
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email || !newEmp.username || !newEmp.password || !newEmp.jobTitle) {
      return showToast('Please enter all required fields', 'error');
    }
    try {
      const body = {
        fullName: newEmp.name,
        email: newEmp.email,
        username: newEmp.username,
        password: newEmp.password,
        jobTitle: newEmp.jobTitle,
        role: newEmp.role,
        gender: newEmp.gender,
      };
      if (newEmp.deptId) body.departmentId = parseInt(newEmp.deptId);
      
      await dispatchAction('/employees', 'POST', body);
      toggleModal('employee');
      showToast('Employee successfully added!');
      refreshDataForTab('employees');
      setNewEmp({ name: '', email: '', username: '', password: '', jobTitle: '', role: 'EMPLOYEE', gender: 'MALE', deptId: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      await dispatchAction(`/employees/${id}`, 'DELETE');
      showToast('Employee removed successfully');
      refreshDataForTab('employees');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!newDept.name) return showToast('Please enter a department name', 'error');
    try {
      await dispatchAction('/departments', 'POST', { name: newDept.name });
      toggleModal('department');
      showToast('Department successfully created!');
      refreshDataForTab('departments');
      setNewDept({ name: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    if (!newLeave.start || !newLeave.end || !newLeave.reason) {
      return showToast('Please enter all required dates and details', 'error');
    }
    try {
      await dispatchAction('/leave', 'POST', {
        leaveType: newLeave.type,
        startDate: new Date(newLeave.start).toISOString(),
        endDate: new Date(newLeave.end).toISOString(),
        reason: newLeave.reason,
      });
      toggleModal('leave');
      showToast('Leave request submitted!');
      refreshDataForTab('leave');
      setNewLeave({ type: 'Annual Leave', start: '', end: '', reason: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReviewLeave = async (id, status) => {
    try {
      await dispatchAction(`/leave/${id}/review`, 'PATCH', { status });
      showToast(`Leave request ${status.toLowerCase()}!`);
      refreshDataForTab('leave');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClockToggle = async () => {
    try {
      if (!clockedIn) {
        await dispatchAction('/attendance/check-in', 'POST');
        setClockedIn(true);
        showToast('Successfully clocked in!', 'success');
      } else {
        await dispatchAction('/attendance/check-out', 'POST');
        setClockedIn(false);
        showToast('Successfully clocked out!', 'success');
      }
      refreshDataForTab('attendance');
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  const handleAddPayroll = async (e) => {
    e.preventDefault();
    if (!newPayroll.empId || !newPayroll.base || !newPayroll.period) {
      return showToast('Complete all fields', 'error');
    }
    try {
      await dispatchAction('/payroll', 'POST', {
        employeeId: parseInt(newPayroll.empId),
        baseSalary: parseFloat(newPayroll.base),
        payPeriod: newPayroll.period,
      });
      toggleModal('payroll');
      showToast('Payroll added successfully!');
      refreshDataForTab('payroll');
      setNewPayroll({ empId: '', base: '8500', period: 'May 2026' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code || !newCourse.start || !newCourse.end || !newCourse.deptId) {
      return showToast('Fill all required fields', 'error');
    }
    try {
      await dispatchAction('/training', 'POST', {
        courseName: newCourse.name,
        courseCode: newCourse.code,
        startDate: new Date(newCourse.start).toISOString(),
        endDate: new Date(newCourse.end).toISOString(),
        departmentId: parseInt(newCourse.deptId)
      });
      toggleModal('course');
      showToast('Training course added successfully!');
      refreshDataForTab('training');
      setNewCourse({ name: '', code: '', start: '', end: '', deptId: '' });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSubmitSelfAssessment = (e) => {
    e.preventDefault();
    if (!achievements) return showToast('Please enter achievements', 'error');
    showToast('Assessment submitted successfully!');
    setAchievements('');
    setImprovements('');
    setComments('');
    setRatings({
      'Communication Skills': 0,
      'Team Collaboration': 0,
      'Problem Solving': 0,
      'Time Management': 0,
      'Technical Expertise': 0,
      'Leadership': 0,
    });
  };

  const handleGenerateAiAnalysis = async (useFallback = false) => {
    setAiLoading(true);
    showToast('Analyzing workforce spreadsheet data...', 'info');

    try {
      const res = await dispatchAction('/analytics/ai', 'POST', { useFallback });
      setAiChartData(res.data);
      localStorage.setItem('gemini_ai_chart_data', JSON.stringify(res.data));
      if (!res.apiKeyConfigured && !useFallback) {
        showToast('Gemini key not set in backend .env. Loaded demo report.', 'warning');
      } else {
        showToast('AI analysis completed successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error occurred during AI generation.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const initials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const avatarColor = (name) => {
    const colors = ['#4F6EF5', '#7C3AED', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = hash * 31 + (name || '').charCodeAt(i);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMoney = (val) => '$' + Number(val || 0).toLocaleString();

  // Navigation Items according to Role
  const navItems = isHR() ? [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z' },
    { id: 'employees', label: 'Employees', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0-8 0 4 4 0 0 0 8 0z' },
    { id: 'attendance', label: 'Attendance', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-15v5l3 3' },
    { id: 'departments', label: 'Departments', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10' },
    { id: 'leave', label: 'Leave Requests', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z' },
    { id: 'selfassessment', label: 'Self-Assessment', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9z' },
    { id: 'analytics', label: 'Analytics', icon: 'M18 20V10m-6 10V4M6 20v-6' },
    { id: 'payroll', label: 'Payroll', icon: 'M3 10h18M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' },
    { id: 'training', label: 'Training', icon: 'M22 10v6M2 10l10-5 10 5-10 5zm4 2v5c3 3 9 3 12 0v-5' },
    { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' }
  ] : [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14h7v7H3z' },
    { id: 'attendance', label: 'Attendance', icon: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-15v5l3 3' },
    { id: 'leave', label: 'Leave Requests', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z' },
    { id: 'selfassessment', label: 'Self-Assessment', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9z' },
    { id: 'payroll', label: 'Payroll', icon: 'M3 10h18M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z' },
    { id: 'training', label: 'Training', icon: 'M22 10v6M2 10l10-5 10 5-10 5zm4 2v5c3 3 9 3 12 0v-5' },
    { id: 'profile', label: 'Profile', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m12-10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' }
  ];

  return (
    <>
      <style>{`
        /* Sidebar and structural CSS variables */
        :root {
          --sidebar-w: 220px;
          --topbar-h: 64px;
        }

        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--light);
        }

        /* Sidebar Styling */
        .sidebar {
          width: var(--sidebar-w);
          background-color: #ffffff;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; bottom: 0; left: 0;
          z-index: 50;
          transition: transform 0.25s ease-in-out;
        }
        
        .sidebar-logo {
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sidebar-logo svg {
          width: 32px; height: 32px;
        }
        .sidebar-logo span {
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--dark);
        }
        
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0.75rem;
          overflow-y: auto;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.6rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--gray);
          font-size: 0.84rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 0.15rem;
          user-select: none;
        }
        .nav-item:hover {
          background-color: #f3f4f6;
          color: var(--dark);
        }
        .nav-item.active {
          background-color: var(--primary);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(79, 110, 245, 0.35);
        }

        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid var(--border);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.4rem 0.5rem;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: #ffffff;
        }
        .avatar.xl { width: 68px; height: 68px; font-size: 1.3rem; }
        .avatar.md { width: 38px; height: 38px; font-size: 0.82rem; }
        
        .user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-info .name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--dark);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-info .role-badge {
          font-size: 0.68rem;
          color: var(--gray);
        }
        .logout-btn {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.5rem;
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #ffe4e6;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: #ffe4e6; }

        /* Topbar Styling */
        .topbar {
          position: fixed;
          left: var(--sidebar-w);
          right: 0; top: 0;
          height: var(--topbar-h);
          background-color: #ffffff;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          z-index: 40;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .page-title {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--dark);
        }
        
        /* Main Body Frame */
        .main-frame {
          flex: 1;
          margin-left: var(--sidebar-w);
          margin-top: var(--topbar-h);
          padding: 1.75rem;
          min-height: calc(100vh - var(--topbar-h));
          overflow-x: hidden;
        }

        /* Widgets, Cards, Modals */
        .card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.4rem 1.5rem;
          box-shadow: var(--shadow);
          margin-bottom: 1.25rem;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.2rem;
        }
        .card-title {
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--dark);
        }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
        .grid-2-3 { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }

        .stat-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem 1.5rem;
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
        }
        .stat-icon {
          width: 38px; height: 38px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          margin-bottom: 0.6rem;
        }
        .stat-icon.purple { background: #EEF2FF; color: var(--primary); }
        .stat-icon.blue { background: #DBEAFE; color: #2563EB; }
        .stat-icon.green { background: #DCFCE7; color: #16A34A; }
        .stat-icon.orange { background: #FEF3C7; color: #D97706; }
        .stat-icon.red { background: #FFE4E6; color: #e11d48; }
        .stat-num { font-size: 1.8rem; font-weight: 800; color: var(--dark); line-height: 1.1; letter-spacing: -0.5px; }
        .stat-label { font-size: 0.76rem; color: var(--gray); font-weight: 500; margin-top: 0.2rem; }

        .table-wrap { overflow-x: auto; width: 100%; }
        table { width: 100%; border-collapse: collapse; font-size: 0.875rem; text-align: left; }
        thead th { padding: 0.75rem 1rem; font-size: 0.72rem; font-weight: 700; color: var(--gray); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--light); }
        tbody td { padding: 0.875rem 1rem; border-bottom: 1px solid var(--border); color: var(--dark); }
        tbody tr:hover { background-color: var(--light); }

        .badge { display: inline-flex; align-items: center; padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
        .badge.green { background: #dcfce7; color: #16a34a; }
        .badge.yellow { background: #fef9c3; color: #ca8a04; }
        .badge.red { background: #fee2e2; color: #dc2626; }
        .badge.blue { background: #dbeafe; color: #2563eb; }
        .badge.purple { background: var(--primary-light); color: var(--primary); }

        .btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.1rem; border-radius: var(--radius-sm); font-size: 0.85rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-primary { background: var(--primary); color: #ffffff; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-success { background: var(--success); color: #ffffff; }
        .btn-danger { background: var(--danger); color: #ffffff; }
        .btn-ghost { background: transparent; border: 1.5px solid var(--border); color: var(--dark); }
        .btn-ghost:hover { border-color: var(--primary); color: var(--primary); }
        .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }

        /* Modal Overlays */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(3px);
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal {
          background: #ffffff;
          border-radius: var(--radius);
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .modal-title { font-weight: 700; font-size: 1rem; }
        .modal-close { border: none; background: transparent; font-size: 1.1rem; cursor: pointer; }
        .modal-body { padding: 1.5rem; }
        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 0.75rem; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { margin-bottom: 1rem; }
        .form-group label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--dark); margin-bottom: 0.4rem; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; padding: 0.65rem 0.9rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: 0.875rem; background: #fff; color: var(--dark);
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
        .form-group textarea { resize: vertical; min-height: 80px; }

        /* Attendance Clock Component */
        .clock-card {
          background: linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%);
          border-radius: var(--radius);
          padding: 2rem;
          text-align: center;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(79, 110, 245, 0.3);
        }
        .clock-time { font-size: 3rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 0.25rem; }
        .clock-date { font-size: 0.9rem; opacity: 0.8; margin-bottom: 1.25rem; }
        .clock-status { font-size: 0.85rem; opacity: 0.9; margin-bottom: 1.25rem; font-weight: 500; }
        .clock-btn { background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.5); color: #ffffff; padding: 0.75rem 2rem; border-radius: var(--radius-sm); font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .clock-btn:hover { background: rgba(255, 255, 255, 0.3); }

        /* Training active courses styling */
        .course-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .course-card { background: #ffffff; border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem; box-shadow: var(--shadow); }
        .course-card .course-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.3rem; }
        .course-card .course-by { font-size: 0.75rem; color: var(--gray); margin-bottom: 0.85rem; }
        .course-card .course-footer { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray); margin-top: 0.85rem; }

        .progress-bar { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; margin-top: 0.35rem; }
        .progress-fill { height: 100%; background-color: var(--primary); transition: width 0.35s ease; }

        .rating-group { margin-bottom: 1rem; }
        .star-rating { display: flex; gap: 0.3rem; }
        .star-rating span { font-size: 1.3rem; cursor: pointer; color: #d1d5db; transition: transform 0.1s; }
        .star-rating span.active { color: #f59e0b; }

        /* Toast notifications styling */
        .toast {
          position: fixed;
          bottom: 1.5rem; right: 1.5rem;
          background: var(--dark2); color: #ffffff;
          padding: 0.8rem 1.25rem; border-radius: var(--radius-sm);
          font-size: 0.85rem; font-weight: 500;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          z-index: 999;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .toast.success { background-color: #16a34a; }
        .toast.error { background-color: #dc2626; }

        /* Upcoming Leaves List styles */
        .upcoming-leave-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem;
          border-radius: var(--radius-sm);
          background-color: var(--light);
          margin-bottom: 0.5rem;
        }
        .upcoming-leave-item .dates { font-size: 0.75rem; color: var(--gray); }
        .upcoming-leave-item .type { font-size: 0.8rem; font-weight: 600; }

        .profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }

        /* Responsive */
        @media(max-width: 900px) {
          .sidebar { transform: translateX(${mobileMenuOpen ? '0' : '-100%'}); }
          .topbar { left: 0; }
          .main-frame { margin-left: 0; }
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2, .grid-2-3 { grid-template-columns: 1fr; }
          .course-grid { grid-template-columns: 1fr 1fr; }
        }
        @media(max-width: 600px) {
          .grid-4, .grid-3 { grid-template-columns: 1fr; }
          .course-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* TOAST SYSTEM */}
      {toastMsg && (
        <div className={`toast ${toastType}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="dashboard-layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="7.5" strokeLinecap="round">
              <path d="M78 20 A41 41 0 1 0 78 80" />
              <path d="M67 31 A26 26 0 1 0 67 69" />
              <line x1="44" y1="38" x2="84" y2="38" />
              <line x1="44" y1="50" x2="78" y2="50" />
              <line x1="44" y1="62" x2="71" y2="62" />
              <circle cx="78" cy="20" r="5" fill="#4F6EF5" stroke="none" />
              <circle cx="78" cy="80" r="5" fill="#4F6EF5" stroke="none" />
            </svg>
            <span>Finprint</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <div
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <div className="avatar" style={{ background: avatarColor(userName) }}>
                {initials(userName)}
              </div>
              <div className="user-info">
                <div className="name">{userName}</div>
                <div className="role-badge">{role}</div>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-sm" style={{ display: 'none' }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
            <span className="page-title">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--gray)', fontWeight: '600' }}>
              Welcome back, <strong style={{ color: 'var(--dark)' }}>{userName}</strong>
            </span>
            <div className="avatar md" style={{ background: avatarColor(userName) }}>
              {initials(userName)}
            </div>
          </div>
        </header>

        {/* MAIN BODY FRAME */}
        <main className="main-frame">
          
          {/* ==================== 1. DASHBOARD OVERVIEW ==================== */}
          {activeTab === 'dashboard' && (
            <div>
              {isHR() ? (
                // HR Overview
                <div>
                  <div className="grid-4">
                    <div className="stat-card">
                      <div className="stat-icon blue">📅</div>
                      <div className="stat-num">{analyticsData?.contractEndsNextMonth ?? 8}</div>
                      <div className="stat-label">Contract Ends Next Month</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon green">📈</div>
                      <div className="stat-num">{analyticsData?.attendanceRate ?? 92}%</div>
                      <div className="stat-label">Attendance Rate</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon purple">✓</div>
                      <div className="stat-num">{analyticsData?.presentToday ?? 217}</div>
                      <div className="stat-label">Present Today</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon orange">✗</div>
                      <div className="stat-num">{analyticsData?.absentToday ?? 18}</div>
                      <div className="stat-label">Absence Today</div>
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="card">
                      <div className="card-header"><span className="card-title">Employees by Department</span></div>
                      <canvas ref={hrDeptChartRef} height="150"></canvas>
                    </div>
                    <div className="card">
                      <div className="card-header"><span className="card-title">Attendance Trend</span></div>
                      <canvas ref={hrAttChartRef} height="150"></canvas>
                    </div>
                  </div>
                </div>
              ) : (
                // Employee Overview
                <div>
                  <div className="grid-4">
                    <div className="stat-card">
                      <div className="stat-icon blue">🏢</div>
                      <div className="stat-num">{userDept}</div>
                      <div className="stat-label">Department</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon green">📈</div>
                      <div className="stat-num">95%</div>
                      <div className="stat-label">My Attendance</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon orange">🕒</div>
                      <div className="stat-num">{leaves.filter(l => l.status === 'PENDING').length}</div>
                      <div className="stat-label">Pending Leaves</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon purple">📅</div>
                      <div className="stat-num">14 Days</div>
                      <div className="stat-label">Leave Balance Available</div>
                    </div>
                  </div>
                  <div className="grid-2-3">
                    <div className="card">
                      <div className="card-header"><span className="card-title">My Weekly Shift Hours</span></div>
                      <canvas ref={empAttChartRef} height="140"></canvas>
                    </div>
                    <div className="card">
                      <span className="card-title" style={{ display: 'block', marginBottom: '1rem' }}>Quick Shortcuts</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <button className="btn btn-primary" onClick={() => setActiveTab('leave')}>📅 Submit Leave</button>
                        <button className="btn btn-ghost" onClick={() => setActiveTab('payroll')}>💰 Payroll</button>
                        <button className="btn btn-ghost" onClick={() => setActiveTab('attendance')}>🕐 Attendance</button>
                        <button className="btn btn-ghost" onClick={() => setActiveTab('training')}>🎓 Training</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 2. EMPLOYEES ==================== */}
          {activeTab === 'employees' && (
            <div>
              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    style={{ padding: '0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                  />
                  <select
                    style={{ padding: '0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    value={empDeptFilter}
                    onChange={(e) => setEmpDeptFilter(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <select
                    style={{ padding: '0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    value={empRoleFilter}
                    onChange={(e) => setEmpRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => toggleModal('employee')}>+ Add Employee</button>
              </div>

              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Role</th>
                        <th>Job Title</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees
                        .filter(e => {
                          const name = (e.fullName || '').toLowerCase();
                          const email = (e.email || '').toLowerCase();
                          const searchMatch = !empSearch || name.includes(empSearch.toLowerCase()) || email.includes(empSearch.toLowerCase());
                          const deptMatch = !empDeptFilter || e.department?.name === empDeptFilter;
                          const roleMatch = !empRoleFilter || e.role === empRoleFilter;
                          return searchMatch && deptMatch && roleMatch;
                        })
                        .map(e => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                <div className="avatar sm" style={{ background: avatarColor(e.fullName) }}>{initials(e.fullName)}</div>
                                <div>
                                  <div style={{ fontWeight: '600' }}>{e.fullName}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>{e.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>{e.department?.name || '—'}</td>
                            <td><span className="badge purple">{e.role}</span></td>
                            <td>{e.jobTitle || 'Staff'}</td>
                            <td>
                              <button className="btn btn-ghost btn-sm" style={{ marginRight: '6px' }} onClick={() => showToast(`Selected profile: ${e.fullName}`)}>View</button>
                              {role === 'ADMIN' && (
                                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEmployee(e.id)}>Delete</button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. ATTENDANCE ==================== */}
          {activeTab === 'attendance' && (
            <div>
              <div className="grid-2-3" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="clock-card" style={{ marginBottom: '1rem' }}>
                    <div className="clock-time">{clockTime}</div>
                    <div className="clock-date">{clockDate}</div>
                    <div className="clock-status">{clockedIn ? 'Status: Check-In Active' : 'Status: Clocked Out'}</div>
                    <button className="clock-btn" onClick={handleClockToggle}>{clockedIn ? 'Clock Out' : 'Clock In'}</button>
                  </div>
                  <div className="card">
                    <span className="card-title" style={{ display: 'block', marginBottom: '0.75rem' }}>This Week Stats</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>40h</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Hours</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--success)' }}>5</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Present</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--danger)' }}>0</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Absences</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header"><span className="card-title">Shift Tracker Logs</span></div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          {isHR() && <th>Employee</th>}
                          <th>Date</th>
                          <th>Clock In</th>
                          <th>Clock Out</th>
                          <th>Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendance.slice(0, 10).map(r => {
                          const name = r.employee?.fullName || 'Self';
                          const inT = r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                          const outT = r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';
                          const hours = r.checkIn && r.checkOut ? ((new Date(r.checkOut) - new Date(r.checkIn)) / 3600000).toFixed(1) + 'h' : '—';
                          return (
                            <tr key={r.id}>
                              {isHR() && (
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="avatar sm" style={{ background: avatarColor(name) }}>{initials(name)}</div>
                                    <span style={{ fontWeight: '600' }}>{name}</span>
                                  </div>
                                </td>
                              )}
                              <td>{formatDate(r.date || r.createdAt)}</td>
                              <td>{inT}</td>
                              <td>{outT}</td>
                              <td>{hours}</td>
                            </tr>
                          );
                        })}
                        {attendance.length === 0 && (
                          <tr>
                            <td colSpan={isHR() ? 5 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No logs loaded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. DEPARTMENTS ==================== */}
          {activeTab === 'departments' && (
            <div>
              <div className="card" style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem' }}>
                <button className="btn btn-primary" onClick={() => toggleModal('department')}>+ Add Department</button>
              </div>

              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                {departments.map((d, index) => {
                  const empCount = employees.filter(e => e.departmentId === d.id).length;
                  return (
                    <div key={d.id} className="course-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontWeight: '800', fontSize: '1rem' }}>{d.name}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--gray)' }}>Active Staff:</span>
                        <strong style={{ color: 'var(--dark)' }}>{empCount}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--gray)' }}>Supervisor:</span>
                        <strong style={{ color: 'var(--primary)' }}>{d.manager?.fullName || 'General HR'}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.5rem' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} className="avatar sm" style={{ background: avatarColor(d.name + i), fontSize: '0.6rem' }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title">Department Employee Spread</span></div>
                <canvas ref={deptOverviewChartRef} height="100"></canvas>
              </div>
            </div>
          )}

          {/* ==================== 5. LEAVE REQUESTS ==================== */}
          {activeTab === 'leave' && (
            <div>
              <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                <div className="leave-balance-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase' }}>Annual Leave</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)', margin: '0.25rem 0' }}>12 Days</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>Days Remaining Available</div>
                </div>
                <div className="leave-balance-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase' }}>Sick Leave</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', margin: '0.25rem 0' }}>8 Days</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>Days Remaining Available</div>
                </div>
                <div className="leave-balance-card" style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--gray)', textTransform: 'uppercase' }}>Casual Leave</div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)', margin: '0.25rem 0' }}>5 Days</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--gray)' }}>Days Remaining Available</div>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search leave requests..."
                    style={{ padding: '0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    value={leaveSearch}
                    onChange={(e) => setLeaveSearch(e.target.value)}
                  />
                  <select
                    style={{ padding: '0.5rem', border: '1.5px solid var(--border)', borderRadius: '6px' }}
                    value={leaveStatusFilter}
                    onChange={(e) => setLeaveStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={() => toggleModal('leave')}>+ Request Leave</button>
              </div>

              <div className="card">
                <span className="card-title" style={{ display: 'block', marginBottom: '1rem' }}>Requests History Log</span>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {isHR() && <th>Employee</th>}
                        <th>Type</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                        {isHR() && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {leaves
                        .filter(l => {
                          const name = (l.employee?.fullName || '').toLowerCase();
                          const type = (l.leaveType || '').toLowerCase();
                          const matchesSearch = !leaveSearch || name.includes(leaveSearch.toLowerCase()) || type.includes(leaveSearch.toLowerCase());
                          const matchesStatus = !leaveStatusFilter || l.status === leaveStatusFilter;
                          return matchesSearch && matchesStatus;
                        })
                        .map(l => {
                          const name = l.employee?.fullName || userName;
                          const start = formatDate(l.startDate);
                          const end = formatDate(l.endDate);
                          const stClass = { APPROVED: 'green', PENDING: 'yellow', REJECTED: 'red' }[l.status] || 'gray';
                          return (
                            <tr key={l.id}>
                              {isHR() && (
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div className="avatar sm" style={{ background: avatarColor(name) }}>{initials(name)}</div>
                                    <span style={{ fontWeight: '600' }}>{name}</span>
                                  </div>
                                </td>
                              )}
                              <td>{l.leaveType || 'Leave'}</td>
                              <td>{start} – {end}</td>
                              <td>{l.reason || '—'}</td>
                              <td><span className={`badge ${stClass}`}>{l.status}</span></td>
                              {isHR() && (
                                <td>
                                  {l.status === 'PENDING' ? (
                                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                                      <button className="btn btn-success btn-sm" onClick={() => handleReviewLeave(l.id, 'APPROVED')}>✓</button>
                                      <button className="btn btn-danger btn-sm" onClick={() => handleReviewLeave(l.id, 'REJECTED')}>✕</button>
                                    </div>
                                  ) : '—'}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      {leaves.length === 0 && (
                        <tr>
                          <td colSpan={isHR() ? 6 : 4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray)' }}>No leave records loaded</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. SELF-ASSESSMENT ==================== */}
          {activeTab === 'selfassessment' && (
            <div>
              {isHR() ? (
                // HR Review List
                <div>
                  <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                    <div className="stat-card">
                      <div className="stat-num">47</div>
                      <div className="stat-label">Total Submissions</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-num" style={{ color: 'var(--warning)' }}>12</div>
                      <div className="stat-label">Pending Review</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-num" style={{ color: 'var(--success)' }}>35</div>
                      <div className="stat-label">Reviewed Completed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-num">4.2★</div>
                      <div className="stat-label">Performance Average</div>
                    </div>
                  </div>

                  <div className="card">
                    <span className="card-title" style={{ display: 'block', marginBottom: '1rem' }}>Employee Submissions</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700' }}>Mona Fathy</span>
                          <span className="badge green">Reviewed</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Sales Department • Score: 4.8★</div>
                        <p style={{ fontSize: '0.85rem' }}><strong>Achievements:</strong> Exceeded quarterly sales targets by 35% and onboarded 4 new strategic client relationships.</p>
                      </div>
                      <div style={{ border: '1.5px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '700' }}>Ahmed Hany</span>
                          <span className="badge yellow">Pending Review</span>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Engineering Department • Score: 4.2★</div>
                        <p style={{ fontSize: '0.85rem' }}><strong>Achievements:</strong> Designed full microservice deployment automation setup using Prisma and PostgreSQL.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Employee Form
                <div className="card">
                  <span className="card-title" style={{ display: 'block', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Q2 Workforce Self-Assessment Form</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>Reflect on your performance, ratings, achievements, and core targets below.</p>
                  
                  <form onSubmit={handleSubmitSelfAssessment}>
                    <div className="grid-2">
                      {Object.keys(ratings).map(skill => (
                        <div key={skill} className="rating-group">
                          <label style={{ fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>{skill}</label>
                          <div className="star-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span
                                key={star}
                                className={ratings[skill] >= star ? 'active' : ''}
                                onClick={() => setRatings(prev => ({ ...prev, [skill]: star }))}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                      <label>Key Accomplishments</label>
                      <textarea
                        placeholder="List your key highlights, outputs, and deliveries this quarter..."
                        value={achievements}
                        onChange={(e) => setAchievements(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Growth Opportunities</label>
                      <textarea
                        placeholder="List technical or soft skills you look forward to developing..."
                        value={improvements}
                        onChange={(e) => setImprovements(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>General Feedback</label>
                      <textarea
                        placeholder="Any additional suggestions or inquiries..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button type="submit" className="btn btn-primary">✅ Submit Assessment</button>
                      <button type="button" className="btn btn-ghost" onClick={() => showToast('Draft saved successfully!')}>💾 Save Draft</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ==================== 7. ANALYTICS ==================== */}
          {activeTab === 'analytics' && (
            <div>
              {/* Stats Grid */}
              <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>{employees.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Active Headcount</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>91.4%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Average Attendance Rate</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--warning)' }}>{departments.length}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Active Departments</div>
                </div>
              </div>

              {/* API Configuration & Execution Panel */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                padding: '2.5rem',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(79,110,245,0.02) 0%, rgba(124,58,237,0.02) 100%)',
                border: '1.5px dashed rgba(79, 110, 245, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>🧠</div>
                <span style={{ fontWeight: '800', fontSize: '1.25rem', color: 'var(--dark)' }}>Secure AI Workforce Intelligence</span>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray)', maxWidth: '480px', margin: '0.4rem 0 1.5rem' }}>
                  Analyze active spreadsheet records, calculate retention models, and forecast department capacities using your secure backend Gemini API key.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    className={`btn btn-primary ${aiLoading ? 'loading' : ''}`}
                    disabled={aiLoading}
                    onClick={() => handleGenerateAiAnalysis(false)}
                    style={{
                      background: 'linear-gradient(135deg, #4F6EF5 0%, #7C3AED 100%)',
                      border: 'none',
                      boxShadow: '0 4px 15px rgba(79, 110, 245, 0.25)',
                      padding: '0.65rem 1.5rem',
                      fontWeight: '600'
                    }}
                  >
                    {aiLoading ? '✨ Analyzing Matrix...' : '🚀 Initialize AI Analysis'}
                  </button>
                  
                  <button
                    className="btn btn-ghost"
                    disabled={aiLoading}
                    onClick={() => handleGenerateAiAnalysis(true)}
                    style={{ padding: '0.65rem 1.5rem' }}
                  >
                    💡 Load Demo Report
                  </button>
                </div>
              </div>

              {/* AI Analysis Output Container */}
              {(aiLoading || aiChartData) && (
                <div className="card" style={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '2rem',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.02)',
                  animation: 'fadeIn 0.5s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>✨</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--dark)' }}>Dynamic HR Intelligence Audit Graph</strong>
                    </div>
                  </div>

                  {aiLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                      <div className="logo-icon" style={{ width: '60px', height: '60px', margin: '0 auto 1rem', animation: 'spin 2s linear infinite' }}>
                        <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="8">
                          <circle cx="50" cy="50" r="40" strokeDasharray="180 60" />
                        </svg>
                      </div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--primary)' }}>Analyzing Spreadsheet Matrices...</strong>
                      <span style={{ fontSize: '0.82rem', color: 'var(--gray)' }}>Retrieving departments, attendance logs, and evaluating training outcomes</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ position: 'relative', height: '350px', width: '100%', marginBottom: '1.5rem' }}>
                        <canvas ref={aiAnalyticsChartRef}></canvas>
                      </div>
                      
                      {aiChartData?.finding && (
                        <div style={{
                          background: 'rgba(79, 110, 245, 0.04)',
                          borderLeft: '4px solid var(--primary)',
                          borderRadius: '8px',
                          padding: '1rem 1.25rem',
                          fontSize: '0.88rem',
                          color: 'var(--dark)',
                          fontWeight: '600'
                        }}>
                          💡 AI Key Finding: <span style={{ fontWeight: '400', color: 'var(--gray)' }}>{aiChartData.finding}</span>
                        </div>
                      )}

                      {aiChartData?.turnoverPredictions && aiChartData.turnoverPredictions.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>⚠️</span> High-Risk Employee Turnover Forecast (AI-Predicted)
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                            {aiChartData.turnoverPredictions.map((pred, idx) => (
                              <div key={idx} style={{
                                background: '#fff',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                borderRadius: '12px',
                                padding: '1rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.01)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <strong style={{ fontSize: '0.9rem', color: 'var(--dark)' }}>{pred.name}</strong>
                                  <span style={{
                                    fontSize: '0.72rem',
                                    fontWeight: '700',
                                    color: '#ef4444',
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    borderRadius: '20px',
                                    padding: '0.2rem 0.6rem'
                                  }}>{pred.riskScore}% Risk</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                  <span style={{ color: 'var(--gray)' }}>Department: {pred.department}</span>
                                  {pred.satisfactionScore && (
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>😊 {pred.satisfactionScore}% Satisfied</span>
                                  )}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', lineHeight: '1.4' }}>💡 {pred.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ==================== 8. PAYROLL ==================== */}
          {activeTab === 'payroll' && (
            <div>
              <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="stat-card">
                  <div className="stat-label">Base Salary</div>
                  <div className="stat-num">{formatMoney(8500)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Performance Bonus</div>
                  <div className="stat-num" style={{ color: 'var(--success)' }}>{formatMoney(1200)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Standard Deductions</div>
                  <div className="stat-num" style={{ color: 'var(--danger)' }}>{formatMoney(850)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Net Payout</div>
                  <div className="stat-num" style={{ color: 'var(--primary)' }}>{formatMoney(8850)}</div>
                </div>
              </div>

              <div className="grid-2-3" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-header"><span className="card-title">Earnings Trend</span></div>
                  <canvas ref={salaryTrendsChartRef} height="140"></canvas>
                </div>
                <div className="card">
                  <span className="card-title" style={{ display: 'block', marginBottom: '0.75rem' }}>Payout Breakdown</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Regular Base Salary</span>
                      <strong style={{ fontSize: '0.88rem' }}>{formatMoney(8500)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Incentives & Bonuses</span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--success)' }}>{formatMoney(1200)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Monthly Allowances</span>
                      <strong style={{ fontSize: '0.88rem' }}>{formatMoney(500)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.35rem 0' }}>
                      <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>Tax / Health Insurance</span>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--danger)' }}>-{formatMoney(850)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>Total Net Paid</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{formatMoney(8850)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {isHR() && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Employee Salary Configurations</span>
                    <button className="btn btn-primary btn-sm" onClick={() => toggleModal('payroll')}>+ Create Payroll Entry</button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Department</th>
                          <th>Base Salary</th>
                          <th>Bonus</th>
                          <th>Net Paid</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.slice(0, 5).map(e => (
                          <tr key={e.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div className="avatar sm" style={{ background: avatarColor(e.fullName) }}>{initials(e.fullName)}</div>
                                <span style={{ fontWeight: '600' }}>{e.fullName}</span>
                              </div>
                            </td>
                            <td>{e.department?.name || '—'}</td>
                            <td>{formatMoney(8500)}</td>
                            <td>{formatMoney(1200)}</td>
                            <td>{formatMoney(8850)}</td>
                            <td><span className="badge green">Processed</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== 9. TRAINING ==================== */}
          {activeTab === 'training' && (
            <div>
              <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="stat-card">
                  <div className="stat-num">{trainingStatsData.active}</div>
                  <div className="stat-label">Active Courses</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{ color: 'var(--success)' }}>{trainingStatsData.completed}</div>
                  <div className="stat-label">Completed Trainings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num" style={{ color: 'var(--warning)' }}>{trainingStatsData.progress}</div>
                  <div className="stat-label">Currently In Progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-num">{trainingStatsData.certs}</div>
                  <div className="stat-label">Certificates Issued</div>
                </div>
              </div>

              <div className="grid-2-3" style={{ marginBottom: '1.25rem' }}>
                <div className="card">
                  <div className="card-header"><span className="card-title">Completed Programs Distribution</span></div>
                  <canvas ref={trainingChartRef} height="150"></canvas>
                </div>
                <div className="card">
                  <span className="card-title" style={{ display: 'block', marginBottom: '0.75rem' }}>Recent Certifications</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                      <div className="avatar sm" style={{ background: avatarColor('Mahmoud Ali') }}>MA</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.84rem' }}>Mahmoud Ali</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--gray)' }}>Leadership & Mentorship program</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar sm" style={{ background: avatarColor('Mona Fathy') }}>MF</div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.84rem' }}>Mona Fathy</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--gray)' }}>Client Relations & Advanced Sales Training</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: '1.25rem' }}>
                <span className="card-title">Interactive Training Programs</span>
                {isHR() && (
                  <button className="btn btn-primary btn-sm" onClick={() => toggleModal('course')}>+ Add Training Course</button>
                )}
              </div>

              <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                <div className="course-card">
                  <span className="badge blue mb-1" style={{ marginBottom: '0.5rem' }}>In Progress</span>
                  <div className="course-title">Fullstack JavaScript Web Development</div>
                  <div className="course-by">Instructor: Mahmoud Ali</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '85%' }}></div></div>
                  <div className="course-footer">
                    <span>Progress: 85%</span>
                    <span>24 Enrolled · 8 weeks</span>
                  </div>
                </div>
                <div className="course-card">
                  <span className="badge green mb-1" style={{ marginBottom: '0.5rem' }}>Completed</span>
                  <div className="course-title">Advanced Agile & Project Operations</div>
                  <div className="course-by">Instructor: Mona Fathy</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '100%' }}></div></div>
                  <div className="course-footer">
                    <span>Progress: 100%</span>
                    <span>18 Enrolled · 6 weeks</span>
                  </div>
                </div>
                <div className="course-card">
                  <span className="badge blue" style={{ marginBottom: '0.5rem' }}>In Progress</span>
                  <div className="course-title">Technical Systems Architecture & Databases</div>
                  <div className="course-by">Instructor: Mohamed Ammar</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: '45%' }}></div></div>
                  <div className="course-footer">
                    <span>Progress: 45%</span>
                    <span>32 Enrolled · 10 weeks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. PROFILE VIEW ==================== */}
          {activeTab === 'profile' && (
            <div>
              <div className="grid-2-3">
                <div>
                  <div className="card">
                    <div className="profile-header">
                      <div className="avatar xl" style={{ background: avatarColor(userName) }}>{initials(userName)}</div>
                      <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '800' }}>{userName}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--gray)', margin: '0.2rem 0 0.5rem' }}>{userTitle}</div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <span className="badge green">Active Staff</span>
                          <span className="badge blue">Full-Time</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                      <div>
                        <div style={{ color: 'var(--gray)', marginBottom: '0.15rem' }}>Department</div>
                        <strong style={{ color: 'var(--dark)' }}>{userDept}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--gray)', marginBottom: '0.15rem' }}>Current Position</div>
                        <strong style={{ color: 'var(--dark)' }}>{userTitle}</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--gray)', marginBottom: '0.15rem' }}>Direct Manager</div>
                        <strong style={{ color: 'var(--dark)' }}>Mahmoud Ali</strong>
                      </div>
                      <div>
                        <div style={{ color: 'var(--gray)', marginBottom: '0.15rem' }}>Account Email</div>
                        <strong style={{ color: 'var(--dark)' }}>{userEmail || 'workplace@company.com'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <span className="card-title" style={{ display: 'block', marginBottom: '1rem' }}>Employee Skills Competency</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                          <span>JavaScript Development</span>
                          <span>90%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '90%' }}></div></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                          <span>React & Frontend Design</span>
                          <span>85%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '85%' }}></div></div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                          <span>Database Systems & Integrations</span>
                          <span>80%</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: '80%' }}></div></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <span className="card-title" style={{ display: 'block', marginBottom: '1rem' }}>Account Security Options</span>
                  <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>Email Notifications</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Get immediate updates via inbox</div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} /> On
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>Two-Factor Authentication</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Activate extra account protection</div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '16px', height: '16px' }} /> Off
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>Calendar Synced</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>Auto sync schedule logs with Outlook</div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '16px', height: '16px' }} /> Off
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ==================== ALL ACTIVE MODALS ==================== */}
      
      {/* 1. Add Employee Modal */}
      {modals.employee && (
        <div className="modal-overlay" onClick={() => toggleModal('employee')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Employee Profile</span>
              <button className="modal-close" onClick={() => toggleModal('employee')}>✕</button>
            </div>
            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Heba Adel"
                      value={newEmp.name}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Email *</label>
                    <input
                      type="email"
                      placeholder="email@company.com"
                      value={newEmp.email}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      placeholder="username"
                      value={newEmp.username}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, username: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Access Password *</label>
                    <input
                      type="password"
                      placeholder="password"
                      value={newEmp.password}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Job Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Specialist"
                      value={newEmp.jobTitle}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, jobTitle: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Access Role *</label>
                    <select
                      value={newEmp.role}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="HR">HR</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      value={newEmp.gender}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, gender: e.target.value }))}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assigned Department</label>
                    <select
                      value={newEmp.deptId}
                      onChange={(e) => setNewEmp(prev => ({ ...prev, deptId: e.target.value }))}
                    >
                      <option value="">No Assigned Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => toggleModal('employee')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Department Modal */}
      {modals.department && (
        <div className="modal-overlay" onClick={() => toggleModal('department')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create New Department</span>
              <button className="modal-close" onClick={() => toggleModal('department')}>✕</button>
            </div>
            <form onSubmit={handleCreateDepartment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Quality Assurance"
                    value={newDept.name}
                    onChange={(e) => setNewDept({ name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => toggleModal('department')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Request Leave Modal */}
      {modals.leave && (
        <div className="modal-overlay" onClick={() => toggleModal('leave')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Submit Leave Request</span>
              <button className="modal-close" onClick={() => toggleModal('leave')}>✕</button>
            </div>
            <form onSubmit={handleRequestLeave}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Leave Category Type *</label>
                  <select
                    value={newLeave.type}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newLeave.start}
                      onChange={(e) => setNewLeave(prev => ({ ...prev, start: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={newLeave.end}
                      onChange={(e) => setNewLeave(prev => ({ ...prev, end: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason / Details *</label>
                  <textarea
                    placeholder="Brief explanation for this request..."
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave(prev => ({ ...prev, reason: e.target.value }))}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => toggleModal('leave')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Training Course Modal */}
      {modals.course && (
        <div className="modal-overlay" onClick={() => toggleModal('course')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create Training Course</span>
              <button className="modal-close" onClick={() => toggleModal('course')}>✕</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Course Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Leadership Mentor"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. LDR-001"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newCourse.start}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, start: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={newCourse.end}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, end: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Department Target *</label>
                  <select
                    value={newCourse.deptId}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, deptId: e.target.value }))}
                    required
                  >
                    <option value="">Select Department Target</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => toggleModal('course')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create Payroll Modal */}
      {modals.payroll && (
        <div className="modal-overlay" onClick={() => toggleModal('payroll')}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create Payroll Entry</span>
              <button className="modal-close" onClick={() => toggleModal('payroll')}>✕</button>
            </div>
            <form onSubmit={handleAddPayroll}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Target Employee *</label>
                  <select
                    value={newPayroll.empId}
                    onChange={(e) => setNewPayroll(prev => ({ ...prev, empId: e.target.value }))}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Basic Base Salary *</label>
                    <input
                      type="number"
                      placeholder="8500"
                      value={newPayroll.base}
                      onChange={(e) => setNewPayroll(prev => ({ ...prev, base: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Pay Period *</label>
                    <input
                      type="text"
                      placeholder="e.g. May 2026"
                      value={newPayroll.period}
                      onChange={(e) => setNewPayroll(prev => ({ ...prev, period: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => toggleModal('payroll')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
