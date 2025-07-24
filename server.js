require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000; // Usar el puerto de Render o 3000 para local

// Middlewares
// Restringir CORS para aceptar peticiones solo desde tu tienda Shopify
const allowedOrigins = ['https://decoarche.com', 'https://www.decoarche.com'];
app.use(cors({
  origin: function(origin, callback){
    if(!origin || allowedOrigins.indexOf(origin) !== -1){
      callback(null, true);
    }else{
      callback(new Error('No permitido por CORS'));
    }
  }
}));
app.use(express.json());

// Ruta raíz para health checks y bienvenida
app.get('/', (req, res) => {
    res.send('Servidor de NovaAI para DecoArche funcionando correctamente. ¡Listo para recibir peticiones del chatbot! 🚀');
});

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Definir la instrucción del sistema (personalidad y contexto del bot)
const systemInstruction = {
    role: "system",
    parts: [{
        text: `
Eres Nova, un asistente virtual experto que representa a NovaAI, una empresa de soluciones de inteligencia artificial.
Tu misión es ayudar a los usuarios a entender los servicios de NovaAI y cómo la IA puede beneficiarles.

**Personalidad:**
- Eres amable, profesional y muy servicial.
- Te expresas de forma clara y fácil de entender, evitando la jerga técnica excesiva.
- Tu objetivo es ser útil y guiar a los usuarios, no vender agresivamente.

**Contexto de la Empresa (NovaAI):**
- **Servicios Principales:**
    1.  **Asistentes Virtuales:** Desarrollo de chatbots y voicebots a medida.
    2.  **Automatización de Procesos (RPA):** Robots para automatizar tareas repetitivas.
    3.  **Análisis de Datos:** Business Intelligence y análisis predictivo.
    4.  **Contenido Generativo:** Creación de texto, imágenes y música con IA.
    5.  **Consultoría y Desarrollo a Medida:** Estrategias de IA personalizadas.

**Instrucciones de Conversación:**
- Si el usuario te da su nombre (lo verás en el historial), úsalo de vez en cuando para personalizar la conversación.
- Mantén las respuestas relativamente cortas y al grano, pero informativas.
- Si no sabes la respuesta a algo, sé honesto y di que te especializas en los servicios de NovaAI.
- Si un usuario muestra un claro interés en contratar un servicio (por ejemplo, pregunta "cómo puedo contratar", "quiero empezar", "me interesa su servicio de..."), pregúntale si le gustaría dejar su email para que un especialista del equipo se ponga en contacto.
- No pidas el email si solo piden información general. Solo cuando el interés sea de contratación.
- Si te dan el email, agradécele y dile que un especialista se pondrá en contacto pronto.
- No inventes información sobre precios o clientes específicos.
`
    }]
};

// Obtener el modelo con la instrucción del sistema
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: systemInstruction
});

// Endpoint para el chat
app.post('/chat', async (req, res) => {
    console.log('\n--- INICIANDO PETICIÓN /chat ---');
    try {
        const { message, history } = req.body;
        console.log('Mensaje recibido:', message);

        if (!message) {
            console.log('Error: Mensaje vacío. Devolviendo error 400.');
            return res.status(400).json({ error: 'No se ha proporcionado ningún mensaje.' });
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 300,
            },
        });

        console.log('Enviando mensaje a la API de Gemini...');
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();
        
        console.log('Respuesta de Gemini recibida con éxito.');
        res.json({ response: text });

    } catch (error) {
        console.error('--- ERROR CRÍTICO en /chat ---');
        console.error('Error detallado:', error);
        res.status(500).json({ error: 'Ha ocurrido un error al procesar tu solicitud.' });
    }
    console.log('--- FIN PETICIÓN /chat ---\n');
});

// Endpoint para capturar leads
app.post('/leads', (req, res) => {
    try {
        const { email, userName } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'No se ha proporcionado ningún email.' });
        }
        // En un proyecto real, guardarías esto en una base de datos, CRM, o enviarías una notificación.
        console.log(`\n--- NUEVO LEAD CAPTURADO ---`);
        console.log(`Nombre: ${userName || 'No proporcionado'}`);
        console.log(`Email: ${email}`);
        console.log(`--------------------------\n`);
        res.status(200).json({ message: 'Lead recibido correctamente.' });
    } catch (error) {
        console.error('Error al guardar el lead:', error);
        res.status(500).json({ error: 'Ha ocurrido un error al procesar el lead.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor de NovaAI escuchando en https://novaai-ceui.onrender.com:${port}`);
});
