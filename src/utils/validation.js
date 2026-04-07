export const validateMarks = (marks) => {
  if (marks === "" || marks === null || marks === undefined) {
    return { valid: true, error: "" };
  }

  const marksNum = Number(marks);

  if (isNaN(marksNum)) {
    return { valid: false, error: "Marks must be a valid number" };
  }

  if (marksNum < 0) {
    return { valid: false, error: "Marks cannot be negative" };
  }

  if (marksNum > 100) {
    return { valid: false, error: "Marks cannot exceed 100%" };
  }

  return { valid: true, error: "" };
};

export const getGradeFromPercentage = (percentage) => {
  const num = Number(percentage);

  if (num >= 90) return "A";
  if (num >= 80) return "B";
  if (num >= 70) return "C";
  if (num >= 60) return "D";
  return "F";
};

export const isMarksPass = (percentage) => {
  return Number(percentage) >= 50;
};
