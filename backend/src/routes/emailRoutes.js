import express from 'express';
import { sendUserConfirmationEmail, sendAdminNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Test email endpoint
router.post('/test', async (req, res) => {
  try {
    const { email, quizTitle, responseData } = req.body;
    
    // Create mock response object
    const mockResponse = {
      _id: 'test-' + Date.now(),
      createdAt: new Date(),
      answers: responseData?.answers || [],
      contactInfo: responseData?.contactInfo || {}
    };

    await sendUserConfirmationEmail(email, quizTitle, mockResponse);
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
