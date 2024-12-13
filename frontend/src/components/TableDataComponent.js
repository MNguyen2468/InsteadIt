import React, { useState } from 'react';

function TableDataComponent() {
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [followingSubreddit, setFollowingSubreddit] = useState([]);
    const [followingUser, setFollowingUser] = useState([]);
    const [ban, setBan] = useState([]);
    const [forum, setForum] = useState([]);
    const [photo, setPhoto] = useState([]);
    const [subreddit, setSubreddit] = useState([]);
    const [comment, setComment] = useState([]);
    const [messages, setMessages] = useState([]);
    const [video, setVideo] = useState([]);
    const [gallery, setGallery] = useState([]);

    const [showMembers, setShowMembers] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const [showFollowingSubreddit, setShowFollowingSubreddit] = useState(false);
    const [showFollowingUser, setShowFollowingUser] = useState(false);
    const [showBan, setShowBan] = useState(false);
    const [showForum, setShowForum] = useState(false);
    const [showPhoto, setShowPhoto] = useState(false);
    const [showSubreddit, setShowSubreddit] = useState(false);
    const [showComment, setShowComment] = useState(false);
    const [showMessages, setShowMessages] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [showGallery, setShowGallery] = useState(false);

    // Fetch functions for each model
    const apiBaseUrl = 'http://3.140.132.61';
    const apiGetTableData  = "http://3.140.132.61/api/get-table-data/";
    
    const fetchMembersData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setMembers(data.members || []);
            setShowMembers(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching members data:', error);
        }
    };

    const fetchUsersData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setUsers(data.user);
            setShowUsers(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching users data:', error);
        }
    };

    const fetchFollowingSubredditData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setFollowingSubreddit(data.followingSubreddit);
            setShowFollowingSubreddit(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching following subreddit data:', error);
        }
    };

    const fetchFollowingUserData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setFollowingUser(data.followingUser);
            setShowFollowingUser(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching following user data:', error);
        }
    };

    const fetchBanData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setBan(data.ban);
            setShowBan(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching ban data:', error);
        }
    };

    const fetchForumData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setForum(data.forum);
            setShowForum(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching forum data:', error);
        }
    };

    const fetchSubredditData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setSubreddit(data.subreddit);
            setShowSubreddit(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching subreddit data:', error);
        }
    };

    const fetchCommentData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setComment(data.comment);
            setShowComment(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching comment data:', error);
        }
    };

    const fetchMessagesData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setMessages(data.messages);
            setShowMessages(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching messages data:', error);
        }
    };

    const fetchVideoData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setVideo(data.video);
            setShowVideo(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching video data:', error);
        }
    };

    const fetchGalleryData = async () => {
        try {
            const response = await fetch(apiGetTableData);
            const data = await response.json();
            setGallery(data.gallery);
            setShowGallery(prevShow => !prevShow);
        } catch (error) {
            console.error('Error fetching gallery data:', error);
        }
    };

    return (
        <div>
            <button onClick={fetchMembersData}>
                {showMembers ? 'Hide Members Data' : 'Show Members Data'}
            </button>
            <button onClick={fetchUsersData}>
                {showUsers ? 'Hide Users Data' : 'Show Users Data'}
            </button>
            <button onClick={fetchFollowingSubredditData}>
                {showFollowingSubreddit ? 'Hide Following Subreddit Data' : 'Show Following Subreddit Data'}
            </button>
            <button onClick={fetchFollowingUserData}>
                {showFollowingUser ? 'Hide Following User Data' : 'Show Following User Data'}
            </button>
            <button onClick={fetchBanData}>
                {showBan ? 'Hide Ban Data' : 'Show Ban Data'}
            </button>
            <button onClick={fetchForumData}>
                {showForum ? 'Hide Forum Data' : 'Show Forum Data'}
            </button>
            <button onClick={fetchSubredditData}>
                {showSubreddit ? 'Hide Subreddit Data' : 'Show Subreddit Data'}
            </button>
            <button onClick={fetchCommentData}>
                {showComment ? 'Hide Comment Data' : 'Show Comment Data'}
            </button>
            <button onClick={fetchMessagesData}>
                {showMessages ? 'Hide Messages Data' : 'Show Messages Data'}
            </button>
            <button onClick={fetchVideoData}>
                {showVideo ? 'Hide Video Data' : 'Show Video Data'}
            </button>
            <button onClick={fetchGalleryData}>
                {showGallery ? 'Hide Gallery Data' : 'Show Gallery Data'}
            </button>

            {/* Conditionally Render Tables for Each Model */}
	    {showMembers && members.length > 0 && (
                <div>
                    <h2>Members Data</h2>
                    <table>
                        <thead>
                            <tr>
                    	        <th>Member ID</th>
                    		<th>Member Name</th>
                    		<th>Member Year</th>
                	    </tr>
            		</thead>
			<tbody>
                	    {members.map((member, index) => (
                    		<tr key={index}>
                        	    <td>{member.memberId}</td>
                        	    <td>{member.memberName}</td>
                        	    <td>{member.memberYear}</td>
                    		</tr>
                	    ))}
            		</tbody>
                    </table>
                </div>
            )}

            {showUsers && users.length > 0 && (
                <div>
                    <h2>Users Data</h2>
                    <table>
                        <thead>
                	    <tr>
                    		<th>User ID</th>
                    		<th>Username</th>
                    		<th>Display Name</th>
                    		<th>Email</th>
                    		<th>Bio</th>
                	    </tr>
            		</thead>
            		<tbody>
                	    {users.map((user, index) => (
                    		<tr key={index}>
                        	    <td>{user.userID}</td>
                        	    <td>{user.username}</td>
                        	    <td>{user.displayName}</td>
                        	    <td>{user.email}</td>
                        	    <td>{user.bio}</td>
                    		</tr>
                	    ))}
            		</tbody>
                    </table>
                </div>
            )}

            {showFollowingSubreddit && followingSubreddit.length > 0 && (
                <div>
                    <h2>Following Subreddit Data</h2>
                    <table>
                        <thead>
                            <tr>
				<th>FollowingSubreddit ID</th>
                                <th>Subreddit ID</th>
                                <th>User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {followingSubreddit.map((item, index) => (
                                <tr key={index}>
				    <td>{item.followingSubredditID}</td>
                                    <td>{item.subredditID_id}</td>
                                    <td>{item.userID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showFollowingUser && followingUser.length > 0 && (
                <div>
                    <h2>Following User Data</h2>
                    <table>
                        <thead>
                            <tr>
				<th>FollowingUser ID</th>
                                <th>Followed ID</th>
                                <th>Follower ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {followingUser.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.followingUserID}</td>
				    <td>{item.followedID_id}</td>
                                    <td>{item.followerID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showBan && ban.length > 0 && (
                <div>
                    <h2>Ban Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Ban ID</th>
                                <th>User ID</th>
                                <th>Subreddit ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ban.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.banID}</td>
                                    <td>{item.userID_id}</td>
                                    <td>{item.subredditID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForum && forum.length > 0 && (
                <div>
                    <h2>Forum Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Forum ID</th>
                                <th>Title</th>
                                <th>User ID</th>
                                <th>Upvotes</th>
                                <th>Downvotes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forum.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.forumID}</td>
                                    <td>{item.title}</td>
                                    <td>{item.userID_id}</td>
                                    <td>{item.upvotes}</td>
                                    <td>{item.downvotes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showPhoto && photo.length > 0 && (
                <div>
                    <h2>Photo Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Photo ID</th>
                                <th>Description</th>
                                <th>Date Uploaded</th>
                                <th>Width</th>
                                <th>Height</th>
                            </tr>
                        </thead>
                        <tbody>
                            {photo.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.photoID}</td>
                                    <td>{item.description}</td>
                                    <td>{item.dateUpload}</td>
                                    <td>{item.w}</td>
                                    <td>{item.h}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showSubreddit && subreddit.length > 0 && (
                <div>
                    <h2>Subreddit Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Subreddit ID</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subreddit.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.subredditID}</td>
                                    <td>{item.title}</td>
                                    <td>{item.description}</td>
                                    <td>{item.userID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showComment && comment.length > 0 && (
                <div>
                    <h2>Comment Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Comment ID</th>
                                <th>Forum ID</th>
                                <th>Main Body</th>
                                <th>Upvotes</th>
                                <th>Downvotes</th>
                                <th>Reply ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comment.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.commentID}</td>
                                    <td>{item.forumID_id}</td>
                                    <td>{item.mainBody}</td>
                                    <td>{item.upvotes}</td>
                                    <td>{item.downvotes}</td>
                                    <td>{item.replyID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showMessages && messages.length > 0 && (
                <div>
                    <h2>Messages Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Message ID</th>
                                <th>Text</th>
                                <th>Photo ID</th>
                                <th>Video ID</th>
                                <th>Sender ID</th>
                                <th>Receiver ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.messageID}</td>
                                    <td>{item.text}</td>
                                    <td>{item.photoID_id}</td>
                                    <td>{item.videoID_id}</td>
                                    <td>{item.senderID_id}</td>
                                    <td>{item.receiverID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showVideo && video.length > 0 && (
                <div>
                    <h2>Video Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Video ID</th>
                                <th>Video</th>
                                <th>Size</th>
                                <th>Length</th>
                                <th>Resolution</th>
                                <th>Date Uploaded</th>
                            </tr>
                        </thead>
                        <tbody>
                            {video.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.videoID}</td>
                                    <td>{item.video}</td>
                                    <td>{item.size}</td>
                                    <td>{item.videoLength}</td>
                                    <td>{item.resolution}</td>
                                    <td>{item.dateUploade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showGallery && gallery.length > 0 && (
                <div>
                    <h2>Gallery Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Gallery Count</th>
                                <th>Photo ID</th>
                                <th>Video ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gallery.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.userID}</td>
                                    <td>{item.galleryCount}</td>
                                    <td>{item.photoID_id}</td>
                                    <td>{item.videoID_id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TableDataComponent;
