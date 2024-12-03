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
    const socket = io("http://localhost:5000");

    // Notify server that this client has joined a specific uniqueUrl
    socket.emit("joinPage", uniqueUrl);

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
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg">This note is password protected. Please enter the password:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded-lg w-64"
          />
          <button
            onClick={verifyPassword}
            className="px-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
          >
            Verify Password
          </button>
          {passwordError && <p className="text-red-500">{passwordError}</p>}
        </div>
      ) :  (
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
            <input type="file" onChange={handleFileUpload} />
            <button onClick={handleFileDownload} className="inline-block cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-900">Download File</button>
            {fileAvailable && (
              <button onClick={handleFileRemove} style={styles.removeButton}>
                Remove File
              </button>
            )}<>
            {!isPasswordProtected && (
              <button
                onClick={handleAddPasswordClick}
                className="px-6 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700"
              >
                Add Password
              </button>
            )}
    
            {showPasswordModal && (
              <div className="modal flex flex-col items-center space-y-4">
                <p className="text-lg">Set a password for this note:</p>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-800 text-white p-2 rounded-lg w-64"
                />
                <div className="space-x-4">
                  <button
                    onClick={handleSavePassword}
                    className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
                  >
                    Save Password
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 bg-gray-600 rounded-lg text-white hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
          <>
        {isPasswordProtected && (
          <button
            onClick={handleRemovePasswordClick}
            className="px-6 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700"
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
              className="bg-gray-800 text-white p-2 rounded-lg w-64"
            />
            {passwordError && <p className="text-red-500">{passwordError}</p>}
            <div className="space-x-4">
              <button
                onClick={verifyAndRemovePassword}
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
              >
                Verify & Remove
              </button>
              <button
                onClick={() => setRemovePasswordModal(false)}
                className="px-4 py-2 bg-gray-600 rounded-lg text-white hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </>
          </div>
        </>
      )}
    </div>
  );
};

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
    marginLeft: "10px",
    color: "white",
    backgroundColor: "red",
    border: "none",
    padding: "10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default NoteEditor;
