import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const SalarySlipSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: String, required: true },
  paymentDate: { type: String, required: true },
  basic: { type: Number, required: true },
  allowances: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  status: { type: String, default: 'Paid' }
}, { timestamps: true });

export default mongoose.models.SalarySlip || mongoose.model('SalarySlip', SalarySlipSchema);
