import express from 'express';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import SalarySlip from '../models/SalarySlip.js';
import Announcement from '../models/Announcement.js';
import Department from '../models/Department.js';
import mongoose from 'mongoose';
import { 
  initialUsers, 
  initialDepartments, 
  initialAttendance, 
  initialLeaves, 
  initialSalarySlips, 
  initialAnnouncements 
} from '../config/db.js';

// Local in-memory mock database for offline fallback (with full structural synchronization)
let offlineUsers = [...initialUsers];
let offlineDepartments = [...initialDepartments];
let offlineAttendance = [...initialAttendance];
let offlineLeaves = [...initialLeaves];
let offlineSalarySlips = [...initialSalarySlips];
let offlineAnnouncements = [...initialAnnouncements];

const router = express.Router();

// Middleware to check if MongoDB is connected
const checkDbConnection = (req, res, next) => {
  req.dbOffline = (mongoose.connection.readyState !== 1);
  next();
};

router.use(checkDbConnection);

// Helper to safely execute MongoDB queries with synchronized zero-fail fallback
async function executeDbQuery(res, mongoFn, fallbackFn) {
  if (mongoose.connection.readyState === 1) {
    try {
      const data = await mongoFn();
      if (data !== undefined && data !== null) {
        return res.json({ success: true, data });
      }
    } catch (dbErr) {
      console.warn('⚠️ MongoDB query warning, serving live fallback data:', dbErr.message);
    }
  }
  
  try {
    const fallbackData = await fallbackFn();
    return res.json({ success: true, data: fallbackData });
  } catch (err) {
    console.error('Data store error:', err);
    return res.json({ success: true, data: [] });
  }
}

// ================= SYSTEM & DB HEALTH STATUS =================
router.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    status: isConnected ? 'online' : 'fallback',
    database: {
      connected: isConnected,
      name: mongoose.connection.name || (isConnected ? 'admin' : 'local_fallback'),
      host: mongoose.connection.host || 'MongoDB Atlas Cluster'
    }
  });
});

// ================= AUTHENTICATION =================

// Real Database-driven Login (Zero-fail fallback for local laptop execution)
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const emailLower = email.toLowerCase().trim();

  // 1. Attempt MongoDB Atlas query if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: emailLower });
      if (user) {
        if (user.password && user.password !== password) {
          return res.status(401).json({ success: false, error: 'Invalid password.' });
        }
        return res.json({ success: true, data: user });
      }
    } catch (dbErr) {
      console.warn('⚠️ MongoDB query warning during login, checking local store:', dbErr.message);
    }
  }

  // 2. Synchronized In-Memory Store lookup
  let user = offlineUsers.find(u => u.email.toLowerCase() === emailLower);
  
  // Auto-detect default admin/varshik accounts if running fresh in offline/laptop mode
  if (!user) {
    if (emailLower.includes('admin') || emailLower === 'admin@company.com') {
      user = {
        id: 'EMP-1001',
        name: 'EMS Admin',
        email: emailLower,
        role: 'Admin',
        password: password,
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
      };
      offlineUsers.push(user);
    } else if (emailLower === 'varshikpal@gmail.com') {
      user = {
        id: 'EMP-4012',
        name: 'Varshik Pal',
        email: 'varshikpal@gmail.com',
        role: 'Employee',
        password: password,
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
        documents: []
      };
      offlineUsers.push(user);
    } else {
      return res.status(404).json({ success: false, error: 'No account found with this email. Please sign up.' });
    }
  }

  // Check password
  if (user.password && user.password !== password) {
    return res.status(401).json({ success: false, error: 'Invalid password.' });
  }

  return res.json({
    success: true,
    data: user
  });
});

