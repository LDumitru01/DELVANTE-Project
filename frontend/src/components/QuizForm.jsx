import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function QuizForm({ slug }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [contactInfo, setContactInfo] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [slug]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quizzes/slug/${slug}`);
      if (!res.ok) {
        throw new Error('Quiz not found');
      }
      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, option) => {
    setAnswers(prev => {
      const current = prev[questionId] || [];
      if (current.includes(option)) {
        return { ...prev, [questionId]: current.filter(o => o !== option) };
      } else {
        return { ...prev, [questionId]: [...current, option] };
      }
    });
  };

  const handleContactChange = (field, value) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCurrentStep = () => {
    const question = quiz.questions[currentStep];
    const answer = answers[question.id];
    
    if (question.required) {
      if (question.type === 'checkbox') {
        return answer && answer.length > 0;
      }
      return answer && answer.trim() !== '';
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      alert('Please answer this question before continuing.');
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    // Validate contact info if required
    if (quiz.settings.requireContactInfo) {
      const requiredFields = quiz.settings.contactFields || [];
      for (const field of requiredFields) {
        if (!contactInfo[field] || contactInfo[field].trim() === '') {
          alert(`Please fill in your ${field}.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
        const question = quiz.questions.find(q => q.id === questionId);
        return {
          questionId,
          type: question?.type || 'text',
          answer
        };
      });

      const res = await fetch(`${API_BASE}/responses/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: formattedAnswers,
          contactInfo
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit response');
      }

      setCompleted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question.id] || '';
    const isActive = index === currentStep;

    if (!isActive) return null;

    return (
      <div key={question.id} className="question-container">
        <div className="question-text">
          <span className="question-number">{currentStep + 1}.</span>
          {question.question}
          {question.required && <span className="required">*</span>}
        </div>
        
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}

        <div className="answer-field">
          {question.type === 'text' && (
            <input
              type="text"
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer..."
            />
          )}

          {question.type === 'textarea' && (
            <textarea
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Your answer..."
              rows={4}
            />
          )}

          {question.type === 'email' && (
            <input
              type="email"
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="your@email.com"
            />
          )}

          {question.type === 'date' && (
            <input
              type="date"
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            />
          )}

          {question.type === 'radio' && (
            <div className="radio-group">
              {question.options.map((option, i) => (
                <label key={i} className="radio-option">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === 'checkbox' && (
            <div className="checkbox-group">
              {question.options.map((option, i) => (
                <label key={i} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={(answer || []).includes(option)}
                    onChange={() => handleCheckboxChange(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          )}

          {question.type === 'select' && (
            <select
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            >
              <option value="">Select an option...</option>
              {question.options.map((option, i) => (
                <option key={i} value={option}>{option}</option>
              ))}
            </select>
          )}

          {question.type === 'scale' && (
            <div className="scale-container">
              <div className="scale-labels">
                <span>{question.scaleLabels?.left || '1'}</span>
                <span>{question.scaleLabels?.right || '10'}</span>
              </div>
              <div className="scale-options">
                {[...Array(10)].map((_, i) => (
                  <label key={i} className={`scale-option ${answer === String(i + 1) ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={question.id}
                      value={i + 1}
                      checked={answer === String(i + 1)}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                    <span>{i + 1}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContactForm = () => {
    if (!quiz.settings.requireContactInfo) return null;

    const fields = quiz.settings.contactFields || [];

    return (
      <div className="contact-form">
        <h3>Contact Information</h3>
        <p>Please provide your contact details so we can get in touch with you.</p>
        
        {fields.includes('name') && (
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={contactInfo.name || ''}
              onChange={(e) => handleContactChange('name', e.target.value)}
              placeholder="Your name"
            />
          </div>
        )}

        {fields.includes('email') && (
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={contactInfo.email || ''}
              onChange={(e) => handleContactChange('email', e.target.value)}
              placeholder="your@email.com"
            />
          </div>
        )}

        {fields.includes('phone') && (
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={contactInfo.phone || ''}
              onChange={(e) => handleContactChange('phone', e.target.value)}
              placeholder="Your phone number"
            />
          </div>
        )}

        {fields.includes('company') && (
          <div className="form-group">
            <label>Company</label>
            <input
              type="text"
              value={contactInfo.company || ''}
              onChange={(e) => handleContactChange('company', e.target.value)}
              placeholder="Your company"
            />
          </div>
        )}
      </div>
    );
  };

  const renderCompletion = () => (
    <div className="completion-screen">
      <div className="completion-icon">✓</div>
      <h2>Thank You!</h2>
      <p>Your response has been submitted successfully.</p>
      {quiz.settings.sendConfirmationEmail && contactInfo.email && (
        <p>A confirmation email has been sent to {contactInfo.email}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">Loading quiz...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error-message">
          <h2>Quiz Not Found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="quiz-container">
        <div className="quiz-content">
          {renderCompletion()}
        </div>
      </div>
    );
  }

  const questions = quiz?.questions || [];
  const isLastQuestion = currentStep === questions.length;
  const progress = ((currentStep + (isLastQuestion ? 1 : 0)) / (questions.length + 1)) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <div className="quiz-header">
          <h1>{quiz.title}</h1>
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
        </div>

        {quiz.settings.showProgressBar && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <div className="quiz-body">
          {!isLastQuestion ? (
            renderQuestion(questions[currentStep], currentStep)
          ) : (
            renderContactForm()
          )}

          <div className="quiz-navigation">
            {currentStep > 0 && (
              <button className="btn-nav btn-prev" onClick={handlePrev}>
                Previous
              </button>
            )}
            
            {!isLastQuestion ? (
              <button className="btn-nav btn-next" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button 
                className="btn-nav btn-submit" 
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizForm;
