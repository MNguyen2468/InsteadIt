import "./leftBar.css";
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Watch from "../../assets/4.png";
import Memories from "../../assets/5.png";
import Events from "../../assets/6.png";
import Gaming from "../../assets/7.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
import Tutorials from "../../assets/11.png";
import Courses from "../../assets/12.png";
import Fund from "../../assets/13.png";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import { NavLink, Link } from 'react-router-dom';

const LeftBar = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          {/* Ensure no extra div wrappers */}
          <NavLink to={currentUser?.username ? "/friends" : "/login"} className="item">
            <img src={Friends} alt="" />
            <span>Friends</span>
          </NavLink>

          <NavLink to="/subreddits" className="item">
            <img src={Groups} alt="" />
            <span>Subreddits</span>
          </NavLink>
           
         
          <NavLink to={currentUser?.username ? `/gallery/${currentUser.username}` : "/login"} className="item">
            <img src={Gallery} alt="" />
            <span>Gallery</span>
          </NavLink>

          <NavLink to={currentUser?.username ? "/chat" : "/login"} className="item">
            <img src={Messages} alt="" />
            <span>Messages</span>
          </NavLink>
        </div>
      </div>
    </div>	  
  );
 /*
	  <NavLink to="/forums" className="item">
            <img src={Events} alt="" />
            <span>Forums</span>
          </NavLink>
	  */

/*return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div>
             <NavLink to={currentUser?.username ? "/friends" : "/login"} className="item">
              <img src={Friends} alt="" />
              <span>Friends</span>
            </NavLink>
          </div>
          <div className="item">
            <NavLink to="/subreddits" className="item">
              <img src={Groups} alt="" />
              <span>Subreddits</span>
            </NavLink>
          </div>
          <div className="item">
            <NavLink to="/forums" className="item">
              <img src={Events} alt="" />
              <span>Forums</span>
            </NavLink>
          </div>
          <div className="item">
            <NavLink to={currentUser?.username ? `/gallery/${currentUser.username}` : "/login"} className="item">
              <img src={Gallery} alt="" />
              <span>Gallery</span>
            </NavLink>
          </div>
            <NavLink to={currentUser?.username ? "/chat" : "/login"} className="item">
              <img src={Messages} alt="" />
              <span>Messages</span>
            </NavLink>
          </div>
      </div>
    </div>
  );*/
};

export default LeftBar;
