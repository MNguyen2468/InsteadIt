import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import { useParams } from 'react-router-dom';
import './Gallery.css';
import { DarkModeContext } from '../../context/darkModeContext';

const Gallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(AuthContext);
  const { username } = useParams();
  const [isOwner, setIsOwner] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [ownerDetails, setOwnerDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const { darkMode } = useContext(DarkModeContext);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    // Get image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise(resolve => img.onload = resolve);

    formData.append('size', file.size);
    formData.append('width', img.width);
    formData.append('height', img.height);
    formData.append('userID', currentUser.userID);
    formData.append('description', 'Gallery photo');

    try {
      const response = await fetch(`http://3.140.132.61/api/upload-photo/`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const newPhoto = await response.json();
      setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`http://3.140.132.61/api/delete-photo/${photoId}/`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.photoID !== photoId));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const fetchOwnerDetails = async () => {
        try {
            const response = await fetch(`http://3.140.132.61/api/user/${username}/`);
            if (!response.ok) {
                throw new Error('Failed to fetch owner details');
            }
            const data = await response.json();
            setOwnerDetails(data);
        } catch (err) {
            setError(err.message);
        }
    }
    const fetchPhotos = async () => {
      try {
        const response = await fetch(`http://3.140.132.61/api/user-photos/${username}/`);
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const data = await response.json();
        setPhotos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) { 
      setIsOwner(currentUser.username === username);
    }
    fetchPhotos();
    fetchOwnerDetails();
  }, [username, currentUser]);

  if (loading) return <div className="loading-message">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className={`gallery-container ${darkMode ? "darkMode" : ""}`}>
      <h2>{ownerDetails?.displayName}'s Photos</h2>
      {isOwner && (
        <div className="gallery-controls">
          <div className="upload-section">
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="custom-file-upload">
              Upload Photo
            </label>
          </div>
          <button 
            className="gallery-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      )}
      <div className="photos-grid">
        {photos.map((photo) => (
          <div 
            key={photo.photoID} 
            className={`photo-item ${isEditing ? 'editing' : ''}`}
            style={{ position: 'relative' }}
            onClick={() => !isEditing && setSelectedPhoto(photo)}
          >
            <img 
              src={`data:image/jpeg;base64,${photo.image}`}
              alt={photo.description || 'Gallery photo'}
            />
            {isOwner && isEditing && (
              <button
                className="delete-photo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePhoto(photo.photoID);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedPhoto && (
        <div className="modal" onClick={() => setSelectedPhoto(null)}>
          <div className="modal-content">
            <img
              src={`data:image/jpeg;base64,${selectedPhoto.image}`}
              alt={selectedPhoto.description || 'Expanded photo'}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
