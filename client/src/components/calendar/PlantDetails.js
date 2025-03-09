import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchRawGardenateData } from '../../utils/gardenateData';

/**
 * Component to display detailed plant information from Gardenate
 */
const PlantDetails = ({ plant, zoneInfo }) => {
  const [gardenateData, setGardenateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    const loadGardenateData = async () => {
      if (!plant || !plant.name) {
        setLoading(false);
        setError('No plant name provided');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch the data with the exact plant name
        let data = await fetchRawGardenateData(plant.name);
        
        // If that fails, try with just the first word of the plant name
        if (!data && plant.name.includes(' ')) {
          const firstWord = plant.name.split(' ')[0];
          data = await fetchRawGardenateData(firstWord);
        }
        
        // Special case for Broad Beans
        if (!data && (plant.name === "Broad Beans" || plant.name.includes("Broad"))) {
          data = await fetchRawGardenateData("Broad Beans");
        }
        
        if (!data) {
          setError(`Could not load data for ${plant.name}`);
          setLoading(false);
          return;
        }
        
        setGardenateData(data);
        
        // Check for different data structures
        let zones = null;
        
        if (data.zones) {
          zones = data.zones;
        } else if (data.data && data.data.zones) {
          zones = data.data.zones;
        }
        
        if (!zones || zones.length === 0) {
          setError(`No zone information found for ${plant.name}`);
          setLoading(false);
          return;
        }
        
        // Determine the best matching zone based on user's location
        let bestZone = null;
        let zonePreference = ['Australia - temperate', 'Australia - sub-tropical', 'Australia - cool/mountain'];
        
        if (zoneInfo && zoneInfo.country) {
          const country = zoneInfo.country.toLowerCase();
          
          if (country === 'gb' || country === 'uk' || country.includes('united kingdom') || country.includes('great britain')) {
            zonePreference = [
              'United Kingdom - cool/temperate', 
              'United Kingdom - warm/temperate',
              'Australia - temperate' // Fallback
            ];
          } else if (country === 'nz' || country.includes('new zealand')) {
            zonePreference = [
              'New Zealand - temperate',
              'New Zealand - sub-tropical',
              'New Zealand - cool/mountain',
              'Australia - temperate' // Fallback
            ];
          } else if (country === 'au' || country.includes('australia')) {
            zonePreference = [
              'Australia - temperate',
              'Australia - sub-tropical',
              'Australia - cool/mountain',
              'Australia - tropical',
              'Australia - arid'
            ];
          }
        }
        
        // Find the best matching zone
        for (const zoneName of zonePreference) {
          const matchingZone = zones.find(zone => zone.zone_name === zoneName);
          if (matchingZone) {
            bestZone = matchingZone;
            break;
          }
        }
        
        // If no preferred zone found, use the first one
        if (!bestZone && zones.length > 0) {
          bestZone = zones[0];
        }
        
        if (bestZone) {
          setSelectedZone(bestZone);
        } else {
          setError(`Could not determine appropriate growing zone for ${plant.name}`);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading Gardenate data:', err);
        setError(`Failed to load plant details: ${err.message}`);
        setLoading(false);
      }
    };

    loadGardenateData();
  }, [plant, zoneInfo]);

  // Handle zone selection change
  const handleZoneChange = (e) => {
    if (!gardenateData || !gardenateData.zones) return;
    
    const zoneName = e.target.value;
    const zone = gardenateData.zones.find(z => z.zone_name === zoneName);
    if (zone) {
      setSelectedZone(zone);
    }
  };

  if (loading) {
    return <LoadingMessage>Loading plant details...</LoadingMessage>;
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorMessage>{error}</ErrorMessage>
      </ErrorContainer>
    );
  }

  if (!gardenateData || !selectedZone) {
    return (
      <ErrorContainer>
        <NoDataMessage>No detailed information available for this plant.</NoDataMessage>
      </ErrorContainer>
    );
  }

  // Check if the selected zone has the expected data structure
  if (!selectedZone.data) {
    return (
      <ErrorContainer>
        <NoDataMessage>Selected zone does not contain detailed information.</NoDataMessage>
      </ErrorContainer>
    );
  }

  // Extract the plant data from the selected zone
  const plantData = selectedZone.data;
  const growingInfo = plantData.growing_info || {};
  const additionalNotes = growingInfo.additional_notes || [];
  const culinaryHints = plantData.culinary_hints || [];

  // Extract description from additional notes (usually the 4th item)
  const description = additionalNotes.length > 3 ? additionalNotes[3] : '';
  
  // Extract growing instructions from additional notes
  const growingInstructions = additionalNotes
    .filter((note, index) => index !== 3 && !note.includes("Be the first to post"))
    .join('\n\n');

  // Format text with bullet points for certain sections
  const formatWithBullets = (text) => {
    if (!text) return '';
    
    // Split by newlines and filter out empty lines
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // If there's only one line, return it as is
    if (lines.length <= 1) return text;
    
    // Format with bullet points
    return lines.map(line => `• ${line}`).join('\n');
  };

  return (
    <DetailsContainer>
      <DetailsHeader>
        <PlantName>{plant.name}</PlantName>
        <CloseButton onClick={() => window.dispatchEvent(new CustomEvent('closePlantDetails'))}>×</CloseButton>
        {gardenateData.zones && gardenateData.zones.length > 0 && (
          <ZoneSelector>
            <label htmlFor="zone-select">Climate Zone:</label>
            <select 
              id="zone-select" 
              value={selectedZone.zone_name} 
              onChange={handleZoneChange}
            >
              {gardenateData.zones.map(zone => (
                <option key={zone.zone_name} value={zone.zone_name}>
                  {zone.zone_name}
                </option>
              ))}
            </select>
          </ZoneSelector>
        )}
      </DetailsHeader>

      {plantData.scientific_name && (
        <ScientificName>{plantData.scientific_name}</ScientificName>
      )}

      {description && (
        <Section>
          <SectionTitle>Description</SectionTitle>
          <SectionContent>{description}</SectionContent>
        </Section>
      )}

      {growingInstructions && (
        <Section>
          <SectionTitle>How to Grow</SectionTitle>
          <SectionContent>{formatWithBullets(growingInstructions)}</SectionContent>
        </Section>
      )}

      {/* Enhanced data: Soil Temperature */}
      {growingInfo.soil_temperature && (
        <Section>
          <SectionTitle>Soil Temperature</SectionTitle>
          <SectionContent>{growingInfo.soil_temperature}</SectionContent>
        </Section>
      )}

      {/* Enhanced data: Spacing */}
      {growingInfo.spacing && (
        <Section>
          <SectionTitle>Spacing</SectionTitle>
          <SectionContent>{growingInfo.spacing}</SectionContent>
        </Section>
      )}

      {/* Enhanced data: Harvest Time */}
      {growingInfo.harvest_time && (
        <Section>
          <SectionTitle>Harvest Time</SectionTitle>
          <SectionContent>{growingInfo.harvest_time}</SectionContent>
        </Section>
      )}

      {culinaryHints && culinaryHints.length > 0 && (
        <Section>
          <SectionTitle>Culinary Uses</SectionTitle>
          <SectionContent>{formatWithBullets(culinaryHints.join('\n'))}</SectionContent>
        </Section>
      )}

      {plantData.companion_plants && plantData.companion_plants.length > 0 && (
        <Section>
          <SectionTitle>Companion Plants</SectionTitle>
          <SectionContent>{formatWithBullets(plantData.companion_plants.join('\n'))}</SectionContent>
        </Section>
      )}

      {plantData.avoid_plants && plantData.avoid_plants.length > 0 && (
        <Section>
          <SectionTitle>Plants to Avoid</SectionTitle>
          <SectionContent>{formatWithBullets(plantData.avoid_plants.join('\n'))}</SectionContent>
        </Section>
      )}
    </DetailsContainer>
  );
};

