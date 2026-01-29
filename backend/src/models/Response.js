import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, required: true },
  type: { type: String, required: true }
}, { _id: false });

const responseSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  quizSlug: { type: String, required: true },
  answers: [answerSchema],
  contactInfo: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    company: { type: String }
  },
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    submittedAt: { type: Date, default: Date.now }
  },
  adminNotified: { type: Boolean, default: false },
  userEmailSent: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Response', responseSchema);
