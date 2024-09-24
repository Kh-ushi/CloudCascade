import { useState } from "react";
import "./MainBar.css";
import Upload from "../Upload";
import MyCloud from "../MyCloud";
import HelpSupport from "../HelpSupport";
import Footer from "../Footer";
import SearchBar from "../SearchBar";
import NoFiles from "../NoFiles";
import SignUp from "../Forms/SignUp";
import Login from "../Forms/Login";
import Logout from "../Logout";

const MainBar = ({ selectedOption, retrievedData, onSelect, refresh, refreshComp }) => {
    const [downloading, setDownloading] = useState({}); // Track download status
    const [searchQuery, setSearchQuery] = useState(''); // Track search query
    const [showSignUp, setShowSignUp] = useState(false);

    const setSignUp = (id) => {
        setShowSignUp(id);
    }

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

            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed", error);
        }

        setDownloading(prev => ({ ...prev, [fileId]: false }));
    };

    // Check if retrievedData is an array and apply search filter
    const filteredFiles = retrievedData && Array.isArray(retrievedData)
        ? retrievedData.flatMap((item) =>
            item.files.filter((file) =>
                file.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
        : [];

    const renderContent = () => {
        switch (selectedOption) {
            case 'DashBoard':
                return <><MyCloud data={retrievedData} /><br /></>;
            case 'UploadFiles':
                return <Upload />;
            case 'AllFiles':
                return (
                    <>
                        <div className="AllFiles">
                            {!retrievedData || retrievedData.length === 0 ? (
                                <><NoFiles></NoFiles></>
                            ) : (
                                <>
                                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                                    <hr />
                                    <table border="1" cellPadding="10" cellSpacing="0">
                                        <thead>
                                            <tr>
                                                <th>FileName</th>
                                                <th>File Size</th>
                                                <th>Download/Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFiles.map((file, index) => (
                                                <tr
                                                    key={index}
                                                    className={file.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 'highlight' : ''}
                                                >
                                                    <td>{file.name}</td>
                                                    <td>{getSize(file.chunks.length * file.chunkSize)}</td>
                                                    <td>
                                                        {downloading[file._id] ? (
                                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                                        ) : (
                                                            <a href="#"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleDownload(file._id, file.name);
                                                                }}>
                                                                <i className="fa-solid fa-download"></i>
                                                            </a>
                                                        )}
                                                        <a href="#"></a> {/* Your delete link can go here */}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    </>
                );
            case 'Help':
                return (
                    <>
                        <h2 style={{ textAlign: "Center" }}>Help & Support</h2>
                        <HelpSupport />
                        <br />
                        <p style={{ textAlign: "center" }}>Write Us an Email regarding any issue</p>
                        <p style={{ textAlign: "center" }}>Our Team will reply back ASAP</p>
                        <br /><br /><br />
                    </>
                );

            case 'Login':
                return (
                    <>
                        {showSignUp ? (
                            <>
                            <SignUp selectFunc={onSelect} refresh={refresh} refreshComp={refreshComp}></SignUp>
                            <a href="#" className="signUpLink" onClick={(e) => { e.preventDefault(); setShowSignUp(false); }}>
                                    Login
                                </a>
                            </>
                            
                        ) : (
                            <>
                                <Login selectFunc={onSelect} refresh={refresh} refreshComp={refreshComp}></Login>
                                <a href="#" className="signUpLink" onClick={(e) => { e.preventDefault(); setShowSignUp(true); }}>
                                    Doesn't Have An Account? Create One
                                </a>
                            </>
                        )}
                    </>
                );
            case 'Logout':
                return (
                    <>
                        <Logout selectFunc={onSelect} refresh={refresh} refreshComp={refreshComp}></Logout>
                    </>
                );

            default:
                return <div>Please select an option from the sidebar.</div>;
        }
    };

    return (
        <div className="MainBar">
            <div className="MainBar-Content">
                {renderContent()}
                <Footer />
            </div>
        </div>
    );
};

export default MainBar;

