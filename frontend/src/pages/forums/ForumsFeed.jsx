import React, { useState, useEffect, useContext } from 'react';
import '../../style.css';
import './Forums.css';
import Forum from './Forums';
import { AuthContext } from '../../context/authContext';
import { DarkModeContext } from '../../context/darkModeContext';
const ForumFeed = () => {
  const [recentForums, setRecentForums] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [forumTitle, setForumTitle] = useState('');
  const [forumBody, setForumBody] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null); // State to store user data
  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(10);
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [inputPostsPerPage, setInputPostsPerPage] = useState('');

  const { darkMode } = useContext(DarkModeContext);

  // Fetch user data
  useEffect(() => {
    setUserData(currentUser);
  }, [currentUser]);

  // Fetch recent forums and associated user details
  const fetchUserDetails = async (userID) => {
    const response = await fetch(`http://3.140.132.61/api/userid/${userID}/`);
    if (!response.ok) {
      throw new Error(`Error fetching user details for ID ${userID}`);
    }
    return response.json();
  };

  const fetchRecentForumsAndUsers = async () => {
    try {
      const response = await fetch(`http://3.140.132.61/api/recent-forums/0/${start}/${end}/`);
      const data = await response.json();

      if (data.length === 0 && start !== 0) {
        // If no posts are returned and it's not the first page, go back to the previous page
        setStart(start - postsPerPage);
        setEnd(end - postsPerPage);
      }

      const userPromises = data.map(async (forum) => {
        const userDetails = await fetchUserDetails(forum.userID);
        return {
          userID: forum.userID,
          username: userDetails.username,
          displayName: userDetails.displayName,
          profilePicture: userDetails.profilePicture,
          forumID: forum.forumID,
          mainBody: forum.mainBody,
          title: forum.title,
          upvotes: forum.upvotes,
          downvotes: forum.downvotes,
          subredditID: forum.subredditID,
        };
      });

      const forumsWithDetails = await Promise.all(userPromises);
      setRecentForums(forumsWithDetails);
    } catch (error) {
      console.error('Error fetching forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!forumTitle || !forumBody) {
      setError('Please fill in both fields');
      return;
    }

    if (!userData) {
      setError('User data not loaded');
      return;
    }

    const postData = {
      title: forumTitle,
      mainBody: forumBody,
      userID: userData.userID,  // Use the logged-in user's ID
      upvotes: 0,
      downvotes: 0,
      subredditID: 0, //0 gets all the forums
    };

    try {
      const response = await fetch('http://3.140.132.61/api/create-forum/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Error creating forum post');

      setShowPopup(false);
      setForumTitle('');
      setForumBody('');
      setError('');
      fetchRecentForumsAndUsers();
    } catch (error) {
      console.error('Error creating forum post:', error);
      setError('Failed to create the forum post');
    }
  };

  useEffect(() => {
    fetchRecentForumsAndUsers();
  }, [start, end]);

  const handlePrevious = () => {
    if (start > 0) {
      setStart(start - postsPerPage);
      setEnd(end - postsPerPage);
    }
  };

  const handleNext = () => {
    fetchRecentForumsAndUsers().then(() => {
      if (recentForums.length === 0) {
        setStart(start - postsPerPage);
        setEnd(end - postsPerPage);
      } else {
        setStart(start + postsPerPage);
        setEnd(end + postsPerPage);
      }
    });
  };

  const handlePostsPerPageChange = (event) => {
    setInputPostsPerPage(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const newPostsPerPage = parseInt(inputPostsPerPage, 10);
      if (!isNaN(newPostsPerPage) && newPostsPerPage > 0) {
        setPostsPerPage(newPostsPerPage);
        setStart(0);
        setEnd(newPostsPerPage);
      }
    }
  };

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
	  <>
      {/* Posts per page container */}
      <div className="posts-per-page-container" style={{ width: '100%', height: '12%' }}>
        <div className={`forums-posts-per-page-input ${darkMode ? 'dark-posts-per-page' : ''}`}>
          <label>Posts per page:</label>
          <input
            type="number"
            value={inputPostsPerPage}
            onChange={handlePostsPerPageChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter Number"
            className="forums-posts-input"
          />
          {/* Pagination controls below the input */}
          <div className="forums-pagination-controls" data-theme={darkMode ? 'dark' : 'light'}>
            <button
              onClick={handlePrevious}
              disabled={start === 0}
              style={{ backgroundColor: start === 0 ? '#ccc' : '' }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={recentForums.length < postsPerPage}
              style={{ backgroundColor: recentForums.length < postsPerPage ? '#ccc' : '' }}
            >
              Next
            </button>
          </div>
          {/* Button to create a new post */}
          {userData && (
            <button className="create-post-button" onClick={() => setShowPopup(true)}>
              +
            </button>
          )}
        </div>
      </div>

      {/* Feed container */}
      <div className="feed-container" data-theme={darkMode ? 'dark' : 'light'}>
        {/* Display the list of forums */}
        {recentForums.map((forum) => (
          <Forum
            key={forum.forumID}
            profileImage={forum.profilePicture}
            displayName={forum.displayName}
            username={forum.username}
            content={forum.mainBody}
            subredditID={forum.subredditID}
          />
        ))}

      {/* Pop-up for creating a new post */}
      {showPopup && (
        <div className="popup-overlay" data-theme={darkMode ? 'dark' : 'light'}>
          <div className="popup-content" data-theme={darkMode ? 'dark' : 'light'}>
            <h2>Create a New Forum Post</h2>
            {error && <div className="error-message">{error}</div>}
            <input
              type="text"
              placeholder="Forum Title"
              value={forumTitle}
              onChange={(e) => setForumTitle(e.target.value)}
            />
            <textarea
              placeholder="Forum Content"
              value={forumBody}
              onChange={(e) => setForumBody(e.target.value)}
            />
            <div className="popup-actions">
              <button className="submit-button" onClick={handleCreatePost}>
                Submit
              </button>
              <button className="cancel-button" onClick={() => setShowPopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
	</>
  );
};

export default ForumFeed;
