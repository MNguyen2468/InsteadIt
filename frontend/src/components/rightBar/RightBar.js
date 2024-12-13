import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import "./rightBar.css";

const RightBar = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [friends, setFriends] = useState([]);
  const [usersNotFollowing, setUsersNotFollowing] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const { currentUser } = useContext(AuthContext);

  const loggedInUsername = localStorage.getItem('username');
  const userApiUrl = `http://3.140.132.61/api/user/${loggedInUsername}`;

  // Fetch user data
  useEffect(() => {
    setUserData(currentUser);

  }, [userApiUrl]);

  const fetchUserDetails = async (followerID) => {
    const response = await fetch(`http://3.140.132.61/api/userid/${followerID}/`);
    if (!response.ok) {
      throw new Error(`Error fetching user details for ID ${followerID}`);
    }
    return response.json();
  };

  const fetchProfileImage = async (photoId) => {
    if (photoId) {
      try {
        const response = await fetch(`http://3.140.132.61/api/photo/${photoId}/`);
        if (response.ok) {
          const imageData = await response.json();
          return `data:image/jpeg;base64,${imageData.image}`
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    }
  };

  // fetch users not following
  const fetchUsersNotFollowing = async () => {
    if (!userData || !userData.userID) {
      return; // Exit if userData is not ready
    }

    try {
      const response = await fetch(`http://3.140.132.61/api/users-not-following/${userData.userID}/3/`);
      
      if (!response.ok) {
        throw new Error(`Error fetching users not following for ID ${userData.userID}`);
      }

      const usersNotFollowing = await response.json();

      const userPromises = usersNotFollowing.map(async (user) => {
        const userDetails = await fetchUserDetails(user.userID);
        const image = await fetchProfileImage(userDetails.profilePicture);
        return {
          userID: user.userID,
          username: userDetails.username,
          displayName: userDetails.displayName,
          profilePicture: image,
        };
      });

      const usersWithDetails = await Promise.all(userPromises);
      setUsersNotFollowing(usersWithDetails);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching users not following:', error);
    } 
  };

  const handleFollowClick = async (username) => {
    try {
      const followApi = `http://3.140.132.61/api/follow/${loggedInUsername}/${username}/`;
      const response = await fetch(followApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Remove the followed user from the suggestions list
      setUsersNotFollowing(prevUsers => prevUsers.filter(user => user.username !== username));

    } catch (error) {
      console.error("Error in follow API call:", error);
    }
  };

  const handleDismiss = (userID) => {
    setUsersNotFollowing(prevUsers => prevUsers.filter(user => user.userID !== userID));
  };

  // fetch friends
  const fetchFriends = async () => {
    if (!userData || !userData.userID) {
      return; // Exit if userData is not ready
    }

    try {
      const response = await fetch(`http://3.140.132.61/api/mutual-followers/${userData.userID}/`);
      
      const mutualFollowers = await response.json();

      const userPromises = mutualFollowers.map(async (user) => {
        const userDetails = await fetchUserDetails(user.followerID);
        const image = await fetchProfileImage(userDetails.profilePicture);
        return {
          followerID: user.followerID,
          username: userDetails.username,
          displayName: userDetails.displayName,
          profilePicture: image,
        };
      });

      const friendsWithDetails = await Promise.all(userPromises);
      setFriends(friendsWithDetails);
      

    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchFriends();
      fetchUsersNotFollowing();
    }
  }, [userData]);

  if (loading) 
    return( 
      <div className="rightBar">
        <div className="container">
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    );

  return (
    <div className="rightBar">
      <div className="container">
        <div className="item">
          <span>Suggestions For You</span>
          {usersNotFollowing.length > 0 ? (
            usersNotFollowing.map((user) => (
              <div 
                key={user.userID} 
                className="user"
                style={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div className="userInfo" onClick={() => navigate(`/profile/${user.username}`)}>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={`${user.displayName}'s profile`} className="profile-image" />
                  ) : (
                    <div className="avatar-placeholder">{user.displayName.charAt(0).toUpperCase()}</div>
                  )}
                  
                  <span>{user.displayName}</span>
                </div>
                <div className="buttons">
                  <button onClick={(e) => {e.stopPropagation(); handleFollowClick(user.username);}}>follow</button>
                  <button onClick={(e) => {e.stopPropagation(); handleDismiss(user.userID);}}>dismiss</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-suggestions">No suggestions for now</div>
          )}
        </div>
        <div className="item">
          <span>Friends</span>
          {friends.map((friend) => (
            <div 
              key={friend.followerID} 
              className="user" 
              onClick={() => navigate(`/profile/${friend.username}`)}
              style={{ 
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="userInfo">
                {friend.profilePicture ? (
                  <img src={friend.profilePicture} alt={`${friend.displayName}'s profile`} className="profile-image" />
                ) : (
                  <div className="avatar-placeholder">{friend.displayName.charAt(0).toUpperCase()}</div>
                )}
                <div className="online" />
                <span>{friend.displayName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightBar;
