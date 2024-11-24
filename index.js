const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const pastes = new Map();

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (match) => {
        const escapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return escapeMap[match];
    });
}

app.post('/api/save', (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ success: false, message: 'Content cannot be empty' });
    }

    const id = crypto.randomBytes(4).toString('hex');
    pastes.set(id, content);

    res.json({ success: true, url: `/paste/${id}` });
});

app.get('/paste/:id', (req, res) => {
    const { id } = req.params;

    if (!pastes.has(id)) {
        return res.status(404).send('<h1>Paste not found</h1>');
    }

    const content = pastes.get(id);
    const escapedContent = escapeHtml(content);

    res.send(`
        <html>
        <head><title>Pistebin</title></head>
        <body>
            <pre style="white-space: pre-wrap; word-wrap: break-word;">${escapedContent}</pre>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
