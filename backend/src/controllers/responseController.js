import Response from '../models/Response.js';
import Quiz from '../models/Quiz.js';
import { sendUserConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

// Submit response
export const submitResponse = async (req, res) => {
  try {
    const { quizId, answers, contactInfo } = req.body;
    
    // Get quiz to validate and get question text
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Build answers with question text
    const enrichedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      return {
        ...answer,
        questionText: question ? question.question : 'Unknown question'
      };
    });

    // Create response
    const response = new Response({
      quizId,
      quizSlug: quiz.slug,
      answers: enrichedAnswers,
      contactInfo,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    await response.save();

    // Send notifications
    if (quiz.settings.sendConfirmationEmail && contactInfo?.email) {
      await sendUserConfirmationEmail(contactInfo.email, quiz.title, response);
      response.userEmailSent = true;
      await response.save();
    }

    await sendAdminNotificationEmail(quiz.title, response);
    response.adminNotified = true;
    await response.save();

    res.status(201).json({ 
      message: 'Response submitted successfully',
      responseId: response._id 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all responses for a quiz (admin)
export const getQuizResponses = async (req, res) => {
  try {
    const responses = await Response.find({ quizId: req.params.quizId })
      .sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all responses (admin)
export const getAllResponses = async (req, res) => {
  try {
    const responses = await Response.find()
      .select('-answers')
      .sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get response by ID
export const getResponseById = async (req, res) => {
  try {
    const response = await Response.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get response statistics
export const getResponseStats = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const totalResponses = await Response.countDocuments({ quizId });
    const responses = await Response.find({ quizId });
    
    const recentResponses = responses.slice(0, 10);
    
    res.json({
      totalResponses,
      recentResponses
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete response
export const deleteResponse = async (req, res) => {
  try {
    const response = await Response.findByIdAndDelete(req.params.id);
    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }
    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
