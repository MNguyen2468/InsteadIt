// Path to this file ./src/pages/login/Login.jsx
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import "./login.css";

const apiLogin = "http://3.140.132.61/api/login/"; // API endpoint for login

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate

  // State to track username and password input
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // State for error messages

  // Function to get CSRF token from cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (username.trim() === "" || password.trim() === "") {
      alert("Please enter both username and password"); // Display an error message
      return;
    }

    const data = {
      username,
      password,
    };

    // Get the CSRF token
    const csrftoken = getCookie('csrftoken'); 

    try {
      const response = await fetch(apiLogin, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //"X-CSRFToken": csrftoken, // Include CSRF token here
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json(); // Get the response data
        // Store tokens in local storage or context
        localStorage.setItem('accessToken', responseData.access);
        localStorage.setItem('refreshToken', responseData.refresh);
        localStorage.setItem('username', username); // <--- Store the username in local storage
        login(responseData.access); // Call the login function with the access token
        navigate("/"); // Navigate to the home page after successful login
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Login failed"); // Set error message from backend
        console.log("Login failed:", errorData);
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred. Please try again."); // General error message
    }
  };

  // Function to proceed without logging in
  const handleProceedWithoutLogin = () => {
    navigate("/"); // Directly navigate to the home page without logging in
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>InsteadIt!</h1>
          <p>
            Welcome to InsteadIt! The social media platform that combines 
	    the functionality of reddit and instagram.
          </p>
          <span>Don't you have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          {error && <div className="error-message">{error}</div>} {/* Display error message if exists */}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Login</button>
            <button type="button" onClick={handleProceedWithoutLogin}>
              Proceed without logging in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

//Examples for future
/* Getting and checking token
const accessToken = localStorage.getItem('accessToken');
console.log("Access Token:", accessToken);

if (!accessToken) {
  console.log("No access token found, user is not authenticated.");
} else {
  console.log("User is authenticated.");
}

*/

/* Add Token in API Requests; Once logged in, you'll typically want to include the accessToken in your API requests to authenticate the user.
const fetchProtectedData = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://3.140.132.61/api/protected-endpoint/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
      'Content-Type': 'application/json'
    },
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log("Protected data:", data);
  } else {
    console.log("Failed to fetch protected data. Status:", response.status);
  }
};
*/

/* Auto direct if not Auth
useEffect(() => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    navigate("/login");  // Redirect to login page if no token
  }
}, [navigate]);
*/
