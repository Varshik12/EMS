import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit2, Trash2, X, Users, Award, Check } from 'lucide-react';
import { getDepartments, getEmployees, createDepartment, updateDepartment, deleteDepartment } from '../../api/api';

export const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    manager: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      if (data.success) {
        setDepartments(data.data);
      }

      const empData = await getEmployees();
      if (empData.success) {
        setEmployees(empData.data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const data = await createDepartment(formData);
      if (data.success) {
        setDepartments(prev => [...prev, data.data]);
        setShowAddModal(false);
        setFormData({ name: '', manager: '' });
      } else {
        alert(data.error || 'Failed to create department.');
      }
    } catch (err) {
      alert('Error creating department.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    try {
      const data = await updateDepartment(selectedDept.id, formData);
      if (data.success) {
        setDepartments(prev => prev.map(dept => dept.id === selectedDept.id ? data.data : dept));
        setShowEditModal(false);
        setSelectedDept(null);
        setFormData({ name: '', manager: '' });
      } else {
        alert(data.error || 'Failed to update department.');
      }
    } catch (err) {
      alert('Error updating department.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? All employees in this sector will need to be reallocated.')) return;
    try {
      const data = await deleteDepartment(id);
      if (data.success) {
        setDepartments(prev => prev.filter(dept => dept.id !== id));
      } else {
        alert('Failed to delete department.');
      }
    } catch (err) {
      alert('Error deleting department.');
    }
  };

  const openEdit = (dept) => {
    setSelectedDept(dept);
    setFormData({
      name: dept.name,
      manager: dept.manager
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Departments</h1>
          <p className="text-sm font-semibold text-slate-500">
            Organize corporate sectors, assign division managers, and monitor staffing.
          </p>
        </div>
        <button 
          onClick={() => { setFormData({ name: '', manager: '' }); setShowAddModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Department
        </button>
      </div>

      {/* Grid of Department Cards */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></span>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map(dept => (
            <div key={dept.id} className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                  <FolderTree className="h-6 w-6" />
                </div>
                {/* Actions */}
                <div className="flex gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => openEdit(dept)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(dept.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {dept.name}
                </h3>
                <p className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Code: {dept.id}
                </p>
              </div>

              {/* Stats & Manager */}
              <div className="mt-6 border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="flex items-center gap-1 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <Users className="h-3.5 w-3.5" /> Headcount
                  </span>
                  <p className="text-slate-800 text-sm font-bold">
                    {dept.employeeCount || 0} Employees
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="flex items-center gap-1 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <Award className="h-3.5 w-3.5" /> Manager
                  </span>
                  <p className="text-slate-800 truncate" title={dept.manager}>
                    {dept.manager || 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" />
                Add New Department
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Name</label>
                <input 
                  type="text" required name="name" value={formData.name} onChange={handleInputChange}
                  placeholder="e.g. Sales & Marketing"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Manager</label>
                <select 
                  name="manager" value={formData.manager} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Assign a Manager --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation})</option>
                  ))}
                  <option value="Softwallet Admin">Softwallet Admin (Operations Manager)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Confirm Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-amber-600" />
                Edit Department details
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Name</label>
                <input 
                  type="text" required name="name" value={formData.name} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Department Manager</label>
                <select 
                  name="manager" value={formData.manager} onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Assign a Manager --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name} ({emp.designation})</option>
                  ))}
                  <option value="Softwallet Admin">Softwallet Admin (Operations Manager)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
