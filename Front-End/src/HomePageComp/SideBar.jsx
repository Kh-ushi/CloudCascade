import { useEffect } from "react";
import "./SideBar.css";
import axios from 'axios';

const SideBar = ({ onSelect, selected, getData, user}) => {
    const getSelected = (id) => {
        onSelect(id);
    };

    useEffect(() => {
        if (selected === 'DashBoard') {
            axios.post("http://localhost:8080/api/getCategory")
                .then(response => {
                    getData(response.data.data);
                })
                .catch(err => {
                    console.log("Error from backend: ", err);
                });
        }
    }, [selected]);  // Add `refresh` to the dependency array

    return (
        <div className="SideBar">
            <div className="child-one">
                <div
                    className={selected === 'DashBoard' ? 'selected' : ''}
                    onClick={() => getSelected('DashBoard')}
                >
                    <i className="fa-solid fa-table-columns"></i>Cloud
                </div>
                <div
                    className={selected === 'UploadFiles' ? 'selected' : ''}
                    onClick={() => getSelected('UploadFiles')}
                >
                    <i className="fa-solid fa-arrow-up"></i>Upload Files
                </div>
                <div
                    className={selected === 'AllFiles' ? 'selected' : ''}
                    onClick={() => getSelected('AllFiles')}
                >
                    <i className="fa-solid fa-folder"></i>All Files
                </div>
            </div>
            <br /><br /><br /><br /><br />
            <div className="child-two">
                <div
                    className={selected === 'Help' ? 'selected' : ''}
                    onClick={() => getSelected('Help')}
                >
                    <i className="fa-solid fa-message"></i>Help & Support
                </div>
                {user ? (
                    <div
                        className={selected === 'Logout' ? 'selected' : ''}
                        onClick={() => getSelected('Logout')}
                    >
                        <i className="fa-solid fa-right-to-bracket"></i>Logout
                    </div>
                ) : (
                    <div
                        className={selected === 'Login' ? 'selected' : ''}
                        onClick={() => getSelected('Login')}
                    >
                        <i className="fa-solid fa-right-to-bracket"></i>Login
                    </div>
                )}
            </div>
        </div>
    );
};

export default SideBar;

