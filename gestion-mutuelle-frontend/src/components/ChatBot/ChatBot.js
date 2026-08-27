import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.css';
import { useAuth } from '../../context/AuthContext';

const ChatBot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // On repasse par le proxy Java pour éviter totalement les erreurs de CORS du navigateur !
  const PROXY_URL = 'http://localhost:8081/chatbot/proxy-n8n'; 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && user) {
      if (messages.length === 0) {
        setMessages([{ text: `Bonjour ${user.username || ''} ! Je suis votre assistant IA. Comment puis-je vous aider ?`, sender: 'bot' }]);
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage, // C'est envoyé au Proxy, qui l'envoie à n8n
          userId: user?.id,
          username: user?.username,
          role: user?.roles?.[0]
        })
      });

      if (response.ok) {
        let data = await response.json();
        // n8n renvoie { "response": "..." }
        if (Array.isArray(data)) data = data[0];
        setMessages(prev => [...prev, { text: data.output || data.response || data.message || "Réponse reçue sans texte !", sender: 'bot' }]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.output || `Erreur Serveur (Code: ${response.status})`;
        setMessages(prev => [...prev, { text: errorMessage, sender: 'bot' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { text: "Le proxy Java ou n8n ne répond pas.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} title="Besoin d'aide ?">
        <i className={isOpen ? "fas fa-times" : "fas fa-robot"}></i>
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-info">
              <div className="bot-avatar"><i className="fas fa-robot"></i></div>
              <div>
                <h3>Assistant n8n (Proxy)</h3>
                <p><span className="status-dot"></span> Connecté</p>
              </div>
            </div>
          </div>
          
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className={`message ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message-wrapper bot">
                <div className="message bot typing">...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question (via Proxy Java)..." 
            />
            <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
