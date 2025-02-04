// App.js
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import LeftBar from "./components/leftBar/LeftBar";
import RightBar from "./components/rightBar/RightBar";
import UserProfile from "./pages/userProfile/UserProfile";
import ChatPage from "./pages/chat/ChatPage"; // Import the new ChatPage component
//import CreateForum from "./pages/createForum/CreateForum";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import "./style.css";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/authContext";
import TableDataComponent from './components/TableDataComponent';  // Import the table data component
import FriendsPage from './pages/friendsList/FriendsPage';
import ForumsFeed from './pages/forums/ForumsFeed';
import SubredditFeed from './pages/subreddit/Subreddit';
import SubredditList from './pages/subredditList/SubredditList';
//import CreateSubreddit from './pages/createSubreddit/CreateSubreddit';
import Gallery from './pages/gallery/Gallery';

function App() {
  const {currentUser} = useContext(AuthContext);

  const { darkMode } = useContext(DarkModeContext);

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://3.140.132.61';
  
  const Layout = () => {
    return (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div style={{ display: "flex" }}>
            <LeftBar />
            <div style={{ flex: 6 }}>
              <Outlet />
            </div>
          <RightBar />
        </div>
      </div>
    );
  };

  // New FriendsLayout component
  const FriendsLayout = () => (
    <div className={`theme-${darkMode ? "dark" : "light"} friends-page`} style={{ height: '100vh' }}>
      <Navbar />
      <div style={{ display: "flex", height: '100%' }}>
        <LeftBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );

  // New Userprofile functions
  const UserProfileLayout = () => (
    <div className={`theme-${darkMode ? "dark" : "light"} friends-page`} style={{ height: '100vh' }}>
      <Navbar />
      <div style={{ display: "flex", height: '100%' }}>
        <LeftBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );

  // New Forums Layout functions
  const ForumsLayout = () => (
    <div className={`theme-${darkMode ? "dark" : "light"} friends-page`} style={{ height: '100vh' }}>
      <Navbar />
      <div style={{ display: "flex", height: '100%' }}>
        <LeftBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );

  const NavBarLeftBarRightBarLayout = () => (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div style={{ display: "flex" }}>
          <LeftBar />
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
          {localStorage.getItem('username') ? (<RightBar />) : null}
        </div>
      </div>
  );

  const NavBarLeftBarLayout = () => (
    <div className={`theme-${darkMode ? "dark" : "light"} friends-page`} style={{ height: '100vh' }}>
      <Navbar />
      <div style={{ display: "flex", height: '100%' }}>
        <LeftBar />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
  {
    path: "/",
    element: <NavBarLeftBarRightBarLayout />,
    children: [
      {
        path: "/",
        element: <Navigate to="/home" />,
      },
      {
        path: "/gallery/:username",
        element: <Gallery />,
      },
      {
        path: "/home",
        element: <ForumsFeed />,
      },
    ],
  },
  // Add a dynamic route for user profiles
  {
    path: "/profile/:username",
    element: <UserProfileLayout />,
    children: [
      {
        path: "",
        element: <UserProfile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "",
    element: <NavBarLeftBarLayout/>,
    children: [
      {
        path: "/friends",
        element: (
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/forums",
        element: <ForumsFeed />
      },
      {
        path: "/subreddit/:subredditID",
        element: <SubredditFeed />
      },
      {
        path: "/subreddits",
        element: <SubredditList />
      },
    ],
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    ),
  },
  
  
]);


  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
