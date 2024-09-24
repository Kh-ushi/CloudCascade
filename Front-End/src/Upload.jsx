

import { useState } from 'react';
import axios from 'axios';
import './Upload.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar'; // Import the ProgressBar component

export default function Upload() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate=useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent the default form submission
        
        setLoading(true); // Show progress bar
        setProgress(0); // Reset progress

        const formData = new FormData(event.target);

        const config = {
            onUploadProgress: (event) => {
                if (event.lengthComputable) {
                    const percentCompleted = Math.round((event.loaded * 100) / event.total);
                    setProgress(percentCompleted); // Update progress
                }
            }
        };

        try {
        const response = await axios.post('http://localhost:8080/api/uploadFile', formData, config);
        
          let file=response.data.file[0];
           console.log(file);
          navigate(`/file/${file._id}`,{state:{file}});


        } catch (error) {
            // Handle error (e.g., show an error message)
        } finally {
            setLoading(false); // Hide progress bar
            setProgress(0); // Reset progress
        }
    };

    return (
        <div className="uploadForm">
            <div className="uploadUpIcon">
                <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="form-group">
                    <input
                        type="file"
                        id="fileUpload"
                        name="fileUpload"
                        className="form-control"
                        multiple
                        required
                    />
                    <select name="fileType" id="fileType" required>
                        <option value="Images">Images</option>
                        <option value="Videos">Videos</option>
                        <option value="Music">Music</option>
                        <option value="Pdf">Pdf</option>
                        <option value="Word">Word</option>
                         <option value="Movies">Movies</option>
                         <option value="Excel">Excel</option>
                         <option value="PPTs">PPTs</option>
                         <option value="E-Books">E-Books</option>
                         <option value="Databases">Databases</option>
                         <option value="Text-Files">Text-Files</option>
                         <option value="Other">Other</option>
                        
                    </select>
                </div>
                <div className="uploadButton">
                    <button type="submit" className="btn btn-primary">Upload</button>
                </div>
            </form>
            {loading && <ProgressBar progress={progress} />} {/* Show progress bar when loading */}
        </div>
    );
}
