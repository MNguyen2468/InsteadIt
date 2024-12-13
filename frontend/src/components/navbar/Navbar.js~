import "./navbar.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const [userProfilePics, setUserProfilePics] = useState({});

  useEffect(() => {
    fetchUsersData();

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsersData = async () => {
    try {
      const response = await fetch("http://3.140.132.61/api/get-table-data/");
      const data = await response.json();
      if (data.user && Array.isArray(data.user)) {
        setAllUsers(data.user);
        
        const profilePics = {};
        await Promise.all(
          data.user.map(async (user) => {
            if (user.profilePicture) {
              try {
                const picResponse = await fetch(`http://3.140.132.61/api/photo/${user.profilePicture}/`);
                if (picResponse.ok) {
                  const picData = await picResponse.json();
                  profilePics[user.userID] = `data:image/jpeg;base64,${picData.image}`;
                }
              } catch (error) {
                console.error(`Error fetching profile picture for user ${user.username}:`, error);
              }
            }
          })
        );
        setUserProfilePics(profilePics);
      }
    } catch (error) {
      console.error('Error fetching users data:', error);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('username');
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      const searchTermLower = value.toLowerCase();
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTermLower) || 
        user.displayName.toLowerCase().includes(searchTermLower)
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  };

  const handleUserSelect = (username) => {
    navigate(`/profile/${username}`);
    setSearchTerm("");
    setShowDropdown(false);
    window.location.reload();
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>InsteadIt!</span>
        </Link>
        <HomeOutlinedIcon onClick={() => navigate('/home')} style={{cursor: 'pointer'}} />
        {darkMode ? (
          <WbSunnyOutlinedIcon onClick={toggle} style={{cursor: 'pointer'}} />
        ) : (
          <DarkModeOutlinedIcon onClick={toggle} style={{cursor: 'pointer'}} />
        )}
        <GridViewOutlinedIcon />
        <div className="search" ref={searchRef}>
          <SearchOutlinedIcon />
          <input 
            type="text" 
            placeholder="Search by username or display name..." 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {showDropdown && filteredUsers.length > 0 && (
            <div className="search-dropdown">
              {filteredUsers.map((user) => (
                <div
                  key={user.userID}
                  className="search-dropdown-item"
                  onClick={() => handleUserSelect(user.username)}
                >
                  {userProfilePics[user.userID] ? (
                    <img 
                      src={userProfilePics[user.userID]}
                      alt={user.username} 
                      className="search-user-avatar"
                    />
                  ) : (
                    <div className="search-user-avatar placeholder-avatar">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="search-user-info">
                    <span className="search-display-name">{user.displayName}</span>
                    <span className="search-username">@{user.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="right">
        {currentUser ? (
          <>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
            <PersonOutlinedIcon />
            <EmailOutlinedIcon />
            <NotificationsOutlinedIcon />
            <div className="user">
              {currentUser.profilePic ? (
                    <img src={currentUser.profilePic} alt={`${currentUser.displayName}'s profile`} className="profile-image" />
                  ) : (
                    <div className="avatar-placeholder">{currentUser.displayName.charAt(0).toUpperCase()}</div>
                  )}
              <div>
                <Link to={`/profile/${currentUser.username}`} className="item">
                  <span>{"@" + currentUser.username}</span>
                </Link>
              </div>
            </div>
          </>
        ) : (
          <div>
            <Link to="/login" style={{marginRight: "10px"}}>Login</Link>
            <span>or</span>
            <Link to="/register" style={{marginLeft: "10px"}}>Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

