from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return Response({'message': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response({'message': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Ensure password check works properly
            if not user.check_password(password):
                return Response({'message': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

            # Token generation for the user
            try:
                refresh = RefreshToken.for_user(user)
                #print(f"Token generated successfully: refresh={str(refresh)}, access={str(refresh.access_token)}")
            except Exception as e:
                print(f"Token generation failed: {str(e)}")
                return Response({'message': 'Token generation failed.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Return tokens and user information
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.userID,  # Return the userID instead of id
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log any unexpected errors
            print(f"Unexpected error during login: {str(e)}")
            return Response({'message': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)