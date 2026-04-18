# GroupFinder API Reference

Base URL:

```text
http://localhost:4000/api
```

For production, replace it with your deployed Render URL:

```text
https://<your-render-app>.onrender.com/api
```

## Common Headers

Use these headers for all protected endpoints:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

Public endpoints:
- `POST /auth/send-otp`
- `POST /auth/verify-otp`

Protected endpoints:
- `GET /users/me`
- `PUT /users/me`
- `POST /events`
- `GET /events`
- `GET /events/category/:category`
- `GET /events/timing/:timing`
- `GET /events/:id`
- `POST /events/:id/request`
- `POST /requests/:id/accept`
- `POST /requests/:id/reject`

## Auth

### Send OTP

- Method: `POST`
- URL: `/auth/send-otp`
- Auth: No

Request body:

```json
{
  "email": "user@example.com"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresInSeconds": 300
  }
}
```

### Verify OTP

- Method: `POST`
- URL: `/auth/verify-otp`
- Auth: No

Request body:

```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

Success response:

```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "token": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "userId": "uuid-here"
  }
}
```

## Users

### Get Current User

- Method: `GET`
- URL: `/users/me`
- Auth: Yes

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "Aarav",
    "mobileNumber": "9000000001",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

### Update Current User

- Method: `PUT`
- URL: `/users/me`
- Auth: Yes

Request body:

```json
{
  "username": "Aarav",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

Success response:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "Aarav",
    "mobileNumber": "9000000001",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

## Events

### Create Event

- Method: `POST`
- URL: `/events`
- Auth: Yes

Request body:

```json
{
  "category": "Tech",
  "title": "React Builders Meetup",
  "description": "A meetup for frontend enthusiasts.",
  "eventAddress": "Koramangala, Bengaluru",
  "eventDate": "2026-04-10",
  "eventTime": "10:00",
  "maxParticipants": 30
}
```

Success response:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event-uuid",
    "creatorId": "user-uuid",
    "category": "Tech",
    "title": "React Builders Meetup",
    "description": "A meetup for frontend enthusiasts.",
    "eventAddress": "Koramangala, Bengaluru",
    "eventDate": "2026-04-10T00:00:00.000Z",
    "eventTime": "10:00",
    "maxParticipants": 30,
    "currentParticipants": 0,
    "status": "ACTIVE",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

### Get All Events

- Method: `GET`
- URL: `/events`
- Auth: Yes

Query params:

```text
limit=10
offset=0
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "event-uuid",
      "creatorId": "user-uuid",
      "category": "Tech",
      "title": "React Builders Meetup",
      "description": "A meetup for frontend enthusiasts.",
      "eventAddress": "Koramangala, Bengaluru",
      "eventDate": "2026-04-10T00:00:00.000Z",
      "eventTime": "10:00",
      "maxParticipants": 30,
      "currentParticipants": 0,
      "status": "ACTIVE",
      "createdAt": "2026-04-12T10:00:00.000Z",
      "creator": {
        "id": "user-uuid",
        "username": "Aarav",
        "mobileNumber": "9000000001"
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "locationFilter": null
  }
}
```

### Get Events By Category

- Method: `GET`
- URL: `/events/category/:category`
- Auth: Yes

Example:

```text
/events/category/Tech
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "event-uuid",
      "creatorId": "user-uuid",
      "category": "Tech",
      "title": "React Builders Meetup",
      "description": "A meetup for frontend enthusiasts.",
      "eventAddress": "Koramangala, Bengaluru",
      "eventDate": "2026-04-10T00:00:00.000Z",
      "eventTime": "10:00",
      "maxParticipants": 30,
      "currentParticipants": 0,
      "status": "ACTIVE",
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  ]
}
```

### Get Events By Timing

- Method: `GET`
- URL: `/events/timing/:timing`
- Auth: Yes

Allowed values:

```text
today
upcoming
```

Example:

```text
/events/timing/today
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "event-uuid",
      "creatorId": "user-uuid",
      "category": "Tech",
      "title": "React Builders Meetup",
      "description": "A meetup for frontend enthusiasts.",
      "latitude": 12.9716,
      "longitude": 77.5946,
      "eventDate": "2026-04-10T00:00:00.000Z",
      "eventTime": "10:00",
      "maxParticipants": 30,
      "currentParticipants": 0,
      "status": "ACTIVE",
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "timing": "today"
  }
}
```

### Get Event By ID

- Method: `GET`
- URL: `/events/:id`
- Auth: Yes

Example:

```text
/events/event-uuid
```

Response:

```json
{
  "success": true,
    "data": {
      "id": "event-uuid",
      "creatorId": "user-uuid",
      "category": "Tech",
      "title": "React Builders Meetup",
      "description": "A meetup for frontend enthusiasts.",
      "eventAddress": "Koramangala, Bengaluru",
      "eventDate": "2026-04-10T00:00:00.000Z",
      "eventTime": "10:00",
      "maxParticipants": 30,
    "currentParticipants": 0,
    "status": "ACTIVE",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

## Requests

### Send Join Request

- Method: `POST`
- URL: `/events/:id/request`
- Auth: Yes

Example:

```text
/events/event-uuid/request
```

No request body.

Success response:

```json
{
  "success": true,
  "message": "Join request sent successfully",
  "data": {
    "id": "request-uuid",
    "eventId": "event-uuid",
    "userId": "user-uuid",
    "status": "PENDING",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

### Accept Request

- Method: `POST`
- URL: `/requests/:id/accept`
- Auth: Yes

Example:

```text
/requests/request-uuid/accept
```

No request body.

Success response:

```json
{
  "success": true,
  "message": "Request accepted successfully",
  "data": {
    "request": {
      "id": "request-uuid",
      "status": "ACCEPTED"
    },
    "event": {
      "id": "event-uuid",
      "creatorId": "user-uuid",
      "category": "Tech",
      "title": "React Builders Meetup",
      "description": "A meetup for frontend enthusiasts.",
      "eventAddress": "Koramangala, Bengaluru",
      "eventDate": "2026-04-10T00:00:00.000Z",
      "eventTime": "10:00",
      "maxParticipants": 30,
      "currentParticipants": 1,
      "status": "ACTIVE",
      "createdAt": "2026-04-12T10:00:00.000Z"
    }
  }
}
```

### Reject Request

- Method: `POST`
- URL: `/requests/:id/reject`
- Auth: Yes

Example:

```text
/requests/request-uuid/reject
```

No request body.

Success response:

```json
{
  "success": true,
  "message": "Request rejected successfully",
  "data": {
    "id": "request-uuid",
    "eventId": "event-uuid",
    "userId": "user-uuid",
    "status": "REJECTED",
    "createdAt": "2026-04-12T10:00:00.000Z"
  }
}
```

## Error Response

Common error format:

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

Examples:
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict`
- `500 Internal Server Error`
