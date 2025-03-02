import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
} from '@mui/material';
import { fetchYears, fetchCurricula } from '../services/curricula';

const CourseSelector = ({ baseUrl, onSelectionComplete, programInfo }) => {
  const [years, setYears] = useState(null);
  const [curricula, setCurricula] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCurriculum, setSelectedCurriculum] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch and validate available years when baseUrl changes
  useEffect(() => {
    const getYears = async () => {
      setLoading(true);
      setError('');
      try {
        const yearsData = await fetchYears(baseUrl);
        if (yearsData && yearsData.length > 0) {
          // Filter years based on program type
          const validYears = yearsData.filter(year => {
            const yearNum = parseInt(year.value, 10);
            return yearNum >= 1 && yearNum <= (programInfo?.maxYears || 6);
          });

          if (validYears.length > 0) {
            setYears(validYears);
          } else {
            setError(`No valid years found for this ${programInfo?.maxYears}-year program`);
          }
        } else {
          setError('No years found for this course');
        }
      } catch (err) {
        setError('Error fetching years');
        console.error('Error fetching years:', err);
      }
      setLoading(false);
    };

    if (baseUrl) {
      getYears();
    }
  }, [baseUrl, programInfo]);

  // Fetch curricula when year is selected
  useEffect(() => {
    const getCurricula = async () => {
      if (!selectedYear) {
        setCurricula(null);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const curriculaData = await fetchCurricula(baseUrl, selectedYear);
        if (curriculaData) {
          setCurricula(curriculaData);
        } else {
          setError('No curricula found for this year');
        }
      } catch (err) {
        setError('Error fetching curricula');
      }
      setLoading(false);
    };

    getCurricula();
  }, [baseUrl, selectedYear]);

  // Notify parent component when both selections are made
  useEffect(() => {
    if (selectedYear && selectedCurriculum) {
      onSelectionComplete(selectedYear, selectedCurriculum);
    }
  }, [selectedYear, selectedCurriculum, onSelectionComplete]);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
    setSelectedCurriculum(''); // Reset curriculum when year changes
  };

  const handleCurriculumChange = (event) => {
    setSelectedCurriculum(event.target.value);
  };

  if (!baseUrl) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
      {loading && (
        <Box display="flex" justifyContent="center">
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {years && (
        <FormControl fullWidth size="small">
          <InputLabel id="year-select-label">Year</InputLabel>
          <Select
            labelId="year-select-label"
            id="year-select"
            value={selectedYear}
            label="Year"
            onChange={handleYearChange}
          >
            <MenuItem value="">
              <em>Select Year</em>
            </MenuItem>
            {years.map((year) => (
              <MenuItem key={year.value} value={year.value}>
                {year.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {curricula && (
        <FormControl fullWidth size="small">
          <InputLabel id="curriculum-select-label">Curriculum</InputLabel>
          <Select
            labelId="curriculum-select-label"
            id="curriculum-select"
            value={selectedCurriculum}
            label="Curriculum"
            onChange={handleCurriculumChange}
          >
            <MenuItem value="">
              <em>Select Curriculum</em>
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

export default CourseSelector;
