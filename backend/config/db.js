import mongoose from 'mongoose';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import SalarySlip from '../models/SalarySlip.js';
import Announcement from '../models/Announcement.js';
import Department from '../models/Department.js';

export const initialUsers = [
  {
    id: 'EMP-1001',
    name: 'EMS Admin',
    email: 'admin@company.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
    role: 'Admin',
    password: 'adminpassword',
    department: 'HR Operations',
    designation: 'Operations Manager',
    joiningDate: 'June 01, 2026',
    contact: '+91 9999999999',
    address: 'Softwallet Corporate Tower, India',
    gender: 'Male',
    dob: '1990-01-01',
    salary: 120000,
    bloodGroup: 'A+',
    status: 'Active',
    documents: []
  },
  {
    id: 'EMP-4012',
    name: 'Varshik Pal',
    email: 'varshikpal@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
    role: 'Employee',
    password: 'password123',
    department: 'IT & Engineering',
    designation: 'MERN Stack Developer',
    joiningDate: 'June 01, 2026',
    contact: '+91 9596393658',
    address: 'Delhi NCR, India',
    gender: 'Male',
    dob: '1998-05-14',
    salary: 65000,
    bloodGroup: 'O+',
    status: 'Active',
    documents: [
      { id: 'DOC-001', name: 'Offer_Letter_Varshik_Pal.pdf', size: '1.2 MB', uploadDate: '2026-06-01' },
      { id: 'DOC-002', name: 'Identity_Verification_Aadhar.pdf', size: '850 KB', uploadDate: '2026-06-02' }
    ]
  }
];

export const initialDepartments = [
  { id: 'DEP-01', name: 'HR Operations', manager: 'EMS Admin', employeeCount: 4 },
  { id: 'DEP-02', name: 'IT & Engineering', manager: 'Varshik Pal', employeeCount: 12 },
  { id: 'DEP-03', name: 'Finance & Accounts', manager: 'Rohan Sharma', employeeCount: 5 },
  { id: 'DEP-04', name: 'Sales & Marketing', manager: 'Pooja Verma', employeeCount: 8 },
  { id: 'DEP-05', name: 'Product & Design', manager: 'Aarav Patel', employeeCount: 6 }
];

const todayStr = new Date().toISOString().split('T')[0];

export const initialAttendance = [
  { id: 'ATT-001', userId: 'EMP-4012', date: todayStr, checkIn: '09:15 AM', checkOut: null, status: 'On Time', hoursWorked: 'Active' },
  { id: 'ATT-002', userId: 'EMP-4012', date: '2026-07-02', checkIn: '09:05 AM', checkOut: '05:30 PM', status: 'On Time', hoursWorked: '8.4 hrs' },
  { id: 'ATT-003', userId: 'EMP-4012', date: '2026-07-01', checkIn: '09:45 AM', checkOut: '05:45 PM', status: 'Late', hoursWorked: '8.0 hrs' }
];

export const initialLeaves = [
  { id: 'LEV-001', userId: 'EMP-4012', type: 'Casual Leave', startDate: '2026-07-15', endDate: '2026-07-16', totalDays: 2, reason: 'Family Function & Personal Event', status: 'Pending', appliedDate: '2026-07-02' },
  { id: 'LEV-002', userId: 'EMP-4012', type: 'Sick Leave', startDate: '2026-06-10', endDate: '2026-06-11', totalDays: 2, reason: 'Viral fever recovery', status: 'Approved', appliedDate: '2026-06-09' }
];

export const initialSalarySlips = [
  { id: 'PAY-202606', userId: 'EMP-4012', month: 'June', year: '2026', paymentDate: '2026-06-30', basic: 45000, allowances: 15000, bonus: 5000, deductions: 4500, netSalary: 60500, status: 'Paid' },
  { id: 'PAY-202605', userId: 'EMP-4012', month: 'May', year: '2026', paymentDate: '2026-05-31', basic: 45000, allowances: 15000, bonus: 0, deductions: 4500, netSalary: 55500, status: 'Paid' }
];

