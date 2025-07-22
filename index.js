require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeLib = require('qrcode');
const express = require('express');
const cors = require('cors'); // Import cors
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 4600;

app.use(express.json());
app.use(cors()); // Use cors middleware

const client = new Client({
    authStrategy: new LocalAuth()
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

client.on('message', async message => {
    if (message.body === '!ping') {
        message.reply('pong');
    } else {
        try {
            const prompt = message.body;
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                systemInstruction: "You are Rick that replies on behalf of the user, Rick. Structure your reply such a way that the other person should think Rick is replying. Respond in the same language and style as the user's message.",
                generationConfig: { temperature: 1.5 } // Increased temperature for more varied responses
            });
            const response = await result.response;
            const text = response.text();
            message.reply(text);
            logs.push(`Received: "${prompt}" - Replied: "${text}"`);
        } catch (error) {
            console.error('Error generating response from Gemini API:', error);
            logs.push(`Error generating response from Gemini API: ${error.message}`);
            message.reply('Sorry, I could not generate a response at this time.');
        }
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
    const uptimeSeconds = process.uptime();
    function formatUptime(seconds) {
        const months = Math.floor(seconds / (30 * 24 * 3600));
        seconds %= (30 * 24 * 3600);
        const days = Math.floor(seconds / (24 * 3600));
        seconds %= (24 * 3600);
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        let parts = [];
        if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
        if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
        if (minutes || parts.length === 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        return parts.join(', ');
    }
    res.status(200).send({ 
        status: 'ok', 
        uptime: formatUptime(uptimeSeconds)
    });
});

client.initialize();

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
