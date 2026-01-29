import express from 'express';
import * as quizController from '../controllers/quizController.js';

const router = express.Router();

// Public routes
router.get('/', quizController.getAllQuizzes);
router.get('/slug/:slug', quizController.getQuizBySlug);

// Admin routes
router.get('/admin/all', quizController.getAllQuizzesAdmin);
router.get('/admin/:id', quizController.getQuizById);
router.post('/', quizController.createQuiz);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);

export default router;
