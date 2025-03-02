import axios from 'axios';

const fetchProgramSchedule = async (url, programName) => {
  try {
    // Check if we have a manually specified number of years for this program
    const savedProgramYears = localStorage.getItem('programYears');
    const programYears = savedProgramYears ? JSON.parse(savedProgramYears) : {};
    
    // Try to determine program type from the URL
    const isBachelors = url.includes('/laurea/') && !url.includes('/magistrale');
    const isSingleCycle = url.includes('/magistralecu/') || url.includes('single-cycle') || url.includes('singlecycle') || 
                          url.includes('ciclo-unico') || url.includes('ciclounico');
    const isMasters = url.includes('/magistrale/') && !url.includes('/magistralecu/');

    // Also check program name for additional clues
    const programNameLower = programName.toLowerCase();
    const isSingleCycleByName = programNameLower.includes('single cycle') || 
                               programNameLower.includes('ciclo unico') || 
                               programNameLower.includes('6 year') || 
                               programNameLower.includes('6-year');

    // Final determination
    const finalIsSingleCycle = isSingleCycle || isSingleCycleByName;

    console.log(`Program detection for ${programName}:`, { 
      isBachelors, 
      isSingleCycle, 
      isSingleCycleByName,
      finalIsSingleCycle,
      isMasters,
      manualYears: programYears[programName]
    });

    // Check if URL already has curricula parameter
    const urlObj = new URL(url);
    const existingCurricula = urlObj.searchParams.get('curricula');

    // Determine the number of years based on program type or manual setting
    let maxYears;
    
    // First check if there's a manual setting
    if (programYears[programName]) {
      maxYears = programYears[programName];
    } else {
      // Otherwise use auto-detection
      if (isMasters) {
        maxYears = 2;
      } else if (finalIsSingleCycle) {
        maxYears = 6; // Changed from 5 to 6 for single cycle degrees
      } else {
        maxYears = 3; // default for bachelor's
      }
    }

    console.log(`Determined maxYears for ${programName}:`, maxYears);

    // Prepare and execute requests for each year
    const allEvents = [];
    
    for (let year = 1; year <= maxYears; year++) {
      try {
        // Create URL with year parameter
        const yearUrl = new URL(url);
        yearUrl.searchParams.set('anno', year.toString());
        if (existingCurricula) {
          yearUrl.searchParams.set('curricula', existingCurricula);
        }
        
        console.log(`Fetching year ${year} for ${programName}:`, yearUrl.toString());
        
        try {
          const response = await axios.get(yearUrl.toString());
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            // Process events for this year
            const yearEvents = response.data.map(event => {
              // Ensure event has all required fields
              if (!event.start || !event.end) {
                console.warn(`Event missing start/end time:`, event);
                return null;
              }
              
              return {
                ...event,
                year,
                program: programName,
                _timetableUrl: yearUrl.toString(),
                // Ensure start and end are valid dates
                start: new Date(event.start),
                end: new Date(event.end)
              };
            }).filter(Boolean); // Remove any null events
            
            console.log(`Found ${yearEvents.length} events for ${programName} year ${year}`);
            allEvents.push(...yearEvents);
          } else {
            console.log(`No events found for ${programName} year ${year}`);
          }
        } catch (fetchError) {
          console.error(`Error fetching events for ${programName} year ${year}:`, fetchError);
          // Continue with other years even if one fails
        }
      } catch (yearError) {
        console.error(`Error fetching year ${year} for ${programName}:`, yearError);
        // Continue with other years even if one fails
      }
    }

    return allEvents;
  } catch (error) {
    console.error(`Error in fetchProgramSchedule for ${programName}:`, error);
    return []; // Return empty array instead of throwing
  }
};

export const fetchSchedule = async () => {
  try {
    // Get saved timetable URLs from localStorage
    const savedUrls = localStorage.getItem('timetableUrls');
    const timetableUrls = savedUrls ? JSON.parse(savedUrls) : [{
      name: 'Digital Transformation Management',
      url: 'https://corsi.unibo.it/2cycle/DigitalTransformationManagement/timetable/@@orario_reale_json'
    }];

    console.log('Fetching schedules for programs:', timetableUrls);

    // Fetch schedules for all programs
    const allSchedules = [];
    for (const timetable of timetableUrls) {
      try {
        console.log(`Starting fetch for program: ${timetable.name} with URL: ${timetable.url}`);
        
        // Test direct fetch to check for CORS issues
        try {
          const testResponse = await fetch(timetable.url);
          console.log(`Direct fetch test for ${timetable.name}:`, {
            status: testResponse.status,
            ok: testResponse.ok,
            statusText: testResponse.statusText
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log(`Direct fetch data sample for ${timetable.name}:`, 
              Array.isArray(testData) ? testData.slice(0, 2) : testData);
          }
        } catch (testError) {
          console.error(`Direct fetch test failed for ${timetable.name}:`, testError);
          // If CORS is the issue, we might need to use a proxy
          console.log('Consider using a CORS proxy if this is a CORS issue');
        }
        
        // Continue with the original axios fetch
        const programEvents = await fetchProgramSchedule(timetable.url, timetable.name);
        console.log(`Fetched ${programEvents.length} events for ${timetable.name}`);
        
        if (programEvents.length === 0) {
          console.warn(`No events found for ${timetable.name}. This might indicate an issue with the URL or data format.`);
        }
        
        allSchedules.push(...programEvents);
      } catch (programError) {
        console.error(`Error fetching program ${timetable.name}:`, programError);
        // Continue with other programs even if one fails
      }
    }

    console.log(`Total events fetched: ${allSchedules.length}`);
    
    // Add mock events if no real events were found (for testing)
    if (allSchedules.length === 0) {
      console.warn('No events found from any source. Adding mock events for testing.');
      const mockEvents = generateMockEvents();
      allSchedules.push(...mockEvents);
    }
    
    return allSchedules;
  } catch (error) {
    console.error('Error fetching schedules:', error);
    throw error;
  }
};

// Helper function to generate mock events for testing
function generateMockEvents() {
  const now = new Date();
  const mockEvents = [];
  
  // Generate events for the next 7 days
  for (let i = 0; i < 7; i++) {
    const day = new Date(now);
    day.setDate(now.getDate() + i);
    
    // Morning event
    const morningStart = new Date(day);
    morningStart.setHours(9, 0, 0);
    const morningEnd = new Date(day);
    morningEnd.setHours(11, 0, 0);
    
    mockEvents.push({
      title: `Mock Lecture ${i+1}`,
      start: morningStart,
      end: morningEnd,
      docente: 'Prof. Mock',
      year: 1,
      program: 'Test Program',
      cfu: 6,
      curricula: 'Default'
    });
    
    // Afternoon event
    const afternoonStart = new Date(day);
    afternoonStart.setHours(14, 0, 0);
    const afternoonEnd = new Date(day);
    afternoonEnd.setHours(16, 0, 0);
    
    mockEvents.push({
      title: `Mock Lab ${i+1}`,
      start: afternoonStart,
      end: afternoonEnd,
      docente: 'Prof. Test',
      year: 2,
      program: 'Test Program',
      cfu: 8,
      curricula: 'Default'
    });
  }
  
  console.log('Generated mock events:', mockEvents);
  return mockEvents;
}
