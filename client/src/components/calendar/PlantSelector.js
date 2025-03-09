import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const plantTypes = ['All', 'Vegetable', 'Herb', 'Flower'];

const PlantSelector = ({ onAddPlant, onRemovePlant, selectedPlants, typeFilter, onTypeFilterChange }) => {
  const [plantInput, setPlantInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch plant suggestions when plantInput changes
  useEffect(() => {
    const fetchPlantSuggestions = async () => {
      if (plantInput.trim() === '') {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        // Use the API to get plant data
        const response = await fetch(`/api/plants?search=${encodeURIComponent(plantInput)}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data && data.data && data.data.plants) {
          setSuggestions(data.data.plants);
        } else {
          console.warn('Unexpected API response format:', data);
          provideMockSuggestions(); // Fallback to mock data
        }
      } catch (error) {
        console.error('Error fetching plant suggestions:', error);
        // Fallback to mock data for demonstration
        provideMockSuggestions();
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fallback data in case the API isn't available
    const provideMockSuggestions = () => {
      const mockPlants = [
        { 
          id: '1', 
          name: 'Roma Tomato', 
          type: 'Vegetable',
          scientific_name: 'Solanum lycopersicum',
          days_to_maturity: { min: 75, max: 80 },
          spacing: { plants: 24 },
          growing_requirements: {
            sunlight: 'full sun',
            water_needs: 'moderate'
          }
        },
        { 
          id: '2', 
          name: 'Genovese Basil', 
          type: 'Herb',
          scientific_name: 'Ocimum basilicum',
          days_to_maturity: { min: 60, max: 70 },
          spacing: { plants: 12 },
          growing_requirements: {
            sunlight: 'full sun',
            water_needs: 'moderate'
          }
        },
        { 
          id: '3', 
          name: 'Buttercrunch Lettuce', 
          type: 'Vegetable',
          scientific_name: 'Lactuca sativa',
          days_to_maturity: { min: 55, max: 65 },
          spacing: { plants: 8 },
          growing_requirements: {
            sunlight: 'partial shade',
            water_needs: 'high'
          }
        },
        { 
          id: '4', 
          name: 'Carrot', 
          type: 'Vegetable',
          scientific_name: 'Daucus carota',
          days_to_maturity: { min: 70, max: 80 },
          spacing: { plants: 2 },
          growing_requirements: {
            sunlight: 'full sun',
            water_needs: 'moderate'
          }
        },
        { 
          id: '5', 
          name: 'Amaranth', 
          type: 'Vegetable',
          scientific_name: 'Amaranthus',
          days_to_maturity: { min: 50, max: 60 },
          spacing: { plants: 18 },
          growing_requirements: {
            sunlight: 'full sun',
            water_needs: 'moderate'
          }
        }
      ];
      
      const filtered = mockPlants.filter(plant => 
        plant.name.toLowerCase().includes(plantInput.toLowerCase()) &&
        (typeFilter === 'All' || getDisplayType(plant) === typeFilter) &&
        !selectedPlants.some(p => p.id === plant.id)
      );
      
      setSuggestions(filtered);
    };
    
    // Debounce the API call to avoid too many requests
    const timeoutId = setTimeout(fetchPlantSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [plantInput, typeFilter, selectedPlants]);
  
  const handleAddPlant = () => {
    if (plantInput.trim() === '') return;
    
    // Check if we have suggestions
    if (suggestions.length > 0) {
      onAddPlant(suggestions[0]);
      setPlantInput('');
      setSuggestions([]);
    }
  };
  
  const handleSuggestionClick = (plant) => {
    onAddPlant(plant);
    setPlantInput('');
    setSuggestions([]);
  };
  
  return (
    <Card>
      <CardHeader>
        <h2>Select Plants for Your Calendar</h2>
      </CardHeader>
      
      <CardContent>
        <FilterButtons>
          <FilterLabel>Filter by Type:</FilterLabel>
          <ButtonGroup>
            {plantTypes.map(type => (
              <FilterButton 
                key={type}
                active={typeFilter === type}
                onClick={() => onTypeFilterChange(type)}
              >
                {type}
              </FilterButton>
            ))}
          </ButtonGroup>
        </FilterButtons>
        
        <FormGroup>
          <Label htmlFor="plantInput">
            Add Plants to Your Calendar
          </Label>
          <InputHint>Search by name or variety</InputHint>
          <InputGroup>
            <Input
              type="text"
              id="plantInput"
              placeholder="e.g., Roma Tomato, Buttercrunch Lettuce, Thai Basil"
              value={plantInput}
              onChange={(e) => setPlantInput(e.target.value)}
            />
            <Button onClick={handleAddPlant}>
              Add
            </Button>
          </InputGroup>
          
          {isLoading && (
            <LoadingText>Loading suggestions...</LoadingText>
          )}
          
          {!isLoading && plantInput.trim() !== '' && suggestions.length > 0 && (
            <SuggestionsList>
              {suggestions.map(plant => (
                <SuggestionItem 
                  key={plant.id}
                  onClick={() => handleSuggestionClick(plant)}
                >
                  <span>{plant.name}</span>
                  <PlantType>{getDisplayType(plant)}</PlantType>
                </SuggestionItem>
              ))}
            </SuggestionsList>
          )}
          
          {!isLoading && plantInput.trim() !== '' && suggestions.length === 0 && (
            <NoResults>No matching plants found. Try a different search term.</NoResults>
          )}
        </FormGroup>
        
        <SelectedPlantsSection>
          <h3>Your Selected Plants:</h3>
          {selectedPlants.length === 0 ? (
            <EmptySelection>
              No plants selected yet. Add some plants to see your planting calendar.
            </EmptySelection>
          ) : (
            <PlantTags>
              {selectedPlants.map(plant => (
                <PlantTag key={plant.id} type={getPlantType(plant)}>
                  <PlantName>{plant.name}</PlantName>
                  <PlantType>{getDisplayType(plant)}</PlantType>
                  <RemoveButton onClick={() => onRemovePlant(plant.id)}>
                    ✕
                  </RemoveButton>
                </PlantTag>
              ))}
            </PlantTags>
          )}
        </SelectedPlantsSection>
      </CardContent>
    </Card>
  );
};

// Helper functions for determining plant type
const getPlantType = (plant) => {
  // If plant has a type property, use it
  if (plant.type) {
    return plant.type.toLowerCase();
  }
  
  // Otherwise, try to determine from tags
  if (plant.tags && Array.isArray(plant.tags)) {
    if (plant.tags.includes('herb')) return 'herb';
    if (plant.tags.includes('vegetable')) return 'vegetable';
    if (plant.tags.includes('flower')) return 'flower';
  }
  
  // Default fallback
  return 'vegetable';
};

const getDisplayType = (plant) => {
  // If plant has a type property, use it
  if (plant.type) {
    return plant.type;
  }
  
  // Otherwise, try to determine from tags
  if (plant.tags && Array.isArray(plant.tags)) {
    if (plant.tags.includes('herb')) return 'Herb';
    if (plant.tags.includes('vegetable')) return 'Vegetable';
    if (plant.tags.includes('flower')) return 'Flower';
  }
  
  // Default fallback
  return 'Vegetable';
};

// Styled Components
const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
  }
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  color: white;
  padding: 18px 24px;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }
`;

const CardContent = styled.div`
  padding: 24px;
`;

const FilterButtons = styled.div`
  margin-bottom: 24px;
`;

const FilterLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2C3E50;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #3A7B5E, #56A978)' : 'white'};
  color: ${props => props.active ? 'white' : '#3A7B5E'};
  border: 1px solid ${props => props.active ? '#3A7B5E' : '#E2E8F0'};
  border-radius: 8px;
  padding: 10px 18px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: ${props => props.active ? '0 2px 8px rgba(58, 123, 94, 0.2)' : 'none'};
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #346d53, #4c9b6c)' 
      : 'linear-gradient(135deg, #f9f9f9, #f0f0f0)'};
    border-color: #3A7B5E;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #2C3E50;
`;

const InputHint = styled.div`
  color: #6B7280;
  font-size: 0.85rem;
  margin-bottom: 10px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #56A978;
    box-shadow: 0 0 0 3px rgba(86, 169, 120, 0.15);
  }
  
  &::placeholder {
    color: #A0AEC0;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(86, 169, 120, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, #346d53, #4c9b6c);
    box-shadow: 0 4px 12px rgba(86, 169, 120, 0.3);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(86, 169, 120, 0.2);
  }
`;

const LoadingText = styled.div`
  margin-top: 12px;
  color: #6B7280;
  font-size: 0.9rem;
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: calc(100% - 5px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 10;
  max-height: 220px;
  overflow-y: auto;
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #EDF2F7;
  transition: all 0.15s ease;
  
  &:hover {
    background-color: rgba(58, 123, 94, 0.05);
    border-left: 3px solid #3A7B5E;
    padding-left: 13px;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NoResults = styled.div`
  margin-top: 12px;
  color: #6B7280;
  font-size: 0.9rem;
  padding: 4px 0;
`;

const SelectedPlantsSection = styled.div`
  margin-top: 32px;
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    color: #3A7B5E;
    font-weight: 600;
    font-size: 1.2rem;
  }
`;

const EmptySelection = styled.p`
  color: #6B7280;
  font-style: italic;
  padding: 16px;
  background: linear-gradient(to right, #F7FAFC, #EDF2F7);
  border-radius: 8px;
  text-align: center;
  border-left: 3px solid #CBD5E0;
`;

const PlantTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PlantTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${props => {
    switch(props.type) {
      case 'vegetable': return 'rgba(86, 169, 120, 0.15)';
      case 'herb': return 'rgba(66, 153, 225, 0.15)';
      case 'flower': return 'rgba(237, 137, 54, 0.15)';
      default: return 'rgba(160, 174, 192, 0.15)';
    }
  }};
  padding: 8px 14px;
  border-radius: 100px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
  border: 1px solid ${props => {
    switch(props.type) {
      case 'vegetable': return 'rgba(86, 169, 120, 0.35)';
      case 'herb': return 'rgba(66, 153, 225, 0.35)';
      case 'flower': return 'rgba(237, 137, 54, 0.35)';
      default: return 'rgba(160, 174, 192, 0.35)';
    }
  }};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
    background-color: ${props => {
      switch(props.type) {
        case 'vegetable': return 'rgba(86, 169, 120, 0.2)';
        case 'herb': return 'rgba(66, 153, 225, 0.2)';
        case 'flower': return 'rgba(237, 137, 54, 0.2)';
        default: return 'rgba(160, 174, 192, 0.2)';
      }
    }};
  }
`;

const PlantName = styled.span`
  font-weight: 500;
  color: #2D3748;
`;

const PlantType = styled.span`
  font-size: 0.75rem;
  color: ${props => {
    switch(props.children) {
      case 'Vegetable': return '#1C4532'; // Darker green for better contrast
      case 'Herb': return '#2A4365'; // Darker blue for better contrast
      case 'Flower': return '#7B341E'; // Darker orange for better contrast
      default: return '#2D3748'; // Darker gray for better contrast
    }
  }};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: white;
  padding: 3px 8px;
  border-radius: 100px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #A0AEC0;
  cursor: pointer;
  font-size: 0.85rem;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.15s ease;
  margin-left: 2px;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #E53E3E;
  }
`;

export default PlantSelector;