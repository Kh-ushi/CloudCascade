import './Login.css';


export default function Login({ selectFunc,refresh,refreshComp}) {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'include', // Include cookies in requests
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                result = { message: 'Unexpected response from server' };
            }

            if (response.ok) {
                alert('Login successful!');
                refreshComp();
                selectFunc('DashBoard');

            } else {
                alert('Login failed: ' + (result.message || 'Unknown error'));
                console.error('Error:', result.message || 'Unknown error');
                selectFunc('Login');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during login');
        }
    };

    return (
        <div className='login-container'>
            <h2>Login</h2>
            <form className='login-form' onSubmit={handleSubmit}>
                <label htmlFor="username">Full Name</label>
                <input type="text" id="username" placeholder="Enter your name" name="username" required />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" name="password" required />

                <button type="submit" className='login-button'>Login</button>
            </form>
        </div>
    );
}

