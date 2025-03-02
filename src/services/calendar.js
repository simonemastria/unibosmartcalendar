import { createEvents } from 'ics';

export const generateICSFile = (events) => {
  const icsEvents = events.map(event => ({
    start: new Date(event.start)
      .toISOString()
      .split(/[^0-9]/)
      .slice(0, 5)
      .map(num => parseInt(num)),
    end: new Date(event.end)
      .toISOString()
      .split(/[^0-9]/)
      .slice(0, 5)
      .map(num => parseInt(num)),
    title: event.title,
    description: `Course: ${event.title}\nTeacher: ${event.docente}\nProgram: ${event.program}${event.note ? '\nNotes: ' + event.note : ''}`,
    location: event.aule?.length > 0 
      ? `${event.aule[0].des_ubicazione} - ${event.aule[0].des_risorsa}`
      : undefined,
    categories: [event.program],
    status: 'CONFIRMED',
    busyStatus: 'BUSY'
  }));

  const { error, value } = createEvents(icsEvents);
  
  if (error) {
    console.error('Error generating ICS file:', error);
    return null;
  }

  return value;
};

export const downloadICSFile = (events, filename = 'unibo-calendar.ics') => {
  const icsContent = generateICSFile(events);
  
  if (!icsContent) {
    console.error('Failed to generate ICS content');
    return false;
  }

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  return true;
};
