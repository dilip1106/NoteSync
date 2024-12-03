import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const NoteEditor = () => {
  const { uniqueUrl } = useParams();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const API_URL =
    import.meta.env.MODE === "development" ? "http://localhost:5000/api/notes" : "/api/notes";
    const [fileAvailable, setFileAvailable] = useState(false);

    useEffect(() => {
      const checkFile = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/check-file/${uniqueUrl}`);
          setFileAvailable(data.fileAvailable);
        } catch (error) {
          setFileAvailable(false); // If no file, reset the state
        }
      };
    
      checkFile();
    }, [uniqueUrl]);
    
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("noteUpdated", (updatedNote) => {
      if (updatedNote.uniqueUrl === uniqueUrl) {
        setContent(updatedNote.content);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [uniqueUrl]);

  useEffect(() => {
    const fetchOrCreateNote = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${uniqueUrl}`);
        setContent(data.content);
        setIsLoading(false);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const { data } = await axios.post(API_URL, { content: "", uniqueUrl });
          setContent(data.content);
          setIsLoading(false);
        } else {
          console.error("Error fetching note:", error);
          setIsLoading(false);
        }
      }
    };

    fetchOrCreateNote();
  }, [uniqueUrl]);

  const updateNote = async () => {
    try {
      const { data } = await axios.put(`${API_URL}/${uniqueUrl}`, { content });
      setContent(data.content);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const formData = new FormData();
      formData.append('file', event.target.files[0]);
  
      await axios.post(`${API_URL}/upload/${uniqueUrl}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      alert('File uploaded successfully');
      setFileAvailable(true); // Update the state
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };


  
  
//  const handleFileDownload = async () => {
//   try {
//     const fileUrl = `${API_URL}/download/${uniqueUrl}`;
//     const response = await axios.get(fileUrl, { responseType: 'blob' });

//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;

//     // Extract the filename from the Content-Disposition header
//     const contentDisposition = response.headers['content-disposition'];
//     const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
//     const fileName = fileNameMatch ? fileNameMatch[1] : 'download';

//     link.setAttribute('download', fileName);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   } catch (error) {
//     console.error('Error downloading file:', error);
//   }
// };

  
const handleFileDownload = async () => {
  try {
    const fileUrl = `${API_URL}/download/${uniqueUrl}`;
    const response = await axios.get(fileUrl, { responseType: "blob" });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    // Extract the filename from the Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
    const fileName = fileNameMatch ? fileNameMatch[1] : "download";

    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

  return (
    <div style={styles.container}>
      {isLoading ? (
        <p style={styles.loading}>Loading...</p>
      ) : (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={updateNote}
            style={styles.textArea}
            rows="10"
          />
          
            <div style={styles.fileActions}>
            <input type="file" onChange={handleFileUpload} />

              <button onClick={handleFileDownload}>Download File</button>
            </div>
        </>
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
