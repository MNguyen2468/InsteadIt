import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserProfile.css';
import { AuthContext } from '../../context/authContext';
import { DarkModeContext } from '../../context/darkModeContext';

const UserProfile = () => {
  const { username } = useParams(); // Get username from the URL
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const [originalData, setOriginalData] = useState({}); // To store original data
  const [isFollowing, setIsFollowing] = useState(null);
  const { refreshUser, currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  // Determine if the logged-in user is the owner of the profile
  const isOwner = currentUser?.username === username;
  
  // Constant for the API endpoint
  const userApi = `http://3.140.132.61/api/user/${username}/`;
  let isFollowingApi, unfollowApi, followApi;
  if (currentUser) {
    isFollowingApi = `http://3.140.132.61/api/is-following/${currentUser.username}/${username}/`;
    unfollowApi = `http://3.140.132.61/api/unfollow/${currentUser.username}/${username}/`;
    followApi = `http://3.140.132.61/api/follow/${currentUser.username}/${username}/`;
  }
    
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
        setOriginalData(data); // Set original data when fetching user data
        if (data.profilePicture) {
          const picResponse = await fetch(`http://3.140.132.61/api/photo/${data.profilePicture}/`);
          if (!picResponse.ok) {
            throw new Error('Failed to fetch profile picture');
          }
          const picData = await picResponse.json();
          setProfilePic(`data:image/jpeg;base64,${picData.image}`);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();

    if (currentUser) {
      const fetchIsFollowing = async () => {
        try {
          const response = await fetch(isFollowingApi);
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
          setIsFollowing(data.isFollowing);
        } catch (err) {
          setError(err.message);
        }
      };
    
      fetchIsFollowing();
    }
  }, [userApi, isFollowingApi]);

  const toggleEditProfile = () => {
    if (!isEditing) {
      setOriginalData(userData); // Store original data when entering edit mode
    }
    setIsEditing(!isEditing);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setError('No image file selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    
    // Get image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);

    // Add required metadata to formData
    formData.append('size', file.size);
    formData.append('width', img.width);
    formData.append('height', img.height);
    formData.append('userID', userData.userID);
    formData.append('description', `${userData.username}'s Profile picture`);

    // Send the form data to the API
    try {
      const response = await fetch(`http://3.140.132.61/api/update-profile-picture/${userData.userID}/`, {
        method: "PUT",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }

      const data = await response.json();
      
      // Update user data with response which includes the new profile picture
      setUserData(data);

      // Refresh the user data in the auth context
      refreshUser();

    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err.message);
    }
  };

  const handleDelete = () => {
    alert('Delete button clicked!');
  };

  // Updated API URL for profile update
  const apiUpdateProfile = userData ? `http://3.140.132.61/api/update-profile/${userData.userID}/` : '';

  const handleSaveChanges = async () => {
    if (!isEditing) return;

    const updatedDisplayName = userData.displayName.trim();
    if (!updatedDisplayName) {
      setError('Display name cannot be blank or only whitespace.');
      return;
    }

    const updatedData = {
      displayName: updatedDisplayName,
      bio: userData.bio,
    };

    try {
      const response = await fetch(apiUpdateProfile, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          //Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData); // Log detailed error
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving changes:', err); // Log the error
      setError(err.message);
    }
  };

  const handleCancelChanges = () => {
    setUserData(originalData); // Restore original data on cancel
    setIsEditing(false); // Exit editing mode
  };

  if (!userData) return <p>Loading...</p>; // Handle loading state
  const { displayName, bio, username: fetchedUsername } = userData; // Extract necessary fields

  const handleFollowingClick = async() => {
    try {
        const apiUrl = isFollowing 
            ? unfollowApi
            : followApi;

        const method = isFollowing ? 'DELETE' : 'POST';
        
        const response = await fetch(apiUrl, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                // Include any other necessary headers here, e.g. authorization
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Update the following state only after a successful API call
        setIsFollowing((prev) => !prev);

    } catch (error) {
        console.error("Error in follow/unfollow API call:", error);
    }
   
  };

  return (
    <div className={`profile-container ${darkMode ? "darkMode" : ""}`}>
      <div className={`profile-main ${darkMode ? "darkMode" : ""}`}>
        <div className="profile-header">
          <div className="profile-pic">
            {profilePic ? (
              <img src={profilePic} alt="Profile" />
            ) : (
              <div className="placeholder-pic">{displayName.charAt(0).toUpperCase()}</div>
            )}
            {isEditing && (
              <div>
                <label htmlFor="profile-pic-upload">Edit Profile Picture</label>
                <span className="file-type-text">(.png or .jpeg only)</span>
                <input 
                  id="profile-pic-upload" 
                  type="file" 
                  accept=".png,.jpeg,.jpg"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }} // Hide the default input
                />
                <label htmlFor="profile-pic-upload" className="custom-file-upload">
                  Upload Photo
                </label>
              </div>
            )}
          </div>
          <div className="header-content">
            <h1>{fetchedUsername}'s Profile</h1>
            {!isOwner && currentUser && (
              <button className="follow-btn" onClick={handleFollowingClick}>
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <div className="profile-info">
          <div className="editable-field">
            <p><strong>Username:</strong> {fetchedUsername}</p>
            <p><strong>Display Name: </strong>
              {isEditing ? (
                <input
                  type="text"
                  value={userData.displayName}
                  onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                />
              ) : (
                <span>{displayName}</span>
              )}
            </p>
            <p><strong>Bio: </strong>
              {isEditing ? (
                <textarea
                  value={userData.bio || ''} // Use empty string if bio is null
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                />
              ) : (
                <span>{bio}</span>
              )}
            </p>
          </div>

          {/* Gallery and Edit Profile Buttons */}
          <div className="action-buttons">
            <button className="gallery-btn" onClick={() => navigate(`/gallery/${fetchedUsername}`)}>
              View Gallery
            </button>
            
            {isEditing ? (
              <>
                <button className="save-changes-btn" onClick={handleSaveChanges}>Save Changes</button>
                <button className="cancel-btn" onClick={handleCancelChanges}>Cancel</button>
              </>
            ) : (
              isOwner && ( // Only show the edit button if the user is the owner of the profile
                <button className="edit-profile-btn" onClick={toggleEditProfile}>
                  Edit Profile
                </button>
              )
            )}
          </div>
          {error && <p className="error-message">{error}</p>} {/* Display error message */}
        </div>
      </div>

      
    </div>
  );
};

export default UserProfile;
