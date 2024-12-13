from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Subreddit, User, FollowingSubreddit
from django.db import models
from django.db.models import Max

@api_view(['POST'])
def create_subreddit_entry(request):
    if request.method == 'POST':
        data = request.data
        ttl = data.get('title')
        user_id = data.get('userID')
        descr = data.get('description')

        if Subreddit.objects.filter(title=ttl).exists():
            return Response({'error': 'Subreddit title already taken'}, status=status.HTTP_400_BAD_REQUEST)

        max_id = Subreddit.objects.aggregate(max_id=models.Max('subredditID'))['max_id'] or 0
        new_subreddit_id = max_id + 1

        # Get the User object for the foreign key
        user = get_object_or_404(User, userID=user_id)
        
        subreddit = Subreddit(
            subredditID=new_subreddit_id,
            title=ttl,
            userID=user,
            description=descr
        )
        subreddit.save()
        
        return Response({'message': 'Subreddit created successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)

# "start" is inclusive, "end" is exclusive 
@api_view(['GET'])
def get_recent_subreddit(request, start, end):
    try:
        recent_subreddit = Subreddit.objects.all().order_by('-subredditID')
        
        # Calculate the actual end index
        if start >= recent_subreddit.count():
            recent_subreddit = []
        else:
            actual_end = min(end, recent_subreddit.count())
            recent_subreddit = recent_subreddit[start:actual_end]
        
        # Serialize the subreddit data
        if not recent_subreddit:
            return Response([], status=status.HTTP_200_OK)
        subreddit_data = [{
            'subredditID': subreddit.subredditID,
            'title': subreddit.title,
            'description': subreddit.description,
            'userID': subreddit.userID.userID,
        } for subreddit in recent_subreddit]
        
        return Response(subreddit_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_subreddit_by_id(request, subreddit_id):
    try:
        subreddit = get_object_or_404(Subreddit, subredditID=subreddit_id)
        return Response({'subredditID': subreddit.subredditID, 'title': subreddit.title, 'description': subreddit.description, 'userID': subreddit.userID.userID}, status=status.HTTP_200_OK)
    except Subreddit.DoesNotExist:
        return Response({'message': 'Subreddit not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def follow_subreddit(request, user_id, subreddit_id):
    try:
        # Get the user and subreddit objects
        user = get_object_or_404(User, userID=user_id)
        subreddit = get_object_or_404(Subreddit, subredditID=subreddit_id)

        # Check if already following
        if FollowingSubreddit.objects.filter(userID=user, subredditID=subreddit).exists():
            return Response({'message': 'Already following this subreddit.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new following ID
        max_id = FollowingSubreddit.objects.aggregate(max_id=models.Max('followingSubredditID'))['max_id'] or 0
        new_following_id = max_id + 1

        # Create the following relationship
        FollowingSubreddit.objects.create(
            followingSubredditID=new_following_id,
            userID=user,
            subredditID=subreddit
        )

        return Response({'message': 'Successfully followed subreddit.'}, status=status.HTTP_201_CREATED)

    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Subreddit.DoesNotExist:
        return Response({'message': 'Subreddit not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def unfollow_subreddit(request, user_id, subreddit_id):
    try:
        # Get the user and subreddit objects
        user = get_object_or_404(User, userID=user_id)
        subreddit = get_object_or_404(Subreddit, subredditID=subreddit_id)

        # Find the following relationship
        following_entry = FollowingSubreddit.objects.filter(
            userID=user_id,
            subredditID=subreddit_id
        ).first()

        if following_entry:
            following_entry.delete()
            return Response({'message': 'Successfully unfollowed subreddit.'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({'message': 'Not following this subreddit.'}, status=status.HTTP_404_NOT_FOUND)

    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Subreddit.DoesNotExist:
        return Response({'message': 'Subreddit not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def is_following_subreddit(request, user_id, subreddit_id):
    try:
        # Get the user and subreddit objects
        user = get_object_or_404(User, userID=user_id)
        subreddit = get_object_or_404(Subreddit, subredditID=subreddit_id)

        # Check if the user is following the subreddit
        is_following = FollowingSubreddit.objects.filter(
            userID=user,
            subredditID=subreddit
        ).exists()

        return Response({'isFollowing': is_following}, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Subreddit.DoesNotExist:
        return Response({'message': 'Subreddit not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_followed_subreddits(request, user_id):
    try:
        if user_id == 0:
            # Get all subreddits if user_id is 0
            subreddits = Subreddit.objects.exclude(subredditID=0)
        else:
            # Get the subreddits that the specified user is following
            followed_subreddits = FollowingSubreddit.objects.filter(userID=user_id).values_list('subredditID', flat=True)
            # Get the subreddit details
            subreddits = Subreddit.objects.filter(subredditID__in=followed_subreddits)

        # Prepare the response data
        subreddits_data = [
            {
                'subredditID': subreddit.subredditID,
                'title': subreddit.title,
                'description': subreddit.description,
                'userID': subreddit.userID.userID
            } for subreddit in subreddits
        ]

        return Response(subreddits_data, status=status.HTTP_200_OK)

    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
