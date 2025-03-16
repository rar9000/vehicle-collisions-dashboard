
require("dotenv").config();
const fetch = require("node-fetch");

exports.handler = async function(event) {
    const API_KEY = process.env.CENSUS_API_KEY;
    let { tract } = event.queryStringParameters;

    if (!tract) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing 'tract' parameter" })
        };
    }

    if (tract.length === 11) {
        tract = tract.substring(5);
    }

    const url = `https://api.census.gov/data/2020/acs/acs5?get=B01003_001E&for=tract:${tract}
    &in=state:21+county:111&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let population = data.length > 1 && data[1][0] ? parseInt(data[1][0], 10) : 0;

        return {
            statusCode: 200,
            body: JSON.stringify({ tract: tract, population: population })
        };
    } catch (error) {
        console.error("Error fetching Census data:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch Census data" })
        };
    }
};