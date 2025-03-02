import React, { useState, useMemo, useEffect } from 'react';
import { Box, Tabs, Tab, Stack, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import CalendarViewIcon from '@mui/icons-material/CalendarViewMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import RefreshIcon from '@mui/icons-material/Refresh';
import IosShareIcon from '@mui/icons-material/IosShare';
import { downloadICSFile } from '../services/calendar';
import CalendarView from './CalendarView';
import CardList from './CardList';
import CourseFilter from './CourseFilter';
import YearFilter from './YearFilter';

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
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [filterExpanded, setFilterExpanded] = useState(true);
  
  // Get available years based on program type and actual events
  const availableYears = useMemo(() => {
    console.log('Calculating available years from events:', events);
    
    if (!events || events.length === 0) {
      console.log('No events available, returning default years [1]');
      return [1];
    }
    
    // Extract unique years that actually have events
    const yearsWithEvents = new Set();
    events.forEach(event => {
      if (event.year) {
        // Convert to number to ensure proper comparison
        yearsWithEvents.add(Number(event.year));
      }
    });
    
    // Convert to sorted array
    const years = Array.from(yearsWithEvents).sort((a, b) => a - b);
    console.log('Years with events:', years);
    
    return years.length > 0 ? years : [1];
  }, [events]);

  // Initialize selectedYears with all available years
  const [selectedYears, setSelectedYears] = useState([]);
  
  // Update selectedYears when availableYears changes
  useEffect(() => {
    console.log('Updating selectedYears with availableYears:', availableYears);
    // Only update if selectedYears is empty or contains years not in availableYears
    const needsUpdate = selectedYears.length === 0 || 
                        !selectedYears.every(year => availableYears.includes(Number(year)));
    
    if (availableYears.length > 0 && needsUpdate) {
      setSelectedYears(availableYears);
    }
  }, [availableYears, selectedYears]);

  // Extract unique courses from events, filtered by selected years
  const courses = useMemo(() => {
    console.log('Filtering courses for years:', selectedYears);
    const uniqueCourses = new Map();
    
    events.forEach(event => {
      // Ensure year is a number for comparison
      const eventYear = Number(event.year);
      
      console.log('Processing event:', {
        title: event.title,
        year: eventYear,
        selectedYears,
        isYearSelected: selectedYears.includes(eventYear)
      });
      
      if (selectedYears.includes(eventYear)) {
        const courseKey = `${event.title}_${eventYear}_${event.program}`;
        if (!uniqueCourses.has(courseKey)) {
          uniqueCourses.set(courseKey, {
            title: event.title,
            docente: event.docente,
            cfu: event.cfu,
            year: eventYear,
            program: event.program
          });
        }
      }
    });
    
    const filteredCourses = Array.from(uniqueCourses.values());
    console.log('Filtered courses:', filteredCourses);
    return filteredCourses;
  }, [events, selectedYears]);

  // Initialize selected courses and handle year changes
  useEffect(() => {
    const coursesForSelectedYears = events
      .filter(event => {
        const eventYear = Number(event.year);
        return selectedYears.includes(eventYear);
      })
      .reduce((acc, event) => {
        const eventYear = Number(event.year);
        const courseKey = `${event.title}_${eventYear}_${event.program}`;
        if (!acc.includes(courseKey)) {
          acc.push(courseKey);
        }
        return acc;
      }, []);

    if (selectedCourses.length === 0) {
      // Initial load - select all courses
      setSelectedCourses(coursesForSelectedYears);
    } else {
      // Year filter changed - keep only courses from selected years
      const validCourses = selectedCourses.filter(courseKey => {
        const parts = courseKey.split('_');
        if (parts.length >= 2) {
          const yearStr = parts[1];
          const year = Number(yearStr);
          return selectedYears.includes(year);
        }
        return false;
      });
      setSelectedCourses(validCourses);
    }
  }, [selectedYears, events, selectedCourses]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleCourseToggle = (newSelection) => {
    setSelectedCourses(newSelection);
  };

  const filteredEvents = useMemo(() => {
    console.log('All events:', events);
    console.log('Selected courses:', selectedCourses);
    console.log('Selected years:', selectedYears);
    
    // Debug the course keys to make sure they match
    if (events.length > 0 && selectedCourses.length > 0) {
      const sampleEvent = events[0];
      const sampleEventYear = Number(sampleEvent.year);
      const sampleCourseKey = `${sampleEvent.title}_${sampleEventYear}_${sampleEvent.program}`;
      
      console.log('Sample event course key:', {
        event: sampleEvent,
        constructedKey: sampleCourseKey,
        isSelected: selectedCourses.includes(sampleCourseKey),
        yearSelected: selectedYears.includes(sampleEventYear)
      });
      
      // Check if any course keys match
      const matchingCourses = selectedCourses.filter(courseKey => 
        events.some(event => {
          const eventYear = Number(event.year);
          const eventKey = `${event.title}_${eventYear}_${event.program}`;
          return courseKey === eventKey;
        })
      );
      
      console.log('Matching course keys:', matchingCourses);
    }
    
    const filtered = events.filter(event => {
      // Ensure year is a number for comparison
      const eventYear = Number(event.year);
      const courseKey = `${event.title}_${eventYear}_${event.program}`;
      
      // Check if both course and year are selected
      const isCourseSelected = selectedCourses.includes(courseKey);
      const isYearSelected = selectedYears.includes(eventYear);
      
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
    
    // If no events are filtered but we have courses selected, this is likely a bug
    if (filtered.length === 0 && selectedCourses.length > 0) {
      console.warn('No events passed filtering despite having selected courses!', {
        selectedCourses,
        selectedYears,
        totalEvents: events.length
      });
    }
    
    return filtered;
  }, [events, selectedCourses, selectedYears]);

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
        <YearFilter
          selectedYears={selectedYears}
          onYearChange={setSelectedYears}
          availableYears={availableYears}
        />
        <CourseFilter
          courses={courses}
          selectedCourses={selectedCourses}
          onCourseToggle={handleCourseToggle}
          expanded={filterExpanded}
          onExpandToggle={() => setFilterExpanded(!filterExpanded)}
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
