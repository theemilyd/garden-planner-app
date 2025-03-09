import React, { useState } from 'react';
import { Button, Container, Row, Col, Table } from 'react-bootstrap';
import ExportCalendarModal from './ExportCalendarModal';
import { downloadCalendarPdf } from '../utils/pdfExport';

/**
 * GlobalPlantingCalendar Component
 * 
 * A specialized version of the planting calendar focused on exporting to PDF
 * This component represents the view that will be captured and converted to PDF
 */
const GlobalPlantingCalendar = ({ plants, zoneData, year = new Date().getFullYear() }) => {
  // State for export modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  
  // Calendar data for export
  const calendarData = {
    year,
    plants: plants.map(plant => ({ id: plant._id, name: plant.name })),
    zoneId: zoneData._id
  };
  
  // Handle direct download
  const handleDownload = async () => {
    setExportLoading(true);
    try {
      await downloadCalendarPdf(calendarData);
    } catch (error) {
      console.error('Error downloading calendar:', error);
      alert('Failed to download calendar. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Months for the calendar
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Helper function to determine planting windows
  const getPlantingWindow = (plant, monthIndex) => {
    // This is a simplified logic - in a real app you would have more sophisticated calculations
    // based on the plant's growing requirements and the zone's climate data
    
    if (!plant.growing_calendar) return { isIndoor: false, isDirect: false };
    
    // Check for indoor seed starting period
    const isIndoor = plant.growing_calendar.indoor_seed_start && 
      monthIndex >= plant.growing_calendar.indoor_seed_start.start_month && 
      monthIndex <= plant.growing_calendar.indoor_seed_start.end_month;
      
    // Check for direct sowing period
    const isDirect = plant.growing_calendar.direct_sow && 
      ((plant.growing_calendar.direct_sow.spring && 
        monthIndex >= plant.growing_calendar.direct_sow.spring.start_month && 
        monthIndex <= plant.growing_calendar.direct_sow.spring.end_month) ||
       (plant.growing_calendar.direct_sow.fall && 
        monthIndex >= plant.growing_calendar.direct_sow.fall.start_month && 
        monthIndex <= plant.growing_calendar.direct_sow.fall.end_month));
        
    return { isIndoor, isDirect };
  };

  return (
    <Container className="planting-calendar mt-4 mb-5">
      <div className="calendar-header bg-success text-white p-3 rounded-top text-center">
        <h2>Your Planting Calendar</h2>
        <p className="mb-0">
          Zone {zoneData.zone} • {year}
        </p>
      </div>
      
      <div className="calendar-legend my-3 d-flex justify-content-center">
        <div className="legend-item d-flex align-items-center">
          <div className="legend-color indoor-sowing-color me-2" 
               style={{ width: '20px', height: '20px', backgroundColor: '#b3e0ff', borderRadius: '3px' }}></div>
          <span>Start indoors</span>
        </div>
        <div className="legend-item ms-3 d-flex align-items-center">
          <div className="legend-color direct-sowing-color me-2" 
               style={{ width: '20px', height: '20px', backgroundColor: '#b3ffb3', borderRadius: '3px' }}></div>
          <span>Direct sow</span>
        </div>
      </div>
      
      <div className="text-end mb-3">
        <Button 
          variant="outline-secondary" 
          className="me-2"
          onClick={handleDownload}
          disabled={exportLoading}
        >
          Download PDF
        </Button>
        <Button 
          variant="primary" 
          onClick={() => setShowExportModal(true)}
          disabled={exportLoading}
        >
          Export Calendar
        </Button>
      </div>
      
      <div className="table-responsive">
        <Table className="calendar-grid" bordered>
          <thead>
            <tr>
              <th style={{ width: '200px' }}>Plant</th>
              {months.map((month) => (
                <th key={month}>{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant._id}>
                <td className="plant-name">
                  {plant.name}
                  <div className="plant-category text-muted small">{plant.plant_type}</div>
                </td>
                {months.map((month, idx) => {
                  const { isIndoor, isDirect } = getPlantingWindow(plant, idx);
                  
                  const cellClasses = [];
                  if (isIndoor) cellClasses.push('indoor-sowing');
                  if (isDirect) cellClasses.push('direct-sowing');
                  
                  return (
                    <td 
                      key={`${plant._id}-${month}`} 
                      className={cellClasses.join(' ')}
                      style={{
                        backgroundColor: isIndoor ? '#b3e0ff' : isDirect ? '#b3ffb3' : 'transparent'
                      }}
                    >
                      {isIndoor && <span className="d-none">Start indoors</span>}
                      {isDirect && <span className="d-none">Direct sow</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      
      {/* Export Calendar Modal */}
      <ExportCalendarModal 
        show={showExportModal}
        onHide={() => setShowExportModal(false)}
        calendarData={calendarData}
      />
    </Container>
  );
};

export default GlobalPlantingCalendar;