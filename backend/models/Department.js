import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  manager: { type: String, default: 'Not Assigned' },
  employeeCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Department || mongoose.model('Department', DepartmentSchema);
