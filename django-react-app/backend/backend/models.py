from django.db import models
from django.contrib.auth.hashers import make_password, check_password



class Members(models.Model):
    memberId = models.IntegerField(primary_key=True)  # Primary key column
    memberName = models.CharField(max_length=8, null=True)  # Adjusted to match varchar(8)
    memberYear = models.IntegerField(null=True)  # Nullable integer field

    def __str__(self):
        return self.memberName + '\t' + str(self.memberId) + '\t' + str(self.memberYear)

    class Meta:
        db_table = 'Members'
        managed = False

class User(models.Model):
    bio = models.CharField(max_length=500, null=True)
    displayName = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    profilePicture = models.CharField(max_length=500, null=True)
    userID = models.IntegerField(primary_key=True)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=500)

    def __str__(self):
        return self.bio + '\t' + str(self.displayName) + '\t' + str(self.email)
    
    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password) 
   
    class Meta:
        db_table = 'User'
        managed = False

class Ban(models.Model):
    banID = models.IntegerField(primary_key=True)
    userID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID')
    subredditID = models.ForeignKey('Subreddit', on_delete=models.CASCADE, db_column='subredditID')

    class Meta:
        db_table = 'Ban'
        managed = False

class Comment(models.Model):
    commentID = models.IntegerField(primary_key=True)
    mainBody = models.CharField(max_length=1000)
    upvotes = models.IntegerField()
    downvotes = models.IntegerField()
    forumID = models.ForeignKey('Forum', on_delete=models.CASCADE, db_column='forumID')
    replyID = models.ForeignKey('self', null=True, on_delete=models.SET_NULL, db_column='replyID')

    class Meta:
        db_table = 'Comment'
        managed = False

class FollowingSubreddit(models.Model):
    userID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID')
    subredditID = models.ForeignKey('Subreddit', on_delete=models.CASCADE, db_column='subredditID')
    followingSubredditID = models.IntegerField(primary_key=True)

    class Meta:
        db_table = 'FollowingSubreddit'
        managed = False

class FollowingUser(models.Model):
    followedID = models.ForeignKey(User, related_name='followed', on_delete=models.CASCADE, db_column='followedID')
    followerID = models.ForeignKey(User, related_name='follower', on_delete=models.CASCADE, db_column='followerID')
    followingUserID = models.IntegerField(primary_key=True)

    class Meta:
        db_table = 'FollowingUser'
        managed = False

class Forum(models.Model):
    forumID = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=50)
    upvotes = models.IntegerField(default = 0)#upvotes = models.IntegerField()
    downvotes = models.IntegerField(default = 0)#downvotes = models.IntegerField()
    mainBody = models.CharField(max_length=1000)
    userID = models.ForeignKey('User', on_delete=models.CASCADE, db_column='userID') #userID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID')
    subredditID = models.ForeignKey('Subreddit', on_delete=models.CASCADE, db_column='subredditID')

    class Meta:
        db_table = 'Forum'
        managed = False

class Gallery(models.Model):
    userID = models.IntegerField(primary_key=True)
    galleryCount = models.IntegerField()
    photoID = models.ForeignKey('Photo', on_delete=models.CASCADE, db_column='photoID')
    videoID = models.ForeignKey('Video', on_delete=models.CASCADE, db_column='videoID')

    class Meta:
        db_table = 'Gallery'
        managed = False

class Messages(models.Model):
    messageID = models.IntegerField(primary_key=True)
    text = models.CharField(max_length=1000)
    photoID = models.ForeignKey('Photo', on_delete=models.CASCADE, db_column='photoID')
    videoID = models.ForeignKey('Video', on_delete=models.CASCADE, db_column='videoID')
    senderID = models.ForeignKey(User, related_name='sender', on_delete=models.CASCADE, db_column='senderID')
    receiverID = models.ForeignKey(User, related_name='receiver', on_delete=models.CASCADE, db_column='receiverID')

    class Meta:
        db_table = 'Messages'
        managed = False

class Photo(models.Model):
    photoID = models.IntegerField(primary_key=True)
    image = models.CharField(max_length=500)
    size = models.IntegerField()
    w = models.IntegerField()
    h = models.IntegerField()
    dateUpload = models.DateTimeField()
    description = models.CharField(max_length=500)

    class Meta:
        db_table = 'Photo'
        managed = False

class Subreddit(models.Model):
    subredditID = models.IntegerField(primary_key=True)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    userID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID')

    class Meta:
        db_table = 'Subreddit'
        managed = False

class Video(models.Model):
    videoID = models.IntegerField(primary_key=True)
    video = models.CharField(max_length=500)
    size = models.IntegerField()
    videoLength = models.IntegerField()
    resolution = models.IntegerField()
    dateUploade = models.DateTimeField()

    class Meta:
        db_table = 'Video'
        managed = False

