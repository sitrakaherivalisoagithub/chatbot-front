'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImageMessage from './components/ImageMessage';

// MODIFICATION 1: Ajouter 'image' au type
type Message = {
  type: 'text' | 'html' | 'image'; // Ajout de 'image'
  content: string;
  sender: 'user' | 'bot';
};

type Conversation = {
  id: string;
  name: string;
  messages: Message[];
};

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([]);

  useEffect(() => {
    handleNewChat();
  }, []);

  // MODIFICATION 2: Refonte complète de handleSend
  const handleSend = async () => {
    if (input.trim() === '' || !activeConversationId) return;

    const userMessage: Message = { type: 'text', content: input, sender: 'user' };
    
    setConversationHistory(prev =>
      prev.map(convo => {
        if (convo.id === activeConversationId) {
          const updatedMessages = [...convo.messages, userMessage];
          const updatedName = convo.messages.length === 0 ? input.split(' ').slice(0, 5).join(' ') : convo.name;
          return { ...convo, messages: updatedMessages, name: updatedName };
        }
        return convo;
      })
    );

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input, session_id: activeConversationId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // -- Début de la nouvelle logique d'aiguillage --

      const contentType = response.headers.get('Content-Type');
      const botMessages: Message[] = []; // Préparer un tableau pour les messages du bot

      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(data);

        if (Array.isArray(data) && data.length > 0) {
          const responseItem = data[0];

          // Cas 2: Gérer la réponse avec image (base64) et texte
          // Vérifier si l'image base64 existe et n'est pas vide (seuil arbitraire pour éviter les chaînes vides)
          if (responseItem.image_base64 && responseItem.image_base64.length > 50) {
            botMessages.push({ type: 'image', content: responseItem.image_base64, sender: 'bot' });
          }

          // Gérer la partie texte (qui peut exister dans les deux cas)
          let messageText: string | null = null;
          if (typeof responseItem.output === 'string') {
            // Cas 2: le texte est directement dans 'output'
            messageText = responseItem.output;
          } else if (responseItem.output && typeof responseItem.output.response === 'string') {
            // Cas 1: le texte est dans 'output.response'
            messageText = responseItem.output.response;
          }

          if (messageText) {
            const htmlContent = messageText
              .replace(/\n/g, '<br />')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
            botMessages.push({ type: 'html', content: htmlContent, sender: 'bot' });
          }
        }
        
        // Si, après toutes les vérifications, aucun message n'a été ajouté
        if (botMessages.length === 0) {
          console.error("La structure JSON de la réponse est inattendue ou vide.", data);
          botMessages.push({ type: 'text', content: 'Erreur: Réponse inattendue du serveur.', sender: 'bot' });
        }

      } else {
        // Fallback pour les réponses qui ne sont pas du JSON
        const text = await response.text();
        console.error("Réponse inattendue (non-JSON):", text);
        botMessages.push({ type: 'text', content: 'Erreur: Réponse inattendue du serveur.', sender: 'bot' });
      }

      // -- Fin de la nouvelle logique --

      // Ajouter le(s) message(s) du bot à l'historique
      setConversationHistory(prev =>
        prev.map(convo =>
          convo.id === activeConversationId
            ? { ...convo, messages: [...convo.messages, ...botMessages] } // ...botMessages (spread)
            : convo
        )
      );

    } catch (error) {
      console.error('Error fetching webhook:', error);
      const errorMessage: Message = { type: 'text', content: '⚠️ Erreur de connexion au serveur d’analyse.', sender: 'bot' };
      setConversationHistory(prev =>
        prev.map(convo =>
          convo.id === activeConversationId
            ? { ...convo, messages: [...convo.messages, errorMessage] }
            : convo
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSessionId = uuidv4();
    const newConversation: Conversation = {
      id: newSessionId,
      name: 'New Chat',
      messages: [],
    };
    setConversationHistory(prev => [newConversation, ...prev]);
    setActiveConversationId(newSessionId);
  };

  const activeConversation = conversationHistory.find(convo => convo.id === activeConversationId);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* ... (Partie Sidebar, aucun changement) ... */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            New Chat
          </button>
        </div>
        <div className="flex-grow p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversations</h2>
          <ul>
            {conversationHistory.map(convo => (
              <li key={convo.id} className="mb-2">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveConversationId(convo.id);
                  }}
                  className={`block p-2 rounded-md ${
                    activeConversationId === convo.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {convo.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* ... (Partie Chat) ... */}
      <div className="flex flex-col flex-grow">
        <div className="flex-grow p-6 overflow-auto">
          <div className="flex flex-col gap-4">
            {activeConversation?.messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg rounded-lg overflow-hidden ${
                    msg.type === 'image' ? '' : 'px-4 py-2'
                  } ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {/* MODIFICATION 3: Ajouter le rendu des images */}
                  {msg.type === 'html' ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                  ) : msg.type === 'image' ? (
                    <ImageMessage src={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <p>Typing...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ... (Partie Input, aucun changement) ... */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-grow px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={1}
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
