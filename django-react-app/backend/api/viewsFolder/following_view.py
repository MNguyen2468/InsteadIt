from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, FollowingUser
import random
from django.db import models

@api_view(['GET'])
def is_following(request, logged_in_username, username):
    try:
        # Get the current user and the user to check
        logged_in_user = get_object_or_404(User, username=logged_in_username)
        target_user = get_object_or_404(User, username=username)

        # Check if the logged-in user is following the target user
        is_following = FollowingUser.objects.filter(
            followerID=logged_in_user,
            followedID=target_user
        ).exists()

        return JsonResponse({'isFollowing': is_following}, status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def unfollow_user(request, logged_in_username, username):
    try:
        # Get the current user and the user to unfollow
        logged_in_user = get_object_or_404(User, username=logged_in_username)
        target_user = get_object_or_404(User, username=username)

        # Find the following relationship
        following_entry = FollowingUser.objects.filter(
            followerID=logged_in_user,
            followedID=target_user
        ).first()

        if following_entry:
            following_entry.delete()
            return JsonResponse({'message': 'Unfollowed successfully.'}, status=status.HTTP_204_NO_CONTENT)
        else:
            return JsonResponse({'message': 'Not following the user.'}, status=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        return JsonResponse({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def follow_user(request, logged_in_username, username):
    try:
        # Get the current user and the user to follow
        logged_in_user = get_object_or_404(User, username=logged_in_username)
        target_user = get_object_or_404(User, username=username)

        # Check if the following entry already exists
        existing_follow = FollowingUser.objects.filter(
            followerID=logged_in_user,
            followedID=target_user
        ).first()

        if existing_follow:
            return JsonResponse({'message': 'Already following the user.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get the maximum existing followingUserID and increment it
        max_id = FollowingUser.objects.aggregate(max_id=models.Max('followingUserID'))['max_id'] or 0
        new_following_id = max_id + 1

        # Create a new following entry
        FollowingUser.objects.create(
            followingUserID=new_following_id,
            followerID=logged_in_user,
            followedID=target_user
        )

        return JsonResponse({'message': 'Followed successfully.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return JsonResponse({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_following(request, user_id):
    try:
        # Get the users who are followed by the specified user
        following = FollowingUser.objects.filter(followerID=user_id).values_list('followedID', flat=True)

        # Get the users that the current user is following (to exclude them)
        userIsFollowed = FollowingUser.objects.filter(followedID=user_id).values_list('followerID', flat=True)

        # Get users who follow the current user but the current user is not following them back
        filteredFollowing = following.exclude(followedID__in=userIsFollowed)

        # Prepare the response data
        filteredFollowing_data = [{'followedID': followedID} for followedID in filteredFollowing]

        return Response(filteredFollowing_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_following_me(request, user_id):
    try:
        # Get the users who are following the specified user
        followedBy = FollowingUser.objects.filter(followedID=user_id).values_list('followerID', flat=True)

        # Get the users that the current user is following (to exclude them)
        userIsFollowing = FollowingUser.objects.filter(followerID=user_id).values_list('followedID', flat=True)

        # Get users who follow the current user but the current user is not following them back
        filteredFollowers = followedBy.exclude(followerID__in=userIsFollowing)

        # Prepare the response data
        filteredFollowers_data = [{'followerID': followerID} for followerID in filteredFollowers]

        return Response(filteredFollowers_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def get_mutual_followers(request, user_id):
    try:
        # Get the users that the specified user is following
        followed_users = FollowingUser.objects.filter(followerID=user_id).values_list('followedID', flat=True)

        # Get mutual followers by filtering for those who also follow back
        mutual_followers = FollowingUser.objects.filter(
            followedID=user_id,         # Users who follow the current user
            followerID__in=followed_users  # These users should be in the list of users followed by the current user
        ).values('followerID')

        # Prepare the response data
        mutual_followers_data = [{'followerID': following['followerID']} for following in mutual_followers]

        return Response(mutual_followers_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_users_not_following(request, user_id, limit):
    try:
        # Convert limit to integer
        limit = int(limit)

        # Get all user IDs except the current user
        all_user_ids = User.objects.exclude(userID=user_id).values_list('userID', flat=True)

        # Get user IDs who the specified user is already following
        following_user_ids = FollowingUser.objects.filter(followerID=user_id).values_list('followedID', flat=True)

        # Get user IDs who the specified user is not following
        not_following_user_ids = set(all_user_ids) - set(following_user_ids)

        # Get a random sample of user IDs
        random_user_ids = random.sample(list(not_following_user_ids), min(limit, len(not_following_user_ids)))

        # Prepare the response data
        users_data = [{'userID': user_id} for user_id in random_user_ids]

        return Response(users_data, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'message': 'Invalid limit parameter. Please provide an integer.'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
