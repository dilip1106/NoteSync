import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const NoteEditor = () => {
  const { uniqueUrl } = useParams();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/notes" : "/api/notes";

  // Initialize Socket.IO client
  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Listen for real-time updates
    socket.on('noteUpdated', (updatedNote) => {
      if (updatedNote.uniqueUrl === uniqueUrl) {
        setContent(updatedNote.content);
      }
    });

    return () => {
      socket.disconnect(); // Clean up the socket connection on component unmount
    };
  }, [uniqueUrl]);

  // Fetch or create note content on component load
  useEffect(() => {
    const fetchOrCreateNote = async () => {
      try {
        // First, attempt to fetch the note
        const { data } = await axios.get(`${API_URL}/${uniqueUrl}`);
        setContent(data.content);
        setIsLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If the note does not exist (404), create a new one
          const { data } = await axios.post(API_URL, { content: '', uniqueUrl });
          setContent(data.content);  // Set the content of the newly created note
          setIsLoading(false);  // Stop loading
        } else {
          console.error('Error fetching note:', error);
          setIsLoading(false);
        }
      }
    };

    fetchOrCreateNote();
  }, [uniqueUrl]);

  const updateNote = async () => {
    try {
      const { data } = await axios.put(`${API_URL}/${uniqueUrl}`, { content });
      setContent(data.content); // Update the state with the latest content after saving
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  return (
    <div style={styles.container}>
      {isLoading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={updateNote}
          style={styles.textArea}
          rows="10"
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#121212',  // Dark background
    height: '100vh',  // Full viewport height
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    color: 'white',  // White text
    fontFamily: 'Arial, sans-serif',
    padding: '0',  // No padding around the container
    margin: '0',  // No margin around the container
    overflowX: 'hidden',  // Prevent horizontal scrolling
  },
  loading: {
    fontSize: '24px',
    color: 'white',
  },
  textArea: {
    width: '100vw',  // Full screen width
    height: '100vh', // Full screen height
    backgroundColor: '#1e1e1e',  // Slightly lighter background
    color: 'white',  // White text
    fontSize: '20px',  // Larger font size
    border: 'none',  // Remove border
    borderRadius: '0',  // Remove rounded corners
    padding: '20px',  // Add padding inside the text area
    resize: 'none',  // Disable resizing
    overflowX: 'hidden',  // Hide horizontal scrollbar
    outline: 'none',  // Remove default outline on focus
    boxSizing: 'border-box',  // Ensure padding is included in the element's size
    wordWrap: 'break-word',  // Ensure long words break to the next line
    lineHeight: '1.5',  // Line height to improve readability
  }
};

export default NoteEditor;
