import React, { useState, useEffect } from 'react';
import { 
  Container, 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Typography,
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  GlobalStyles
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScheduleContainer from './components/ScheduleContainer';
import Settings from './components/Settings';
import { fetchSchedule } from './services/api';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ac3931',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#ac3931',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#8e2e28',
              color: '#fff',
            },
          },
        },
      },
    },
  },
});

// Calendar page component
function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await fetchSchedule();
        console.log('Fetched data:', data);
        if (Array.isArray(data)) {
          // Filter out events with invalid dates and convert dates
          const validEvents = data
            .filter(event => event.start && event.end)
            .map(event => {
              try {
                // Convert to Date objects and ensure they're valid
                const start = new Date(event.start);
                const end = new Date(event.end);
                
                // Check if dates are valid
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                  console.warn('Invalid date found in event:', event);
                  return null;
                }
                
                return {
                  ...event,
                  start,
                  end
                };
              } catch (dateError) {
                console.warn('Error converting dates for event:', event, dateError);
                return null;
              }
            })
            .filter(Boolean); // Remove null events
          
          console.log(`Processed ${validEvents.length} valid events out of ${data.length} total`);
          setEvents(validEvents);
        } else {
          setError('Invalid data format received from the server');
        }
      } catch (err) {
        console.error('Error loading schedule:', err);
        setError('Failed to load schedule. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return <ScheduleContainer events={events} />;
}

// App layout with navigation
function AppLayout() {
  const location = useLocation();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              color: 'inherit', 
              textDecoration: 'none',
              '&:hover': {
                color: 'inherit'
              }
            }}
          >
            Unibo Course Calendar
          </Typography>
          {location.pathname === '/' ? (
            <IconButton
              color="inherit"
              onClick={() => window.location.href = '/settings'}
              aria-label="settings"
            >
              <SettingsIcon />
            </IconButton>
          ) : (
            <Button
              color="inherit"
              onClick={() => window.location.href = '/'}
              startIcon={<ArrowBackIcon />}
            >
              Back to Calendar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            '.rbc-calendar': {
              fontFamily: theme.typography.fontFamily,
            },
            '.rbc-toolbar button': {
              color: theme.palette.text.primary,
            },
            '.rbc-toolbar button.rbc-active': {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
            '.rbc-event': {
              backgroundColor: theme.palette.primary.main,
              borderRadius: '4px',
              padding: '2px 5px',
              fontSize: '0.875rem',
            },
            '.rbc-today': {
              backgroundColor: theme.palette.action.hover,
            },
            '.rbc-header': {
              padding: '8px',
              fontWeight: theme.typography.fontWeightMedium,
            },
          }}
        />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<CalendarPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;
