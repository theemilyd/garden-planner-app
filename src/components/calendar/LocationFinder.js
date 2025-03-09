import React, { useState } from 'react';
import styled from 'styled-components';

// Country database with postal code formats
const countries = [
  { code: 'US', name: 'United States', postalFormat: '#####', zoneSystem: 'USDA' },
  { code: 'CA', name: 'Canada', postalFormat: 'A#A #A#', zoneSystem: 'Canadian' },
  { code: 'GB', name: 'United Kingdom', postalFormat: 'AA## #AA', zoneSystem: 'RHS' },
  { code: 'AU', name: 'Australia', postalFormat: '####', zoneSystem: 'Australian' },
  { code: 'NZ', name: 'New Zealand', postalFormat: '####', zoneSystem: 'NZ' },
  { code: 'FR', name: 'France', postalFormat: '#####', zoneSystem: 'European' },
  { code: 'DE', name: 'Germany', postalFormat: '#####', zoneSystem: 'European' },
];

const LocationFinder = ({ onSubmit, loading, zoneInfo }) => {
  const [country, setCountry] = useState('US');
  const [postalCode, setPostalCode] = useState('');
  
  // Get postal code format for selected country
  const getPostalCodeFormat = () => {
    const selectedCountry = countries.find(c => c.code === country);
    return selectedCountry ? selectedCountry.postalFormat : '#####';
  };
  
  // Validate postal code based on country format
  const isValidPostalCode = (code) => {
    if (!code || code.trim() === '') {
      return false;
    }
    
    // Apply country-specific validation patterns
    switch(country) {
      case 'US':
        // US ZIP codes: 5 digits or 5+4 format
        return /^\d{5}(-\d{4})?$/.test(code);
        
      case 'CA':
        // Canadian postal codes: A1A 1A1 format
        // Remove spaces for validation and allow with/without space
        const caCode = code.replace(/\s+/g, '');
        return /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i.test(caCode);
        
      case 'GB':
        // UK postcodes have complex format but simplified for UI
        // Allow common formats like SW1A 1AA, B1 1AA, etc.
        const ukCode = code.toUpperCase().replace(/\s+/g, ' ').trim();
        return /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/.test(ukCode);
        
      case 'AU':
      case 'NZ':
        // Australia and New Zealand: 4 digits
        return /^\d{4}$/.test(code);
        
      case 'FR':
      case 'DE':
        // European postal codes: typically 5 digits
        return /^\d{5}$/.test(code);
        
      default:
        // Generic validation for other countries
        // Require at least 3 characters, allow letters, numbers, and hyphens
        return /^[A-Za-z0-9-]{3,10}$/.test(code);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidPostalCode(postalCode)) {
      onSubmit(country, postalCode);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h2>Find Your Growing Zone</h2>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="country">Select Your Country</Label>
            <Select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="postalCode">
              Enter Your {country === 'US' ? 'ZIP' : 'Postal'} Code
              <FormatHint> (Format: {getPostalCodeFormat()})</FormatHint>
            </Label>
            <InputGroup>
              <Input
                type="text"
                id="postalCode"
                placeholder={`e.g., ${getPostalCodeFormat()}`}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Finding Zone...' : 'Find Zone'}
              </Button>
            </InputGroup>
          </FormGroup>
        </form>
        
        {loading && (
          <LoadingIndicator>
            <Spinner />
            <p>Finding your growing zone...</p>
          </LoadingIndicator>
        )}
        
        {zoneInfo && (
          <ZoneInfo>
            <h3>Your Growing Information</h3>
            <ZoneInfoGrid>
              <ZoneInfoItem>
                <ZoneInfoLabel>Zone System:</ZoneInfoLabel> {zoneInfo.zoneSystem}
              </ZoneInfoItem>
              <ZoneInfoItem>
                <ZoneInfoLabel>Zone:</ZoneInfoLabel> {zoneInfo.zoneName}
              </ZoneInfoItem>
              <ZoneInfoItem>
                <ZoneInfoLabel>Last Frost Date:</ZoneInfoLabel> {zoneInfo.lastFrostDate}
              </ZoneInfoItem>
              <ZoneInfoItem>
                <ZoneInfoLabel>First Frost Date:</ZoneInfoLabel> {zoneInfo.firstFrostDate}
              </ZoneInfoItem>
              <ZoneInfoItem>
                <ZoneInfoLabel>Growing Season:</ZoneInfoLabel> {zoneInfo.growingDays} days
              </ZoneInfoItem>
              <ZoneInfoItem>
                <ZoneInfoLabel>Data Source:</ZoneInfoLabel> {zoneInfo.dataSource}
              </ZoneInfoItem>
            </ZoneInfoGrid>
          </ZoneInfo>
        )}
      </CardContent>
    </Card>
  );
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

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2C3E50;
`;

const FormatHint = styled.span`
  font-weight: normal;
  color: #6B7280;
  font-size: 0.85em;
  margin-left: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233A7B5E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #56A978;
    box-shadow: 0 0 0 3px rgba(86, 169, 120, 0.15);
  }
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
  
  &:disabled {
    background: #CBD5E0;
    color: #718096;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 24px 0;
`;

const Spinner = styled.div`
  border: 3px solid #EDF2F7;
  border-top: 3px solid #56A978;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 0.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ZoneInfo = styled.div`
  margin-top: 28px;
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  border-radius: 10px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 12px rgba(58, 123, 94, 0.15);
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
  }
`;

const ZoneInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
`;

const ZoneInfoItem = styled.p`
  margin: 0;
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  color: white;
`;

const ZoneInfoLabel = styled.span`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  margin-right: 8px;
  min-width: 140px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

export default LocationFinder;