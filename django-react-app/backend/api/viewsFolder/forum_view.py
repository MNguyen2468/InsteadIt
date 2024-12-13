from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Forum, Subreddit
from django.db import models

@api_view(['POST'])
def create_forum_entry(request):
    if request.method == 'POST':
        data = request.data
        ttl = data.get('title')
        user_id = data.get('userID')
        main_body = data.get('mainBody')
        subreddit_id= data.get('subredditID')

        # Get the maximum existing forumID and increment it
        max_id = Forum.objects.aggregate(max_id=models.Max('forumID'))['max_id'] or 0
        new_forum_id = max_id + 1

        # Create a new forum entry in the database
        new_forum = Forum(
            forumID=new_forum_id,  # Manually set the forumID
            title=ttl,
            userID_id=user_id,  # Use userID_id to set the foreign key
            mainBody=main_body,
            upvotes=0,  # Assuming you want to initialize this
            downvotes=0,  # Assuming you want to initialize this
            subredditID_id=subreddit_id,  # Set to None if you're ignoring this field
        )
        
        # Save the new forum entry
        new_forum.save()

        return Response({'message': 'Forum created successfully'}, status=status.HTTP_201_CREATED)
    
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

# "start" is inclusive, "end" is exclusive 
@api_view(['GET'])
def get_recent_forum(request, subbreddit_id, start, end):
    try:
        if subbreddit_id == 0:
            # Get the most recent forums across all subreddits
            recent_forums = Forum.objects.all().order_by('-forumID')
        else:
            # Get the most recent forums for the specified subreddit
            recent_forums = Forum.objects.filter(subredditID=subbreddit_id).order_by('-forumID')
        
        # Calculate the actual end index
        if start >= recent_forums.count():
            recent_forums = []
        else:
            actual_end = min(end, recent_forums.count())
            recent_forums = recent_forums[start:actual_end]
        
        # Serialize the forum data
        if not recent_forums:
            return Response([], status=status.HTTP_200_OK)
        forum_data = [{
            'forumID': forum.forumID,
            'title': forum.title,
            'upvotes': forum.upvotes,
            'downvotes': forum.downvotes,
            'mainBody': forum.mainBody,
            'userID': forum.userID.userID,
            'subredditID': forum.subredditID.subredditID
        } for forum in recent_forums]
        
        return Response(forum_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
