const express = require('express');
const cors = require('cors');
const { create } = require('@wppconnect-team/wppconnect');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Banco de dados simples em memória
let reminders = [];

// Inicializa o bot do WhatsApp
let whatsappClient;

create({
    session: 'medicine-reminders',
    catchQR: (base64Qr) => {
        console.log('Scan this QR code to connect WhatsApp:');
        // Você pode enviar este QR para o frontend se quiser
    },
    statusFind: (status) => {
        console.log('WhatsApp status:', status);
    }
})
.then((client) => {
    whatsappClient = client;
    console.log('WhatsApp bot connected!');
})
.catch((error) => {
    console.error('WhatsApp connection error:', error);
});

// API para criar lembretes
app.post('/api/reminders', (req, res) => {
    const { medicine, time, phone } = req.body;
    
    // Formata o número para o padrão do WhatsApp
    const formattedPhone = phone.includes('@c.us') ? phone : `${phone}@c.us`;
    
    const newReminder = {
        id: Date.now(),
        medicine,
        time,
        phone: formattedPhone
    };
    
    reminders.push(newReminder);
    
    // Agenda o lembrete
    const [hours, minutes] = time.split(':');
    cron.schedule(`${minutes} ${hours} * * *`, () => {
        if (whatsappClient) {
            whatsappClient.sendText(
                formattedPhone,
                `⏰ Lembrete de Medicamento!\nTome agora: ${medicine}`
            ).then(() => {
                console.log(`Lembrete enviado para ${formattedPhone}`);
            }).catch(console.error);
        }
    });
    
    res.status(201).json(newReminder);
});

// API para listar lembretes
app.get('/api/reminders', (req, res) => {
    res.json(reminders);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});