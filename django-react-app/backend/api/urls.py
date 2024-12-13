# Path to this file /home/ec2-user/Demo-Web/django-react-app/backend/api/urls.py

from .viewsFolder.views import HelloWorldView, show_data, get_table_data
from .viewsFolder.user_view import register_user, get_user_data, update_user_profile, get_userid_data, update_profile_picture, get_user_photos
from .viewsFolder.login_view import LoginView
from .viewsFolder.forum_view import create_forum_entry, get_recent_forum
from .viewsFolder.subreddit_view import create_subreddit_entry, get_recent_subreddit, get_subreddit_by_id, follow_subreddit, get_followed_subreddits, unfollow_subreddit, is_following_subreddit
from .viewsFolder.following_view import (
    get_mutual_followers,
    get_user_following,
    get_following_me,
    is_following,
    unfollow_user,
    follow_user,
    get_users_not_following
)
from .viewsFolder.messages_view import get_chat_messages, create_message
from .viewsFolder.photo_view import get_photo, upload_photo, delete_photo
from django.urls import path

urlpatterns = [
    path('hello/', HelloWorldView.as_view(), name='hello_world'),
    path('show-data/', show_data, name='show_data'),  # New route for showing data
    path('get-table-data/', get_table_data, name='get_table_data'),  # New API route for React
    path('register/', register_user, name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # User
    path('user/<str:un>/', get_user_data, name='get_user_data'),
    path('userid/<int:uid>/', get_userid_data, name='get_userid_data'),
    path('update-profile/<int:userID>/', update_user_profile, name='update_user_profile'),
    path('update-profile-picture/<int:uid>/', update_profile_picture, name='update_profile_picture'),
    
    # Messages
    path('messages/<int:sender_id>/<int:receiver_id>/', get_chat_messages, name='get_chat_messages'),
    path('create-message/', create_message, name='create_message'),

    # Following Lists
    path('user-following/<int:user_id>/', get_user_following, name='get_user_following'),
    path('following-me/<int:user_id>/', get_following_me, name='get_following_me'),
    path('mutual-followers/<int:user_id>/', get_mutual_followers, name='mutual-followers'),
    path('users-not-following/<int:user_id>/<int:limit>/', get_users_not_following, name='get_users_not_following'),

    # Following Actions
    path('is-following/<str:logged_in_username>/<str:username>/', is_following, name='is_following'),
    path('unfollow/<str:logged_in_username>/<str:username>/', unfollow_user, name='unfollow_user'),
    path('follow/<str:logged_in_username>/<str:username>/', follow_user, name='follow_user'),
   

    # Forum
    path('create-forum/', create_forum_entry, name='create_forum'),
    path('recent-forums/<int:subbreddit_id>/<int:start>/<int:end>/', get_recent_forum, name='get_recent_forum'),

    # Subreddit
    path('create-subreddit/', create_subreddit_entry, name = 'create_subreddit'),
    path('subreddit-list/<int:start>/<int:end>/', get_recent_subreddit, name='get_recent_subreddit'),
    path('subreddit-info/<int:subreddit_id>/', get_subreddit_by_id, name='get_subreddit_by_id'),
    path('follow-subreddit/<int:user_id>/<int:subreddit_id>/', follow_subreddit, name='follow_subreddit'),
    path('get-followed-subreddit/<int:user_id>/', get_followed_subreddits, name='get_followed_subreddits'),
    path('unfollow-subreddit/<int:user_id>/<int:subreddit_id>/', unfollow_subreddit, name='unfollow_subreddit'),
    path('is-following-subreddit/<int:user_id>/<int:subreddit_id>/', is_following_subreddit, name='is_following_subreddit'),

    # Photo
    path('photo/<int:photo_id>/', get_photo, name='get_photo'),
    path('upload-photo/', upload_photo, name='upload_photo'),
    path('user-photos/<str:username>/', get_user_photos, name='get_user_photos'),
    path('delete-photo/<int:photo_id>/', delete_photo, name='delete_photo'),
]

