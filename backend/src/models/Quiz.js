import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'scale', 'date', 'email']
  },
  question: { type: String, required: true },
  description: { type: String, default: '' },
  required: { type: Boolean, default: false },
  options: [{ type: String }], // For radio, checkbox, select
  minLength: { type: Number, default: 0 },
  maxLength: { type: Number, default: 0 },
  minValue: { type: Number, default: 0 },
  maxValue: { type: Number, default: 10 },
  scaleLabels: {
    left: { type: String, default: '' },
    right: { type: String, default: '' }
  },
  order: { type: Number, default: 0 }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  questions: [questionSchema],
  settings: {
    showProgressBar: { type: Boolean, default: true },
    allowAnonymous: { type: Boolean, default: true },
    sendConfirmationEmail: { type: Boolean, default: true },
    requireContactInfo: { type: Boolean, default: false },
    contactFields: [{
      type: String,
      enum: ['name', 'email', 'phone', 'company']
    }]
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

quizSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Quiz', quizSchema);
