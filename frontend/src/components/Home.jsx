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

import React from 'react'

const Home = () => {
  return (
    <div>Home</div>
  )
}

export default Home