# 🎫 AI Ticket Classification API

An AI-powered ticket classification API built with **Node.js**, **Express.js**, and **Google Gemini API**.

The API analyzes customer support tickets related to financial services and automatically classifies them into categories, determines severity, assigns the appropriate department, generates a safe agent summary, and decides whether human review is required.

---

# Features

- AI-powered ticket classification
- Structured JSON response using Gemini Response Schema
- Automatic department routing
- Severity detection
- Human review flagging
- Safety rules to prevent requesting sensitive information
- Health check endpoint
- Environment variable support with dotenv

---

# Tech Stack

- Node.js
- Express.js
- Google Gemini API (`@google/genai`)
- dotenv

---

# Project Structure

```
project/
│
├── server.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/yourusername/ticket-classification-api.git
```

Go to project folder

```bash
cd ticket-classification-api
```

Install dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file.

```env
GEMINI_API_KEY=YOUR_API_KEY
PORT=3000
```

---

# Run the Server

Development

```bash
npm run dev
```

or

```bash
node server.js
```

Server starts at

```
http://localhost:3000
```

---

# API Endpoints

## Health Check

### GET

```
/health
```

### Response

```json
{
  "status": "healthy",
  "timestamp": "2025-08-06T12:00:00.000Z"
}
```

---

## Classify Ticket

### POST

```
/sort-ticket
```

### Request Body

```json
{
  "ticket_id": "TK-1001",
  "channel": "email",
  "locale": "en",
  "message": "I accidentally sent money to the wrong person."
}
```

---

# Example Response

```json
{
  "ticket_id": "TK-1001",
  "case_type": "wrong_transfer",
  "severity": "high",
  "department": "dispute_resolution",
  "agent_summary": "Customer reports that money was transferred to the wrong recipient and requires assistance.",
  "human_review_required": false,
  "confidence": 0.98
}
```

---

# Ticket Categories

| Case Type | Description |
|------------|-------------|
| wrong_transfer | Money sent to the wrong recipient |
| payment_failed | Transaction failed but balance deducted |
| refund_request | Customer requesting a refund |
| phishing_or_social_engineering | Scam, phishing, OTP or PIN request |
| other | Any other issue |

---

# Severity Levels

- Low
- Medium
- High
- Critical

---

# Department Mapping

| Case Type | Department |
|------------|------------|
| wrong_transfer | dispute_resolution |
| payment_failed | payments_ops |
| refund_request (low severity) | customer_support |
| refund_request (contested) | dispute_resolution |
| phishing_or_social_engineering | fraud_risk |
| other | customer_support |

---

# Human Review Rules

Human review is automatically required when:

- Severity is `critical`
- Case type is `phishing_or_social_engineering`

Example

```json
{
    "human_review_required": true
}
```

---

# AI Safety Rules

The AI assistant follows strict safety guidelines.

It **never** asks customers to provide:

- PIN
- OTP
- Password
- Card Number

Agent summaries remain neutral and safe.

---

# Error Responses

## Missing Fields

```json
{
    "error": "ticket_id and message are required fields."
}
```

Status Code

```
400 Bad Request
```

---

## Internal Server Error

```json
{
    "error": "Internal Server Error"
}
```

Status Code

```
500 Internal Server Error
```

---

# Sample Requests

## Wrong Transfer

```json
{
    "ticket_id":"101",
    "message":"I accidentally transferred money to another account."
}
```

---

## Payment Failed

```json
{
    "ticket_id":"102",
    "message":"Money was deducted but payment failed."
}
```

---

## Refund Request

```json
{
    "ticket_id":"103",
    "message":"Please refund my payment."
}
```

---

## Phishing

```json
{
    "ticket_id":"104",
    "message":"Someone called me asking for my OTP."
}
```

---

# Dependencies

```json
{
  "@google/genai": "^latest",
  "dotenv": "^latest",
  "express": "^latest"
}
```

---

# Future Improvements

- Authentication
- Database Integration
- Logging
- Rate Limiting
- Docker Support
- Unit Testing
- Swagger Documentation
- Request Validation
- Multi-language Support

---

# License

MIT License

---

# Author

Developed using **Express.js** and **Google Gemini API**.