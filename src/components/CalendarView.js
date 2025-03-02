import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { Box, Paper, Dialog, DialogTitle, DialogContent } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventList from './EventList';

const locales = {
  'it': it
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());

  // Process events for the calendar
  const calendarEvents = useMemo(() => {
    console.log('Processing events for calendar:', events.length);
    
    // Debug event structure
    if (events.length > 0) {
      console.log('Sample event structure:', events[0]);
    }
    
    return events.map(event => {
      // Ensure start and end are valid dates
      let start, end;
      
      try {
        start = new Date(event.start);
        end = new Date(event.end);
        
        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          console.warn('Invalid date in event:', event);
          // Use current date as fallback
          const now = new Date();
          start = now;
          end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
        }
      } catch (error) {
        console.error('Error parsing dates for event:', event, error);
        // Use current date as fallback
        const now = new Date();
        start = now;
        end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
      }
      
      return {
        title: `${event.title} - ${event.docente || 'No Instructor'}`,
        start,
        end,
        resource: event,
      };
    });
  }, [events]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.resource);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#1976d2',
        borderRadius: '4px',
        border: 'none',
        color: 'white',
      }
    };
  };

  const formats = {
    eventTimeRangeFormat: () => '', // This removes the time from the month view
    timeGutterFormat: (date, culture, localizer) =>
      localizer.format(date, 'HH:mm', culture),
    eventTimeRangeEndFormat: ({ end }, culture, localizer) =>
      localizer.format(end, 'HH:mm', culture),
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
      localizer.format(start, 'MMMM dd', culture) + ' - ' +
      localizer.format(end, view === Views.MONTH ? 'MMMM dd' : 'dd', culture),
  };

  return (
    <Box sx={{ height: '85vh' }}>
      <Paper elevation={2} sx={{ height: 'calc(100% - 48px)', p: 2 }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={{
            month: true,
            week: true,
            day: true,
          }}
          view={view}
          date={date}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          formats={formats}
          popup
          tooltipAccessor={event => `${event.resource.title} - ${event.resource.docente}`}
        />
      </Paper>

      <Dialog
        open={Boolean(selectedEvent)}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle>{selectedEvent.title}</DialogTitle>
            <DialogContent>
              <EventList events={[selectedEvent]} />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarView;
