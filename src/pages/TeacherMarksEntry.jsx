import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/TeacherMarksEntry.css';

function TeacherMarksEntry() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [marks, setMarks] = useState([]);
  
  const [formData, setFormData] = useState({
    studentId: '',
    lessonId: '',
    marks: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLesson, setFilterLesson] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await API.get('/teacher/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to fetch students');
    }
  };

  const fetchLessons = async () => {
    try {
      const res = await API.get('/teacher/lessons');
      setLessons(res.data);
    } catch (err) {
      setError('Failed to fetch lessons');
    }
  };

  const fetchMarks = async () => {
    try {
      const res = await API.get('/teacher/marks/entries');
      setMarks(res.data);
    } catch (err) {
      setError('Failed to fetch marks');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchLessons();
    fetchMarks();
  }, []);

  const validateMarks = (value) => {
    if (value === '') return { valid: true, error: '' };
    
    const num = Number(value);
    if (isNaN(num)) {
      return { valid: false, error: 'Marks must be a valid number' };
    }
    if (num < 0) {
      return { valid: false, error: 'Marks cannot be negative' };
    }
    if (num > 100) {
      return { valid: false, error: 'Marks cannot exceed 100%' };
    }
    return { valid: true, error: '' };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'marks') {
      const validation = validateMarks(value);
      if (!validation.valid && value !== '') {
        setError(validation.error);
        return;
      }
      setError('');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      lessonId: '',
      marks: ''
    });
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.studentId || !formData.lessonId || formData.marks === '') {
      setError('Please fill in all fields');
      return;
    }

    const validation = validateMarks(formData.marks);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      const payload = {
        studentId: formData.studentId,
        lessonId: formData.lessonId,
        marks: Number(formData.marks)
      };

      if (editingId) {
        await API.put(`/teacher/marks/${editingId}`, payload);
        setMessage('Mark updated successfully!');
      } else {
        await API.post('/teacher/marks', payload);
        setMessage('Mark added successfully!');
      }

      resetForm();
      fetchMarks();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (mark) => {
    setEditingId(mark._id);
    setFormData({
      studentId: mark.student._id,
      lessonId: mark.lesson._id,
      marks: mark.marks
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this mark?')) return;

    try {
      await API.delete(`/teacher/marks/${id}`);
      setMessage('Mark deleted successfully!');
      fetchMarks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete mark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredMarks = marks.filter(mark => {
    const matchesSearch = 
      mark.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.student?.studentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLesson = filterLesson === '' || mark.lesson?._id === filterLesson;
    
    return matchesSearch && matchesLesson;
  });

  const getGrade = (marksValue) => {
    if (marksValue >= 90) return 'A';
    if (marksValue >= 80) return 'B';
    if (marksValue >= 70) return 'C';
    if (marksValue >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="marks-entry-container">
      <aside className="marks-sidebar">
        <div className="sidebar-header">
          <h2>Marks Entry</h2>
          <p className="teacher-name">{user?.fullName}</p>
          <p className="teacher-subject">{user?.subject}</p>
        </div>

        <div className="sidebar-stats">
          <div className="stat">
            <span className="stat-label">Students</span>
            <strong>{students.length}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">Lessons</span>
            <strong>{lessons.length}</strong>
          </div>
          <div className="stat">
            <span className="stat-label">Marks Entered</span>
            <strong>{marks.length}</strong>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="marks-main">
        <header className="marks-header">
          <h1>Add Student Marks</h1>
          <p>Enter marks (0-100%) for students in each lesson</p>
        </header>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <div className="marks-grid">
          <div className="form-card">
            <h3>{editingId ? 'Update Mark' : 'Add New Mark'}</h3>
            
            <form onSubmit={handleSubmit} className="marks-form">
              <div className="form-group">
                <label htmlFor="studentId">Student *</label>
                <select
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={!!editingId}
                  required
                >
                  <option value="">-- Select a student --</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lessonId">Lesson *</label>
                <select
                  id="lessonId"
                  name="lessonId"
                  value={formData.lessonId}
                  onChange={handleChange}
                  disabled={!!editingId}
                  required
                >
                  <option value="">-- Select a lesson --</option>
                  {lessons.map(lesson => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title} ({lesson.term} - {lesson.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="marks">Marks (%) *</label>
                <div className="marks-input-wrapper">
                  <input
                    id="marks"
                    type="number"
                    name="marks"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="Enter marks 0-100"
                    value={formData.marks}
                    onChange={handleChange}
                    required
                  />
                  <span className="marks-unit">%</span>
                </div>
                <small>Enter a percentage value between 0 and 100</small>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? 'Update Mark' : 'Add Mark'}
                </button>
                {editingId && (
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="marks-list-card">
            <h3>Marks Record</h3>

            <div className="filters">
              <input
                type="text"
                placeholder="Search by student name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <select
                value={filterLesson}
                onChange={(e) => setFilterLesson(e.target.value)}
                className="filter-select"
              >
                <option value="">All Lessons</option>
                {lessons.map(lesson => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-wrapper">
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Code</th>
                    <th>Lesson</th>
                    <th>Term</th>
                    <th>Marks (%)</th>
                    <th>Grade</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarks.length > 0 ? (
                    filteredMarks.map(mark => (
                      <tr key={mark._id}>
                        <td>{mark.student?.fullName}</td>
                        <td>{mark.student?.studentCode}</td>
                        <td>{mark.lesson?.title}</td>
                        <td>{mark.lesson?.term}</td>
                        <td className="marks-cell">{mark.marks}%</td>
                        <td>
                          <span className={`grade-badge grade-${getGrade(mark.marks).toLowerCase()}`}>
                            {getGrade(mark.marks)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(mark)}
                            title="Edit mark"
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(mark._id)}
                            title="Delete mark"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        No marks found. Add a new mark to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeacherMarksEntry;
