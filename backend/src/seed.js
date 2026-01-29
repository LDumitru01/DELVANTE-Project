import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quiz from './models/Quiz.js';

dotenv.config();

const sampleQuiz = {
  title: 'Customer Feedback Form',
  description: 'Help us improve our products and services by sharing your feedback.',
  slug: 'feedback-form',
  questions: [
    {
      id: 'q1',
      type: 'scale',
      question: 'How satisfied are you with our overall service?',
      description: 'Rate from 1 (not satisfied) to 10 (very satisfied)',
      required: true,
      scaleLabels: { left: 'Not satisfied', right: 'Very satisfied' }
    },
    {
      id: 'q2',
      type: 'radio',
      question: 'How often do you use our product?',
      required: true,
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time']
    },
    {
      id: 'q3',
      type: 'checkbox',
      question: 'Which features do you use most?',
      required: false,
      options: ['Dashboard', 'Reports', 'Analytics', 'Integrations', 'Mobile App']
    },
    {
      id: 'q4',
      type: 'select',
      question: 'How would you rate the ease of use?',
      required: true,
      options: ['Very Easy', 'Easy', 'Neutral', 'Difficult', 'Very Difficult']
    },
    {
      id: 'q5',
      type: 'textarea',
      question: 'What could we improve?',
      description: 'Share your suggestions for improvement',
      required: false,
      maxLength: 1000
    },
    {
      id: 'q6',
      type: 'text',
      question: 'What is your favorite feature?',
      required: false
    }
  ],
  settings: {
    showProgressBar: true,
    allowAnonymous: true,
    sendConfirmationEmail: true,
    requireContactInfo: true,
    contactFields: ['name', 'email', 'company']
  }
};

const seedDatabase = async () => {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz_db';

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if quiz already exists
    const existing = await Quiz.findOne({ slug: sampleQuiz.slug });
    if (existing) {
      console.log('Sample quiz already exists');
      process.exit(0);
    }

    // Create sample quiz
    const quiz = new Quiz(sampleQuiz);
    await quiz.save();
    console.log('Sample quiz created successfully!');
    console.log(`Quiz URL: http://localhost:5173/?quiz=${sampleQuiz.slug}`);
    console.log(`Admin URL: http://localhost:5174/`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
