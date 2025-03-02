import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const CalendarFilters = ({ 
  years,
  curricula, 
  selectedYear,
  selectedCurriculum, 
  onYearChange,
  onCurriculumChange 
}) => {
  // Log the received years for debugging
  console.log('CalendarFilters received years:', years);
  console.log('CalendarFilters years:', years);
  const hasFilters = (years && years.length > 0) || (curricula && curricula.length > 0);
  if (!hasFilters) return null;

  return (
    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
      {years && years.length > 0 && (
        <Paper 
          elevation={2}
          sx={{
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
            value={selectedYear ? [selectedYear] : []}
            onChange={(e, newYear) => {
              console.log('Year selection changed:', newYear);
              onYearChange(newYear ? newYear[0] : '');
            }}
            aria-label="degree year"
            size="small"
            color="primary"
          >
            <ToggleButton value="1" aria-label="year 1">
              1st Year
            </ToggleButton>
            <ToggleButton value="2" aria-label="year 2">
              2nd Year
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>
      )}

      {curricula && curricula.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="curriculum-filter-label">Curriculum</InputLabel>
          <Select
            labelId="curriculum-filter-label"
            id="curriculum-filter"
            value={selectedCurriculum || ''}
            label="Curriculum"
            onChange={(e) => onCurriculumChange(e.target.value)}
          >
            <MenuItem value="">
              <em>All Curricula</em>
            </MenuItem>
            {curricula.map((curriculum) => (
              <MenuItem key={curriculum.value} value={curriculum.value}>
                {curriculum.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default CalendarFilters;
