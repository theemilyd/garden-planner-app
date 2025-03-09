import React from 'react';
import styled from 'styled-components';

const WeatherWidget = ({ weatherData, zoneInfo, compact = false }) => {
  if (!weatherData || !weatherData.data) {
    return null;
  }
  
  const { data } = weatherData;
  
  // Helper function to get weather icon
  const getWeatherIcon = (condition) => {
    if (!condition) return '🌤️'; // Default icon
    
    condition = condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) return '☀️';
    if (condition.includes('cloud') && condition.includes('part')) return '⛅';
    if (condition.includes('cloud')) return '☁️';
    if (condition.includes('rain') || condition.includes('shower')) return '🌧️';
    if (condition.includes('thunder') || condition.includes('storm')) return '⛈️';
    if (condition.includes('snow') || condition.includes('flurries')) return '❄️';
    if (condition.includes('fog') || condition.includes('mist')) return '🌫️';
    
    return '🌤️'; // Default icon
  };
  
  // Calculate planting conditions based on weather data
  const getPlantingConditions = () => {
    const frostRisk = data.frostRisk || 'Low';
    const temp = data.currentTemp || 0;
    
    if (frostRisk === 'High') return { status: 'Poor', message: 'High frost risk' };
    if (temp < 40) return { status: 'Poor', message: 'Too cold for most plants' };
    if (temp > 90) return { status: 'Poor', message: 'Too hot for most plants' };
    if (temp < 50) return { status: 'Fair', message: 'Good for cold-hardy plants only' };
    if (temp > 85) return { status: 'Fair', message: 'Water frequently in hot conditions' };
    
    return { status: 'Good', message: 'Favorable planting conditions' };
  };
  
  const plantingConditions = getPlantingConditions();
  
  // Compact view for mobile
  if (compact) {
    return (
      <CompactCard>
        <IconTemp>
          {getWeatherIcon(data.forecast?.[0]?.condition)}
          <span>
            {data.location?.startsWith('GB') || data.location?.startsWith('UK') ? 
              `${Math.round((data.currentTemp - 32) * 5/9)}°C` :
              `${data.currentTemp}°F / ${Math.round((data.currentTemp - 32) * 5/9)}°C`
            }
          </span>
        </IconTemp>
        <CompactDetails>
          <Location>{data.location}</Location>
          <Condition status={plantingConditions.status}>
            {plantingConditions.status} planting conditions
          </Condition>
        </CompactDetails>
      </CompactCard>
    );
  }
  
  // Full view for desktop
  return (
    <Card>
      <CardHeader>
        <h2>Weather & Planting Conditions</h2>
      </CardHeader>
      
      <CardContent>
        <CurrentWeather>
          <WeatherIcon>{getWeatherIcon(data.forecast?.[0]?.condition)}</WeatherIcon>
          <TemperatureDisplay>
            <CurrentTemp>
              {data.country === 'GB' || data.country === 'UK' ? 
                `${Math.round((data.currentTemp - 32) * 5/9)}°C` :
                `${data.currentTemp}°F / ${Math.round((data.currentTemp - 32) * 5/9)}°C`
              }
            </CurrentTemp>
            <Location>{data.location}</Location>
          </TemperatureDisplay>
        </CurrentWeather>
        
        <ConditionPanel status={plantingConditions.status}>
          <ConditionTitle>
            {plantingConditions.status} Planting Conditions
          </ConditionTitle>
          <ConditionMessage>
            {plantingConditions.message}
          </ConditionMessage>
        </ConditionPanel>
        
        <Forecast>
          <h3>3-Day Forecast</h3>
          <ForecastGrid>
            {data.forecast && data.forecast.map((day, idx) => (
              <ForecastDay key={idx}>
                <ForecastDate>{day.date.split('-')[2]}</ForecastDate>
                <ForecastIcon>{getWeatherIcon(day.condition)}</ForecastIcon>
                <ForecastTemp>
                  {data.country === 'GB' || data.country === 'UK' ? (
                    <>
                      <HighTemp>{Math.round((day.high - 32) * 5/9)}°C</HighTemp>
                      <LowTemp>{Math.round((day.low - 32) * 5/9)}°C</LowTemp>
                    </>
                  ) : (
                    <>
                      <HighTemp>{day.high}°F</HighTemp>
                      <LowTemp>{day.low}°F</LowTemp>
                    </>
                  )}
                </ForecastTemp>
              </ForecastDay>
            ))}
          </ForecastGrid>
        </Forecast>
        
        <ZoneTips>
          <h3>Zone {zoneInfo.zoneName} Tips</h3>
          <TipsList>
            <Tip>Frost risk is currently <FrostRisk risk={data.frostRisk || 'Low'}>{data.frostRisk || 'Low'}</FrostRisk></Tip>
            <Tip>Growing season: {zoneInfo.growingDays} days</Tip>
            <Tip>Select plants suitable for zone {zoneInfo.zoneName}</Tip>
          </TipsList>
        </ZoneTips>
      </CardContent>
    </Card>
  );
};

