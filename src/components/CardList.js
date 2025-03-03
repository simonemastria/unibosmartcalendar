import React from 'react';
import { Paper, Typography, Box, Grid, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import SchoolIcon from '@mui/icons-material/School';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const EventCard = ({ event }) => {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 2, '&:hover': { boxShadow: 6 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" gutterBottom>
            {event.title}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon />
              {event.docente}
            </Typography>
            <Typography variant="body1">
              {formatDate(startDate)}
            </Typography>
            <Typography variant="body1">
              {formatTime(startDate)} - {formatTime(endDate)}
            </Typography>
            <Chip 
              label={`${event.cfu} CFU`}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={6}>
          {event.aule && event.aule.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon color="action" />
                Location
              </Typography>
              {event.aule.map((aula, index) => (
                <Box key={index} sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    {aula.des_edificio} - {aula.des_piano}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {aula.des_indirizzo}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {event.teams && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideocamIcon color="action" />
                Online Meeting
              </Typography>
              <Typography variant="body2">
                <a 
                  href={event.teams} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#ac3931', textDecoration: 'none' }}
                >
                  Join Teams Meeting
                </a>
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

const CardList = ({ events }) => {
  console.log('CardList received events:', events);

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.start instanceof Date 
      ? event.start.toISOString().split('T')[0]
      : new Date(event.start).toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <Box>
      {Object.entries(groupedEvents)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, dayEvents]) => (
          <Box key={date} sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ 
              borderBottom: '2px solid #ac3931',
              pb: 1,
              mb: 3
            }}>
              {formatDate(date)}
            </Typography>
            {dayEvents
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map((event, index) => (
                <EventCard 
                  key={`${event.title}_${event.year}_${event.start}_${index}`} 
                  event={event} 
                />
              ))}
          </Box>
        ))}
    </Box>
  );
};

export default CardList;
