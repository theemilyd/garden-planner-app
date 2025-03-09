import React, { useState } from 'react';
import { aiAPI } from '../api';

const GardeningTips = () => {
  const [query, setQuery] = useState('');
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError('');
      const response = await aiAPI.answerGardeningQuestion(query);
      // Unwrap axios response data
      const tipData = response.data;
      setTips(prev => [{
        question: query,
        answer: tipData.answer || tipData.response || tipData,
        sources: tipData.sources || [],
        timestamp: new Date().toISOString()
      }, ...prev]);
      setQuery('');
    } catch (err) {
      setError('Failed to get gardening tips. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const predefinedQuestions = [
    "How do I improve my soil?",
    "What are natural ways to deter pests?",
    "Which plants grow well together?",
    "How often should I water my garden?",
    "What vegetables are easy to grow for beginners?",
    "How can I extend my growing season?",
  ];

  return (
    <div className="container my-4">
      <div className="row mb-4">
        <div className="col-md-8 offset-md-2">
          <h1 className="text-center mb-4">Gardening Tips & Advice</h1>
          <div className="card">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Ask Claude</h3>
            </div>
            <div className="card-body">
              <p className="mb-4">
                Get personalized gardening advice from Claude, our AI gardening assistant. 
                Ask any gardening question and get research-backed answers to help your garden thrive.
              </p>
              
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ask a gardening question..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                  />
                  <button
                    className="btn btn-success"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Thinking...
                      </>
                    ) : (
                      <>Ask</>
                    )}
                  </button>
                </div>
              </form>
              
              {error && <div className="alert alert-danger mt-3">{error}</div>}
              
              <div className="mt-3">
                <h6>Popular Questions:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {predefinedQuestions.map((question, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-success btn-sm"
                      onClick={() => setQuery(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tips.length > 0 && (
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <h3 className="mb-3">Your Gardening Advice</h3>
            
            {tips.map((tip, index) => (
              <div className="card mb-4" key={index}>
                <div className="card-header bg-light">
                  <h5 className="mb-0">{tip.question}</h5>
                </div>
                <div className="card-body">
                  <div dangerouslySetInnerHTML={{ __html: tip.answer.replace(/\n/g, '<br/>') }} />
                  
                  {tip.sources && tip.sources.length > 0 && (
                    <div className="mt-3">
                      <h6>Sources:</h6>
                      <ul className="mb-0">
                        {tip.sources.map((source, idx) => (
                          <li key={idx}>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              {source.title || source.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="card-footer text-muted">
                  <small>Generated on {new Date(tip.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tips.length === 0 && !loading && (
        <div className="row">
          <div className="col-md-8 offset-md-2 text-center">
            <div className="card">
              <div className="card-body">
                <p className="mb-0">No questions asked yet. Try asking Claude for gardening advice!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardeningTips;