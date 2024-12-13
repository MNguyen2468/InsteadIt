// Path to this file ./src/pages/register/Register.jsx
import { Link } from "react-router-dom";
import "./register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const apiRegister = "http://3.140.132.61/api/register/"

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();// Prevent form submission

    // Check for empty fields
    if (username.trim() === "" || email.trim() === "" || password.trim() === "" || name.trim() === "") {
      alert("Please fill in all fields"); // Alert if any field is empty
      return;
    }

    const data = {
      username,
      email,
      password,
      name,
    };

    try {
      const response = await fetch(apiRegister, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Handle success
        navigate("/login");
      } else {
        // Handle error
        console.log("Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
	
  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>InsteadIt!</h1>
          <p>
            Welcome to InsteadIt! The social media platform that combines 
			the functionality of reddit and instagram.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
          <button>Login</button>
          </Link>
        </div>
        <div className="right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
			  required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
			  required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
			  required
            />
            <input
              type="text"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
			  required
            />
            <button type="submit">Register</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
