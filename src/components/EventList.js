import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VideocamIcon from '@mui/icons-material/Videocam';
import SchoolIcon from '@mui/icons-material/School';
import { format } from 'date-fns';
import { formatEventTitle } from '../utils/eventUtils';

const EventList = ({ events }) => {
  if (!events.length) {
    return (
      <Typography color="text.secondary" align="center">
        No events scheduled
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {events
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .map((event, index) => (
          <Paper
            key={`${event.cod_modulo}-${index}`}
            elevation={1}
            sx={{
              p: 2,
              '&:hover': {
                boxShadow: 3,
              },
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" component="h3">
                    {formatEventTitle(event)}
                  </Typography>
                  <Chip
                    label={`${event.cfu} CFU`}
                    color="primary"
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SchoolIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {event.docente}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  {format(new Date(event.start), 'HH:mm')} -{' '}
                  {format(new Date(event.end), 'HH:mm')}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                {event.aule && event.aule.length > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2">
                        {event.aule[0].des_edificio} - {event.aule[0].des_piano}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.aule[0].des_indirizzo}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {event.teams && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VideocamIcon fontSize="small" color="action" />
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
        ))}
    </Box>
  );
};

export default EventList;