// Styled Components
const Card = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadow};
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  height: 100%;
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #3A7B5E, #56A978);
  color: white;
  padding: 16px;
  
  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: -0.3px;
    color: white;
  }
`;

const CardContent = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CurrentWeather = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const WeatherIcon = styled.div`
  font-size: 3rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TemperatureDisplay = styled.div`
  display: flex;
  flex-direction: column;
`;

const CurrentTemp = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.text};
`;

const Location = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.secondaryText};
`;

const ConditionPanel = styled.div`
  background: ${props => {
    switch(props.status.toLowerCase()) {
      case 'good': return 'rgba(72, 187, 120, 0.1)';
      case 'fair': return 'rgba(246, 224, 94, 0.1)';
      case 'poor': return 'rgba(229, 62, 62, 0.1)';
      default: return 'rgba(160, 174, 192, 0.1)';
    }
  }};
  border-left: 3px solid ${props => {
    switch(props.status.toLowerCase()) {
      case 'good': return '#38A169';
      case 'fair': return '#ECC94B';
      case 'poor': return '#E53E3E';
      default: return '#718096';
    }
  }};
  padding: 12px;
  border-radius: 8px;
`;

const ConditionTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  margin-bottom: 4px;
`;

const ConditionMessage = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.secondaryText};
`;

const Forecast = styled.div`
  margin-top: 8px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 1rem;
    color: ${props => props.theme.text};
  }
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const ForecastDay = styled.div`
  background: ${props => props.theme.lightGray};
  border-radius: 8px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ForecastDate = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 4px;
  color: ${props => props.theme.secondaryText};
`;

const ForecastIcon = styled.div`
  font-size: 1.5rem;
  margin: 4px 0;
`;

const ForecastTemp = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
`;

const HighTemp = styled.div`
  font-weight: 600;
  color: ${props => props.theme.text};
  font-size: 0.9rem;
`;

const LowTemp = styled.div`
  color: ${props => props.theme.secondaryText};
  font-size: 0.9rem;
`;

const ZoneTips = styled.div`
  margin-top: 8px;
  
  h3 {
    margin: 0 0 10px 0;
    font-size: 1rem;
    color: ${props => props.theme.text};
  }
`;

const TipsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Tip = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.secondaryText};
  padding: 8px 12px;
  background: ${props => props.theme.lightGray};
  border-radius: 6px;
`;

const FrostRisk = styled.span`
  font-weight: 600;
  color: ${props => {
    switch(props.risk.toLowerCase()) {
      case 'high': return props.theme.error;
      case 'medium': return props.theme.warning;
      case 'low': return props.theme.success;
      default: return props.theme.success;
    }
  }};
`;

// Compact mobile view
const CompactCard = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 12px;
  box-shadow: ${props => props.theme.shadow};
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconTemp = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 1.2rem;
  
  span {
    font-weight: 600;
    color: ${props => props.theme.text};
  }
`;

const CompactDetails = styled.div`
  flex: 1;
`;

const Condition = styled.div`
  font-weight: 500;
  color: ${props => {
    switch(props.status.toLowerCase()) {
      case 'good': return props.theme.success;
      case 'fair': return props.theme.warning;
      case 'poor': return props.theme.error;
      default: return props.theme.secondaryText;
    }
  }};
  font-size: 0.9rem;
`;

export default WeatherWidget;