# Name Classification API

## Endpoint

GET /api/classify?name=<name>

## Description

This API integrates with the Genderize API and processes the response.

## Features

- Input validation
- Error handling
- Confidence scoring
- ISO timestamp

## Example

/api/classify?name=john

## Response

{
"status": "success",
"data": {
"name": "john",
"gender": "male",
"probability": 0.99,
"sample_size": 1234,
"is_confident": true,
"processed_at": "2026-04-01T12:00:00Z"
}
}
