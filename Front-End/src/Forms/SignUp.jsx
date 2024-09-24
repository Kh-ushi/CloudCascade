import './SignUp.css';


export default function SignUp({selectFunc,refresh,refreshComp}) {

    const getSelected=(id)=>{
        selectFunc(id);
    }
 
   const handleSubmit = async (event) => {
    event.preventDefault(); 
    const formData = new FormData(event.target);

    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      const response = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        
        alert('Signup successful!');
        console.log(refresh);
        refreshComp();
        getSelected('DashBoard');
        console.log(refresh);
      } else {
        
        alert('Signup failed: ' + result.message);
        console.error('Error:', result.message);
        getSelected('Login');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred during signup');
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        
        <label htmlFor="name">Full Name</label>
        <input type="text" id="name" placeholder="Enter your name" name="username" required />
        
        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="Enter your email" name="email" required />
        
        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="Enter your password" name="password" required />
        
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

