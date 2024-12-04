import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import NoteEditor from './components/NoteEditor';
// import "./App.css"
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:uniqueUrl" element={<NoteEditor />} />
    </Routes>
  </Router>
);

export default App;
