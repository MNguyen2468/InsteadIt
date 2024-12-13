import React, { useState, useEffect, useContext } from 'react';
import '../../style.css'; 
import './Subreddit.css';
import Forum from './Forums';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { DarkModeContext } from '../../context/darkModeContext';


const SubredditFeed = () => {
  const [recentForums, setRecentForums] = useState([]);
  const { subredditID } = useParams();
  const [subredditInfo, setSubredditInfo] = useState(null);
  const [creatorInfo, setCreatorInfo] = useState(null);
  const { currentUser } = useContext(AuthContext); 
  const [isFollowing, setIsFollowing] = useState(false);
  const [showPopup, setShowPopup] = useState(false); // State for controlling the popup
  const [title, setTitle] = useState('');
  const [mainBody, setMainBody] = useState('');
  const [postContent, setPostContent] = useState('');
  const [userData, setUserData] = useState(null); // To store user data for userID
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(DarkModeContext);
  
  // Pagination state
  const [start, setStart] = useState(0);  // Initial start value
  const [end, setEnd] = useState(10);    // Initial end value (shows 10 items)

  // Posts per page state
  const [postsPerPage, setPostsPerPage] = useState(10);
  const [inputPostsPerPage, setInputPostsPerPage] = useState('');

  // Fetch subreddit info and recent forums
  useEffect(() => {
    const fetchSubredditInfo = async () => {
      try {
        const subredditResponse = await fetch(`http://3.140.132.61/api/subreddit-info/${subredditID}/`);
        if (!subredditResponse.ok) {
          throw new Error('Failed to fetch subreddit info');
        }
        const subredditData = await subredditResponse.json();
        setSubredditInfo(subredditData);

        const creatorResponse = await fetch(`http://3.140.132.61/api/userid/${subredditData.userID}/`);
        if (!creatorResponse.ok) {
          throw new Error('Failed to fetch creator info');
        }
        const creatorData = await creatorResponse.json();
        setCreatorInfo(creatorData);

        // Check follow status if user is logged in
        if (currentUser?.userID) {
          const followResponse = await fetch(`http://3.140.132.61/api/is-following-subreddit/${currentUser.userID}/${subredditID}/`);
          if (followResponse.ok) {
            const followData = await followResponse.json();
            setIsFollowing(followData.isFollowing);
          }
        }
      } catch (error) {
        console.error('Error fetching subreddit data:', error);
      }
    };

    fetchSubredditInfo();
  }, [subredditID, currentUser]);

  // Fetch user data to get userID
  useEffect(() => {
    setUserData(currentUser);
  }, [currentUser]);

  // Fetch recent forums and associated user details
  const fetchRecentForumsAndUsers = async () => {
    try {
      const response = await fetch(`http://3.140.132.61/api/recent-forums/${subredditID}/${start}/${end}/`);
      const recentForums = await response.json();

      const userPromises = recentForums.map(async (forum) => {
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

  // Fetch user details for a forum
  const fetchUserDetails = async (userID) => {
    const response = await fetch(`http://3.140.132.61/api/userid/${userID}/`);
    if (!response.ok) {
      throw new Error(`Error fetching user details for ID ${userID}`);
    }
    return response.json();
  };

  // Handle follow/unfollow subreddit
  const handleFollowToggle = async () => {
    if (!currentUser?.userID) {
      alert('Please log in to follow/unfollow subreddits');
      return;
    }

    try {
      const endpoint = isFollowing 
        ? `http://3.140.132.61/api/unfollow-subreddit/${currentUser.userID}/${subredditID}/`
        : `http://3.140.132.61/api/follow-subreddit/${currentUser.userID}/${subredditID}/`;
      
      const response = await fetch(endpoint, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} subreddit`);
      }

      // Toggle the following state after successful API call
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow status:', error);
      alert(error.message);
    }
  };

  //handle posts per page change
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

  // Handle post submission
  const handlePostSubmit = async () => {
    if (!title || !mainBody) {
      alert('Please fill in all fields');
      return;
    }

    const forumData = {
      title,
      mainBody,
      userID: userData?.userID,  // Get userID from userData
      upvotes: 0,
      downvotes: 0,
      subredditID: parseInt(subredditID) 
    };
    console.log('forumData: ', forumData);

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
        throw new Error('Forum creation failed');
      }

      setShowPopup(false);
      setPostContent('');

      // refresh the forum list after creation
      fetchRecentForumsAndUsers();
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchRecentForumsAndUsers();
  }, [subredditID, start, end]);

  // Handle previous and next buttons
  const handlePrevious = () => {
    if (start > 0) {
      setStart(start - postsPerPage);
      setEnd(end - postsPerPage);
    }
  };

  const handleNext = () => {
    setStart(start + postsPerPage);
    setEnd(end + postsPerPage);
  };

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="subreddit-page" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="feed-container" data-theme={darkMode ? 'dark' : 'light'}>
      <div className="subreddit-posts-per-page-input">
          <label>Posts per page:</label>
          <input
            type="number"
            value={inputPostsPerPage}
            onChange={handlePostsPerPageChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter Number"
            className="subreddit-posts-input"
          />
        </div>
        {/* Subreddit Banner */}
        <div className="subreddit-banner">
          <div className="subreddit-name">
            <h1>{subredditInfo?.title}</h1>
          </div>
          <div className="subreddit-description">
            <p>{subredditInfo?.description}</p>
          </div>
          <div className="subreddit-creator-section">
            <p className="subreddit-creator">
              Created by: <Link to={`/profile/${creatorInfo?.username}`}>{creatorInfo?.displayName}</Link>
            </p>
            {currentUser && (
              <button
                onClick={handleFollowToggle}
                className={`follow-button ${isFollowing ? 'following' : ''}`}
                disabled={loading}
              >
                {loading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Display Forum Posts */}
        {recentForums.length === 0 ? (
          <div className="no-forums-message">
            No forums yet
          </div>
        ) : (
          recentForums.map((forum) => (
            <Forum 
              key={forum.forumID} 
              profileImage={forum.profilePicture} 
              displayName={forum.displayName} 
              username={forum.username}
              content={forum.mainBody} 
            />
          ))
        )}

        {/* Pagination Controls */}
        <div className="subreddit-pagination-controls">
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

        {/* Circular Button to Create Post */}
        {userData && (
          <button className="create-subreddit-post-button" onClick={() => setShowPopup(true)}>
            +
          </button>
        )}

        {/* Popup for post input */}
        {showPopup && (
          <div className="popup" data-theme={darkMode ? 'dark' : 'light'}>
            <div className="popup-content" data-theme={darkMode ? 'dark' : 'light'}>
              <h2>Create a Post</h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Forum Title"
              />
              <textarea
                value={mainBody}
                onChange={(e) => setMainBody(e.target.value)}
                placeholder="Write your post..."
              ></textarea>
              <div className="popup-buttons">
                <button 
                  onClick={handlePostSubmit}
                  className="submit-button"
                >
                  Submit
                </button>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubredditFeed;
