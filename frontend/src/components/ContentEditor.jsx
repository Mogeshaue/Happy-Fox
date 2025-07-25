import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './ContentEditor.css';

const ContentEditor = ({ setBreadcrumbs }) => {
  const { schoolId, courseId, moduleId, contentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const contentType = searchParams.get('type') || 'learning_material';
  const isEditing = contentId !== 'new';

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: 15,
    order_index: 1,
    is_published: false
  });

  // Rich text editor state
  const [editorContent, setEditorContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Quiz specific state
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: ''
  });

  useEffect(() => {
    const initializeContent = async () => {
      try {
        setLoading(true);

        if (isEditing) {
          // Mock existing content data
          const mockContent = {
            id: contentId,
            title: 'Introduction to React Hooks',
            content: '<h2>What are React Hooks?</h2><p>React Hooks are functions that let you "hook into" React state and lifecycle features from function components.</p><h3>Key Benefits:</h3><ul><li><strong>Simplified Code:</strong> No need for class components</li><li><strong>Reusable Logic:</strong> Custom hooks enable logic sharing</li><li><strong>Better Testing:</strong> Easier to test and debug</li></ul>',
            duration: 15,
            type: contentType,
            order_index: 1,
            is_published: true
          };

          setFormData(mockContent);
          setEditorContent(mockContent.content);
        } else {
          // New content defaults
          const defaultContent = getDefaultContentByType(contentType);
          setFormData(defaultContent);
          setEditorContent(defaultContent.content);
        }

        // Update breadcrumbs
        const contentTitle = isEditing ? formData.title : `New ${getContentTypeTitle(contentType)}`;
        setBreadcrumbs([
          { label: 'Happy Fox Academy', path: `/school/${schoolId}` },
          { label: 'Advanced React Development', path: `/school/${schoolId}/course/${courseId}` },
          { label: 'React Hooks Deep Dive', path: `/school/${schoolId}/course/${courseId}/module/${moduleId}` },
          { label: contentTitle, path: window.location.pathname }
        ]);

      } catch (error) {
        console.error('Error initializing content:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeContent();
  }, [contentId, contentType, isEditing, schoolId, courseId, moduleId, setBreadcrumbs, formData.title]);

  const getContentTypeTitle = (type) => {
    const titles = {
      learning_material: 'Learning Material',
      quiz: 'Quiz',
      assignment: 'Assignment',
      code_exercise: 'Code Exercise',
      video: 'Video Lesson',
      document: 'Document'
    };
    return titles[type] || 'Content';
  };

  const getDefaultContentByType = (type) => {
    const defaults = {
      learning_material: {
        title: '',
        content: '<h2>Welcome to Your Learning Material</h2><p>Start writing your content here...</p>',
        duration: 15,
        order_index: 1,
        is_published: false
      },
      quiz: {
        title: '',
        content: '',
        duration: 10,
        order_index: 1,
        is_published: false
      },
      assignment: {
        title: '',
        content: '<h2>Assignment Instructions</h2><p>Describe what students need to do...</p>',
        duration: 30,
        order_index: 1,
        is_published: false
      },
      code_exercise: {
        title: '',
        content: '<h2>Coding Exercise</h2><p>Instructions for the coding challenge...</p>',
        duration: 45,
        order_index: 1,
        is_published: false
      },
      video: {
        title: '',
        content: '<h2>Video Lesson</h2><p>Add video embed and additional notes...</p>',
        duration: 20,
        order_index: 1,
        is_published: false
      },
      document: {
        title: '',
        content: '<h2>Document Resource</h2><p>Upload documents and add descriptions...</p>',
        duration: 5,
        order_index: 1,
        is_published: false
      }
    };
    return defaults[type] || defaults.learning_material;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const contentData = {
        ...formData,
        content: editorContent,
        type: contentType
      };

      // Mock save operation
      console.log('Saving content:', contentData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to module
      navigate(`/school/${schoolId}/course/${courseId}/module/${moduleId}`);
      
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    await handleSave();
    setFormData({ ...formData, is_published: true });
  };

  // Rich text editor functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    setEditorContent(document.querySelector('.editor-content').innerHTML);
  };

  const insertList = (ordered = false) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList';
    formatText(command);
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const insertTable = () => {
    const table = `
      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <th style="border: 1px solid #ddd; padding: 8px;">Header 1</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Header 2</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
          <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
        </tr>
      </table>
    `;
    formatText('insertHTML', table);
  };

  const insertCodeBlock = () => {
    const code = `<pre><code>// Your code here
function example() {
  return "Hello World";
}</code></pre>`;
    formatText('insertHTML', code);
  };

  if (loading) {
    return <div className="content-loading">Loading content editor...</div>;
  }

  return (
    <div className="content-editor">
      {/* Editor Header */}
      <div className="editor-header">
        <div className="header-info">
          <div className="content-type-badge">
            {getContentTypeTitle(contentType)}
          </div>
          <h1>{isEditing ? 'Edit Content' : 'Create New Content'}</h1>
        </div>
        <div className="header-actions">
          <button 
            className="preview-btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '📝 Edit' : '👁️ Preview'}
          </button>
          <button 
            className="save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Draft'}
          </button>
          <button 
            className="publish-btn"
            onClick={handlePublish}
            disabled={saving}
          >
            🚀 Publish
          </button>
        </div>
      </div>

      {/* Content Form */}
      <div className="editor-content-wrapper">
        <div className="content-form">
          {/* Basic Info */}
          <div className="form-section">
            <h3>Content Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter content title..."
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Content Editor */}
          {(contentType === 'learning_material' || contentType === 'assignment' || contentType === 'code_exercise' || contentType === 'video' || contentType === 'document') && (
            <div className="form-section">
              <h3>Content</h3>
              
              {/* Rich Text Toolbar */}
              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <button type="button" onClick={() => formatText('bold')} title="Bold">
                    <strong>B</strong>
                  </button>
                  <button type="button" onClick={() => formatText('italic')} title="Italic">
                    <em>I</em>
                  </button>
                  <button type="button" onClick={() => formatText('underline')} title="Underline">
                    <u>U</u>
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <button type="button" onClick={() => formatText('formatBlock', 'h2')} title="Heading 2">
                    H2
                  </button>
                  <button type="button" onClick={() => formatText('formatBlock', 'h3')} title="Heading 3">
                    H3
                  </button>
                  <button type="button" onClick={() => formatText('formatBlock', 'p')} title="Paragraph">
                    P
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <button type="button" onClick={() => insertList(false)} title="Bullet List">
                    •
                  </button>
                  <button type="button" onClick={() => insertList(true)} title="Numbered List">
                    1.
                  </button>
                </div>
                
                <div className="toolbar-group">
                  <button type="button" onClick={insertImage} title="Insert Image">
                    🖼️
                  </button>
                  <button type="button" onClick={insertTable} title="Insert Table">
                    📊
                  </button>
                  <button type="button" onClick={insertCodeBlock} title="Code Block">
                    💻
                  </button>
                </div>
              </div>

              {/* Editor Content */}
              {showPreview ? (
                <div className="content-preview">
                  <div dangerouslySetInnerHTML={{ __html: editorContent }}></div>
                </div>
              ) : (
                <div
                  className="editor-content"
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                  onInput={(e) => setEditorContent(e.target.innerHTML)}
                  style={{ minHeight: '400px' }}
                />
              )}
            </div>
          )}

          {/* Quiz Builder */}
          {contentType === 'quiz' && (
            <div className="form-section">
              <h3>Quiz Questions</h3>
              <div className="quiz-builder">
                <div className="question-form">
                  <div className="form-group">
                    <label>Question</label>
                    <textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      placeholder="Enter your question..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="options-grid">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="option-item">
                        <input
                          type="radio"
                          name="correct_answer"
                          checked={currentQuestion.correct_answer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: index })}
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="form-group">
                    <label>Explanation (optional)</label>
                    <textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                      placeholder="Explain why this answer is correct..."
                      rows={2}
                    />
                  </div>
                  
                  <button 
                    type="button" 
                    className="add-question-btn"
                    onClick={() => {
                      setQuizQuestions([...quizQuestions, currentQuestion]);
                      setCurrentQuestion({
                        question: '',
                        options: ['', '', '', ''],
                        correct_answer: 0,
                        explanation: ''
                      });
                    }}
                  >
                    Add Question
                  </button>
                </div>

                {/* Questions List */}
                {quizQuestions.length > 0 && (
                  <div className="questions-list">
                    <h4>Quiz Questions ({quizQuestions.length})</h4>
                    {quizQuestions.map((question, index) => (
                      <div key={index} className="question-item">
                        <div className="question-header">
                          <span className="question-number">Q{index + 1}</span>
                          <button 
                            type="button"
                            className="remove-question-btn"
                            onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== index))}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="question-content">
                          <p><strong>{question.question}</strong></p>
                          <ul>
                            {question.options.map((option, optIndex) => (
                              <li key={optIndex} className={optIndex === question.correct_answer ? 'correct' : ''}>
                                {option}
                                {optIndex === question.correct_answer && ' ✓'}
                              </li>
                            ))}
                          </ul>
                          {question.explanation && (
                            <p className="explanation"><em>Explanation: {question.explanation}</em></p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Settings */}
          <div className="form-section">
            <h3>Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  Published (visible to students)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="editor-footer">
        <button 
          className="cancel-btn"
          onClick={() => navigate(`/school/${schoolId}/course/${courseId}/module/${moduleId}`)}
        >
          Cancel
        </button>
        <div className="footer-actions">
          <button 
            className="save-draft-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button 
            className="save-publish-btn"
            onClick={handlePublish}
            disabled={saving}
          >
            Save & Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
