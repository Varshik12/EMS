import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  sender: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
