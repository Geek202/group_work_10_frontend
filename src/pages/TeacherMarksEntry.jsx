import React, { useState } from 'react';

const TeacherMarksEntry = () => {
    const [marks, setMarks] = useState('');
    const [error, setError] = useState('');

    const handleMarksChange = (e) => {
        const value = e.target.value;
        if (value === '' || value >= 0 && value <= 100) {
            setMarks(value);
            setError('');
        } else {
            setError('Marks should be between 0 and 100.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error === '') {
            // Submit marks logic goes here
            alert(`Marks ${marks} submitted!`);
        }
    };

    return (
        <div>
            <h1>Teacher Marks Entry</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="marks">Enter Marks (0-100):</label>
                <input type="number" id="marks" value={marks} onChange={handleMarksChange} />
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default TeacherMarksEntry;