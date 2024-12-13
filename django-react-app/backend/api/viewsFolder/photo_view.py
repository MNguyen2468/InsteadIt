from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Photo
from django.db import models
import datetime, base64
from django.utils import timezone


@api_view(['GET'])
def get_photo(request, photo_id):
    try:
        # Retrieve the photo object by ID
        photo = get_object_or_404(Photo, photoID=photo_id)
        
        # Encode image binary data to base64
        image_base64 = base64.b64encode(photo.image).decode('utf-8')

        # Prepare the response data, including the base64 image string
        photo_data = {
            'photoID': photo.photoID,
            'size': photo.size,
            'width': photo.w,
            'height': photo.h,
            'dateUpload': photo.dateUpload,
            'description': photo.description,
            'image': image_base64,  # The base64 encoded image
            'userID': photo.userID
        }
        
        return Response(photo_data, status=status.HTTP_200_OK)

    except Exception as e:
        # Handle any errors that occur
        return Response(
            {'error': f'Error retrieving photo: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def upload_photo(request):
    try:
        # Get image data from request
        image = request.FILES.get('image')
        size = request.data.get('size')
        width = request.data.get('width')
        height = request.data.get('height')
        description = request.data.get('description', '')
        user_id = request.data.get('userID')

        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate new photo ID
        max_photo_id = Photo.objects.all().aggregate(models.Max('photoID'))['photoID__max'] or 0
        new_photo_id = max_photo_id + 1

        # Read image binary data
        image_data = image.read()

        # Create new photo object
        photo = Photo(
            photoID=new_photo_id,
            image=image_data,
            size=size,
            w=width,
            h=height,
            dateUpload=timezone.now(),
            description=description,
            userID=user_id
        )
        photo.save()

        # Return response with new photo data
        photo_data = {
            'photoID': photo.photoID,
            'image': base64.b64encode(photo.image).decode('utf-8'),
            'size': photo.size,
            'width': photo.w,
            'height': photo.h,
            'dateUpload': photo.dateUpload,
            'description': photo.description,
            'userID': photo.userID
        }

        return Response(photo_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Error uploading photo: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
def upload_photo_with_id(request, photo_id):
    try:
        # Get image data from request
        image = request.FILES.get('image')
        size = request.data.get('size')
        width = request.data.get('width')
        height = request.data.get('height')
        user_id = request.data.get('userID')
        description = request.data.get('description', '')

        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Read image binary data
        image_data = image.read()

        # Create new photo object with provided ID
        photo = Photo(
            photoID=photo_id,
            image=image_data,
            size=size,
            w=width,
            h=height,
            dateUpload=timezone.now(),
            description=description,
            userID=user_id
        )
        photo.save()

        # Return response with photo data
        photo_data = {
            'photoID': photo.photoID,
            'image': base64.b64encode(photo.image).decode('utf-8'),
            'size': photo.size,
            'width': photo.w,
            'height': photo.h,
            'dateUpload': photo.dateUpload,
            'description': photo.description,
            'userID': photo.userID
        }

        return Response(photo_data, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'error': f'Error uploading photo: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
def delete_photo(request, photo_id):
    try:
        # Get photo by ID
        photo = get_object_or_404(Photo, photoID=photo_id)
        
        # Delete the photo
        photo.delete()
        
        return Response({'message': 'Photo deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

    except Photo.DoesNotExist:
        return Response({'error': 'Photo not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response(
            {'error': f'Error deleting photo: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
