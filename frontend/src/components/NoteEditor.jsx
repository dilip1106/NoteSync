import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

const NoteEditor = () => {
  const { uniqueUrl } = useParams();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileAvailable, setFileAvailable] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Modal visibility
  const [newPassword, setNewPassword] = useState(""); // New password input
  const [removePasswordModal, setRemovePasswordModal] = useState(false); // Modal visibility
const [enteredPassword, setEnteredPassword] = useState(""); // Password input
const [resetpasswordError, setResetPasswordError] = useState("");

  const API_URL =
    import.meta.env.MODE === "development" ? "http://localhost:5000/api/notes" : "/api/notes";

  useEffect(() => {
    const checkProtection = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/is-protected/${uniqueUrl}`);
        setIsPasswordProtected(data.isProtected);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking password protection:", error);
      }
    };
    checkProtection();
  }, [uniqueUrl]);

  const verifyPassword = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/verify-password/${uniqueUrl}`, { password });
      if (data.verified) {
        setPasswordVerified(true);
        setPasswordError("");
      } else {
        setPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      setPasswordError("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (passwordVerified || !isPasswordProtected) {
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
    }
  }, [passwordVerified, isPasswordProtected, uniqueUrl]);
  useEffect(() => {
    const checkFile = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/check-file/${uniqueUrl}`);

        setFileAvailable(data.fileAvailable);
      } catch (error) {
        setFileAvailable(false); // Reset state if file is not available
      }
    };
    checkFile();
  }, [uniqueUrl]);

  useEffect(() => {
    const socket = io("https://notesync-bad5.onrender.com/");

    // Notify server that this client has joined a specific uniqueUrl
    socket.emit("joinPage", uniqueUrl);
// Notify server that this client has joined a specific uniqueUrl
socket.emit("joinPage", uniqueUrl);
socket.on("noteUpdated", (updatedNote) => {
      if (updatedNote.uniqueUrl === uniqueUrl) {
        setContent(updatedNote.content);
      }
    });
    // Update the user count whenever it changes
    socket.on("userCountUpdated", (count) => {
      setUserCount(count); // Update the state with the new user count
    });

    return () => {
      // Notify server that this client is leaving the page
      socket.emit("leavePage", uniqueUrl);
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

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert("File size exceeds 5 MB. Please choose a smaller file.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${API_URL}/upload/${uniqueUrl}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("File uploaded successfully");
      setFileAvailable(true);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleFileDownload = async () => {
    try {
      const fileUrl = `${API_URL}/download/${uniqueUrl}`;
      const response = await axios.get(fileUrl, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "download.zip"; // Default filename
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="(.+)"/);
        if (matches && matches[1]) {
          fileName = decodeURIComponent(matches[1]);
        }
      }

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download the file. Please try again later.");
    }
  };
  const handleFileRemove = async () => {
    try {
      const { data } = await axios.delete(`${API_URL}/remove-file/${uniqueUrl}`);
      alert(data.message);
      setFileAvailable(false); // Update the state to reflect the file removal
    } catch (error) {
      console.error("Error removing file:", error);
      alert("Failed to remove the file. Please try again later.");
    }
  };

  const handleAddPasswordClick = () => {
    setShowPasswordModal(true); // Open the modal
  };
  
  const handleSavePassword = async () => {
    try {
      const response = await axios.patch(`${API_URL}/add-password/${uniqueUrl}`, {
        password: newPassword,
      });
  
      alert(response.data.message);
      setIsPasswordProtected(true); // Update UI
      setShowPasswordModal(false); // Close the modal
    } catch (error) {
      console.error("Error adding password:", error);
      alert("Failed to add password. Please try again.");
    }
  };
  const handleRemovePasswordClick = () => {
    setRemovePasswordModal(true); // Show the modal to input the password
  };
  
  const verifyAndRemovePassword = async () => {
    try {
      // Verify the password
      const verifyResponse = await axios.post(`${API_URL}/verify-password/${uniqueUrl}`, {
        password: enteredPassword,
      });
  
      if (verifyResponse.data.verified) {
        // Password verified, proceed to remove it
        const removeResponse = await axios.patch(`${API_URL}/remove-password/${uniqueUrl}`);
        alert(removeResponse.data.message);
        setIsPasswordProtected(false); // Update UI
        setRemovePasswordModal(false); // Close modal
        setResetPasswordError(""); // Clear errors
      } else {
        setResetPasswordError("Incorrect password. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying/removing password:", error);
      alert("Failed to remove password. Please try again later.");
    }
  };


  return (
    <div style={styles.container}>
    {isLoading ? (
      <p className="text-2xl animate-pulse">Loading...</p>
    ) : isPasswordProtected && !passwordVerified ? (
      <div style={{display:"flex", alignItems:"center", flexDirection:"column"}}>
        <p >This note is password protected. Please enter the password:</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input} // Apply new style here
        />
        <button
          onClick={verifyPassword}
          style={buttonStyles("#007BFF")} // Blue for Verify
        >
          Verify Password
        </button>
        {passwordError && <p className="text-red-500">{passwordError}</p>}
      </div>
    ) : (
      <>
        <div style={styles.topRight}>
          <p>
            File Available:{" "}
            <span style={{ color: fileAvailable ? "green" : "red" }}>
              {fileAvailable ? "Yes" : "No"}
            </span>
          </p>
          <p>Users Online: {userCount}</p>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={updateNote}
          style={styles.textArea}
          rows="10"
        />
        <div>
          <input
            type="file"
            onChange={handleFileUpload}
            style={styles.fileInput} // Apply new style here
          />
          <button
            onClick={handleFileDownload}
            style={buttonStyles("#333")}
          >
            Download File
          </button>
          {fileAvailable && (
            <button onClick={handleFileRemove} style={styles.removeButton}>
              Remove File
            </button>
          )}
          {!isPasswordProtected && (
            <button
              onClick={handleAddPasswordClick}
              style={buttonStyles("#4CAF50")} // Green for Add Password
            >
              Add Password
            </button>
          )}
          {showPasswordModal && (
            <div className="modal flex flex-col items-center space-y-4">
              <p className="text-lg">Set a password for this note:</p>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={styles.input} // Apply new style here
              />
              <div className="space-x-4">
                <button
                  onClick={handleSavePassword}
                  style={buttonStyles("#007BFF")} // Blue for Save
                >
                  Save Password
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  style={buttonStyles("#6C757D")} // Grey for Cancel
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {isPasswordProtected && (
            <button
              onClick={handleRemovePasswordClick}
              style={buttonStyles("#FF5C5C")} // Red for Remove Password
            >
              Remove Password
            </button>
          )}
          {removePasswordModal && (
            <div className="modal flex flex-col items-center space-y-4">
              <p className="text-lg">Enter the current password to remove it:</p>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
                style={styles.input} // Apply new style here
              />
              {resetpasswordError && <p className="text-red-500">{resetpasswordError}</p>}
              <div className="space-x-4">
                <button
                  onClick={verifyAndRemovePassword}
                  style={buttonStyles("#007BFF")} // Blue for Verify & Remove
                >
                  Verify & Remove
                </button>
                <button
                  onClick={() => setRemovePasswordModal(false)}
                  style={buttonStyles("#6C757D")} // Grey for Cancel
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
}
const styles = {
  container: {
    backgroundColor: "#121212",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "white",
    fontFamily: "Arial, sans-serif",
    padding: "0",
    margin: "0",
    overflowX: "hidden",
  },
  topRight: {
    position: "absolute",
    top: "10px",
    right: "20px",
    textAlign: "right",
    fontSize: "16px",
  },
  loading: {
    fontSize: "24px",
    color: "white",
  },
  textArea: {
    width: "100vw",
    height: "100vh",
    backgroundColor: "#1e1e1e",
    color: "white",
    fontSize: "20px",
    border: "none",
    padding: "20px",
    resize: "none",
    overflowX: "hidden",
    outline: "none",
    boxSizing: "border-box",
    wordWrap: "break-word",
    lineHeight: "1.5",
  },
  fileActions: {
    marginTop: "20px",
  },
  removeButton: {
    height:"45px",
    marginRight: "10px",
    color: "white",
    backgroundColor: "#FF5C5C", // Red background
    border: "none",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease", // Smooth background change
  },
  button: {
    height:"45px",
    marginRight: "10px",
    padding: "12px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: "14px",
    border: "none",
    transition: "background-color 0.3s ease, transform 0.2s ease", // Transition for background and scale
  },
  addPasswordButton: {
    backgroundColor: "#4CAF50", // Green background
    color: "white",
  },
  verifyButton: {
    backgroundColor: "#007BFF", // Blue background
    color: "white",
    marginRight:"15px",
  },
  removePasswordButton: {
    backgroundColor: "#FF5C5C", // Red background for removal
    color: "white",
  },
  cancelButton: {
    backgroundColor: "#6C757D", // Grey background for cancel
    color: "white",
  },
  input: {
    backgroundColor: "#333", // Dark background for inputs
    color: "white", // White text color
    padding: "12px", // Increased padding for bigger input
    fontSize: "18px", // Bigger font size
    borderRadius: "6px", // Rounded corners
    width: "150px", // Full width
    marginBottom: "10px", // Space between inputs
    outline: "none", // Remove default outline
    boxSizing: "border-box", // Ensure padding doesn't affect width
  },
  fileInput:{
    backgroundColor: "#333", // Dark background for inputs
    color: "white", // White text color
    padding: "12px", // Increased padding for bigger input
    fontSize: "15px", // Bigger font size
    borderRadius: "6px", // Rounded corners
    width: "170px", // Full width
    marginBottom: "10px", // Space between inputs
    outline: "none", // Remove default outline
    boxSizing: "border-box",
    marginRight:"10px",
  }
};

const buttonStyles = (color) => ({
  ...styles.button,
  backgroundColor: color,
});

export default NoteEditor;