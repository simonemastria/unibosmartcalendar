import React from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const CourseFilter = ({ courses, selectedCourses, onCourseToggle, expanded, onExpandToggle }) => {
  const theme = useTheme();
  
  // Helper function to generate consistent course keys
  const getCourseKey = (course) => `${course.title}_${course.year}_${course.program}`;
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Use the helper function to generate consistent keys
      const allCourseKeys = courses.map(course => getCourseKey(course));
      onCourseToggle(allCourseKeys);
    } else {
      onCourseToggle([]);
    }
  };

  const handleCourseToggle = (courseKey) => {
    const newSelection = selectedCourses.includes(courseKey)
      ? selectedCourses.filter(key => key !== courseKey)
      : [...selectedCourses, courseKey];
    onCourseToggle(newSelection);
  };

  // Debug the course keys
  console.log('CourseFilter - Courses:', courses);
  console.log('CourseFilter - Selected Courses:', selectedCourses);

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        mb: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: theme.palette.primary.main,
          color: 'white',
        }}
      >
        <Typography variant="h6">
          Course Filter
        </Typography>
        <IconButton 
          onClick={onExpandToggle}
          sx={{ color: 'white' }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={courses.length > 0 && courses.every(course => 
                    selectedCourses.includes(getCourseKey(course)))
                  }
                  indeterminate={
                    courses.some(course => 
                      selectedCourses.includes(getCourseKey(course))
                    ) &&
                    !courses.every(course => 
                      selectedCourses.includes(getCourseKey(course))
                    )
                  }
                  onChange={handleSelectAll}
                />
              }
              label="Select All"
            />
            {courses.map((course) => (
              <FormControlLabel
                key={getCourseKey(course)}
                control={
                  <Checkbox
                    checked={selectedCourses.includes(getCourseKey(course))}
                    onChange={() => handleCourseToggle(getCourseKey(course))}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {course.docente ? `Prof. ${course.docente}` : 'No instructor'} • 
                      {course.cfu ? ` ${course.cfu} CFU` : ''} • 
                      Year {course.year} • 
                      {course.program}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </FormGroup>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CourseFilter;
