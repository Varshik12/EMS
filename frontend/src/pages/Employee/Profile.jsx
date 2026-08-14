import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Briefcase,
  Calendar,
  Phone,
  MapPin,
  Mail,
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCode,
  Globe,
  Settings,
  Edit2
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUserProfile, uploadDocument, deleteDocument } = useApp();
  
  // Edit Form States
  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState(user.contact || '');
  const [address, setAddress] = useState(user.address || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setContact(user.contact || '');
    setAddress(user.address || '');
  }, [user]);

  // Document Upload States
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUserProfile({ contact, address });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setUploadMessage(`Ready to upload: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
  };

  const executeUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    setTimeout(() => {
      const mockSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
      uploadDocument(selectedFile.name, mockSizeStr);
      setIsUploading(false);
      setSelectedFile(null);
      setUploadMessage('Document uploaded and synchronized successfully!');
      setTimeout(() => setUploadMessage(''), 3000);
    }, 1200);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const avatars = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
  ];

  const selectAvatar = (url) => {
    updateUserProfile({ avatar: url });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:text-2xl">My Corporate Profile</h1>
          <p className="text-xs text-slate-400 font-medium">Verify employee records, update credentials, and manage identity verification documents.</p>
        </div>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>Profile contact settings have been successfully updated.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar & Quick Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
          <div className="relative group">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-28 w-28 rounded-full border-4 border-indigo-50 object-cover shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition duration-150 flex items-center justify-center text-white text-[10px] font-bold uppercase cursor-pointer">
              Active Face ID
            </div>
          </div>

          <h2 className="mt-4 text-base font-bold text-slate-800">{user.name}</h2>
          <span className="text-xs text-slate-500 font-medium">{user.designation}</span>
          
          <div className="mt-3 flex items-center gap-1.5 rounded-md bg-indigo-50/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            {user.id}
          </div>

          {/* Avatar choice */}
          <div className="mt-6 border-t border-slate-100 w-full pt-4 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Avatar</p>
            <div className="mt-2.5 flex justify-center gap-2">
              {avatars.map((url, index) => (
                <button
                  key={index}
                  onClick={() => selectAvatar(url)}
                  className={`h-9 w-9 rounded-full overflow-hidden border transition ${user.avatar === url ? 'ring-2 ring-indigo-500 border-white scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt="Face choice" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats list */}
          <div className="mt-6 border-t border-slate-100 w-full pt-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Department</span>
              <span className="font-bold text-slate-800">{user.department}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Official Email</span>
              <span className="font-mono text-slate-800 font-semibold">{user.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Role Privilege</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide text-[10px] uppercase">{user.role}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Detailed Work Metrics & Edit Fields */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Briefcase className="h-4.5 w-4.5 text-indigo-600" />
              Employment Details
            </h3>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditing ? 'Cancel Edit' : 'Edit Contact'}
            </button>
          </div>

          {/* Static Details / Edit Form */}
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name (Read-only)</label>
                  <input
                    type="text"
                    value={user.name}
                    disabled
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Designation (Read-only)</label>
                  <input
                    type="text"
                    value={user.designation}
                    disabled
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date (Read-only)</label>
                  <input
                    type="text"
                    value={user.joiningDate}
                    disabled
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="+1 (555) 000-0000"
                    className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Residential Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter full address"
                  className="mt-1.5 w-full rounded-lg border border-slate-250 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Joining Date</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{user.joiningDate || 'Not set'}</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{user.contact || 'No contact provided'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                    <span className="text-xs font-mono font-semibold text-slate-800 mt-0.5 block">{user.email || 'Not set'}</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Residential Address</span>
                    <span className="text-xs font-semibold text-slate-700 mt-0.5 block leading-relaxed">{user.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Block */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="h-4.5 w-4.5 text-indigo-600" />
              Identity & Employment Documents ({user.documents ? user.documents.length : 0})
            </h3>

            {/* Document list */}
            <div className="space-y-2 mb-4">
              {user.documents && user.documents.length > 0 ? (
                user.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-150 p-3 hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 font-mono mt-0.5">Size: {doc.size} | Uploaded: {doc.uploadDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => alert(`Simulating file download for ${doc.name}`)}
                        className="rounded p-1 text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="rounded p-1 text-slate-400 hover:text-red-500 transition"
                        title="Remove Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                  <FileText className="h-8 w-8 mx-auto text-slate-300 animate-bounce" />
                  <p className="mt-2 text-xs font-semibold">No verification documents yet</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Upload a passport, utility bill, or certificate below to begin verification.</p>
                </div>
              )}
            </div>

            {/* Drag & Drop File Upload */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${dragActive ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200 hover:bg-slate-50/50'}`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs font-bold text-slate-700">Drag & Drop file to upload, or <span className="text-indigo-600 hover:underline">browse files</span></p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Acceptable formats: PDF, DOC, JPG, PNG (Max 10MB)</p>
            </div>

            {uploadMessage && (
              <div className="mt-3 rounded-lg bg-indigo-50 p-3 text-[11px] font-semibold text-indigo-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  {uploadMessage}
                </span>
                {selectedFile && !isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      executeUpload();
                    }}
                    className="rounded bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-indigo-700 transition"
                  >
                    Confirm Upload
                  </button>
                )}
                {isUploading && <span className="animate-pulse">Processing upload...</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
