export const handler = async (event, context) => {
  const AIRTABLE_CONFIG = {
    baseId: process.env.AIRTABLE_BASE_ID,
    tableId: process.env.AIRTABLE_TABLE_ID,
    apiKey: process.env.AIRTABLE_API_KEY
  };

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { httpMethod, body } = event;

    if (httpMethod === 'GET') {
      // Fetch records
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableId)}`,
        {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    if (httpMethod === 'POST') {
      // Create record
      const requestData = JSON.parse(body);
      
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_CONFIG.baseId}/${encodeURIComponent(AIRTABLE_CONFIG.tableId)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_CONFIG.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            records: [{
              fields: {
                variable_1: requestData.variable_1,
                variable_2: requestData.variable_2
              }
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data)
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}