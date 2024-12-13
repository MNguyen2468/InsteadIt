import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db.models import Q
from .models import Messages

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.sender_id = self.scope['url_route']['kwargs']['sender_id']
        self.receiver_id = self.scope['url_route']['kwargs']['receiver_id']
        self.room_group_name = f"chat_{self.sender_id}_{self.receiver_id}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Fetch chat history between sender and receiver
        await self.send_chat_history()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Fetch chat history (similar to your get_chat_messages API)
    async def send_chat_history(self):
        messages = Messages.objects.filter(
            (Q(senderID=self.sender_id) & Q(receiverID=self.receiver_id)) |
            (Q(senderID=self.receiver_id) & Q(receiverID=self.sender_id))
        ).order_by('messageID').values('messageID', 'text', 'photoID', 'videoID', 'senderID', 'receiverID')

        # Send message history to WebSocket
        await self.send(text_data=json.dumps({
            'messages': list(messages)
        }))

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Broadcast message to the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
