import express from 'express';
import * as responseController from '../controllers/responseController.js';

const router = express.Router();

// Public route - submit response
router.post('/', responseController.submitResponse);

// Admin routes
router.get('/', responseController.getAllResponses);
router.get('/quiz/:quizId', responseController.getQuizResponses);
router.get('/stats/:quizId', responseController.getResponseStats);
router.get('/:id', responseController.getResponseById);
router.delete('/:id', responseController.deleteResponse);

export default router;