export const initialAnnouncements = [
  { id: 'ANN-001', title: 'Welcome to Softwallet Smart EMS Portal', content: 'We have deployed the new Smart Employee Management System (EMS). All employees can track attendance, apply for leaves, and download salary slips.', category: 'Policy', date: '2026-07-02', sender: 'HR Operations' },
  { id: 'ANN-002', title: 'Monthly All-Hands Townhall', content: 'Our upcoming all-hands townhall will be held next Tuesday to discuss quarterly company goals and product releases.', category: 'General', date: '2026-07-01', sender: 'Management Desk' },
  { id: 'ANN-003', title: 'Security & Compliance Guidelines', content: 'Please ensure all employee verification documents and contact details are updated in your personal profile.', category: 'Urgent', date: '2026-06-28', sender: 'IT Security' }
];

export const connectDB = async () => {
  // Disable query buffering so operations don't hang if database connection is unavailable or blocked by network/firewall
  mongoose.set('bufferCommands', false);

  // Target MongoDB connection URI provided by user
  const defaultUri = 'mongodb+srv://EMS:EMS1@cluster0.eqxqlh0.mongodb.net/admin?retryWrites=true&w=majority';
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI || defaultUri;
  const uri = rawUri.trim();

  // Target database name: defaults to 'admin' (or specified in MONGODB_DB_NAME)
  const targetDbName = process.env.MONGODB_DB_NAME || 'admin';

  try {
    // Attempt connection with explicitly selected admin database
    await mongoose.connect(uri, {
      dbName: targetDbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    
    console.log(`✅ Connected to MongoDB Atlas successfully [Database: ${mongoose.connection.name || targetDbName}].`);
    await seedDatabase();
    return true;
  } catch (error) {
    console.warn(`⚠️ Connection with dbName '${targetDbName}' failed (${error.message}). Retrying standard connection...`);
    try {
      await mongoose.connect(uri, { 
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      console.log(`✅ Connected to MongoDB Atlas [Database: ${mongoose.connection.name}].`);
      await seedDatabase();
      return true;
    } catch (err2) {
      console.error('❌ MongoDB Atlas Connection Notice (Laptop/Offline network):', err2.message || err2);
      console.log('⚡ Server running seamlessly in synchronized offline fallback storage mode.');
      return false;
    }
  }
};

const seedDatabase = async () => {
  try {
    // 1. Seed Admin & Employee Users
    for (const u of initialUsers) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`🌱 Seeded user: ${u.name} (${u.role}) -> ${u.email}`);
      }
    }

    // 2. Seed Departments
    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      await Department.insertMany(initialDepartments);
      console.log('🌱 Seeded default corporate departments.');
    }

    // 3. Seed Announcements
    const annCount = await Announcement.countDocuments();
    if (annCount === 0) {
      await Announcement.insertMany(initialAnnouncements);
      console.log('🌱 Seeded corporate announcements.');
    }

    // 4. Seed Attendance
    const attCount = await Attendance.countDocuments();
    if (attCount === 0) {
      await Attendance.insertMany(initialAttendance);
      console.log('🌱 Seeded sample attendance logs.');
    }

    // 5. Seed Leaves
    const leaveCount = await Leave.countDocuments();
    if (leaveCount === 0) {
      await Leave.insertMany(initialLeaves);
      console.log('🌱 Seeded sample leave requests.');
    }

    // 6. Seed Salary Slips
    const slipCount = await SalarySlip.countDocuments();
    if (slipCount === 0) {
      await SalarySlip.insertMany(initialSalarySlips);
      console.log('🌱 Seeded sample salary slips.');
    }

    console.log('✨ MongoDB Atlas initialization & seeding completed successfully.');
  } catch (err) {
    console.error('❌ Error during MongoDB database seeding:', err.message || err);
  }
};