// Styled Components
const DetailsContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
  max-height: 80vh;
  overflow-y: auto;
`;

const DetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const PlantName = styled.h2`
  margin: 0;
  color: var(--sage-700);
  font-size: 1.5rem;
`;

const ScientificName = styled.p`
  font-style: italic;
  color: var(--sage-600);
  margin-top: -15px;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--sage-600);
  position: absolute;
  right: 20px;
  top: 15px;
  
  &:hover {
    color: var(--sage-800);
  }
`;

const ZoneSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  
  label {
    font-weight: 500;
    color: var(--sage-600);
  }
  
  select {
    padding: 6px 10px;
    border-radius: 4px;
    border: 1px solid var(--sage-300);
    background-color: white;
    color: var(--sage-800);
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: var(--sage-500);
      box-shadow: 0 0 0 2px rgba(58, 123, 94, 0.2);
    }
  }
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  color: var(--sage-600);
  font-size: 1.1rem;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--sage-200);
  padding-bottom: 5px;
`;

const SectionContent = styled.p`
  margin: 0;
  line-height: 1.5;
  color: var(--sage-900);
  white-space: pre-line;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: var(--sage-600);
`;

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  margin-bottom: 20px;
`;

const NoDataMessage = styled.div`
  color: var(--sage-500);
  font-style: italic;
  margin-bottom: 20px;
`;

export default PlantDetails; 