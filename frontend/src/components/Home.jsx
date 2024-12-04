// import React, { useState } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';

// const Home = () => {
//     // const { uniqueUrl } = useParams();
//     const [content, setContent] = useState('');
//     const navigate = useNavigate();
//     const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/notes" : "/api/notes";

//     const createNote = async () => {
//         try {
//             const { data } = await axios.post('http://localhost:5000/api/notes', { content,uniqueUrl });
//             navigate(`/note/${data.uniqueUrl}`);
//         } catch (error) {
//             console.error('Error creating note:', error);
//         }
//     };

//     return (
//         <div>
//             <h1>Welcome to Shrib</h1>
//             <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="Write your note here..."
//                 rows="10"
//                 cols="50"
//             />
//             <br />
//             <button onClick={createNote}>Create Note</button>
//         </div>
//     );
// };

// export default Home;

import React from 'react';

const Home = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a, #333333)',
        color: 'white',
        textAlign: 'center',
        padding: '20px',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(100, 100, 100, 0.3), 0 4px 10px rgba(50, 50, 50, 0.2)',
          backgroundColor: '#1e1e1e',
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: '#f0f0f0',
          }}
        >
          NOTESYNC
        </h1>
        <p>
          Welcome to NOTESYNC, your go-to platform for collaborative note-taking
          and sharing!
        </p>

        {/* "How to Use" Section */}
        <div
          style={{
            margin: '1rem 0',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(80, 80, 80, 0.3)', // Subtle shadow only
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>How to use:</p>
          <ul
            style={{
              listStyleType: 'disc',
              textAlign: 'left',
              paddingLeft: '1.5rem',
            }}
          >
            <li>Add any name of your choice after the "/" in the URL, and your note will be created.</li>
            <li>Upload files and share them with others.</li>
          </ul>
        </div>

        {/* Features Section */}
        <div
          style={{
            margin: '1rem 0',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(80, 80, 80, 0.3)', // Subtle shadow only
          }}
        >
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Features:</p>
          <ul
            style={{
              listStyleType: 'disc',
              textAlign: 'left',
              paddingLeft: '1.5rem',
            }}
          >
            <li>Share plain text notes any any files with ease.</li>
            <li>See the number of users currently accessing the same note.</li>
            <li>Add a password to protect your notes for enhanced privacy.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
