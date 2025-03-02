import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const YearFilter = ({ selectedYears = [], onYearChange, availableYears = [] }) => {
  console.log('YearFilter received:', {
    availableYears,
    selectedYears
  });

  // Ensure we have arrays even if undefined is passed
  const years = Array.isArray(availableYears) ? availableYears : [];
  const selected = Array.isArray(selectedYears) ? selectedYears : [];

  const handleYearChange = (event, newYears) => {
    console.log('YearFilter change:', newYears);
    // Always keep at least one year selected
    if (newYears && newYears.length > 0) {
      onYearChange(newYears);
    }
  };

  if (!years || years.length === 0) {
    console.log('No available years, not rendering YearFilter');
    return null;
  }

  const getYearLabel = (year) => {
    const labels = {
      1: '1st',
      2: '2nd',
      3: '3rd',
      4: '4th',
      5: '5th',
      6: '6th'
    };
    return labels[year] || `${year}th`;
  };

  return (
    <Paper 
      elevation={2}
      sx={{
        mb: 2,
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SchoolIcon color="primary" />
        <Typography variant="subtitle1">
          Year:
        </Typography>
      </Box>
      <ToggleButtonGroup
        value={selected}
        onChange={handleYearChange}
        aria-label="degree year"
        size="small"
        color="primary"
      >
        {years.map(year => (
          <ToggleButton 
            key={year} 
            value={year} 
            aria-label={`year ${year}`}
          >
            {getYearLabel(year)} Year
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Paper>
  );
};

export default YearFilter;
