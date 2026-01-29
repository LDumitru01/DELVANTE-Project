import { useState, useEffect } from 'react';
import quizApi from './services/api';
import './App.css';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const [view, setView] = useState('list'); // list, create, edit, responses
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slug: '',
    questions: [],
    settings: {
      showProgressBar: true,
      allowAnonymous: true,
      sendConfirmationEmail: true,
      requireContactInfo: false,
      contactFields: ['name', 'email']
    }
  });

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizApi.getAllQuizzesAdmin();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async (quizId) => {
    setLoading(true);
    try {
      const data = await quizApi.getQuizResponses(quizId);
      setResponses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('settings.')) {
      const settingKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: { ...prev.settings, [settingKey]: type === 'checkbox' ? checked : value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          id: generateId(),
          type: 'text',
          question: '',
          description: '',
          required: false,
          options: [],
          order: prev.questions.length
        }
      ]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const removeQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    }));
  };

  const addOption = (questionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, options: [...q.options, ''] } : q
      )
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) };
        }
        return q;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentQuiz) {
        await quizApi.updateQuiz(currentQuiz._id, formData);
      } else {
        await quizApi.createQuiz(formData);
      }
      setView('list');
      loadQuizzes();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (quiz) => {
    setFormData({
      title: quiz.title,
      description: quiz.description,
      slug: quiz.slug,
      questions: quiz.questions,
      settings: quiz.settings
    });
    setCurrentQuiz(quiz);
    setView('create');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizApi.deleteQuiz(id);
        loadQuizzes();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleViewResponses = (quiz) => {
    setCurrentQuiz(quiz);
    loadResponses(quiz._id);
    setView('responses');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      slug: '',
      questions: [],
      settings: {
        showProgressBar: true,
        allowAnonymous: true,
        sendConfirmationEmail: true,
        requireContactInfo: false,
        contactFields: ['name', 'email']
      }
    });
    setCurrentQuiz(null);
  };

  const renderQuestionEditor = () => (
    <div className="question-editor">
      {formData.questions.map((question, qIndex) => (
        <div key={question.id} className="question-card">
          <div className="question-header">
            <span>Question {qIndex + 1}</span>
            <button 
              type="button" 
              className="btn-remove"
              onClick={() => removeQuestion(qIndex)}
            >
              Remove
            </button>
          </div>
          
          <div className="form-group">
            <label>Question Text *</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
              placeholder="Enter your question"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Question Type</label>
              <select
                value={question.type}
                onChange={(e) => updateQuestion(qIndex, 'type', e.target.value)}
              >
                <option value="text">Short Text</option>
                <option value="textarea">Long Text</option>
                <option value="radio">Single Choice (Radio)</option>
                <option value="checkbox">Multiple Choice (Checkbox)</option>
                <option value="select">Dropdown</option>
                <option value="scale">Rating Scale</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label>Required</label>
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(qIndex, 'required', e.target.checked)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (optional)</label>
            <input
              type="text"
              value={question.description}
              onChange={(e) => updateQuestion(qIndex, 'description', e.target.value)}
              placeholder="Additional context for the question"
            />
          </div>

          {/* Options for multiple choice questions */}
          {['radio', 'checkbox', 'select'].includes(question.type) && (
            <div className="options-section">
              <label>Options</label>
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="option-row">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateQuestionOption(qIndex, oIndex, e.target.value)}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeOption(qIndex, oIndex)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add-option"
                onClick={() => addOption(qIndex)}
              >
                + Add Option
              </button>
            </div>
          )}

          {/* Scale configuration */}
          {question.type === 'scale' && (
            <div className="form-row">
              <div className="form-group">
                <label>Left Label</label>
                <input
                  type="text"
                  value={question.scaleLabels?.left || ''}
                  onChange={(e) => updateQuestion(qIndex, 'scaleLabels', { 
                    ...question.scaleLabels, 
                    left: e.target.value 
                  })}
                  placeholder="e.g., Not at all"
                />
              </div>
              <div className="form-group">
                <label>Right Label</label>
                <input
                  type="text"
                  value={question.scaleLabels?.right || ''}
                  onChange={(e) => updateQuestion(qIndex, 'scaleLabels', { 
                    ...question.scaleLabels, 
                    right: e.target.value 
                  })}
                  placeholder="e.g., Very much"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <button type="button" className="btn-add-question" onClick={addQuestion}>
        + Add Question
      </button>
    </div>
  );

  const renderQuizList = () => (
    <div className="quiz-list">
      <div className="page-header">
        <h1>Quiz Management</h1>
        <button className="btn-primary" onClick={() => { resetForm(); setView('create'); }}>
          + Create New Quiz
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes created yet. Create your first quiz to get started.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <p className="quiz-slug">/{quiz.slug}</p>
              <p className="quiz-desc">{quiz.description || 'No description'}</p>
              <div className="quiz-meta">
                <span>{quiz.questions?.length || 0} questions</span>
                <span>{quiz.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="quiz-actions">
                <button onClick={() => handleViewResponses(quiz)}>Responses</button>
                <button onClick={() => handleEdit(quiz)}>Edit</button>
                <button className="btn-danger" onClick={() => handleDelete(quiz._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuizForm = () => (
    <div className="quiz-form">
      <div className="page-header">
        <h1>{currentQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h1>
        <button className="btn-secondary" onClick={() => { setView('list'); resetForm(); }}>
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Quiz Details</h2>
          
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the quiz"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>URL Slug *</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="my-quiz"
              required
              pattern="[a-z0-9-]+"
              title="Lowercase letters, numbers, and hyphens only"
            />
            <small>Quiz URL: /quiz/{formData.slug || 'your-quiz-slug'}</small>
          </div>
        </div>

        <div className="form-section">
          <h2>Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="settings.showProgressBar"
                  checked={formData.settings.showProgressBar}
                  onChange={handleInputChange}
                />
                Show Progress Bar
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="settings.allowAnonymous"
                  checked={formData.settings.allowAnonymous}
                  onChange={handleInputChange}
                />
                Allow Anonymous
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="settings.sendConfirmationEmail"
                  checked={formData.settings.sendConfirmationEmail}
                  onChange={handleInputChange}
                />
                Send Confirmation Email to User
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="settings.requireContactInfo"
                  checked={formData.settings.requireContactInfo}
                  onChange={handleInputChange}
                />
                Require Contact Info
              </label>
            </div>
          </div>

          {formData.settings.requireContactInfo && (
            <div className="form-group">
              <label>Contact Fields to Collect</label>
              <div className="checkbox-group">
                {['name', 'email', 'phone', 'company'].map(field => (
                  <label key={field}>
                    <input
                      type="checkbox"
                      checked={formData.settings.contactFields.includes(field)}
                      onChange={(e) => {
                        const fields = e.target.checked
                          ? [...formData.settings.contactFields, field]
                          : formData.settings.contactFields.filter(f => f !== field);
                        setFormData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, contactFields: fields }
                        }));
                      }}
                    />
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Questions</h2>
          {renderQuestionEditor()}
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setView('list')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (currentQuiz ? 'Update Quiz' : 'Create Quiz')}
          </button>
        </div>
      </form>
    </div>
  );

  const renderResponses = () => (
    <div className="responses-view">
      <div className="page-header">
        <h1>Responses: {currentQuiz?.title}</h1>
        <button className="btn-secondary" onClick={() => setView('list')}>
          Back to Quizzes
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="empty-state">
          <p>No responses yet for this quiz.</p>
        </div>
      ) : (
        <div className="responses-list">
          {responses.map(response => (
            <div key={response._id} className="response-card">
              <div className="response-header">
                <span className="response-date">
                  {new Date(response.createdAt).toLocaleString()}
                </span>
                <span className="response-contact">
                  {response.contactInfo?.email || response.contactInfo?.name || 'Anonymous'}
                </span>
              </div>
              <div className="response-answers">
                {response.answers.slice(0, 3).map((answer, i) => (
                  <div key={i} className="answer-item">
                    <strong>{answer.questionText}</strong>
                    <p>{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
                  </div>
                ))}
                {response.answers.length > 3 && (
                  <p className="more-answers">+ {response.answers.length - 3} more answers</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      {error && <div className="error-banner">{error}</div>}
      
      {view === 'list' && renderQuizList()}
      {view === 'create' && renderQuizForm()}
      {view === 'responses' && renderResponses()}
    </div>
  );
}

export default App;
