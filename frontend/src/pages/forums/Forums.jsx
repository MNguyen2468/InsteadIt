import React, { useState, useEffect, useContext } from "react";
import './Forums.css';
import { Link, useNavigate } from "react-router-dom"; 
import { DarkModeContext } from '../../context/darkModeContext';

const Forum = ({ profileImage, displayName, username, content, subredditID  }) => {
  const navigate = useNavigate();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [image, setImage] = useState(null);
  const { darkMode } = useContext(DarkModeContext);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSubredditClick = () => {
    navigate(`/subreddit/${subredditID}`);
  };

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (profileImage) {
        try {
          const response = await fetch(`http://3.140.132.61/api/photo/${profileImage}/`);
          if (response.ok) {
            const imageData = await response.json();
            setImage(`data:image/jpeg;base64,${imageData.image}`);
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      }
    };

    fetchProfileImage();
  }, [profileImage]);


  return (
    <div className="forum-post">
      <div className="forum-container" data-theme={darkMode ? 'dark' : 'light'}>
        <div className="forum-header">
          <div className="forum-pic">
            {profileImage ? (
                <img src={image} alt={`${displayName}'s profile`} className="profile-image" />
            ) : (
              <div className="avatar-placeholder">{displayName.charAt(0).toUpperCase()}</div>
            )}
          </div>
          <Link to={`/profile/${username}`} className="forum-author">
            <span>{displayName}</span>
          </Link>
        </div>
        <div className="forum-content">
          <p>{content}</p>
        </div>
        <div className="forum-actions">
          <div className="dropdown">
            <button
              className="forum-button"
              onClick={toggleDropdown}
            >
              Rate
            </button>
            {dropdownVisible && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  Like
                </div>
                <div className="dropdown-item">
                  Dislike
                </div>
              </div>
            )}
          </div>
          <button className="forum-button">
            Comment
          </button>
          {subredditID !== 0 && (
            <button className="subreddit-button" onClick={handleSubredditClick}>Subreddit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Forum;
