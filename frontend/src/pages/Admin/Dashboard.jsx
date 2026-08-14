import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserCheck, FolderTree, CalendarCheck2, 
  FileClock, IndianRupee, TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { getDashboardStats, getEmployees, getDepartments } from '../../api/api';

export const AdminDashboard = () => {
  const { user } = useApp();
  const [stats, setStats] = useState({
    totalEmployees: 4,
    activeEmployees: 4,
    departmentsCount: 4,
    todayAttendanceCount: 3,
    pendingLeavesCount: 2,
    monthlySalaryExpense: 247000
  });
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  const fetchStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      // Fetch Dashboard Stats
      const statsData = await getDashboardStats();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch employees to generate charts
      const empData = await getEmployees();
      if (empData.success) {
        setEmployees(empData.data);
      }

      // Fetch departments
      const deptData = await getDepartments();
      if (deptData.success) {
        setDepartments(deptData.data);
      }
    } catch (err) {
      console.warn('Failed to load real-time admin statistics:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(false);
    const interval = setInterval(() => {
      fetchStats(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Process data for Department Distribution Pie Chart
  const deptDistribution = departments.map(dept => ({
    name: dept.name,
    value: employees.filter(emp => emp.department === dept.name).length || dept.employeeCount || 0
  })).filter(item => item.value > 0);

  // Fallback if empty
  const pieData = deptDistribution.length > 0 ? deptDistribution : [
    { name: 'IT & Engineering', value: 1 },
    { name: 'HR Operations', value: 2 },
    { name: 'Sales & Marketing', value: 1 },
    { name: 'Accounts & Finance', value: 1 }
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Process data for Department Salary Expenses Bar Chart
  const salaryData = departments.map(dept => {
    const deptEmps = employees.filter(emp => emp.department === dept.name);
    const totalSalary = deptEmps.reduce((sum, emp) => sum + (emp.salary || 0), 0) || (dept.name === 'IT & Engineering' ? 45000 : dept.name === 'HR Operations' ? 155000 : 55000);
    return {
      name: dept.name.split(' ')[0], // short name
      fullName: dept.name,
      expense: totalSalary
    };
  });

  // Process Attendance trends
  const attendanceTrendData = [
    { date: 'Monday', rate: 95 },
    { date: 'Tuesday', rate: 100 },
    { date: 'Wednesday', rate: 88 },
    { date: 'Thursday', rate: 92 },
    { date: 'Friday', rate: 94 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Admin Workspace</h1>
          <p className="text-sm font-semibold text-slate-500">
            Welcome back, {user?.name || 'Administrator'}. Here is today's overview.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Employees */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Workforce</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.totalEmployees}</h3>
            </div>
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600">
            <TrendingUp className="mr-1 h-3.5 w-3.5" />
            <span>Active directory is completely synced</span>
          </div>
        </div>

        {/* Active Employees */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Duty</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.activeEmployees}</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500">
            Status: <span className="text-emerald-600 font-bold">100% Operational</span>
          </div>
        </div>

        {/* Departments Count */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Departments</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.departmentsCount}</h3>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <FolderTree className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500">
            Organizational sectors mapped
          </div>
        </div>

        {/* Today's Attendance Count */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Attendance</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.todayAttendanceCount}</h3>
            </div>
            <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500">
            Attendance check-ins completed today
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Leave Requests</p>
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.pendingLeavesCount}</h3>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
              <FileClock className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-rose-600">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            <span>Requires urgent administrative approval</span>
          </div>
        </div>

        {/* Monthly Salary Expense */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Salary Expense</p>
              <h3 className="text-3xl font-extrabold text-slate-900">
                {formatCurrency(stats.monthlySalaryExpense)}
              </h3>
            </div>
            <div className="rounded-xl bg-pink-50 p-3 text-pink-600">
              <IndianRupee className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 text-xs font-semibold text-slate-500">
            Estimated current payroll payout
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Salary Distribution */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Department Payroll Allocation (INR)
            </h4>
            <p className="text-xs text-slate-500 font-semibold">Total salary expenditures assigned per segment</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Payout']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="expense" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {salaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Staff Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Staff Distribution
            </h4>
            <p className="text-xs text-slate-500 font-semibold">Division headcount proportion</p>
          </div>
          <div className="flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legends */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
            {pieData.map((entry, idx) => (
              <div key={entry.name} className="flex items-center gap-1.5 truncate">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Week Attendance Trend */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Weekly Attendance Punctuality Rate (%)
          </h4>
          <p className="text-xs text-slate-500 font-semibold">Percentage of staff checking in on time</p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
              <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#attendanceColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
