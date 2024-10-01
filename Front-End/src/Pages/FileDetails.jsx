import { useLocation, useNavigate } from "react-router-dom";
import './FileDetails.css';
import { useState, useEffect } from "react";
import NoFiles from "../NoFiles";
import SearchBar from "../SearchBar";

export default function FileDetails({ isDeleted, setIsDeleted }) {
    const location = useLocation();
    const [file, setFile] = useState(location.state?.file || {}); // Initialize file state
    const [downloading, setDownloading] = useState({}); // Track download status
    const [searchQuery, setSearchQuery] = useState(''); // Track search query
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userId, setUserId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/isLoggedIn', {
                    method: 'POST',
                    credentials: 'include'
                });

                const data = await response.json();
                setIsLoggedIn(data.loggedIn); // Ensure this matches your API response
                setUserId(data.user._id);
            } catch (error) {
                console.error('Error checking login status:', error);
                setIsLoggedIn(false); // Default to false on error
            }
        }

        checkLoginStatus();
    }, []);

    useEffect(() => {
        // Update file state whenever location.state changes
        setFile(location.state?.file || {});
    }, [location.state]); // This will trigger the effect when location.state changes

    useEffect(() => {
        console.log("FileDetails Getting Re-rendered because isDeleted changes inside fileDetails");
    }, [isDeleted]);

    function getSize(sizeInBytes) {
        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        let unitIndex = 0;
        let size = sizeInBytes;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    const handleDownload = async (fileId, fileName) => {
        if (!isLoggedIn) {
            alert('You must be logged in to download files.');
            return;
        }

        setDownloading(prev => ({ ...prev, [fileId]: true }));

        try {
            const response = await fetch(`http://localhost:8080/api/retrieveFile/${fileId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create a download link and programmatically click it
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName; // Use the original file name here
            document.body.appendChild(a);
            a.click();
            a.remove();

            // Cleanup URL object
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download the file. Please try again later."); // User-friendly error message
        } finally {
            setDownloading(prev => ({ ...prev, [fileId]: false }));
        }
    };

    const handleDelete = async (file) => {
        if (!isLoggedIn) {
            alert('You must be logged in to delete files.');
            return;
        }

        if (file.userId !== userId) {
            alert('You are not the owner of this file');
            return;
        }

        try {
            console.log(file._id);
            console.log(file.fileCategory);

            // Pass the file category as a query parameter
            const response = await fetch(`http://localhost:8080/api/deleteFile/${file._id}?category=${file.fileCategory}`, {
                method: 'DELETE', // Ensure you're using the DELETE method
            });

            // Check if the deletion was successful
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                alert(result.message);
                navigate('/');

                setIsDeleted((prev) => !prev); // Toggle isDelete state
            } else {
                console.error('Failed to delete file');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    // Filter files based on the search query (matches full or initials)
    const filteredFiles = file?.files?.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="FileDetails">
            <div className="file-type">
                <div dangerouslySetInnerHTML={{ __html: file.icon }} className='icon-file'></div>
                <h3>{file.name}</h3>
            </div>
            <div className="all-files">
                <div className="container">
                    {!file.files || file.files.length === 0 ? (
                        <NoFiles />
                    ) : (
                        <>
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                            <hr />
                            <table border="1" cellPadding="10" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Sno.</th>
                                        <th>FileName</th>
                                        <th>File Size</th>
                                        <th>Download/Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map((file, index) => (
                                        <tr key={index} className={
                                            file.name.toLowerCase().startsWith(searchQuery.toLowerCase())
                                                ? 'highlight'
                                                : ''
                                        }>
                                            <td>{index + 1}</td>
                                            <td>{file.name}</td>
                                            <td>{getSize(file.chunks.length * file.chunkSize)}</td>
                                            <td>
                                                {downloading[file._id] ? (
                                                    <i className="fa-solid fa-spinner fa-spin"></i> // Spinner icon
                                                ) : (
                                                    <>
                                                        <a href="#" className="dwnld-btn"
                                                           onClick={(e) => {
                                                               e.preventDefault();
                                                               handleDownload(file._id, file.name); // Pass file ID and name
                                                           }}>
                                                            <i className="fa-solid fa-download"></i>
                                                        </a>
                                                        <a href="#" className="trash"
                                                           onClick={(e) => {
                                                               e.preventDefault();
                                                               handleDelete(file);
                                                           }}><i className="fa-solid fa-trash"></i></a>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
