# Chatbot Web con Gemini API - Proyecto de Demostración de NovaAI

Este proyecto es una demostración de un chatbot inteligente para un sitio web, impulsado por la API de Google Gemini y desarrollado como parte del portafolio de **NovaAI**.

## Descripción General

El chatbot, llamado Nova, está diseñado para mantener conversaciones fluidas y naturales con los usuarios. Su objetivo es presentar los servicios de la agencia NovaAI, responder preguntas y capturar leads de clientes potenciales. A diferencia de un bot con respuestas predefinidas, este utiliza un modelo de lenguaje avanzado (LLM) para generar respuestas dinámicas y contextuales.

## Arquitectura

El proyecto utiliza una arquitectura cliente-servidor:

-   **Frontend (`index.html`, `style.css`, `script.js`):** Una interfaz de chat web que se comunica con el backend. Gestiona la interacción del usuario y muestra la conversación.
-   **Backend (`server.js`):** Un servidor Node.js con Express que actúa como intermediario seguro. Recibe los mensajes del frontend, se comunica con la API de Gemini para obtener una respuesta inteligente y la devuelve al cliente.

## Características

-   **Inteligencia Conversacional:** Conectado al modelo `gemini-1.5-flash` para respuestas coherentes y relevantes.
-   **Personalidad Definida:** El bot tiene una personalidad y un conjunto de instrucciones claras definidas en el backend para actuar como un asistente experto de NovaAI.
-   **Manejo de Historial:** Envía el historial de la conversación a la API para mantener el contexto.
-   **Captación de Leads:** Identifica el interés de contratación y solicita un email, que se registra en el backend.
- **Interfaz de Chat Atractiva:** Diseño limpio y moderno creado con HTML y CSS.

## ¿Cómo Ejecutarlo?

Este proyecto requiere un entorno de Node.js para el backend.

1.  **Clonar el Repositorio (si aplica):**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd chatbot_web_simple
    ```

2.  **Instalar Dependencias del Backend:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    -   Crea un archivo `.env` en la raíz del directorio `chatbot_web_simple`.
    -   Añade tu clave de API de Gemini, basándote en el archivo `.env.example`:
        ```
        GEMINI_API_KEY="TU_CLAVE_DE_API_AQUÍ"
        ```

4.  **Iniciar el Servidor Backend:**
    ```bash
    node server.js
    ```
    El servidor se ejecutará en `http://localhost:3000`.

5.  **Abrir el Frontend:**
    -   Abre el archivo `index.html` en tu navegador web. Puedes usar una extensión como "Live Server" en VS Code para una mejor experiencia.

6.  ¡Listo! Ya puedes interactuar con el chatbot inteligente.

## Próximos Pasos y Mejoras

-   **Implementar Streaming:** Mostrar la respuesta del bot palabra por palabra para una experiencia más dinámica.
-   **Persistencia del Historial:** Guardar el historial de conversación en el `localStorage` del navegador para que no se pierda al recargar la página.
-   **Despliegue:** Publicar el frontend y el backend en una plataforma de hosting (como Vercel, Netlify, Render, etc.).
