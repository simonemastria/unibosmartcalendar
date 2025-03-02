import axios from 'axios';

// Fetch available years from the course page
export const fetchYears = async (baseUrl) => {
  try {
    // Ensure we're using the base HTML URL
    const htmlUrl = baseUrl.replace('/@@orario_reale_json', '');
    
    const response = await axios.get(htmlUrl);
    const html = response.data;

    // Extract years from the HTML response
    const yearMatch = html.match(/name="anno"[^>]*>([\s\S]*?)<\/select>/);
    if (!yearMatch) return null;

    const optionsMatch = yearMatch[1].match(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g);
    if (!optionsMatch) return null;

    // Parse year options
    const years = optionsMatch
      .map(option => {
        const valueMatch = option.match(/value="([^"]*)"/);
        const textMatch = option.match(/>([^<]*)</);
        if (valueMatch && textMatch) {
          return {
            value: valueMatch[1],
            label: textMatch[1].trim()
          };
        }
        return null;
      })
      .filter(Boolean);

    return years.length > 0 ? years : null;
  } catch (error) {
    console.error('Error fetching years:', error);
    return null;
  }
};

// Fetch curricula for a specific year
export const fetchCurricula = async (baseUrl, year) => {
  try {
    // Ensure we're using the base HTML URL and add the available_curricula endpoint
    const baseHtmlUrl = baseUrl.replace('/@@orario_reale_json', '');
    const curriculaUrl = `${baseHtmlUrl}/@@available_curricula?anno=${year}`;
    
    // Fetch the curricula data
    const response = await axios.get(curriculaUrl);
    
    // The response should be a JSON array of curricula
    if (Array.isArray(response.data)) {
      return response.data.map(curriculum => ({
        value: curriculum.value,
        label: curriculum.label || curriculum.value
      }));
    }

    return null;
  } catch (error) {
    console.error('Error fetching curricula:', error);
    return null;
  }
};

// Create the final JSON URL
export const createJsonUrl = (baseUrl, year, curriculum) => {
  const baseHtmlUrl = baseUrl.replace('/@@orario_reale_json', '');
  return `${baseHtmlUrl}/@@orario_reale_json?anno=${year}&curricula=${curriculum}`;
};