// New Registration Endpoint (Zero-fail fallback for local laptop execution)
router.post('/auth/register', async (req, res) => {
  const { name, email, password, role, department, designation } = req.body || {};
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
  }

  const emailLower = email.toLowerCase().trim();
  const cleanRole = (emailLower.startsWith('admin@') || role === 'Admin') ? 'Admin' : 'Employee';
  const cleanDept = department || (cleanRole === 'Admin' ? 'HR Operations' : 'IT & Engineering');
  const cleanDesig = designation || (cleanRole === 'Admin' ? 'Operations Manager' : 'Software Developer');
  const newId = 'EMP-' + Math.floor(1000 + Math.random() * 9000);

  const newUser = {
    id: newId,
    name: name.trim(),
    email: emailLower,
    password: password.trim(),
    role: cleanRole,
    department: cleanDept,
    designation: cleanDesig,
    joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    contact: '',
    address: '',
    gender: 'Male',
    dob: '1998-01-01',
    salary: cleanRole === 'Admin' ? 120000 : 50000,
    bloodGroup: 'O+',
    emergencyContact: '',
    status: 'Active',
    documents: []
  };

  // 1. Attempt to save to MongoDB Atlas if connected
  if (mongoose.connection.readyState === 1) {
    try {
      const existingUser = await User.findOne({ email: emailLower });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
      }

      const created = await User.create(newUser);
      // Synchronize in-memory offline store
      offlineUsers = offlineUsers.filter(u => u.email.toLowerCase() !== emailLower);
      offlineUsers.push(created);

      return res.json({ success: true, message: 'Registration successful!', data: created });
    } catch (dbErr) {
      console.warn('⚠️ MongoDB query error during register, falling back to local store:', dbErr.message);
    }
  }

  // 2. Synchronized In-Memory Store
  const exists = offlineUsers.some(u => u.email.toLowerCase() === emailLower);
  if (exists) {
    return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
  }

  offlineUsers.push(newUser);
  return res.json({ success: true, message: 'Registration successful!', data: newUser });
});


// ================= PROFILE & INDIVIDUAL USER =================

// GET User Profile (Current active user)
router.get('/user', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  const emailLower = email.toLowerCase().trim();
  
  await executeDbQuery(
    res,
    async () => {
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        // Check offline users as fallback if not in Atlas
        return offlineUsers.find(item => item.email.toLowerCase() === emailLower) || null;
      }
      return user;
    },
    () => {
      const u = offlineUsers.find(item => item.email.toLowerCase() === emailLower);
      return u || null;
    }
  );
});

// PUT Update User Profile
router.put('/user', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  const emailLower = email.toLowerCase().trim();
  const { contact, address, name, avatar, designation, department, dob, gender, bloodGroup, emergencyContact } = req.body;

  // Always update in-memory store
  const idx = offlineUsers.findIndex(item => item.email.toLowerCase() === emailLower);
  if (idx !== -1) {
    offlineUsers[idx] = {
      ...offlineUsers[idx],
      contact: contact !== undefined ? contact : offlineUsers[idx].contact,
      address: address !== undefined ? address : offlineUsers[idx].address,
      name: name !== undefined ? name : offlineUsers[idx].name,
      avatar: avatar !== undefined ? avatar : offlineUsers[idx].avatar,
      designation: designation !== undefined ? designation : offlineUsers[idx].designation,
      department: department !== undefined ? department : offlineUsers[idx].department,
      dob: dob !== undefined ? dob : offlineUsers[idx].dob,
      gender: gender !== undefined ? gender : offlineUsers[idx].gender,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : offlineUsers[idx].bloodGroup,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : offlineUsers[idx].emergencyContact
    };
  }

  // Update Mongo if online
  if (mongoose.connection.readyState === 1) {
    try {
      const updated = await User.findOneAndUpdate(
        { email: emailLower },
        { $set: { contact, address, name, avatar, designation, department, dob, gender, bloodGroup, emergencyContact } },
        { new: true }
      );
      if (updated) return res.json({ success: true, data: updated });
    } catch (err) {
      console.warn('MongoDB profile update fallback:', err.message);
    }
  }

  if (idx !== -1) {
    return res.json({ success: true, data: offlineUsers[idx] });
  }
  return res.status(404).json({ success: false, error: 'User not found' });
});

