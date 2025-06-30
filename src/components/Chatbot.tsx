import { useEffect, useState } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const ViteWebhook = import.meta.env.VITE_WEBHOOK_URL;

const Chatbot = () => {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    createChat({
      webhookUrl: 'https://n8n-1-onbo.onrender.com/webhook/a889d2ae-2159-402f-b326-5f61e90f602e/chat',
      webhookConfig: {
        method: 'POST',
        headers: {}
      },
      target: '#n8n-chat',
      mode: 'window',
      chatInputKey: 'chatInput',
      chatSessionKey: 'sessionId',
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: 'en',
      initialMessages: [
        'Hi there! 👋',
        'Welcome to the FFC! What can I assist you with today?',
      ],
      i18n: {
        en: {
          title: 'Hi there! 👋',
          subtitle: "Start a chat. We're here to help you 24/7.",
          footer: '<a href="https://n8n.io">Powered by n8n</a>',
          getStarted: 'New Conversation',
          inputPlaceholder: 'Type your question..',
          closeButtonTooltip: 'Close',
        },
      },
    });
    const timer = setTimeout(() => setShowBubble(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div id="n8n-chat"></div>
      {showBubble && (
        <div className="chat-bubble-tooltip">Click me!</div>
      )}
    </>
  );
};

export default Chatbot;