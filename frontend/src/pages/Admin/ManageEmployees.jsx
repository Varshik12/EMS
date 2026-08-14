import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, ShieldAlert,
  Check, X, Eye, Briefcase, Mail, Phone, Calendar, IndianRupee
} from 'lucide-react';
import { getEmployees, getDepartments, createEmployee, updateEmployee, deleteEmployee } from '../../api/api';

export const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    contact: '',
    gender: 'Male',
    dob: '',
    address: '',
    department: 'IT & Engineering',
    designation: '',
    joiningDate: '',
    salary: 50000,
    bloodGroup: 'O+',
    emergencyContact: '',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      if (data.success) {
        setEmployees(data.data);
      }

      const deptData = await getDepartments();
      if (deptData.success) {
        setDepartments(deptData.data);
      }
    } catch (e) {
      console.warn('Fallback loading employees:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' ? Number(value) : value
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await createEmployee(formData);
      if (data.success) {
        setEmployees(prev => [data.data, ...prev]);
        setShowAddModal(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to add employee.');
      }
    } catch (err) {
      alert('Error creating employee. Using database.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await updateEmployee(formData.id, formData);
      if (data.success) {
        setEmployees(prev => prev.map(emp => emp.id === formData.id ? data.data : emp));
        setShowEditModal(false);
        resetForm();
      } else {
        alert(data.error || 'Failed to edit employee.');
      }
    } catch (err) {
      alert('Error updating employee.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to remove this employee from your directory? This action is irreversible.')) return;
    try {
      const data = await deleteEmployee(id);
      if (data.success) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
      } else {
        alert('Failed to delete.');
      }
    } catch (err) {
      alert('Error deleting employee.');
    }
  };

  const toggleStatus = async (emp) => {
    const newStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const data = await updateEmployee(emp.id, { status: newStatus });
      if (data.success) {
        setEmployees(prev => prev.map(item => item.id === emp.id ? data.data : item));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      contact: '',
      gender: 'Male',
      dob: '',
      address: '',
      department: departments[0]?.name || 'IT & Engineering',
      designation: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 50000,
      bloodGroup: 'O+',
      emergencyContact: '',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'
    });
  };

  const openEdit = (emp) => {
    setSelectedEmp(emp);
    setFormData({ ...emp });
    setShowEditModal(true);
  };

  const openDetail = (emp) => {
    setSelectedEmp(emp);
    setShowDetailModal(true);
  };

  // Filter Logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.email.toLowerCase().includes(search.toLowerCase()) || 
                          emp.id.toLowerCase().includes(search.toLowerCase()) ||
                          emp.designation.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Employee Directory</h1>
          <p className="text-sm font-semibold text-slate-500">
            Monitor, onboard, and edit corporate employee rosters.
          </p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="h-4.5 w-4.5" />
          Onboard Employee
        </button>
      </div>

      {/* Filters Area */}
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
        {/* Search */}
        <div className="relative col-span-1 sm:col-span-2">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, email or role..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dept Filter */}
        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Employee Grid/Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-4.5 px-6">Employee</th>
                  <th className="py-4.5 px-6">ID</th>
                  <th className="py-4.5 px-6">Department & Role</th>
                  <th className="py-4.5 px-6">Joining Date</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      No corporate records match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <img 
                          src={emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'} 
                          alt={emp.name}
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{emp.name}</p>
                          <p className="text-[10px] text-slate-400">{emp.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">{emp.id}</td>
                      <td className="py-4 px-6">
                        <p className="text-slate-900">{emp.designation}</p>
                        <p className="text-[10px] text-slate-400">{emp.department}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{emp.joiningDate}</td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => toggleStatus(emp)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                            emp.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          {emp.status}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1">
                        <button 
                          onClick={() => openDetail(emp)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openEdit(emp)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(emp.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Onboard Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                Onboard New Employee
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employee ID</label>
                  <input 
                    type="text" required name="id" value={formData.id} onChange={handleInputChange}
                    placeholder="e.g. EMP-1052"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input 
                    type="text" required name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="e.g. Varshik Pal"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input 
                    type="email" required name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="email@company.com"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contact Number</label>
                  <input 
                    type="text" name="contact" value={formData.contact} onChange={handleInputChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gender</label>
                  <select 
                    name="gender" value={formData.gender} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date of Birth</label>
                  <input 
                    type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department</label>
                  <select 
                    name="department" value={formData.department} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Designation</label>
                  <input 
                    type="text" required name="designation" value={formData.designation} onChange={handleInputChange}
                    placeholder="e.g. MERN Stack Developer"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Joining Date</label>
                  <input 
                    type="date" required name="joiningDate" value={formData.joiningDate} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Monthly Base Salary (INR)</label>
                  <input 
                    type="number" required name="salary" value={formData.salary} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Blood Group</label>
                  <input 
                    type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                    placeholder="e.g. O+"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Emergency Contact No.</label>
                  <input 
                    type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                    placeholder="Emergency phone"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Permanent Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleInputChange}
                  rows="2" placeholder="Full residential details..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Confirm Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-amber-600" />
                Edit Employee Details
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employee ID (Read Only)</label>
                  <input 
                    type="text" disabled name="id" value={formData.id}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                  <input 
                    type="text" required name="name" value={formData.name} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <input 
                    type="email" required name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contact Number</label>
                  <input 
                    type="text" name="contact" value={formData.contact} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Gender</label>
                  <select 
                    name="gender" value={formData.gender} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date of Birth</label>
                  <input 
                    type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department</label>
                  <select 
                    name="department" value={formData.department} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Designation</label>
                  <input 
                    type="text" required name="designation" value={formData.designation} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Joining Date</label>
                  <input 
                    type="date" required name="joiningDate" value={formData.joiningDate} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Monthly Base Salary (INR)</label>
                  <input 
                    type="number" required name="salary" value={formData.salary} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Blood Group</label>
                  <input 
                    type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Emergency Contact No.</label>
                  <input 
                    type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Permanent Address</label>
                <textarea 
                  name="address" value={formData.address} onChange={handleInputChange}
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetailModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Employee Profile Details
              </h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header profile */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <img 
                  src={selectedEmp.avatar} 
                  alt={selectedEmp.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-indigo-100 shadow-sm"
                />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedEmp.name}</h4>
                  <p className="text-xs font-semibold text-indigo-600">{selectedEmp.designation}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{selectedEmp.department}</p>
                </div>
              </div>

              {/* Data fields Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Employee ID</p>
                  <p className="font-mono text-slate-800">{selectedEmp.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Corporate Email</p>
                  <p className="text-slate-800 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedEmp.email}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Contact Phone</p>
                  <p className="text-slate-800 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {selectedEmp.contact || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Gender & DOB</p>
                  <p className="text-slate-800">{selectedEmp.gender} | {selectedEmp.dob || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Joining Date</p>
                  <p className="text-slate-800 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {selectedEmp.joiningDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Monthly Salary</p>
                  <p className="text-slate-800 font-bold flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-400" /> {selectedEmp.salary ? selectedEmp.salary.toLocaleString('en-IN') : '50,000'} / month
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Medical Details (Blood Group)</p>
                  <p className="text-slate-800 font-bold">{selectedEmp.bloodGroup || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Emergency Contact No.</p>
                  <p className="text-slate-800">{selectedEmp.emergencyContact || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-slate-100 pt-4 text-xs">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Permanent Address</p>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{selectedEmp.address || 'No residential address documented.'}</p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 shadow-md"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