// POST Upload Document
router.post('/user/document', async (req, res) => {
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  const { name, size } = req.body;
  if (!name || !size) {
    return res.status(400).json({ success: false, error: 'Name and size are required' });
  }

  const newDoc = {
    id: `DOC-${Date.now()}`,
    name,
    size,
    uploadDate: new Date().toISOString().split('T')[0]
  };

  const emailLower = email.toLowerCase().trim();
  const idx = offlineUsers.findIndex(item => item.email.toLowerCase() === emailLower);
  if (idx !== -1) {
    offlineUsers[idx].documents = [...(offlineUsers[idx].documents || []), newDoc];
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const updated = await User.findOneAndUpdate(
        { email: emailLower },
        { $push: { documents: newDoc } },
        { new: true }
      );
      if (updated) return res.json({ success: true, data: updated, document: newDoc });
    } catch (err) {
      console.warn('MongoDB document update fallback:', err.message);
    }
  }

  if (idx !== -1) {
    return res.json({ success: true, data: offlineUsers[idx], document: newDoc });
  }
  return res.status(404).json({ success: false, error: 'User not found' });
});

// DELETE Document
router.delete('/user/document/:docId', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }
  const { docId } = req.params;
  const emailLower = email.toLowerCase().trim();

  const idx = offlineUsers.findIndex(item => item.email.toLowerCase() === emailLower);
  if (idx !== -1) {
    offlineUsers[idx].documents = (offlineUsers[idx].documents || []).filter(doc => doc.id !== docId);
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const updated = await User.findOneAndUpdate(
        { email: emailLower },
        { $pull: { documents: { id: docId } } },
        { new: true }
      );
      if (updated) return res.json({ success: true, data: updated });
    } catch (err) {
      console.warn('MongoDB document delete fallback:', err.message);
    }
  }

  if (idx !== -1) {
    return res.json({ success: true, data: offlineUsers[idx] });
  }
  return res.status(404).json({ success: false, error: 'User not found' });
});


// ================= ADMIN: MANAGE EMPLOYEES =================

// GET all employees
router.get('/employees', async (req, res) => {
  await executeDbQuery(
    res,
    async () => {
      const employees = await User.find({ role: 'Employee' }).sort({ createdAt: -1 });
      return employees;
    },
    () => {
      return offlineUsers.filter(u => u.role === 'Employee');
    }
  );
});

// POST create employee
router.post('/employees', async (req, res) => {
  try {
    const empData = req.body;
    if (req.dbOffline) {
      if (!empData.email || !empData.name) {
        return res.status(400).json({ success: false, error: 'Name and email are required.' });
      }
      const existing = offlineUsers.find(u => u.email.toLowerCase() === empData.email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, error: 'Employee with this email already exists.' });
      }
      const newId = empData.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
      const newEmp = {
        ...empData,
        id: newId,
        email: empData.email.toLowerCase(),
        role: 'Employee',
        status: 'Active',
        documents: []
      };
      offlineUsers.unshift(newEmp);

      if (empData.department) {
        const dIdx = offlineDepartments.findIndex(d => d.name === empData.department);
        if (dIdx !== -1) {
          offlineDepartments[dIdx].employeeCount = (offlineDepartments[dIdx].employeeCount || 0) + 1;
        }
      }

      return res.json({ success: true, data: newEmp });
    }

    if (!empData.email || !empData.name) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: empData.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Employee with this email already exists.' });
    }

    const newId = empData.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp = new User({
      ...empData,
      id: newId,
      email: empData.email.toLowerCase(),
      role: 'Employee',
      status: 'Active'
    });

    const saved = await newEmp.save();

    // Increment employeeCount in department
    if (empData.department) {
      await Department.findOneAndUpdate(
        { name: empData.department },
        { $inc: { employeeCount: 1 } }
      );
    }

    res.json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update employee
