import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile as apiUpdateUserProfile,
  uploadUserDocument,
  deleteUserDocument,
  checkIn as apiCheckIn,
  checkOut as apiCheckOut,
  getAttendance,
  getLeaves,
  submitLeaveRequest as apiSubmitLeaveRequest,
  getSalarySlips,
  getAnnouncements
} from '../api/api';

const AppContext = createContext(undefined);

const initialUser = null;

const initialAttendance = [];

const initialLeaves = [];

const initialSalarySlips = [];

const initialAnnouncements = [];


export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('ems_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          // If the saved user is the default template user, upgrade immediately
          if (parsed.name === 'Employee User' || parsed.name === 'Jane Doe') {
            sessionStorage.setItem('ems_user', JSON.stringify(initialUser));
            return initialUser;
          }
          return parsed;
        }
      } catch (e) {
        console.warn('Error parsing saved ems_user:', e);
      }
    }
    return initialUser;
  });

  const [attendance, setAttendance] = useState(() => {
    const saved = sessionStorage.getItem('ems_attendance');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 0) {
        sessionStorage.setItem('ems_attendance', JSON.stringify(initialAttendance));
        return initialAttendance;
      }
      return parsed;
    }
    return initialAttendance;
  });

  const [leaves, setLeaves] = useState(() => {
    const saved = sessionStorage.getItem('ems_leaves');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 0) {
        sessionStorage.setItem('ems_leaves', JSON.stringify(initialLeaves));
        return initialLeaves;
      }
      return parsed;
    }
    return initialLeaves;
  });

  const [salarySlips, setSalarySlips] = useState(() => {
    const saved = sessionStorage.getItem('ems_salary_slips');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 0) {
        sessionStorage.setItem('ems_salary_slips', JSON.stringify(initialSalarySlips));
        return initialSalarySlips;
      }
      return parsed;
    }
    const defaultSlips = initialSalarySlips;
    sessionStorage.setItem('ems_salary_slips', JSON.stringify(defaultSlips));
    return defaultSlips;
  });

  const [announcements, setAnnouncements] = useState(() => {
    const saved = sessionStorage.getItem('ems_announcements');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length === 0) {
        sessionStorage.setItem('ems_announcements', JSON.stringify(initialAnnouncements));
        return initialAnnouncements;
      }
      return parsed;
    }
    const defaultAnnouncements = initialAnnouncements;
    sessionStorage.setItem('ems_announcements', JSON.stringify(defaultAnnouncements));
    return defaultAnnouncements;
  });

  const [checkInStatus, setCheckInStatus] = useState(() => {
    const saved = sessionStorage.getItem('ems_check_in_status');
    return saved ? JSON.parse(saved) : { checkedIn: false, lastCheckInTime: null, lastRecordId: null };
  });

  const [roleView, setRoleView] = useState(() => {
    const saved = sessionStorage.getItem('ems_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) {
          return parsed.role;
        }
      } catch (e) {
        console.warn('Error parsing saved roleView ems_user:', e);
      }
    }
    return 'Employee';
  });

  // Sync data with Backend on mount and poll every 5 seconds for real-time updates
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const savedUserStr = sessionStorage.getItem('ems_user');
        if (!savedUserStr) return;
        const savedUser = JSON.parse(savedUserStr);
        if (!savedUser) return;
        const email = savedUser.email;
        const userId = savedUser.id;
        const isAdmin = savedUser.role === 'Admin';

        const userData = await getUserProfile(email);
        if (userData.success) {
          const userObj = userData.data;
          setUser(userObj);
          sessionStorage.setItem('ems_user', JSON.stringify(userObj));
          
          const attData = await getAttendance(isAdmin ? { all: true } : { userId });
          if (attData.success) setAttendance(attData.data);

          const leavesData = await getLeaves(isAdmin ? { all: true } : { userId });
          if (leavesData.success) setLeaves(leavesData.data);

          const slipsData = await getSalarySlips(isAdmin ? { all: true } : { userId });
          if (slipsData.success) setSalarySlips(slipsData.data);

          const annData = await getAnnouncements();
          if (annData.success) setAnnouncements(annData.data);
        }
      } catch (err) {
        console.warn('Backend server not connected or running in fallback mode:', err);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    sessionStorage.setItem('ems_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem('ems_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    sessionStorage.setItem('ems_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    sessionStorage.setItem('ems_check_in_status', JSON.stringify(checkInStatus));
  }, [checkInStatus]);

  const updateUserProfile = async (updatedFields) => {
    try {
      const data = await apiUpdateUserProfile(updatedFields);
      if (data.success) {
        setUser(data.data);
        return;
      }
    } catch (e) {
      console.log('Using local fallback for profile update:', e);
    }
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  const uploadDocument = async (name, size) => {
    const newDoc = {
      id: `DOC-${Date.now()}`,
      name,
      size,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    try {
      const data = await uploadUserDocument(name, size);
      if (data.success) {
        setUser(data.data);
        return;
      }
    } catch (e) {
      console.log('Upload Document: Falling back to local storage', e);
    }

    setUser(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const deleteDocument = async (id) => {
    try {
      const data = await deleteUserDocument(id);
      if (data.success) {
        setUser(data.data);
        return;
      }
    } catch (e) {
      console.log('Delete Document: Falling back to local storage', e);
    }

    setUser(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== id)
    }));
  };

  const handleCheckIn = async () => {
    const now = new Date();
    const checkInTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayDateStr = now.toISOString().split('T')[0];

    const hour = now.getHours();
    const minutes = now.getMinutes();
    let status = 'On Time';
    if (hour > 9 || (hour === 9 && minutes > 0)) {
      status = 'Late';
    }

    const currentUserId = user?.id || 'EMP-TEMP';
    const newRecordId = `ATT-${Date.now()}`;
    const newRecord = {
      id: newRecordId,
      userId: currentUserId,
      date: todayDateStr,
      checkIn: checkInTimeStr,
      checkOut: null,
      status,
      hoursWorked: null
    };

    try {
      const data = await apiCheckIn(currentUserId);
      if (data.success) {
        setAttendance(prev => [data.data, ...prev]);
        setCheckInStatus({
          checkedIn: true,
          lastCheckInTime: data.data.checkIn,
          lastRecordId: data.data.id
        });
        return;
      }
    } catch (e) {
      console.log('Check-In: Falling back to local storage', e);
    }

    setAttendance(prev => [newRecord, ...prev]);
    setCheckInStatus({
      checkedIn: true,
      lastCheckInTime: checkInTimeStr,
      lastRecordId: newRecordId
    });
  };

  const handleCheckOut = async () => {
    if (!checkInStatus.checkedIn || !checkInStatus.lastRecordId) return;

    const now = new Date();
    const checkOutTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const currentUserId = user?.id || 'EMP-TEMP';
      const data = await apiCheckOut(checkInStatus.lastRecordId, currentUserId);
      if (data.success) {
        setAttendance(prev => prev.map(rec => rec.id === checkInStatus.lastRecordId ? data.data : rec));
        setCheckInStatus({
          checkedIn: false,
          lastCheckInTime: null,
          lastRecordId: null
        });
        return;
      }
    } catch (e) {
      console.log('Check-Out: Falling back to local storage', e);
    }

    setAttendance(prev => prev.map(rec => {
      if (rec.id === checkInStatus.lastRecordId) {
        let hoursText = '9.0 hrs';
        if (rec.checkIn) {
          try {
            const [timeVal, period] = rec.checkIn.split(' ');
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
        return {
          ...rec,
          checkOut: checkOutTimeStr,
          hoursWorked: hoursText
        };
      }
      return rec;
    }));

    setCheckInStatus({
      checkedIn: false,
      lastCheckInTime: null,
      lastRecordId: null
    });
  };

  const submitLeaveRequest = async (type, startDate, endDate, reason) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
      id: `LR-${Date.now().toString().slice(-4)}`,
      type,
      startDate,
      endDate,
      totalDays: isNaN(totalDays) ? 1 : totalDays,
      reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const currentUserId = user?.id || 'EMP-TEMP';
      const data = await apiSubmitLeaveRequest(type, startDate, endDate, reason, currentUserId);
      if (data.success) {
        setLeaves(prev => [data.data, ...prev]);
        return;
      }
    } catch (e) {
      console.log('Leave Request: Falling back to local storage', e);
    }

    setLeaves(prev => [newRequest, ...prev]);
  };

  const logout = () => {
    localStorage.removeItem('ems_authenticated');
    localStorage.removeItem('ems_user');
    sessionStorage.removeItem('ems_authenticated');
    sessionStorage.removeItem('ems_user');
  };

  return (
    <AppContext.Provider value={{
      user,
      attendance,
      leaves,
      salarySlips,
      announcements,
      checkInStatus,
      updateUserProfile,
      uploadDocument,
      deleteDocument,
      handleCheckIn,
      handleCheckOut,
      submitLeaveRequest,
      logout,
      roleView,
      setRoleView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};