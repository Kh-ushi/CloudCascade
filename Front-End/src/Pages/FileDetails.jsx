
import { useLocation } from "react-router-dom";
import './FileDetails.css';
import { useState } from "react";
import NoFiles from "../NoFiles";
import SearchBar from "../SearchBar";

export default function FileDetails() {
    const location = useLocation();
    const { file } = location.state || {};
    const [downloading, setDownloading] = useState({}); // Track download status
    const [searchQuery, setSearchQuery] = useState(''); // Track search query

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
        setDownloading(prev => ({ ...prev, [fileId]: true }));

        try {
            const response = await fetch(`http://localhost:8080/api/retrieveFile/${fileId}`);
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
        }

        setDownloading(prev => ({ ...prev, [fileId]: false }));
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
                        <><NoFiles></NoFiles></>
                    ) : (
                        <>
                            {/* Pass the searchQuery and setSearchQuery as props to SearchBar */}
                            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                            <hr />
                            <table border="1" cellPadding="10" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Sno.</th>
                                        <th>FileName</th>
                                        <th>File Size</th>
                                        <th>Download</th>
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
                                                    <a href="#"
                                                       onClick={(e) => { 
                                                           e.preventDefault(); 
                                                           handleDownload(file._id, file.name); // Pass file ID and name
                                                       }}>
                                                        <i className="fa-solid fa-download"></i>
                                                    </a>
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
