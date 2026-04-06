import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/DirectorDashboard.css";

function DirectorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeSection, setActiveSection] = useState("teachers");

  const [teacherForm, setTeacherForm] = useState({
    fullName: "",
    email: "",
    password: "",
    subject: "",
    className: "",
    teacherCode: ""
  });

  const [studentForm, setStudentForm] = useState({
    fullName: "",
    email: "",
    password: "",
    className: "",
    studentCode: ""
  });

  const [editingTeacherId, setEditingTeacherId] = useState("");
  const [editingStudentId, setEditingStudentId] = useState("");

  const [reportStudentId, setReportStudentId] = useState("");
  const [reportTerm, setReportTerm] = useState("Term 1");
  const [reportYear, setReportYear] = useState("2025");
  const [report, setReport] = useState(null);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/director/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/director/students");
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
  }, []);

  const handleTeacherChange = (e) => {
    setTeacherForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleStudentChange = (e) => {
    setStudentForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetTeacherForm = () => {
    setTeacherForm({
      fullName: "",
      email: "",
      password: "",
      subject: "",
      className: "",
      teacherCode: ""
    });
    setEditingTeacherId("");
  };

  const resetStudentForm = () => {
    setStudentForm({
      fullName: "",
      email: "",
      password: "",
      className: "",
      studentCode: ""
    });
    setEditingStudentId("");
  };

  const handleCreateOrUpdateTeacher = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingTeacherId) {
        await API.put(`/director/teachers/${editingTeacherId}`, {
          fullName: teacherForm.fullName,
          email: teacherForm.email,
          subject: teacherForm.subject,
          className: teacherForm.className,
          teacherCode: teacherForm.teacherCode
        });
        setMessage("Teacher updated successfully");
      } else {
        await API.post("/director/teachers", teacherForm);
        setMessage("Teacher created successfully");
      }

      resetTeacherForm();
      fetchTeachers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save teacher");
    }
  };

  const handleCreateOrUpdateStudent = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (editingStudentId) {
        await API.put(`/director/students/${editingStudentId}`, {
          fullName: studentForm.fullName,
          email: studentForm.email,
          className: studentForm.className,
          studentCode: studentForm.studentCode
        });
        setMessage("Student updated successfully");
      } else {
        await API.post("/director/students", studentForm);
        setMessage("Student created successfully");
      }

      resetStudentForm();
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacherId(teacher._id);
    setTeacherForm({
      fullName: teacher.fullName || "",
      email: teacher.email || "",
      password: "",
      subject: teacher.subject || "",
      className: teacher.className || "",
      teacherCode: teacher.teacherCode || ""
    });
    setActiveSection("teachers");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student._id);
    setStudentForm({
      fullName: student.fullName || "",
      email: student.email || "",
      password: "",
      className: student.className || "",
      studentCode: student.studentCode || ""
    });
    setActiveSection("students");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTeacher = async (id) => {
    try {
      await API.delete(`/director/teachers/${id}`);
      setMessage("Teacher deleted successfully");
      fetchTeachers();
    } catch (err) {
      setError("Failed to delete teacher");
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await API.delete(`/director/students/${id}`);
      setMessage("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      setError("Failed to delete student");
    }
  };

  const handleViewStudentReport = async (studentId) => {
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

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.fullName} ${teacher.email} ${teacher.subject} ${teacher.className} ${teacher.teacherCode}`
      .toLowerCase()
      .includes(teacherSearch.toLowerCase())
  );

  const filteredStudents = students.filter((student) =>
    `${student.fullName} ${student.email} ${student.className} ${student.studentCode}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase())
  );

  return (
    <div className="director-layout">
      <aside className="sidebar">
        <h2>Director Panel</h2>
        <button onClick={() => setActiveSection("teachers")}>Teachers</button>
        <button onClick={() => setActiveSection("students")}>Students</button>
        <button onClick={() => setActiveSection("reports")}>Reports</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="dashboard-content">
        <div className="topbar">
          <h1>Welcome, {user?.fullName}</h1>
          <p>Role: {user?.role}</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <span>Total Teachers</span>
            <strong>{teachers.length}</strong>
          </div>
          <div className="stat-card">
            <span>Total Students</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        {activeSection === "teachers" && (
          <div className="section">
            <div className="form-card">
              <h3>{editingTeacherId ? "Edit Teacher" : "Create Teacher"}</h3>
              <form onSubmit={handleCreateOrUpdateTeacher}>
                <input name="fullName" placeholder="Full name" value={teacherForm.fullName} onChange={handleTeacherChange} />
                <input name="email" placeholder="Email" value={teacherForm.email} onChange={handleTeacherChange} />
                {!editingTeacherId && (
                  <input name="password" placeholder="Password" value={teacherForm.password} onChange={handleTeacherChange} />
                )}
                <input name="subject" placeholder="Subject" value={teacherForm.subject} onChange={handleTeacherChange} />
                <input name="className" placeholder="Class name" value={teacherForm.className} onChange={handleTeacherChange} />
                <input name="teacherCode" placeholder="Teacher code" value={teacherForm.teacherCode} onChange={handleTeacherChange} />
                <button type="submit">
                  {editingTeacherId ? "Update Teacher" : "Create Teacher"}
                </button>
                {editingTeacherId && (
                  <button type="button" className="secondary-btn" onClick={resetTeacherForm}>
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>Teachers List</h3>
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                />
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Class</th>
                    <th>Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher._id}>
                      <td>{teacher.fullName}</td>
                      <td>{teacher.email}</td>
                      <td>{teacher.subject}</td>
                      <td>{teacher.className}</td>
                      <td>{teacher.teacherCode}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditTeacher(teacher)}>
                            Edit
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteTeacher(teacher._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan="6">No teachers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "students" && (
          <div className="section">
            <div className="form-card">
              <h3>{editingStudentId ? "Edit Student" : "Create Student"}</h3>
              <form onSubmit={handleCreateOrUpdateStudent}>
                <input name="fullName" placeholder="Full name" value={studentForm.fullName} onChange={handleStudentChange} />
                <input name="email" placeholder="Email" value={studentForm.email} onChange={handleStudentChange} />
                {!editingStudentId && (
                  <input name="password" placeholder="Password" value={studentForm.password} onChange={handleStudentChange} />
                )}
                <input name="className" placeholder="Class name" value={studentForm.className} onChange={handleStudentChange} />
                <input name="studentCode" placeholder="Student code" value={studentForm.studentCode} onChange={handleStudentChange} />
                <button type="submit">
                  {editingStudentId ? "Update Student" : "Create Student"}
                </button>
                {editingStudentId && (
                  <button type="button" className="secondary-btn" onClick={resetStudentForm}>
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>

            <div className="table-card">
              <div className="table-header">
                <h3>Students List</h3>
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Class</th>
                    <th>Code</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>{student.fullName}</td>
                      <td>{student.email}</td>
                      <td>{student.className}</td>
                      <td>{student.studentCode}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" onClick={() => handleEditStudent(student)}>
                            Edit
                          </button>
                          <button className="view-btn" onClick={() => handleViewStudentReport(student._id)}>
                            View Report
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteStudent(student._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan="5">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "reports" && (
          <div className="section">
            <div className="form-card">
              <h3>Student Report Utility</h3>
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
                  onClick={() => reportStudentId && handleViewStudentReport(reportStudentId)}
                >
                  Load Report
                </button>
              </div>
            </div>

            {report && (
              <div className="table-card">
                <h3>{report.student}'s Report</h3>
                <p><strong>Class:</strong> {report.class}</p>
                <p><strong>Term:</strong> {report.term}</p>
                <p><strong>Academic Year:</strong> {report.academicYear}</p>

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

export default DirectorDashboard;