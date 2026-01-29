const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const quizApi = {
  // Get all quizzes
  getAllQuizzes: async () => {
    const res = await fetch(`${API_BASE}/quizzes/`);
    return res.json();
  },

  // Get quiz by ID
  getQuizById: async (id) => {
    const res = await fetch(`${API_BASE}/quizzes/admin/${id}`);
    return res.json();
  },

  // Create quiz
  createQuiz: async (quizData) => {
    const res = await fetch(`${API_BASE}/quizzes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });
    return res.json();
  },

  // Update quiz
  updateQuiz: async (id, quizData) => {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });
    return res.json();
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Get quiz responses
  getQuizResponses: async (quizId) => {
    const res = await fetch(`${API_BASE}/responses/quiz/${quizId}`);
    return res.json();
  },

  // Get response by ID
  getResponseById: async (id) => {
    const res = await fetch(`${API_BASE}/responses/${id}`);
    return res.json();
  },

  // Delete response
  deleteResponse: async (id) => {
    const res = await fetch(`${API_BASE}/responses/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

export default quizApi;
