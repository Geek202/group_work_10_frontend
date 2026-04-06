import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/TeacherDashboard.css";

function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeSection, setActiveSection] = useState("marks");

  const [formData, setFormData] = useState({
    studentId: "",
    term: "",
    academicYear: "",
    marks: ""
  });

  const [report, setReport] = useState(null);
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportTerm, setReportTerm] = useState("Term 1");
  const [reportYear, setReportYear] = useState("2025");

  const [markSearch, setMarkSearch] = useState("");
  const [editId, setEditId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchMarks = async () => {
    try {
      const res = await API.get("/teacher/marks");
      setMarks(res.data);
    } catch (err) {
      setError("Failed to fetch marks");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/teacher/students");
      setStudents(res.data);
    } catch (err) {
      setError("Failed to fetch students");
    }
  };

  useEffect(() => {
    fetchMarks();
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      term: "",
      academicYear: "",
      marks: ""
    });
    setEditId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editId) {
        await API.put(`/teacher/marks/${editId}`, {
          marks: Number(formData.marks)
        });
        setMessage("Mark updated successfully");
      } else {
        await API.post("/teacher/marks", {
          studentId: formData.studentId,
          term: formData.term,
          academicYear: formData.academicYear,
          marks: Number(formData.marks)
        });
        setMessage("Mark added successfully");
      }

      resetForm();
      fetchMarks();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (mark) => {
    setEditId(mark._id);
    setFormData({
      studentId: mark.student?._id || "",
      term: mark.term || "",
      academicYear: mark.academicYear || "",
      marks: mark.marks || ""
    });
    setActiveSection("marks");
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await API.delete(`/teacher/marks/${id}`);
      setMessage("Mark deleted successfully");
      fetchMarks();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const handleViewReport = async (studentId) => {
    setMessage("");
    setError("");
    setReport(null);
    setReportStudentId(studentId);

    try {
      const res = await API.get(
        `/student/report/${studentId}?term=${reportTerm}&academicYear=${reportYear}`
      );
      setReport(res.data);
      setActiveSection("reports");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report");
      setActiveSection("reports");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  const filteredMarks = marks.filter((mark) =>
    `${mark.student?.fullName || ""} ${mark.student?.studentCode || ""} ${mark.term} ${mark.academicYear} ${mark.subject}`
      .toLowerCase()
      .includes(markSearch.toLowerCase())
  );

  return (
    <div className="teacher-layout">
      <aside className="teacher-sidebar">
        <h2>Teacher Panel</h2>
        <div className="teacher-info">
          <p><strong>{user?.fullName}</strong></p>
          <p>{user?.subject}</p>
          <p>{user?.className}</p>
        </div>

        <button onClick={() => setActiveSection("marks")}>Marks</button>
        <button onClick={() => setActiveSection("students")}>Students</button>
        <button onClick={() => setActiveSection("reports")}>Reports</button>

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="teacher-content">
        <div className="teacher-topbar">
          <h1>Teacher Dashboard</h1>
          <p>Manage students and marks for your subject</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span>My Students</span>
            <strong>{students.length}</strong>
          </div>
          <div className="stat-card">
            <span>Marks Added</span>
            <strong>{marks.length}</strong>
          </div>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        {activeSection === "marks" && (
          <div className="teacher-grid">
            <div className="teacher-card">
              <h3>{editId ? "Update Mark" : "Add Mark"}</h3>

              <form onSubmit={handleSubmit} className="teacher-form">
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={!!editId}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentCode})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  name="term"
                  placeholder="Term e.g Term 1"
                  value={formData.term}
                  onChange={handleChange}
                  disabled={!!editId}
                />

                <input
                  type="text"
                  name="academicYear"
                  placeholder="Academic Year e.g 2025"
                  value={formData.academicYear}
                  onChange={handleChange}
                  disabled={!!editId}
                />

                <input
                  type="number"
                  name="marks"
                  placeholder="Marks"
                  value={formData.marks}
                  onChange={handleChange}
                />

                <button type="submit">
                  {editId ? "Update Mark" : "Add Mark"}
                </button>

                {editId && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            <div className="teacher-card">
              <div className="table-header">
                <h3>My Marks</h3>
                <input
                  type="text"
                  placeholder="Search marks..."
                  value={markSearch}
                  onChange={(e) => setMarkSearch(e.target.value)}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Code</th>
                      <th>Class</th>
                      <th>Subject</th>
                      <th>Term</th>
                      <th>Year</th>
                      <th>Marks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarks.length > 0 ? (
                      filteredMarks.map((mark) => (
                        <tr key={mark._id}>
                          <td>{mark.student?.fullName || "N/A"}</td>
                          <td>{mark.student?.studentCode || "N/A"}</td>
                          <td>{mark.className}</td>
                          <td>{mark.subject}</td>
                          <td>{mark.term}</td>
                          <td>{mark.academicYear}</td>
                          <td>{mark.marks}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="edit-btn" onClick={() => handleEdit(mark)}>
                                Edit
                              </button>
                              <button className="view-btn" onClick={() => handleViewReport(mark.student?._id)}>
                                Report
                              </button>
                              <button className="delete-btn" onClick={() => handleDelete(mark._id)}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8">No marks found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "students" && (
          <div className="teacher-card">
            <div className="table-header">
              <h3>Students In My Class</h3>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Class</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student._id}>
                        <td>{student.fullName}</td>
                        <td>{student.studentCode}</td>
                        <td>{student.className}</td>
                        <td>
                          <button className="view-btn" onClick={() => handleViewReport(student._id)}>
                            View Report
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "reports" && (
          <div className="teacher-grid">
            <div className="teacher-card">
              <h3>Report Utility</h3>
              <div className="report-filter-grid">
                <select value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)}>
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentCode})
                    </option>
                  ))}
                </select>

                <select value={reportTerm} onChange={(e) => setReportTerm(e.target.value)}>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>

                <input
                  type="text"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                  placeholder="Academic Year"
                />

                <button
                  type="button"
                  onClick={() => reportStudentId && handleViewReport(reportStudentId)}
                >
                  Load Report
                </button>
              </div>
            </div>

            {report && (
              <div className="teacher-card">
                <h3>{report.student}'s Report</h3>
                <p><strong>Class:</strong> {report.class}</p>
                <p><strong>Term:</strong> {report.term}</p>
                <p><strong>Academic Year:</strong> {report.academicYear}</p>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.subjects?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.subject}</td>
                          <td>{item.marks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="report-summary-director">
                  <div className="stat-card"><span>Total</span><strong>{report.total}</strong></div>
                  <div className="stat-card"><span>Average</span><strong>{report.average}</strong></div>
                  <div className="stat-card"><span>Grade</span><strong>{report.grade}</strong></div>
                  <div className="stat-card"><span>Remark</span><strong>{report.remark}</strong></div>
                  <div className="stat-card"><span>Position</span><strong>{report.position}/{report.totalStudents}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default TeacherDashboard;