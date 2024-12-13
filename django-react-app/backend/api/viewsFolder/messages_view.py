from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Messages
from django.db import models
from django.db.models import Q


@api_view(['GET'])
def get_chat_messages(request, sender_id, receiver_id):
    try:
        # Fetch messages between the sender and receiver
        messages = Messages.objects.filter(
            (Q(senderID=sender_id) & Q(receiverID=receiver_id)) |
            (Q(senderID=receiver_id) & Q(receiverID=sender_id))
        ).order_by('messageID').values('messageID', 'text', 'photoID', 'videoID', 'senderID', 'receiverID')

        # Prepare the response data
        messages_data = list(messages)

        return Response({'messages': messages_data}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'message': f'Error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def create_message(request):
    if request.method == 'POST':
        data = request.data
        text = data.get('text')
        sender_id = data.get('senderID')
        receiver_id = data.get('receiverID')
        photo_id = data.get('photoID', None)  # Optional, can be null
        video_id = data.get('videoID', None)  # Optional, can be null

        # Get the maximum existing messageID and increment it
        max_id = Messages.objects.aggregate(max_id=models.Max('messageID'))['max_id'] or 0
        new_message_id = max_id + 1

        # Create a new message entry in the database
        new_message = Messages(
            messageID=new_message_id,  # Manually set the messageID
            text=text,
            senderID_id=sender_id,  # Use senderID_id to set the foreign key
            receiverID_id=receiver_id,  # Use receiverID_id to set the foreign key
            photoID_id=photo_id,  # Use photoID_id to set the foreign key (optional)
            videoID_id=video_id,  # Use videoID_id to set the foreign key (optional)
        )

        # Save the new message entry
        new_message.save()

        return Response({'message': 'Message sent successfully'}, status=status.HTTP_201_CREATED)
    
    return Response({'error': 'Invalid request method'}, status=status.HTTP_400_BAD_REQUEST)