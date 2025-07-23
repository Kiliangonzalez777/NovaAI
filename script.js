document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatContainer = document.getElementById('chat-container');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // IMPORTANTE: Esta URL deberá ser reemplazada por la del servidor público.
    const API_BASE_URL = 'http://localhost:3000';

    // --- Lógica para abrir y cerrar el chat ---
    chatBubble.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
    });

    closeChatBtn.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // --- Memoria y Contexto del Chatbot ---
    const context = {
        userName: null, // Se podría usar en el futuro, por ahora lo dejamos.
        awaitingEmail: false,
    };
    // Historial de la conversación para la API de Gemini.
    // Comienza vacío. El primer mensaje del bot es solo para la UI.
    const history = []; 

    // --- Lógica de Envío de Mensajes ---
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const userText = userInput.value.trim();
        if (userText === '') return;

        appendMessage(userText, 'user-message');
        userInput.value = '';

        showTypingIndicator();

        try {
            const botResponse = await getBotResponse(userText);
            appendMessage(botResponse, 'bot-message');
        } catch (error) {
            console.error("Error en sendMessage:", error);
            appendMessage('Lo siento, no puedo conectarme con mi inteligencia en este momento. Por favor, intenta más tarde.', 'bot-message');
        } finally {
            hideTypingIndicator();
        }
    }

    function appendMessage(text, className) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', className);
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.classList.add('message', 'bot-message');
        typingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        chatBox.appendChild(typingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            chatBox.removeChild(indicator);
        }
    }

    function isValidEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    async function saveLead(email) {
        try {
            await fetch(`${API_BASE_URL}/leads`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, userName: context.userName }),
            });
        } catch (error) {
            console.error("Error al guardar el lead:", error);
            // No mostramos este error al usuario para no interrumpir el flujo.
        }
    }

    // --- Lógica Principal del Bot (Conexión con Gemini) ---
    async function getBotResponse(userText) {
        // 1. Comprobar si estamos esperando el email (lógica de captación de leads)
        if (context.awaitingEmail) {
            if (isValidEmail(userText)) {
                await saveLead(userText);
                context.awaitingEmail = false;
                // El modelo ya está instruido para dar una respuesta de agradecimiento.
                // Continuamos para que Gemini genere esa respuesta.
            } else {
                return "Parece que ese no es un email válido. ¿Podrías intentarlo de nuevo, por favor?";
            }
        }

        // Añadir el mensaje actual del usuario al historial
        history.push({ role: "user", parts: [{ text: userText }] });

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userText,
                history: history.slice(0, -1) // Enviar historial sin el último mensaje del usuario
            }),
        });

        if (!response.ok) {
            throw new Error('La respuesta del servidor no fue exitosa.');
        }

        const data = await response.json();
        const botText = data.response;

        // 2. Comprobar si la respuesta del bot pide el email para activar el contexto
        if (botText.toLowerCase().includes('email') || botText.toLowerCase().includes('correo electrónico')) {
            context.awaitingEmail = true;
        }

        // Añadir la respuesta del bot al historial
        history.push({ role: "model", parts: [{ text: botText }] });

        return botText;
    }
});