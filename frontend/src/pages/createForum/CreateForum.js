import { Link } from "react-router-dom";
import "./CreateForum.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateForum = () => {
  const [title, setTitle] = useState("");
  const [mainBody, setMainBody] = useState("");
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the auth token and determine the logged-in user
  const authToken = localStorage.getItem('accessToken');
  const loggedInUsername = localStorage.getItem('username');
  const userApi = `http://3.140.132.61/api/user/${loggedInUsername}/`;

  // Fetch user data based on the username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(userApi);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
  }, [userApi]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form submission

    // Check for empty fields
    if (title.trim() === "" || mainBody.trim() === "") {
      alert("Please fill in all fields"); 
      return;
    }

    const forumData = {
      title,
      mainBody,
      userID: userData?.userID,  // userID fetched from user data
      upvotes: 0,                // Set default upvotes and downvotes
      downvotes: 0,
      subredditID: 0          // zero means all
    };

    try {
      const response = await fetch("http://3.140.132.61/api/create-forum/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //Authorization: `Bearer ${authToken}`, // Authorization using Bearer token
        },
        body: JSON.stringify(forumData),
      });

      if (!response.ok) {
        throw new Error("Forum creation failed");
      }

      // Navigate to forums page after successful creation
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>InsteadIt!</h1>
          <p>
            Create a new forum and start a discussion on topics you're passionate about!
          </p>
          <span>Want to view existing forums?</span>
          <Link to="/">
            <button>Go to Forums</button>
          </Link>
        </div>
        <div className="right">
          <h1>Create Forum</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Forum Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              style={{ height: "200px" }}
              placeholder="Main Body"
              value={mainBody}
              onChange={(e) => setMainBody(e.target.value)}
              required
            ></textarea>
            <button type="submit">Create Forum</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateForum;