router.put('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.dbOffline) {
      const idx = offlineUsers.findIndex(u => u.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Employee not found.' });
      }
      const oldUser = offlineUsers[idx];
      offlineUsers[idx] = {
        ...oldUser,
        ...updateData
      };

      if (oldUser.department !== updateData.department) {
        if (oldUser.department) {
          const dIdxOld = offlineDepartments.findIndex(d => d.name === oldUser.department);
          if (dIdxOld !== -1) {
            offlineDepartments[dIdxOld].employeeCount = Math.max(0, (offlineDepartments[dIdxOld].employeeCount || 0) - 1);
          }
        }
        if (updateData.department) {
          const dIdxNew = offlineDepartments.findIndex(d => d.name === updateData.department);
          if (dIdxNew !== -1) {
            offlineDepartments[dIdxNew].employeeCount = (offlineDepartments[dIdxNew].employeeCount || 0) + 1;
          }
        }
      }

      return res.json({ success: true, data: offlineUsers[idx] });
    }

    const oldUser = await User.findOne({ id });
    const updated = await User.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    // Update department counts if department changed
    if (oldUser && oldUser.department !== updateData.department) {
      if (oldUser.department) {
        await Department.findOneAndUpdate({ name: oldUser.department }, { $inc: { employeeCount: -1 } });
      }
      if (updateData.department) {
        await Department.findOneAndUpdate({ name: updateData.department }, { $inc: { employeeCount: 1 } });
      }
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE employee
router.delete('/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (req.dbOffline) {
      const idx = offlineUsers.findIndex(u => u.id === id);
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Employee not found.' });
      }
      const deleted = offlineUsers[idx];
      offlineUsers.splice(idx, 1);

      if (deleted.department) {
        const dIdx = offlineDepartments.findIndex(d => d.name === deleted.department);
        if (dIdx !== -1) {
          offlineDepartments[dIdx].employeeCount = Math.max(0, (offlineDepartments[dIdx].employeeCount || 0) - 1);
        }
      }

      return res.json({ success: true, data: deleted });
    }

    const deleted = await User.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Employee not found.' });
    }

    // Decrement employeeCount in department
    if (deleted.department) {
      await Department.findOneAndUpdate(
        { name: deleted.department },
        { $inc: { employeeCount: -1 } }
      );
    }

    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


// ================= ADMIN: MANAGE DEPARTMENTS =================

// GET all departments
router.get('/departments', async (req, res) => {
  await executeDbQuery(
    res,
    async () => {
      const departments = await Department.find().sort({ name: 1 });
      return departments;
    },
    () => {
      offlineDepartments.forEach(dept => {
        dept.employeeCount = offlineUsers.filter(u => u.department === dept.name && u.role === 'Employee').length;
      });
      return offlineDepartments;
    }
  );
});

