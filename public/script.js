document.getElementById('reminderForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const medicine = document.getElementById('medicine').value;
    const time = document.getElementById('time').value;
    const phone = document.getElementById('phone').value;
    
    try {
        const response = await fetch('/api/reminders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ medicine, time, phone }),
        });
        
        if (response.ok) {
            alert('Lembrete agendado com sucesso!');
            loadReminders();
        } else {
            alert('Erro ao agendar lembrete');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Falha na comunicação com o servidor');
    }
});

async function loadReminders() {
    const response = await fetch('/api/reminders');
    const reminders = await response.json();
    
    const list = document.getElementById('remindersList');
    list.innerHTML = '';
    
    reminders.forEach(reminder => {
        const item = document.createElement('div');
        item.className = 'reminder-item';
        item.innerHTML = `
            <strong>${reminder.medicine}</strong>
            <p>Horário: ${reminder.time}</p>
            <p>WhatsApp: ${reminder.phone}</p>
        `;
        list.appendChild(item);
    });
}

// Carrega os lembretes quando a página abre
loadReminders();