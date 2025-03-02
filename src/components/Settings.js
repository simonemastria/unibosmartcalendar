import React, { useState } from 'react';
import { createJsonUrl } from '../services/curricula';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CourseSelector from './CourseSelector';
import AddIcon from '@mui/icons-material/Add';

const Settings = () => {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState('');
  const [pendingUrl, setPendingUrl] = useState(null);
  const [pendingProgramInfo, setPendingProgramInfo] = useState(null);
  const [success, setSuccess] = useState('');
  const [timetableUrls, setTimetableUrls] = useState(() => {
    const saved = localStorage.getItem('timetableUrls');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Add state for editing program years
  const [editingProgramYears, setEditingProgramYears] = useState(null);
  const [programYears, setProgramYears] = useState(() => {
    const saved = localStorage.getItem('programYears');
    return saved ? JSON.parse(saved) : {};
  });

  const normalizeUrl = (url) => {
    try {
      console.log('Normalizing URL:', url);
      // Remove trailing slashes and spaces
      url = url.trim().replace(/\/*$/, '');

      // Check if it's a valid Unibo URL
      if (!url.includes('corsi.unibo.it')) {
        return { isValid: false, error: 'Not a valid Unibo course URL' };
      }

      // Extract the base path
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      // Extract the original URL parameters first
      const originalUrlObj = new URL(url);
      const curricula = originalUrlObj.searchParams.get('curricula');
      const anno = originalUrlObj.searchParams.get('anno');

      // Determine program type and valid years
      let maxYears;
      const programType = pathParts[0].toLowerCase();
      console.log('Program type:', programType);
      console.log('Path parts:', pathParts);
      
      if (['laurea', '1cycle'].includes(programType)) {
        maxYears = 3; // 3-year degree program
        console.log('Detected 3-year program');
      } else if (['magistrale', '2cycle'].includes(programType)) {
        maxYears = 2; // 2-year degree program
        console.log('Detected 2-year program');
      } else if (['singlecycle', 'magistralecu'].includes(programType)) {
        maxYears = 6; // 5 or 6-year degree program
        console.log('Detected 5/6-year program');
      } else {
        console.log('Invalid program type:', programType);
        return { isValid: false, error: 'Not a valid degree program URL' };
      }

      // If anno is provided, validate it's within range
      if (anno) {
        const yearNum = parseInt(anno, 10);
        if (isNaN(yearNum) || yearNum < 1 || yearNum > maxYears) {
          return { 
            isValid: false, 
            error: `Invalid year. This is a ${maxYears}-year program, year must be between 1 and ${maxYears}`
          };
        }
      }

      // Create program info object for the UI
      const programInfo = {
        type: programType,
        maxYears,
        currentYear: anno ? parseInt(anno, 10) : null
      };
      
      console.log('Created program info:', programInfo);

      // Check if we have enough parts for a valid course URL
      if (pathParts.length < 2) {
        return { isValid: false, error: 'Invalid course URL format' };
      }

      // Determine the correct endpoint based on program type
      const endpoint = ['laurea', 'magistralecu'].includes(pathParts[0]) ? 'orario-lezioni' : 'timetable';

      // Construct the base URL without the endpoint
      const baseUrl = `${urlObj.origin}/${pathParts.slice(0, 2).join('/')}`;

      // Build the normalized URL
      let normalizedUrl = `${baseUrl}/${endpoint}/@@orario_reale_json`;
      console.log('Normalized URL:', normalizedUrl);
      
      // Add query parameters if they exist
      if (curricula || anno) {
        normalizedUrl += '?';
        if (anno) normalizedUrl += `anno=${anno}`;
        if (curricula && anno) normalizedUrl += '&';
        if (curricula) normalizedUrl += `curricula=${curricula}`;
      }

      // Extract program name for display
      const programName = pathParts[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return { 
        isValid: true, 
        url: normalizedUrl,
        isComplete: !!(curricula && anno),
        anno,
        curricula,
        programName,
        programInfo
      };
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' };
    }
  };

  const validateUrl = (url) => {
    try {
      new URL(url);
      return url.includes('unibo.it') && 
        (url.includes('timetable') || url.includes('orario-lezioni'));
    } catch {
      return false;
    }
  };

  const handleAddUrl = async () => {
    if (!validateUrl(newUrl)) {
      setError('Please enter a valid Unibo course URL');
      return;
    }

    const { isValid, url: normalizedUrl, error, isComplete, anno, curricula, programName, programInfo } = normalizeUrl(newUrl);
    
    if (!isValid) {
      setError(error);
      return;
    }

    if (isComplete) {
      // If URL is complete with year and curricula, add it directly
      const newTimetable = {
        name: `${programName} - Year ${anno}${curricula ? ` - ${curricula}` : ''}`,
        url: normalizedUrl,
        programType: programInfo.type,
        maxYears: programInfo.maxYears,
        _timetableUrl: normalizedUrl // Add the original URL for program type detection
      };

      setTimetableUrls(prev => {
        const updated = [...prev, newTimetable];
        localStorage.setItem('timetableUrls', JSON.stringify(updated));
        return updated;
      });

      setSuccess('Timetable added successfully');
      setNewUrl('');
    } else {
      // Store the URL and program info for the course selector
      setPendingUrl(normalizedUrl);
      setPendingProgramInfo(programInfo);
      setNewUrl('');
    }
  };

  const handleRemoveUrl = (index) => {
    setTimetableUrls(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('timetableUrls', JSON.stringify(updated));
      
      // Also remove program years if this was the last URL for this program
      const removedProgram = prev[index].name;
      const stillExists = updated.some(url => url.name === removedProgram);
      
      if (!stillExists && programYears[removedProgram]) {
        const updatedYears = {...programYears};
        delete updatedYears[removedProgram];
        localStorage.setItem('programYears', JSON.stringify(updatedYears));
        setProgramYears(updatedYears);
      }
      
      return updated;
    });
  };
  
  const handleEditYears = (program) => {
    setEditingProgramYears(program);
  };
  
  const handleSaveYears = (program, years) => {
    const updatedYears = {
      ...programYears,
      [program]: parseInt(years, 10)
    };
    localStorage.setItem('programYears', JSON.stringify(updatedYears));
    setProgramYears(updatedYears);
    setEditingProgramYears(null);
    setSuccess('Program years updated successfully');
  };

  const handleCourseSelection = (year, curriculum) => {
    if (pendingUrl) {
      // Extract program name from normalized URL
      const programPath = new URL(pendingUrl).pathname.split('/')[2];
      const degreeName = programPath
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      const finalUrl = createJsonUrl(pendingUrl, year, curriculum);
      
      const newTimetable = {
        name: `${degreeName} - Year ${year}`,
        url: finalUrl,
        programType: pendingProgramInfo.type,
        maxYears: pendingProgramInfo.maxYears
      };

      setTimetableUrls(prev => {
        const updated = [...prev, newTimetable];
        localStorage.setItem('timetableUrls', JSON.stringify(updated));
        return updated;
      });

      setPendingUrl(null);
      setNewUrl('');
      setSuccess('Timetable added successfully');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Calendar Settings
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Timetable
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            label="Timetable JSON URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://corsi.unibo.it/[degree-type]/[program-name]/timetable"
            helperText="Enter any Unibo course timetable URL - it will be automatically converted to the correct format"
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddUrl}
            sx={{ minWidth: '120px' }}
          >
            Add
          </Button>
        </Box>

        {pendingUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select Year and Curriculum
            </Typography>
            <CourseSelector
              baseUrl={pendingUrl}
              onSelectionComplete={handleCourseSelection}
              programInfo={pendingProgramInfo}
            />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Active Timetables
        </Typography>
        {timetableUrls.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
            No timetables added yet. Add a timetable URL above to get started.
          </Typography>
        )}
        <List>
          {timetableUrls.map((timetable, index) => (
            <ListItem key={index} divider={index < timetableUrls.length - 1}>
              <ListItemText
                primary={timetable.name}
                secondary={timetable.url}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveUrl(index)}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditYears(timetable.name)}
                >
                  Edit Years
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {editingProgramYears && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Edit Program Years
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Program Years"
              value={programYears[editingProgramYears]}
              onChange={(e) => handleSaveYears(editingProgramYears, e.target.value)}
              placeholder="Enter the number of years for this program"
            />
          </Box>
        </Paper>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
