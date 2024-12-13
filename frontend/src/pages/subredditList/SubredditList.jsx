import React, { useState, useEffect, useContext, useCallback } from "react";
import "./SubredditList.css";
import "../subreddit/Forums.css";
import { AuthContext } from "../../context/authContext";
import { DarkModeContext } from "../../context/darkModeContext";
import { useNavigate } from "react-router-dom";

// Main SubredditList Component
const SubredditList = () => {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const [subreddits, setSubreddits] = useState([]);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState("");
  const [showAllSubreddits, setShowAllSubreddits] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [subredditName, setSubredditName] = useState("");
  const [subredditDescription, setSubredditDescription] = useState("");
  const [itemsToShow, setItemsToShow] = useState(5);
  const [startIndex, setStartIndex] = useState(0);
  const authToken = localStorage.getItem("accessToken");


  // Fetch user data
  useEffect(() => {
    setUserData(currentUser);
  }, [currentUser]);

  // Add handler to go to specific page
  const handlePageInput = (event) => {
    if (event.key === "Enter") {
      let pageNumber = Number(event.target.value);

      if (pageNumber <= 1) {
        goToPage(1); // Go to the first page for negative or zero input
      } else if (pageNumber > totalPages) {
        goToPage(totalPages); // Go to the last page if input exceeds total pages
      } else {
        goToPage(pageNumber); // Go to the specified page if input is within range
      }
    }
  };

  const fetchFollowedSubreddits = useCallback(async () => {
    try {
      const userId = showAllSubreddits ? 0 : userData?.userID;
      const response = await fetch(
        `http://3.140.132.61/api/get-followed-subreddit/${userId}/`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch followed subreddits");
      }
      const followedSubreddits = await response.json();

      const formattedSubreddits = followedSubreddits.map((subreddit) => ({
        subredditId: subreddit.subredditID,
        name: subreddit.title.replace("r/", ""),
        description: subreddit.description,
        avatar: "",
      }));

      setSubreddits(formattedSubreddits);
    } catch (error) {
      console.error("Error fetching followed subreddits:", error);
    }
  }, [showAllSubreddits, userData]);

  // Fetch subreddits when user data is available or when showAllSubreddits changes
  useEffect(() => {
    fetchFollowedSubreddits();
  }, [userData, showAllSubreddits, fetchFollowedSubreddits]);

  const handleSubredditCreate = async () => {
    if (!subredditName || !subredditDescription) {
      alert("Please fill in all fields");
      return;
    }

    const subredditData = {
      title: `r/${subredditName}`,
      description: subredditDescription,
      userID: userData?.userID,
    };

    try {
      const response = await fetch(
        "http://3.140.132.61/api/create-subreddit/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(subredditData),
        }
      );

      if (!response.ok) {
        throw new Error("Subreddit creation failed");
      }

      setShowPopup(false); // Close popup on successful creation
      setSubredditName(""); // Reset subreddit name input
      setSubredditDescription(""); // Reset subreddit description input
      fetchFollowedSubreddits(); // Refresh the subreddit list
    } catch (error) {
      console.error("Error creating subreddit:", error);
      setError(error.message);
    }
  };

  // Move to the next set of items without overlap
  const handleNext = () => {
    setStartIndex((prevIndex) =>
      Math.min(prevIndex + itemsToShow, subreddits.length)
    );
  };

  // Move to the previous set of items
  const handlePrevious = () => {
    setStartIndex((prevIndex) => Math.max(prevIndex - itemsToShow, 0));
  };

  // Calculate displayed subreddits based on current startIndex and itemsToShow
  const displayedSubreddits =
    itemsToShow === subreddits.length
      ? subreddits
      : subreddits.slice(
          startIndex,
          Math.min(startIndex + itemsToShow, subreddits.length)
        );

  // Calculate total pages
  const totalPages = Math.ceil(subreddits.length / itemsToShow);

  // Go to a specific page
  const goToPage = (pageNumber) => {
    setStartIndex((pageNumber - 1) * itemsToShow);
  };

  

  return (
    <div className={`subreddit-page theme-${darkMode ? "dark" : "light"}`}>
      <header className="subreddit-header">
        <h1>Subreddits</h1>

        {currentUser && (
          <button
            className="create-subreddit-button"
            onClick={() => setShowPopup(true)}
          >
            Create Subreddit
          </button>
        )}

        {currentUser && (
          <div className="subreddit-toggle">
            <button
              onClick={() => setShowAllSubreddits(true)}
              className={`toggle-button ${showAllSubreddits ? "active" : ""}`}
            >
              Show All
            </button>
            <button
              onClick={() => setShowAllSubreddits(false)}
              className={`toggle-button ${!showAllSubreddits ? "active" : ""}`}
            >
              Show Followed
            </button>
          </div>
        )}

        <div className="items-and-page-skip">
          {/* Items to display input */}
          <div className="items-to-show-input">
            <label htmlFor="itemsToShow">Items to display: </label>
            <select 
              value={itemsToShow}
              onChange={(e) => {
                const newItemsToShow = parseInt(e.target.value, 10);
                setItemsToShow(newItemsToShow);
                setStartIndex(0); // Reset to first page when changing items per page
              }}
              className="items-input"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          {/* Page Skip Input */}
          <div className="page-skip-input">
            <label htmlFor="pageInput">Go to page: </label>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="Page"
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePageInput(e);
              }}
            />
          </div>
        </div>
      </header>

      <div className="subreddit-content">
        <div className="subreddit-list-container">
          {!showAllSubreddits && subreddits.length === 0 ? (
            <div className="no-subreddits-message">
              You have no followed Subreddits
            </div>
          ) : (
            <SubredditListComponent subreddits={displayedSubreddits} />
          )}

          <div className="pagination">
            <div className="pagination-buttons">
              <button
                onClick={handlePrevious}
                disabled={startIndex === 0}
                className={`previous-button ${
                  startIndex === 0 ? "disabled" : ""
                }`}
              >
                Previous {itemsToShow}
              </button>
              <button
                onClick={handleNext}
                disabled={startIndex + itemsToShow >= subreddits.length}
                className={`next-button ${
                  startIndex + itemsToShow >= subreddits.length
                    ? "disabled"
                    : ""
                }`}
              >
                Next {itemsToShow}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subreddit Creation Popup */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Create a New Subreddit</h2>
            <input
              type="text"
              value={subredditName}
              onChange={(e) => setSubredditName(e.target.value)}
              placeholder="Subreddit Name"
            />
            <textarea
              value={subredditDescription}
              onChange={(e) => setSubredditDescription(e.target.value)}
              placeholder="Subreddit Description"
            ></textarea>
            <div className="popup-actions">
              <button className="submit-button" onClick={handleSubredditCreate}>
                Submit
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowPopup(false)} // Close the popup
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SubredditListComponent
const SubredditListComponent = ({ subreddits }) => {
  const navigate = useNavigate();

  const handleSubredditClick = (subredditId) => {
    navigate(`/subreddit/${subredditId}`);
  };

  const renderSubreddits = () => {
    return subreddits.map((subreddit) => {
      const uniqueKey = `subreddit-${subreddit.subredditId}`;

      return (
        <div
          key={uniqueKey}
          className="subreddit-list-item"
          onClick={() => handleSubredditClick(subreddit.subredditId)}
        >
          <div className="subreddit-avatar">
            {subreddit.avatar ? (
              <img src={subreddit.avatar} alt={subreddit.name} />
            ) : (
              <div className="avatar-placeholder">
                {subreddit.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="subreddit-details">
            <div className="subreddit-name">r/{subreddit.name}</div>
            <div className="subreddit-description">
              {subreddit.description || "No description available"}
            </div>
          </div>
        </div>
      );
    });
  };

  return <div className="subreddit-list">{renderSubreddits()}</div>;
};

export default SubredditList;
