import './Logout.css';
import { useState } from 'react';

export default function Logout({ selectFunc ,refresh ,refreshComp}) {

    const [loading, setLoading] = useState(false); // Add loading state for user feedback

    const handleLogout = async () => {
        try {
            setLoading(true);  // Show loading state

            // Send request to the backend to log out the user
            const response = await fetch('https://cloudcascade.onrender.com/api/logout', {
                method: 'POST',
                credentials: 'include', // Ensures that cookies are sent along with the request
            });

            const result = await response.json();

            if (response.ok) {
                console.log('Logout successful:', result);
                refreshComp();
                selectFunc('Login');  
            } else {
                console.error('Logout failed:', result.message);
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setLoading(false); 
            selectFunc('DashBoard');
        }
    };

    const cancelLogout = () => {
        selectFunc('DashBoard'); 
    };

    return (
        <div className="logout-container">
            <div className="logout-box">
                <h2>Are you sure you want to logout?</h2>
                <div className="button-group">
                    <button className="btn-confirm" onClick={handleLogout} disabled={loading}>
                        {loading ? 'Logging out...' : 'Logout'}
                    </button>
                    <button className="btn-cancel" onClick={cancelLogout} disabled={loading}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
