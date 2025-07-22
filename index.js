const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeLib = require('qrcode');
const express = require('express');
const app = express();
const port = process.env.PORT || 4600;

app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth()
});

let qrCodeData = null;
const logs = [];

client.on('qr', qr => {
    qrCodeData = qr;
    qrcode.generate(qr, {small: true});
    logs.push(`QR Code generated: ${qr}`);
});

client.on('ready', () => {
    console.log('Client is ready!');
    logs.push('Client is ready!');
    qrCodeData = null; // Clear QR code data after successful authentication
});

client.on('message', message => {
    if (message.body === '!ping') {
        message.reply('pong');
    }
});

app.get('/qr', (req, res) => {
    if (qrCodeData) {
        qrcodeLib.toDataURL(qrCodeData, (err, url) => {
            if (err) {
                console.error('Error generating QR code image:', err);
                return res.status(500).send({ error: 'Error generating QR code image.' });
            }
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>WhatsApp QR Code</title>
                </head>
                <body>
                    <h1>Scan this QR Code with your WhatsApp app</h1>
                    <img src="${url}" alt="QR Code">
                    <p>If the QR code doesn't load, refresh the page.</p>
                </body>
                </html>
            `);
        });
    } else {
        res.status(404).send({ error: 'QR code not available yet.' });
    }
});

app.get('/logs', (req, res) => {
    const logHtml = logs.map(log => `<p>${log}</p>`).join('');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp Bot Logs</title>
        </head>
        <body>
            <h1>Application Logs</h1>
            <div id="logs">
                ${logHtml}
            </div>
            <script>
                // Auto-refresh logs every 5 seconds
                setInterval(() => {
                    location.reload();
                }, 5000);
            </script>
        </body>
        </html>
    `);
});

app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;
    if (!number || !message) {
        return res.status(400).send({ error: 'Both number and message are required.' });
    }
    try {
        const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
        await client.sendMessage(chatId, message);
        res.status(200).send({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error sending message:', error);
        logs.push(`Error sending message: ${error.message}`);
        res.status(500).send({ success: false, error: error.message });
    }
});

app.get('/send-message', (req, res) => {
    res.status(204).send(); // 204 No Content for keep-alive/ping requests
});

app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok', uptime: process.uptime() });
});

client.initialize();

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
