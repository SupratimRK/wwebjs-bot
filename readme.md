

# WhatsApp Message API Documentation
---

## Packages Used

This project uses the following main npm packages:

- [`whatsapp-web.js`](https://www.npmjs.com/package/whatsapp-web.js): WhatsApp client library for Node.js
- [`qrcode-terminal`](https://www.npmjs.com/package/qrcode-terminal): For displaying QR codes in the terminal
- [`express`](https://www.npmjs.com/package/express): Web server framework

---

This document provides details on how to use the WhatsApp Message API to send messages using [whatsapp-web.js](https://wwebjs.dev/guide).

---

## How It Works

This API uses [whatsapp-web.js](https://wwebjs.dev/guide) to automate WhatsApp messaging. When you start the server, it will generate a QR code in your terminal. Scan this QR code with your WhatsApp mobile app to authenticate and start the client.

**Steps to Start the Client:**

1. Run the server (e.g., `node index.js`).
2. A QR code will appear in your terminal.
3. Open WhatsApp on your phone > tap the three dots > Linked devices > Link a device.
4. Scan the QR code displayed in your terminal.
5. Once scanned, the client will be ready and you can send messages via the API.

For more details, see the [official guide](https://wwebjs.dev/guide).

---

## Endpoint

`POST /send-message`

## Description

Sends a WhatsApp message to a specified number.

## Request Body

| Parameter | Type   | Required | Description                          |
| :-------- | :----- | :------- | :----------------------------------- |
| `number`  | `string` | Yes      | The recipient's phone number. Include country code, e.g., `11234567890`. |
| `message` | `string` | Yes      | The content of the message to send.  |

## Example Usage

The server will be running on `http://localhost:4600`.


### cURL Example

```bash
curl -X POST http://localhost:4600/send-message \
  -H "Content-Type: application/json" \
  -d '{ "number": "YOUR_PHONE_NUMBER", "message": "Hello from cURL!" }'
```

### PowerShell Example

```powershell
Invoke-RestMethod -Uri "http://localhost:4600/send-message" `
                  -Method Post `
                  -Headers @{ "Content-Type" = "application/json" } `
                  -Body '{ "number": "YOUR_PHONE_NUMBER", "message": "Hello from PowerShell!" }'
```


### JavaScript/TypeScript Example

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


### Postman Example

To use this API with Postman, follow these steps:

1.  **Import cURL Request (Recommended for quick setup):**
    *   Open Postman.
    *   Click on `File` > `Import` (or the `Import` button in the top left).
    *   Select `Raw text` and paste the cURL example from above:
        ```bash
        curl -X POST http://localhost:4600/send-message \
        -H "Content-Type: application/json" \
        -d '{ "number": "YOUR_PHONE_NUMBER", "message": "Hello from cURL!" }'
        ```
    *   Click `Continue` and then `Import`. This will automatically configure the request.
    *   Proceed to step 8 to replace `YOUR_PHONE_NUMBER`.

2.  **Manual Setup (Alternative):**
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

3.  Replace `YOUR_PHONE_NUMBER` with the actual recipient's phone number (e.g., `11234567890`).
4.  Click `Send` to send the request.


---

## Example Response

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

For more information and advanced usage, see the [whatsapp-web.js documentation](https://wwebjs.dev/guide).
