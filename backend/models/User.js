import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DocumentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  size: { type: String, required: true },
  uploadDate: { type: String, required: true }
}, { _id: false });

const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150' },
  role: { type: String, default: 'Employee' },
  password: { type: String, default: 'password' },
  department: { type: String, default: 'IT & Engineering' },
  designation: { type: String, default: 'MERN Stack Developer' },
  joiningDate: { type: String, default: 'June 01, 2026' },
  contact: { type: String, default: '' },
  address: { type: String, default: '' },
  gender: { type: String, default: 'Male' },
  dob: { type: String, default: '1998-01-01' },
  salary: { type: Number, default: 50000 },
  bloodGroup: { type: String, default: 'O+' },
  emergencyContact: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  documents: [DocumentSchema]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
