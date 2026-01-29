import { useState, useEffect } from 'react';
import QuizForm from './components/QuizForm';
import './App.css';

function App() {
  const [quizSlug, setQuizSlug] = useState(null);

  // Get quiz slug from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('quiz') || params.get('slug');
    if (slug) {
      setQuizSlug(slug);
    }
  }, []);

  // Demo mode - show quiz selector when no slug is provided
  const [demoSlug, setDemoSlug] = useState('');

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (demoSlug.trim()) {
      window.location.search = `?quiz=${demoSlug.trim()}`;
    }
  };

  if (quizSlug) {
    return <QuizForm slug={quizSlug} />;
  }

  return (
    <div className="app-container">
      <div className="welcome-screen">
        <h1>Quiz Platform</h1>
        <p>Welcome to our interactive quiz platform</p>
        
        <div className="demo-form">
          <h3>Try a Demo Quiz</h3>
          <form onSubmit={handleDemoSubmit}>
            <input
              type="text"
              value={demoSlug}
              onChange={(e) => setDemoSlug(e.target.value)}
              placeholder="Enter quiz slug (e.g., feedback-form)"
            />
            <button type="submit">Load Quiz</button>
          </form>
        </div>

        <div className="info-section">
          <h3>How to Use</h3>
          <ol>
            <li>Create a quiz in the <a href="/admin">Admin Panel</a></li>
            <li>Share the quiz URL with the slug parameter</li>
            <li>Example: <code>/?quiz=your-quiz-slug</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default App;
