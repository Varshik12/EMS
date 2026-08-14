import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  date: { type: String, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, default: null },
  status: { type: String, default: 'On Time' },
  hoursWorked: { type: String, default: null }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
