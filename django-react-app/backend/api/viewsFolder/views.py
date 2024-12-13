# Path to this file /home/ec2-user/Demo-Web/django-react-app/backend/api/viewFolder/views.py
from django.shortcuts import get_object_or_404
from django.http import JsonResponse, HttpResponse
from django.views import View
from .models import *

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework.views import APIView

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

import base64

def hello_view(request):
    return JsonResponse({'message': 'Hello, World!'})

class HelloWorldView(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({'message': 'Hello, World!'})

# New view for showing data
def show_data(request):
    data = Members.objects.all()  # Fetch all records
    data_list = [str(record) for record in data]  # Convert each record to string
    return HttpResponse("<br>".join(data_list))  # Display data in a simple format

def get_video_data(video):
    """Helper function to convert video object to dictionary."""
    video_base64 = base64.b64encode(video.video).decode('utf-8') if video.video else None  # Convert binary to base64
    return {
        'videoID': video.videoID,
        'video': video_base64,  # Base64 encoded video data
        'size': video.size,
        'videoLength': video.videoLength,  # Length of the video
        'resolution': video.resolution,  # Video resolution
        'dateUpload': video.dateUploade.isoformat(),  # Corrected field name to match model
    }

# New API endpoint for React
def get_table_data(request):
    members_data = list(Members.objects.values())  # Convert queryset to list of dictionaries

    # Retrieve data from database
    # = list(.objects.values())
    user_data = list(User.objects.values())
    followingSubreddit_data = list(FollowingSubreddit.objects.values())
    followingUser_data = list(FollowingUser.objects.values())
    ban_data = list(Ban.objects.values())
    forum_data = list(Forum.objects.values())
    
    # Retrieve photo data is removed since displaying it would create problems

    subreddit_data = list(Subreddit.objects.values())
    comment_data = list(Comment.objects.values())
    messages_data = list(Messages.objects.values())
    
    # Retrieve photo data with conversion
    video_queryset = Video.objects.all()
    video_data = [get_video_data(video) for video in video_queryset]
    
    gallery_data = list(Gallery.objects.values())
# Combine both datasets into a dictionary
    response_data = {
        'members': members_data,
        'user': user_data,
        'followingSubreddit' : followingSubreddit_data,
        'followingUser' : followingUser_data,
        'ban' : ban_data,
        'forum' : forum_data,
	'subreddit' : subreddit_data,
	'comment' : comment_data,
	'messages' : messages_data,
	'video' : video_data,
	'gallery' : gallery_data,
    }

    return JsonResponse(response_data, safe=False)


'''
# Protected View
# This function is a placeholder/example for what protected view stands for
# This function will only allow access to the view if the user is authenicatedcated and the token is valid.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'This is a protected view!'})
'''












