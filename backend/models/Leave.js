import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LeaveSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  type: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  totalDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  appliedDate: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
