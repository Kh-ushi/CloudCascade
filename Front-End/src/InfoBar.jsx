import './InfoBar.css';
import { useState, useEffect } from 'react';

export default function InfoBar({ getUser, refresh}) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        console.log("Refersh Changed :",refresh);
        fetch('http://localhost:8080/api/isLoggedIn', {
            method: 'POST',
            credentials: 'include',
        })
            .then(response => response.json())
            .then(data => {
                if (data.loggedIn) {
                    setUser(data.user);
                    getUser(data.user);
                    console.log(data);
                } else {
                    setUser(data.user);
                    getUser(data.user);
                    console.log(data);
                }
            })
            .catch(error => console.error('Error:', error));
    }, [refresh]); 
    


    return (
        <div className="InfoBar">
            <div>
                {user ? (
                    <div className='userInfo'>
                        <div className='userImg'><i className="fa-solid fa-user"></i></div>
                        <p>{user.username}</p>
                    </div>
                ) : (
                    <div className='userInfo'>
                        <div className='userImg'><i className="fa-solid fa-user"></i></div>
                        <p>LOGIN/SIGN-UP</p>
                    </div>
                )}
            </div>
            <div className='icons-settings-bell'>
                <div><i className="fa-solid fa-gear"></i></div>
                <div><i className="fa-solid fa-bell"></i></div>
            </div>
        </div>
    );
}
