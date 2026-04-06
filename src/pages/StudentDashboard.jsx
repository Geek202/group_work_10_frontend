import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const reportRef = useRef(null);

  const [term, setTerm] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  const handleFetchReport = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setReport(null);

    try {
      const res = await API.get(
        `/student/report/${user.id}?term=${term}&academicYear=${academicYear}`
      );

      setReport(res.data);
      setMessage("Report fetched successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch report");
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);
      }

      pdf.save(
        `${report.student.replace(/\s+/g, "_")}_${report.term}_${report.academicYear}_Report.pdf`
      );
    } catch (err) {
      setError("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="student-layout">
      <aside className="student-sidebar">
        <h2>Student Panel</h2>

        <div className="student-info-box">
          <p><strong>{user?.fullName}</strong></p>
          <p>{user?.email}</p>
          <p>{user?.studentCode}</p>
          <p>{user?.className}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="student-content">
        <div className="student-topbar">
          <h1>Student Dashboard</h1>
          <p>View your academic report</p>
        </div>

        {message && <div className="success-box">{message}</div>}
        {error && <div className="error-box">{error}</div>}

        <div className="student-card">
          <h3>Generate Report</h3>

          <form onSubmit={handleFetchReport} className="student-form">
            <select value={term} onChange={(e) => setTerm(e.target.value)}>
              <option value="">Select Term</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>

            <input
              type="text"
              placeholder="Academic Year e.g 2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />

            <button type="submit">View Report</button>
          </form>
        </div>

        {report && (
          <>
            <div className="report-actions">
              <button onClick={handleDownloadPDF} disabled={downloading}>
                {downloading ? "Downloading..." : "Download PDF"}
              </button>
            </div>

            <div className="report-card" ref={reportRef}>
              <div className="report-header">
                <h2>Report Card</h2>
                <p><strong>Student:</strong> {report.student}</p>
                <p><strong>Student Code:</strong> {report.studentCode}</p>
                <p><strong>Class:</strong> {report.class}</p>
                <p><strong>Term:</strong> {report.term}</p>
                <p><strong>Academic Year:</strong> {report.academicYear}</p>
              </div>

              <div className="report-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects?.map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.subject}</td>
                        <td>{subject.marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="report-summary">
                <div className="summary-box">
                  <span>Total</span>
                  <strong>{report.total}</strong>
                </div>

                <div className="summary-box">
                  <span>Average</span>
                  <strong>{report.average}</strong>
                </div>

                <div className="summary-box">
                  <span>Grade</span>
                  <strong>{report.grade}</strong>
                </div>

                <div className="summary-box">
                  <span>Remark</span>
                  <strong>{report.remark}</strong>
                </div>

                <div className="summary-box">
                  <span>Position</span>
                  <strong>
                    {report.position} / {report.totalStudents}
                  </strong>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;