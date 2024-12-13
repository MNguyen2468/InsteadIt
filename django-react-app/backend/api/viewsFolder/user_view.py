from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views import View
from .models import User, Photo
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.db.models import Q, Max
from django.utils import timezone
import datetime, base64
from django.db import models
from .photo_view import upload_photo_with_id

@api_view(['POST'])
def register_user(request):
    if request.method == 'POST':
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        display_name = request.data.get('name')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate userID manually (e.g., max userID + 1)
        max_id = User.objects.aggregate(max_id=models.Max('userID'))['max_id'] or 0
        new_user_id = max_id + 1

        user = User(userID=new_user_id, username=username, email=email, displayName=display_name)
        user.set_password(password)  # Set the hashed password
        user.save()
        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)




@api_view(['GET'])
def get_user_data(request, un):
    try:
        # Fetch the user by their username
        user = User.objects.get(username=un)
        
        # Prepare the response data
        user_data = {
            'userID': user.userID,
            'username': user.username,
            'email': user.email,
            'displayName': user.displayName,
            'bio': user.bio,
            'profilePicture': user.profilePicture
        }

        return Response(user_data, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_userid_data(request, uid):
    try:
        # Fetch the user by their userID
        user = User.objects.get(userID=uid)

        # Prepare the response data
        user_data = {
            'userID': user.userID,
            'username': user.username,
            'email': user.email,
            'displayName': user.displayName,
            'bio': user.bio,
            'profilePicture': user.profilePicture
        }

        return Response(user_data, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'message': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_user_profile(request, userID):
    try:
        # Fetch the user by userID
        user = get_object_or_404(User, userID=userID)

        # Only update the fields you want to allow
        displayName = request.data.get('displayName')
        bio = request.data.get('bio')

        if displayName is not None:
            user.displayName = displayName
        if bio is not None:
            user.bio = bio

        user.save()  # Save the updated user instance

        # Prepare the response data
        user_data = {
            'userID': user.userID,
            'username': user.username,
            'email': user.email,
            'displayName': user.displayName,
            'bio': user.bio,
            'profilePicture': user.profilePicture,
        }

        return Response(user_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def update_profile_picture(request, uid):
    try:
        # Fetch the user by userID
        user = get_object_or_404(User, userID=uid)

        # Get image data from request
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        size = request.data.get('size')
        width = request.data.get('width')
        height = request.data.get('height')
        user_id = request.data.get('userID')
        description = request.data.get('description', '')

        # Generate new photo ID
        max_photo_id = Photo.objects.all().aggregate(models.Max('photoID'))['photoID__max'] or 0
        new_photo_id = max_photo_id + 1

        # Read image binary data
        image_data = image.read()

        # Create new photo object with the new ID
        photo = Photo(
            photoID=new_photo_id,
            image=image_data,
            size=size,
            w=width,
            h=height,
            dateUpload=timezone.now(),
            description=description,
            userID = user_id
        )
        photo.save()

        # Update user's profile picture with new photo ID
        user.profilePicture = new_photo_id
        user.save()

        # Prepare the response data
        user_data = {
            'userID': user.userID,
            'username': user.username,
            'email': user.email,
            'displayName': user.displayName,
            'bio': user.bio,
            'profilePicture': user.profilePicture
        }

        return Response(user_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_photos(request, username):
    try:
        # Get user by username first
        user = get_object_or_404(User, username=username)
        
        # Get all photos for the specified user, ordered by most recent first
        user_photos = Photo.objects.filter(userID=user.userID).order_by('-dateUpload')

        if not user_photos:
            return Response([], status=status.HTTP_200_OK)

        # Serialize the photo data
        photos_data = [{
            'photoID': photo.photoID,
            'image': base64.b64encode(photo.image).decode('utf-8'),
            'size': photo.size,
            'width': photo.w,
            'height': photo.h,
            'dateUpload': photo.dateUpload,
            'description': photo.description,
            'userID': photo.userID
        } for photo in user_photos]

        return Response(photos_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'error': f'Error retrieving photos: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


