import React, { useState, useEffect, useContext } from 'react';
import './FriendsPage.css';
import { AuthContext } from '../../context/authContext';
import { DarkModeContext } from '../../context/darkModeContext';
import { useNavigate } from 'react-router-dom';

const FriendsPage = () => {
  const { darkMode } = useContext(DarkModeContext);
  const [friends, setFriends] = useState([]);
  const [following, setFollowing] = useState([]);
  const [follower, setFollower] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [activeList, setActiveList] = useState('friends'); 
  const [loading, setLoading] = useState(true); // Initially true to show "Loading..."

  const loggedInUsername = localStorage.getItem('username');
  const currentUserApi = `http://3.140.132.61/api/user/${loggedInUsername}/`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(currentUserApi);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchUserData();
  }, [currentUserApi]);

  const fetchUserDetails = async (followerID) => {
    const response = await fetch(`http://3.140.132.61/api/userid/${followerID}/`);
    if (!response.ok) {
      throw new Error(`Error fetching user details for ID ${followerID}`);
    }
    return response.json();
  };

  const fetchFriendsData = async () => {
    if (!userData || !userData.userID) return;
    setLoading(true); // Start loading

    try {
      const mutualFollowersResponse = await fetch(`http://3.140.132.61/api/mutual-followers/${userData.userID}/`);
      const followingResponse = await fetch(`http://3.140.132.61/api/user-following/${userData.userID}/`);
      const followersResponse = await fetch(`http://3.140.132.61/api/following-me/${userData.userID}/`);

      const [mutualFollowers, following, followers] = await Promise.all([
        mutualFollowersResponse.json(),
        followingResponse.json(),
        followersResponse.json()
      ]);

      setFriends(await Promise.all(mutualFollowers.map(async (f) => {
        const details = await fetchUserDetails(f.followerID);
        return { ...f, ...details };
      })));
      
      setFollowing(await Promise.all(following.map(async (f) => {
        const details = await fetchUserDetails(f.followedID);
        return { ...f, ...details };
      })));
      
      setFollower(await Promise.all(followers.map(async (f) => {
        const details = await fetchUserDetails(f.followerID);
        return { ...f, ...details };
      })));

    } catch (error) {
      setError('Error fetching friends data');
      console.error(error);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, [userData]);

  const handleToggle = (list) => {
    setActiveList(list);
  };

  return (
    <div className={`friends-page theme-${darkMode ? 'dark' : 'light'}`}>
      <header className="friends-header">
        <button className={activeList === 'friends' ? 'active' : ''} onClick={() => handleToggle('friends')}>Friends</button>
        <button className={activeList === 'following' ? 'active' : ''} onClick={() => handleToggle('following')}>Following</button>
        <button className={activeList === 'followers' ? 'active' : ''} onClick={() => handleToggle('followers')}>Followers</button>
      </header>

      <div className="friends-content">
        {error && <p className="error-message">{error}</p>}
        {!error && activeList === 'friends' && <FriendList friends={friends} loading={loading} />}
        {!error && activeList === 'following' && <FriendList friends={following} loading={loading} />}
        {!error && activeList === 'followers' && <FriendList friends={follower} loading={loading} />}
      </div>
    </div>
  );
};

const FriendList = ({ friends, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="friend-list">
      {loading ? (
        <p>Loading...</p>
      ) : friends.length === 0 ? (
        <p>no one here :(</p>
      ) : (
        friends.map((friend) => (
          <div key={`${friend.followerID}-${friend.username}`} className="friend-list-item" onClick={() => navigate(`/profile/${friend.username}`)}>
            <div className="friend-avatar">
              {friend.avatar ? (
                <img src={friend.avatar} alt={friend.username} />
              ) : (
                <div className="avatar-placeholder">{friend.username.charAt(0).toUpperCase()}</div>
              )}
            </div>
            <div className="friend-details">
              <div className="friend-displayName">{friend.displayName || 'Unknown'}</div>
              <div className="friend-username">@{friend.username}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default FriendsPage;
