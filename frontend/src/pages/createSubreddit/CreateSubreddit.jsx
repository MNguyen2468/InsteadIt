import { Link } from "react-router-dom";
import "./CreateSubreddit.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CreateSubreddit = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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
    if (title.trim() === "" || description.trim() === "") {
      alert("Please fill in all fields"); 
      return;
    }

    const subredditData = {
      title: `r/${title}`, // Add r/ prefix to title
      description,
      userID: userData?.userID  // userID fetched from user data
    };

    try {
      const response = await fetch("http://3.140.132.61/api/create-subreddit/", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subredditData),
      });

      if (!response.ok) {
        throw new Error("Subreddit creation failed");
      }

      // Navigate to subreddits page after successful creation
      navigate("/subreddits");
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
            Create a new subreddit community and connect with people who share your interests!
          </p>
          <span>Want to view existing subreddits?</span>
          <Link to="/subreddits">
            <button>Go to Subreddits</button>
          </Link>
        </div>
        <div className="right">
          <h1>Create Subreddit</h1>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Subreddit Name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              style={{ height: "200px" }}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            <button type="submit">Create Subreddit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSubreddit;
