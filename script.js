// --- Variable de control para evitar doble inicialización ---
let chatbotInitialized = false;

// --- Función principal que inicializa todo el chatbot ---
function initializeNovaChatbot() {
    // Si ya se ha inicializado, no hacer nada más.
    if (chatbotInitialized) {
        return;
    }

    // --- Elementos del DOM ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatContainer = document.getElementById('chat-container');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Verificación crucial: si los elementos no existen, abortar.
    // Esto puede pasar si el script se ejecuta antes de que el HTML esté listo.
    if (!chatBubble || !chatContainer || !closeChatBtn || !sendBtn || !userInput || !chatBox) {
        console.log("NovaAI: Elementos del DOM no encontrados. Reintentando...");
        return;
    }

    // URL del servidor público en Render
    const API_BASE_URL = 'https://novaai-ceui.onrender.com';

    // --- Lógica para abrir y cerrar el chat ---
    chatBubble.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
    });

    closeChatBtn.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    // --- Memoria y Contexto del Chatbot ---
    const context = {
        userName: null,
        awaitingEmail: false,
    };
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
        const re = /^(([^<>()[\\].,;:\s@"]+(\.[^<>()[\\].,;:\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
        }
    }

    async function getBotResponse(userText) {
        if (context.awaitingEmail) {
            if (isValidEmail(userText)) {
                await saveLead(userText);
                context.awaitingEmail = false;
            } else {
                return "Parece que ese no es un email válido. ¿Podrías intentarlo de nuevo, por favor?";
            }
        }

        history.push({ role: "user", parts: [{ text: userText }] });

        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userText,
                history: history.slice(0, -1)
            }),
        });

        if (!response.ok) {
            throw new Error('La respuesta del servidor no fue exitosa.');
        }

        const data = await response.json();
        const botText = data.response;

        if (botText.toLowerCase().includes('email') || botText.toLowerCase().includes('correo electrónico')) {
            context.awaitingEmail = true;
        }

        history.push({ role: "model", parts: [{ text: botText }] });
        return botText;
    }

    // Marcar como inicializado y mostrar mensaje de éxito en la consola.
    chatbotInitialized = true;
    console.log("¡Chatbot de NovaAI inicializado con éxito!");
}

// --- Lógica de Carga Robusta ---
// Intento 1: Ejecutar cuando el HTML esté listo (el método estándar).
document.addEventListener('DOMContentLoaded', initializeNovaChatbot);

// Intento 2: Ejecutar cuando la página entera (imágenes, etc.) esté cargada.
window.addEventListener('load', initializeNovaChatbot);

// Intento 3 (Fallback): Si todo lo demás falla, intentar ejecutar después de 1 segundo.
// Esto ayuda a esquivar errores de otros scripts que bloquean los eventos de carga.
setTimeout(initializeNovaChatbot, 1000);

