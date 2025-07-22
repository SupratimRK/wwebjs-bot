# WhatsApp Message API Documentation
---

## Packages Used

This project uses the following main npm packages:

- [`whatsapp-web.js`](https://www.npmjs.com/package/whatsapp-web.js): WhatsApp client library for Node.js
- [`qrcode-terminal`](https://www.npmjs.com/package/qrcode-terminal): For displaying QR codes in the terminal
- [`qrcode`](https://www.npmjs.com/package/qrcode): For generating QR code images for the web
- [`express`](https://www.npmjs.com/package/express): Web server framework

---

This document provides details on how to use the WhatsApp Message API to send messages using [whatsapp-web.js](https://wwebjs.dev/guide).

---

## How It Works

This API uses [whatsapp-web.js](https://wwebjs.dev/guide) to automate WhatsApp messaging. When you start the server, it will generate a QR code in your terminal and also provide a web endpoint to view the QR code. Scan this QR code with your WhatsApp mobile app to authenticate and start the client.

**Steps to Start the Client:**

1. Run the server (e.g., `node index.js`).
2. A QR code will appear in your terminal and at the `/qr` endpoint.
3. Open WhatsApp on your phone > tap the three dots > Linked devices > Link a device.
4. Scan the QR code displayed in your terminal or at `http://localhost:4600/qr`.
5. Once scanned, the client will be ready and you can send messages via the API.

For more details, see the [official guide](https://wwebjs.dev/guide).

---

# API Endpoints

## 1. `POST /send-message`

Send a WhatsApp message to a specified number.

### Request Body

| Parameter | Type   | Required | Description                          |
| :-------- | :----- | :------- | :----------------------------------- |
| `number`  | `string` | Yes      | The recipient's phone number. Include country code, e.g., `11234567890`. |
| `message` | `string` | Yes      | The content of the message to send.  |

### Example Usage

The server will be running on `http://localhost:4600`.


#### cURL Example

```bash
curl -X POST http://localhost:4600/send-message \
  -H "Content-Type: application/json" \
  -d '{ "number": "YOUR_PHONE_NUMBER", "message": "Hello from cURL!" }'
```

#### PowerShell Example

```powershell
Invoke-RestMethod -Uri "http://localhost:4600/send-message" `
                  -Method Post `
                  -Headers @{ "Content-Type" = "application/json" } `
                  -Body '{ "number": "YOUR_PHONE_NUMBER", "message": "Hello from PowerShell!" }'
```


#### JavaScript/TypeScript Example

```javascript
async function sendMessage() {
    const url = 'http://localhost:4600/send-message';
    const data = {
        number: 'YOUR_PHONE_NUMBER', // Replace with the recipient's phone number
        message: 'Hello from JavaScript!'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendMessage();
```


#### React Example

You can also call this API from a React app using the `fetch` API or `axios`:

```jsx
import React, { useState } from 'react';

function SendMessage() {
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState(null);

  const handleSend = async () => {
    try {
      const res = await fetch('http://localhost:4600/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number, message })
      });
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ success: false, error: err.message });
    }
  };

  return (
    <div>
      <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Phone Number" />
      <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" />
      <button onClick={handleSend}>Send</button>
      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
    </div>
  );
}

export default SendMessage;
```


#### Postman Example

To use this API with Postman, follow these steps:

1.  **Manual Setup:**
    *   Open Postman.
    *   Create a new request.
    *   Set the request type to `POST`.
    *   Enter the request URL: `http://localhost:4600/send-message`.
    *   Go to the `Headers` tab and add a new header:
        *   Key: `Content-Type`
        *   Value: `application/json`
    *   Go to the `Body` tab, select `raw`, and choose `JSON` from the dropdown.
    *   Enter the following JSON in the body:

        ```json
        {
            "number": "YOUR_PHONE_NUMBER",
            "message": "Hello from Postman!"
        }
        ```

2.  Replace `YOUR_PHONE_NUMBER` with the actual recipient's phone number (e.g., `11234567890`).
3.  Click `Send` to send the request.

### Example Response

A successful response from the `/send-message` endpoint will look like this:

```json
{
    "success": true,
    "message": "Message sent successfully."
}
```

If there is an error (e.g., missing parameters or WhatsApp not ready), you may receive a response like:

```json
{
    "success": false,
    "error": "Error message here."
}
```

---

## 2. `GET /send-message`

This endpoint is designed for health checks or keep-alive services. It returns a `204 No Content` status, indicating that the request was successful but there is no data to return. This prevents errors from services that might send `GET` requests to the main messaging endpoint.

---

## 3. `GET /qr`

Returns an HTML page displaying the current WhatsApp QR code for authentication. If the QR code is not available (e.g., after successful authentication), it returns a 404 error with a JSON message.

- **URL:** `http://localhost:4600/qr`
- **Method:** `GET`
- **Response:**
    - If QR code is available: HTML page with QR code image and instructions.
    - If QR code is not available: `{ "error": "QR code not available yet." }` (404)

**Note:** The QR code is cleared after successful authentication. If you need to re-authenticate, restart the server or clear the session.

---

## 4. `GET /logs`

Returns an HTML page displaying the application logs, including QR code generation, authentication, and message sending events. The log page auto-refreshes every 5 seconds.

- **URL:** `http://localhost:4600/logs`
- **Method:** `GET`
- **Response:** HTML page with a list of log entries.

---

## 5. `GET /health`

Returns a JSON object indicating the health and uptime of the server.

- **URL:** `http://localhost:4600/health`
- **Method:** `GET`
- **Response:**
    ```json
    {
        "status": "ok",
        "uptime": "2 days, 3 hours, 5 minutes"
    }
    ```
  - `uptime`: Human-friendly string (months, days, hours, minutes; seconds are not shown)

---

# Error Handling

- All endpoints return appropriate HTTP status codes and JSON error messages when applicable.
- If WhatsApp is not authenticated, `/send-message` will not work and will return an error.
- The `/qr` endpoint will return a 404 error if the QR code is not available (e.g., after successful authentication).

---

# Additional Notes

- The QR code is only available until authentication is complete. After successful authentication, the QR code is removed for security.
- Logs are kept in memory and will be lost if the server restarts.
- This API is for educational and prototyping purposes. For production, consider security, error handling, and session management improvements.

---

For more information and advanced usage, see the [whatsapp-web.js documentation](https://wwebjs.dev/guide).
