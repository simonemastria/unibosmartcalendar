import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';

const CurriculumSelect = ({ 
  open, 
  onClose, 
  curricula, 
  loading, 
  onSelect,
  programName 
}) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Select Curriculum for {programName}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : curricula && curricula.length > 0 ? (
          <List>
            {curricula.map((curriculum) => (
              <ListItem key={curriculum.value} disablePadding>
                <ListItemButton onClick={() => onSelect(curriculum)}>
                  <ListItemText primary={curriculum.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" align="center" py={2}>
            No curricula found or this program doesn't have multiple curricula.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CurriculumSelect;
