// authContext.js
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const refreshUser = async () => {
    // Get username from localStorage
    const username = localStorage.getItem('username');
    if (!username) return;
    
    try {
      // Fetch user data from API
      const userApi = `http://3.140.132.61/api/user/${username}/`;
      const response = await fetch(userApi);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      
      let profilePicData = null;
      
      // Fetch profile picture if it exists
      if (userData.profilePicture) {
        const photoResponse = await fetch(`http://3.140.132.61/api/photo/${userData.profilePicture}/`);
        if (photoResponse.ok) {
          const photoData = await photoResponse.json();
          profilePicData = `data:image/jpeg;base64,${photoData.image}`;
        }
      }

      // Update current user with fetched data
      setCurrentUser({
        userID: userData.userID,
        username: userData.username,
        displayName: userData.displayName || '',
        profilePic: profilePicData,
      });
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const login = () => {
    refreshUser();
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