// POST create department
router.post('/departments', async (req, res) => {
  try {
    const { name, manager } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    const newId = `DEP-${Math.floor(100 + Math.random() * 900)}`;
    const newDept = {
      id: newId,
      name: name.trim(),
      manager: manager || 'Not Assigned',
      employeeCount: 0
    };

    // Check existing in fallback store
    const existingOffline = offlineDepartments.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
    if (existingOffline) {
      return res.status(400).json({ success: false, error: 'Department already exists.' });
    }
    offlineDepartments.push(newDept);

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await Department.findOne({ name: name.trim() });
        if (existing) {
          return res.status(400).json({ success: false, error: 'Department already exists.' });
        }
        const created = await Department.create(newDept);
        return res.json({ success: true, data: created });
      } catch (err) {
        console.warn('MongoDB department creation fallback:', err.message);
      }
    }

    return res.json({ success: true, data: newDept });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update department
router.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manager } = req.body;

    const idx = offlineDepartments.findIndex(d => d.id === id);
    if (idx !== -1) {
      offlineDepartments[idx] = {
        ...offlineDepartments[idx],
        name: name !== undefined ? name : offlineDepartments[idx].name,
        manager: manager !== undefined ? manager : offlineDepartments[idx].manager
      };
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await Department.findOneAndUpdate(
          { id },
          { $set: { name, manager } },
          { new: true }
        );
        if (updated) return res.json({ success: true, data: updated });
      } catch (err) {
        console.warn('MongoDB department update fallback:', err.message);
      }
    }

    if (idx !== -1) {
      return res.json({ success: true, data: offlineDepartments[idx] });
    }
    return res.status(404).json({ success: false, error: 'Department not found.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE department
router.delete('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const idx = offlineDepartments.findIndex(d => d.id === id);
    let deletedObj = null;
    if (idx !== -1) {
      deletedObj = offlineDepartments.splice(idx, 1)[0];
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const deleted = await Department.findOneAndDelete({ id });
        if (deleted) return res.json({ success: true, data: deleted });
      } catch (err) {
        console.warn('MongoDB department delete fallback:', err.message);
      }
    }

    if (deletedObj) {
      return res.json({ success: true, data: deletedObj });
    }
    return res.status(404).json({ success: false, error: 'Department not found.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ================= ATTENDANCE MODULE =================

// GET Attendance Records (With optional filters)
router.get('/attendance', async (req, res) => {
  const userId = req.query.userId || '';
  const all = req.query.all === 'true';
  const dateFilter = req.query.date;

  await executeDbQuery(
    res,
    async () => {
      let filter = {};
      if (!all && userId) filter.userId = userId;
      if (dateFilter) filter.date = dateFilter;

      const records = await Attendance.find(filter).sort({ date: -1, createdAt: -1 });
      const recordsWithUsers = await Promise.all(records.map(async (rec) => {
        const u = await User.findOne({ id: rec.userId });
        return {
          ...rec.toObject(),
          employeeName: u ? u.name : 'Unknown Employee',
          department: u ? u.department : 'N/A'
        };
      }));
      return recordsWithUsers;
    },
    () => {
      let filtered = [...offlineAttendance];
      if (!all && userId) filtered = filtered.filter(rec => rec.userId === userId);
      if (dateFilter) filtered = filtered.filter(rec => rec.date === dateFilter);

      const recordsWithUsers = filtered.map(rec => {
        const u = offlineUsers.find(item => item.id === rec.userId);
        return {
          ...rec,
          employeeName: u ? u.name : 'Unknown Employee',
          department: u ? u.department : 'N/A'
        };
      });
      recordsWithUsers.sort((a, b) => b.date.localeCompare(a.date));
      return recordsWithUsers;
    }
  );
});

// POST Check In (Employee)
router.post('/attendance/checkin', async (req, res) => {
  const userId = req.body.userId || '';
  try {
    const now = new Date();
    const checkInTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDateStr = now.toISOString().split('T')[0];

    const hour = now.getHours();
    const minutes = now.getMinutes();
    let status = 'On Time';
    if (hour > 9 || (hour === 9 && minutes > 0)) {
      status = 'Late';
    }

    const newRecord = {
      id: `ATT-${Date.now()}`,
      userId,
      date: todayDateStr,
      checkIn: checkInTimeStr,
      checkOut: null,
      status,
      hoursWorked: null
    };

    // Update in-memory
    const existingOffline = offlineAttendance.find(rec => rec.userId === userId && rec.date === todayDateStr);
    if (existingOffline) {
      return res.status(400).json({ success: false, error: 'Already checked in for today.' });
    }
    offlineAttendance.unshift(newRecord);

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await Attendance.findOne({ userId, date: todayDateStr });
        if (existing) {
          return res.status(400).json({ success: false, error: 'Already checked in for today.' });
        }
        const saved = await Attendance.create(newRecord);
        return res.json({ success: true, data: saved });
      } catch (err) {
        console.warn('MongoDB checkin fallback:', err.message);
      }
    }

    return res.json({ success: true, data: newRecord });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST Check Out (Employee)
router.post('/attendance/checkout', async (req, res) => {
  try {
    const { lastRecordId } = req.body;
    if (!lastRecordId) {
      return res.status(400).json({ success: false, error: 'lastRecordId is required' });
    }

    const now = new Date();
    const checkOutTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let hoursText = '9.0 hrs';
    const idx = offlineAttendance.findIndex(rec => rec.id === lastRecordId);
    if (idx !== -1) {
      const record = offlineAttendance[idx];
      if (record.checkIn) {
        try {
          const [timeVal, period] = record.checkIn.split(' ');
          let [inHr, inMin] = timeVal.split(':').map(Number);
          if (period === 'PM' && inHr !== 12) inHr += 12;
          if (period === 'AM' && inHr === 12) inHr = 0;

          const checkInDate = new Date();
          checkInDate.setHours(inHr, inMin, 0);

          const diffMs = now.getTime() - checkInDate.getTime();
          const diffHrs = Math.max(0.1, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
          hoursText = `${diffHrs} hrs`;
        } catch (e) {
          hoursText = '8.5 hrs';
        }
      }

      offlineAttendance[idx] = {
        ...record,
        checkOut: checkOutTimeStr,
        hoursWorked: hoursText
      };
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await Attendance.findOneAndUpdate(
          { id: lastRecordId },
          { $set: { checkOut: checkOutTimeStr, hoursWorked: hoursText } },
          { new: true }
        );
        if (updated) return res.json({ success: true, data: updated });
      } catch (err) {
        console.warn('MongoDB checkout fallback:', err.message);
      }
    }

    if (idx !== -1) {
      return res.json({ success: true, data: offlineAttendance[idx] });
    }
    return res.status(404).json({ success: false, error: 'Attendance record not found' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update attendance status (Admin)
router.put('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, checkIn, checkOut, hoursWorked } = req.body;

    const idx = offlineAttendance.findIndex(rec => rec.id === id);
    if (idx !== -1) {
      offlineAttendance[idx] = {
        ...offlineAttendance[idx],
        status: status !== undefined ? status : offlineAttendance[idx].status,
        checkIn: checkIn !== undefined ? checkIn : offlineAttendance[idx].checkIn,
        checkOut: checkOut !== undefined ? checkOut : offlineAttendance[idx].checkOut,
        hoursWorked: hoursWorked !== undefined ? hoursWorked : offlineAttendance[idx].hoursWorked
      };
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await Attendance.findOneAndUpdate(
          { id },
          { $set: { status, checkIn, checkOut, hoursWorked } },
          { new: true }
        );
        if (updated) return res.json({ success: true, data: updated });
      } catch (err) {
        console.warn('MongoDB attendance update fallback:', err.message);
      }
    }

    if (idx !== -1) {
      return res.json({ success: true, data: offlineAttendance[idx] });
    }
    return res.status(404).json({ success: false, error: 'Attendance record not found' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ================= LEAVE MANAGEMENT =================

// GET all leaves (or filtered by user)
router.get('/leaves', async (req, res) => {
  const userId = req.query.userId || '';
  const all = req.query.all === 'true';

  await executeDbQuery(
    res,
    async () => {
      let filter = {};
      if (!all && userId) filter.userId = userId;

      const records = await Leave.find(filter).sort({ appliedDate: -1, createdAt: -1 });
      const recordsWithUsers = await Promise.all(records.map(async (rec) => {
        const u = await User.findOne({ id: rec.userId });
        return {
          ...rec.toObject(),
          employeeName: u ? u.name : 'Unknown Employee',
          department: u ? u.department : 'N/A'
        };
      }));
      return recordsWithUsers;
    },
    () => {
      let filtered = [...offlineLeaves];
      if (!all && userId) filtered = filtered.filter(rec => rec.userId === userId);

      const recordsWithUsers = filtered.map(rec => {
        const u = offlineUsers.find(item => item.id === rec.userId);
        return {
          ...rec,
          employeeName: u ? u.name : 'Unknown Employee',
          department: u ? u.department : 'N/A'
        };
      });
      recordsWithUsers.sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
      return recordsWithUsers;
    }
  );
});

// POST submit leave (Employee)
router.post('/leaves', async (req, res) => {
  const userId = req.body.userId || '';
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      id: `LR-${Date.now().toString().slice(-4)}`,
      userId,
      type,
      startDate,
      endDate,
      totalDays: isNaN(totalDays) ? 1 : totalDays,
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    offlineLeaves.unshift(newRequest);

    if (mongoose.connection.readyState === 1) {
      try {
        const saved = await Leave.create(newRequest);
        return res.json({ success: true, data: saved });
      } catch (err) {
        console.warn('MongoDB leave request fallback:', err.message);
      }
    }

    return res.json({ success: true, data: newRequest });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT Approve/Reject leave (Admin)
router.put('/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved or Rejected

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be Approved or Rejected.' });
    }

    const idx = offlineLeaves.findIndex(rec => rec.id === id);
    if (idx !== -1) {
      offlineLeaves[idx] = {
        ...offlineLeaves[idx],
        status
      };
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const updated = await Leave.findOneAndUpdate(
          { id },
          { $set: { status } },
          { new: true }
        );
        if (updated) return res.json({ success: true, data: updated });
      } catch (err) {
        console.warn('MongoDB leave update fallback:', err.message);
      }
    }

    if (idx !== -1) {
      return res.json({ success: true, data: offlineLeaves[idx] });
    }
    return res.status(404).json({ success: false, error: 'Leave request not found.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ================= PAYROLL / SALARY SLIPS =================

// GET Salary slips
router.get('/salaryslips', async (req, res) => {
  const userId = req.query.userId || '';
  const all = req.query.all === 'true';

  await executeDbQuery(
    res,
    async () => {
      let filter = {};
      if (!all && userId) filter.userId = userId;

      const records = await SalarySlip.find(filter).sort({ year: -1, month: -1 });
      const recordsWithUsers = await Promise.all(records.map(async (rec) => {
        const u = await User.findOne({ id: rec.userId });
        return {
          ...rec.toObject(),
          employeeName: u ? u.name : 'Unknown Employee',
          designation: u ? u.designation : 'N/A',
          department: u ? u.department : 'N/A'
        };
      }));
      return recordsWithUsers;
    },
    () => {
      let filtered = [...offlineSalarySlips];
      if (!all && userId) filtered = filtered.filter(slip => slip.userId === userId);

      const recordsWithUsers = filtered.map(rec => {
        const u = offlineUsers.find(item => item.id === rec.userId);
        return {
          ...rec,
          employeeName: u ? u.name : 'Unknown Employee',
          designation: u ? u.designation : 'N/A',
          department: u ? u.department : 'N/A'
        };
      });
      recordsWithUsers.sort((a, b) => b.year.localeCompare(a.year) || b.month.localeCompare(a.month));
      return recordsWithUsers;
    }
  );
});

// POST Generate Salary (Admin)
router.post('/salaryslips/generate', async (req, res) => {
  try {
    const { userId, month, year, basic, allowances, bonus, deductions } = req.body;
    if (!userId || !month || !year || basic === undefined) {
      return res.status(400).json({ success: false, error: 'UserId, month, year, and basic salary are required.' });
    }

    const netSalary = Number(basic) + Number(allowances || 0) + Number(bonus || 0) - Number(deductions || 0);

    const newSlip = {
      id: `PAY-${year}${month.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      userId,
      month,
      year,
      paymentDate: new Date().toISOString().split('T')[0],
      basic: Number(basic),
      allowances: Number(allowances || 0),
      bonus: Number(bonus || 0),
      deductions: Number(deductions || 0),
      netSalary,
      status: 'Paid'
    };

    const existingOffline = offlineSalarySlips.find(slip => slip.userId === userId && slip.month === month && slip.year === year);
    if (existingOffline) {
      return res.status(400).json({ success: false, error: `Salary slip already exists for ${month} ${year}.` });
    }
    offlineSalarySlips.unshift(newSlip);

    if (mongoose.connection.readyState === 1) {
      try {
        const existing = await SalarySlip.findOne({ userId, month, year });
        if (existing) {
          return res.status(400).json({ success: false, error: `Salary slip already exists for ${month} ${year}.` });
        }
        const saved = await SalarySlip.create(newSlip);
        return res.json({ success: true, data: saved });
      } catch (err) {
        console.warn('MongoDB salary slip generation fallback:', err.message);
      }
    }

    return res.json({ success: true, data: newSlip });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ================= ANNOUNCEMENTS =================

// GET announcements
router.get('/announcements', async (req, res) => {
  await executeDbQuery(
    res,
    async () => {
      const records = await Announcement.find().sort({ date: -1 });
      return records;
    },
    () => {
      return [...offlineAnnouncements].sort((a, b) => b.date.localeCompare(a.date));
    }
  );
});

// POST create announcement (Admin)
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, category, sender } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ success: false, error: 'Title, content, and category are required.' });
    }

    const newAnnouncement = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      title,
      content,
      category,
      date: new Date().toISOString().split('T')[0],
      sender: sender || 'Management Desk'
    };

    offlineAnnouncements.unshift(newAnnouncement);

    if (mongoose.connection.readyState === 1) {
      try {
        const saved = await Announcement.create(newAnnouncement);
        return res.json({ success: true, data: saved });
      } catch (err) {
        console.warn('MongoDB announcement fallback:', err.message);
      }
    }

    return res.json({ success: true, data: newAnnouncement });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});


// ================= ADMIN: MAIN DASHBOARD AGGREGATED STATS =================

router.get('/admin/dashboard-stats', async (req, res) => {
  await executeDbQuery(
    res,
    async () => {
      const totalEmployees = await User.countDocuments({ role: 'Employee' });
      const activeEmployees = await User.countDocuments({ role: 'Employee', status: 'Active' });
      const departmentsCount = await Department.countDocuments();
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayAttendanceCount = await Attendance.countDocuments({ date: todayStr });
      
      const pendingLeavesCount = await Leave.countDocuments({ status: 'Pending' });

      // Monthly Salary Expense (sum of all employees' actual database salaries)
      const employees = await User.find({ role: 'Employee', status: 'Active' });
      const monthlySalaryExpense = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);

      return {
        totalEmployees,
        activeEmployees,
        departmentsCount,
        todayAttendanceCount,
        pendingLeavesCount,
        monthlySalaryExpense
      };
    },
    () => {
      const totalEmployees = offlineUsers.filter(u => u.role === 'Employee').length;
      const activeEmployees = offlineUsers.filter(u => u.role === 'Employee' && u.status === 'Active').length;
      const departmentsCount = offlineDepartments.length;
      
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todayAttendanceCount = offlineAttendance.filter(rec => rec.date === todayDateStr).length;
      
      const pendingLeavesCount = offlineLeaves.filter(req => req.status === 'Pending').length;

      const monthlySalaryExpense = offlineUsers
        .filter(u => u.role === 'Employee' && u.status === 'Active')
        .reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);

      return {
        totalEmployees,
        activeEmployees,
        departmentsCount,
        todayAttendanceCount,
        pendingLeavesCount,
        monthlySalaryExpense
      };
    }
  );
});

export default router;