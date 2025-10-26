# Go CRM API – Sprint 1

## Run
go mod tidy
export $(grep -v '^#' .env | xargs) && go run ./cmd/api

## Endpoints
GET  /healthz
GET  /leads?country=&status=&allocated_to=&q=&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=50&offset=0
POST /leads
GET  /leads/:id
PUT  /leads/:id
DELETE /leads/:id

## Example create
curl -X POST http://localhost:8080/leads \
  -H 'Content-Type: application/json' \
  -d '{
    "full_name": "Jane Student",
    "destination_country": "Canada",
    "status": "New"
  }'
