import React, { useState, useMemo, useEffect } from 'react';
import { Box, Tabs, Tab, Stack, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import CalendarViewIcon from '@mui/icons-material/CalendarViewMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import IosShareIcon from '@mui/icons-material/IosShare';
import { downloadICSFile } from '../services/calendar';
import CalendarView from './CalendarView';
import CardList from './CardList';
import ProgramFilter from './ProgramFilter';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `schedule-tab-${index}`,
    'aria-controls': `schedule-tabpanel-${index}`,
  };
}

const ScheduleContainer = ({ events }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [programFilters, setProgramFilters] = useState({});
  
  // This space intentionally left empty - we've moved to program-based filtering

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleProgramFilterChange = (newFilters) => {
    setProgramFilters(newFilters);
  };

  const filteredEvents = useMemo(() => {
    console.log('All events:', events);
    console.log('Program filters:', programFilters);
    
    if (!programFilters || Object.keys(programFilters).length === 0) {
      console.log('No program filters set, showing all events');
      return events.map(event => ({
        ...event,
        title: `[${event.program}] ${event.title}`
      }));
    }
    
    const filtered = events.filter(event => {
      // Skip events without program information
      if (!event.program) return false;
      
      // Get the filters for this program
      const programFilter = programFilters[event.program];
      if (!programFilter) return false;
      
      // Ensure year is a number for comparison
      const eventYear = Number(event.year);
      const courseKey = `${event.title}_${eventYear}_${event.program}`;
      
      // Check if both course and year are selected for this program
      const isCourseSelected = programFilter.selectedCourses.includes(courseKey);
      const isYearSelected = programFilter.selectedYears.includes(eventYear);
      
      const isIncluded = isCourseSelected && isYearSelected;
      
      console.log('Checking event:', { 
        title: event.title, 
        year: eventYear, 
        program: event.program,
        key: courseKey, 
        isCourseSelected,
        isYearSelected,
        isIncluded
      });
      
      return isIncluded;
    }).map(event => ({
      ...event,
      title: `[${event.program}] ${event.title}`
    }));
    
    console.log('Filtered events:', filtered);
    
    // If no events are filtered but we have programs with courses selected, this is likely a bug
    if (filtered.length === 0 && Object.keys(programFilters).length > 0) {
      console.warn('No events passed filtering despite having program filters!', {
        programFilters,
        totalEvents: events.length
      });
    }
    
    return filtered;
  }, [events, programFilters]);

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="schedule view tabs"
          sx={{ flex: 1 }}
          centered
        >
          <Tab 
            icon={<CalendarViewIcon />} 
            label="Calendar View" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<ViewListIcon />} 
            label="List View" 
            {...a11yProps(1)} 
          />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Calendar">
            <IconButton 
              onClick={(e) => setExportAnchorEl(e.currentTarget)}
              size="small"
            >
              <IosShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Calendar">
            <IconButton 
              onClick={() => window.location.reload()}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            downloadICSFile(filteredEvents);
            setExportAnchorEl(null);
          }}>
            Download Calendar File
          </MenuItem>
          <MenuItem onClick={() => {
            // Create subscription URL
            const timetableUrls = JSON.parse(localStorage.getItem('timetableUrls'));
            const encodedUrls = encodeURIComponent(JSON.stringify(timetableUrls));
            const subscriptionUrl = `webcal://localhost:3001/calendar.ics?urls=${encodedUrls}`;
            
            // Create a temporary input to copy the URL
            const tempInput = document.createElement('input');
            tempInput.value = subscriptionUrl;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Open instructions dialog
            alert(
              'Calendar subscription URL copied to clipboard!\n\n' +
              'To subscribe to this calendar:\n\n' +
              '1. In Apple Calendar: File > New Calendar Subscription\n' +
              '2. In Google Calendar: Other Calendars (+) > From URL\n' +
              '3. In Outlook: Add Calendar > Subscribe from web\n\n' +
              'Paste the copied URL when prompted.\n\n' +
              'The calendar will automatically update when changes occur.'
            );
            
            setExportAnchorEl(null);
          }}>
            Subscribe to Calendar
          </MenuItem>
        </Menu>
      </Box>

      <Stack spacing={2}>
        <ProgramFilter
          events={events}
          selectedPrograms={programFilters}
          onProgramFilterChange={handleProgramFilterChange}
        />
      </Stack>

      <TabPanel value={currentTab} index={0}>
        <CalendarView events={filteredEvents} />
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <CardList events={filteredEvents} />
      </TabPanel>
    </Box>
  );
};

export default ScheduleContainer;
