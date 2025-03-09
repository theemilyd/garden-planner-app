import React, { useState } from 'react';
import styled from 'styled-components';

const JournalEntry = ({ entries = [], onAddEntry, onDeleteEntry }) => {
  const [newEntry, setNewEntry] = useState('');
  const [showForm, setShowForm] = useState(false);
  // const [image, setImage] = useState(null); // Not used directly
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      // We'll need to keep this function but we can modify it to avoid the eslint warning
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      onAddEntry({
        id: Date.now().toString(),
        text: newEntry,
        date: new Date().toISOString(),
        image: imagePreview // In a real app, you'd handle image upload differently
      });
      setNewEntry('');
      setImagePreview(null);
      setShowForm(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <JournalContainer>
      <JournalHeader>
        <h3>Garden Journal</h3>
        {!showForm && (
          <AddEntryButton onClick={() => setShowForm(true)}>
            Add Entry
          </AddEntryButton>
        )}
      </JournalHeader>
      
      {showForm && (
        <EntryForm>
          <TextArea
            placeholder="Write your garden observations, notes, or reflections..."
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
          />
          
          <ImageUploadContainer>
            <ImageUploadLabel htmlFor="image-upload">
              Add Photo
            </ImageUploadLabel>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            
            {imagePreview && (
              <ImagePreview>
                <img src={imagePreview} alt="Preview" />
                <RemoveImageButton onClick={() => {
                  setImagePreview(null);
                }}>
                  ✕
                </RemoveImageButton>
              </ImagePreview>
            )}
          </ImageUploadContainer>
          
          <FormActions>
            <CancelButton onClick={() => {
              setShowForm(false);
              setNewEntry('');
              setImagePreview(null);
            }}>
              Cancel
            </CancelButton>
            <SaveButton 
              onClick={handleAddEntry}
              disabled={!newEntry.trim()}
            >
              Save Entry
            </SaveButton>
          </FormActions>
        </EntryForm>
      )}
      
      <JournalEntries>
        {entries.length === 0 ? (
          <EmptyState>No journal entries yet. Start documenting your garden journey!</EmptyState>
        ) : (
          entries.map(entry => (
            <Entry key={entry.id}>
              <EntryHeader>
                <EntryDate>{formatDate(entry.date)}</EntryDate>
                <DeleteButton onClick={() => onDeleteEntry(entry.id)}>
                  🗑️
                </DeleteButton>
              </EntryHeader>
              
              <EntryText>{entry.text}</EntryText>
              
              {entry.image && (
                <EntryImage>
                  <img src={entry.image} alt="Journal entry" />
                </EntryImage>
              )}
            </Entry>
          ))
        )}
      </JournalEntries>
    </JournalContainer>
  );
};

// Styled Components
const JournalContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-top: 20px;
`;

const JournalHeader = styled.div`
  background-color: #4A9C59;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const AddEntryButton = styled.button`
  background-color: white;
  color: #4A9C59;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const EntryForm = styled.div`
  padding: 16px;
  border-bottom: 1px solid #eee;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 12px;
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 12px;
`;

const ImageUploadLabel = styled.label`
  display: inline-block;
  padding: 8px 12px;
  background-color: #f0f0f0;
  color: #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 12px;
  
  img {
    max-width: 150px;
    max-height: 150px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  color: #d32f2f;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  
  &:hover {
    background-color: #f8f8f8;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const CancelButton = styled.button`
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const SaveButton = styled.button`
  background-color: #4A9C59;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #3a8b49;
  }
  
  &:disabled {
    background-color: #a0d2a8;
    cursor: not-allowed;
  }
`;

const JournalEntries = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 0 16px;
`;

const Entry = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const EntryDate = styled.div`
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  
  &:hover {
    color: #d32f2f;
  }
`;

const EntryText = styled.div`
  margin-bottom: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
`;

const EntryImage = styled.div`
  img {
    max-width: 100%;
    border-radius: 4px;
    border: 1px solid #eee;
  }
`;

const EmptyState = styled.div`
  padding: 20px 0;
  text-align: center;
  color: #888;
  font-style: italic;
  font-size: 0.9rem;
`;

export default JournalEntry;