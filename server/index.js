const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createEvents } = require('ics');

const app = express();
app.use(cors());

// Helper function to fetch and process events
async function fetchProgramSchedule(url, programName) {
  try {
    const isBachelors = url.includes('/laurea/');
    const urlObj = new URL(url);
    const existingCurricula = urlObj.searchParams.get('curricula');

    const createYearUrl = (year) => {
      const yearUrl = new URL(url);
      yearUrl.searchParams.set('anno', year.toString());
      if (existingCurricula) {
        yearUrl.searchParams.set('curricula', existingCurricula);
      }
      return yearUrl.toString();
    };

    const yearRequests = [
      axios.get(createYearUrl(1)),
      axios.get(createYearUrl(2))
    ];

    if (isBachelors) {
      yearRequests.push(axios.get(createYearUrl(3)));
    }

    const responses = await Promise.all(yearRequests);
    return responses.flatMap((response, index) => {
      const year = index + 1;
      return response.data.map(event => ({
        ...event,
        year,
        program: programName
      }));
    });
  } catch (error) {
    console.error(`Error fetching schedule for ${programName}:`, error);
    return [];
  }
}

// Convert events to ICS format
function generateICSContent(events) {
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
  return error ? null : value;
}

// Endpoint to serve calendar data
app.get('/calendar.ics', async (req, res) => {
  try {
    const urlsParam = req.query.urls;
    if (!urlsParam) {
      return res.status(400).send('No calendar URLs provided');
    }

    const urls = JSON.parse(decodeURIComponent(urlsParam));
    const allSchedules = await Promise.all(
      urls.map(timetable => fetchProgramSchedule(timetable.url, timetable.name))
    );

    const allEvents = allSchedules.flat();
    const icsContent = generateICSContent(allEvents);

    if (!icsContent) {
      return res.status(500).send('Error generating calendar');
    }

    res.set('Content-Type', 'text/calendar;charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="unibo-calendar.ics"');
    res.send(icsContent);
  } catch (error) {
    console.error('Error serving calendar:', error);
    res.status(500).send('Internal server error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Calendar server running on port ${PORT}`);
});
