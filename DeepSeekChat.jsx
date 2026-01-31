import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, Menu, X, Settings, User, Moon, Sun, ChevronRight, Globe, Paperclip, Search, MoreVertical, Key, AlertCircle } from 'lucide-react';

// OpenRouter API конфигурация
const OPENROUTER_API_KEY = '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';
const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free';

const AIChat = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Привет! Я AI ассистент на базе OpenRouter. Чем могу помочь вам сегодня?',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      role: 'user',
      content: 'Расскажи мне о возможностях искусственного интеллекта в современном мире.',
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 3,
      role: 'assistant',
      content: 'Искусственный интеллект (ИИ) сегодня — это мощный инструмент, который трансформирует практически все сферы жизни. Вот основные направления его применения:\n\n🔹 **Обработка естественного языка (NLP)** — чат-боты, переводчики, анализ текстов\n\n🔹 **Компьютерное зрение** — распознавание образов, автономный транспорт, медицинская диагностика\n\n🔹 **Машинное обучение** — прогнозирование, рекомендательные системы, оптимизация процессов\n\n🔹 **Генеративный ИИ** — создание изображений, текстов, музыки и видео\n\nИИ уже помогает в науке, медицине, бизнесе, образовании и творчестве. Хотите узнать подробнее о каком-то конкретном направлении?',
      timestamp: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 4,
      role: 'user',
      content: 'А как насчёт этических аспектов развития ИИ?',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(OPENROUTER_API_KEY);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [error, setError] = useState(null);
  const [streamingContent, setStreamingContent] = useState('');

  // Инициализация API ключа в localStorage
  useEffect(() => {
    if (!localStorage.getItem('openrouter_api_key')) {
      localStorage.setItem('openrouter_api_key', OPENROUTER_API_KEY);
    }
  }, []);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const theme = {
    bg: darkMode ? '#0a0a0f' : '#ffffff',
    bgSecondary: darkMode ? '#111118' : '#f7f7f8',
    bgTertiary: darkMode ? '#1a1a24' : '#f0f0f0',
    bgHover: darkMode ? '#1f1f2e' : '#e8e8eb',
    border: darkMode ? '#2a2a3a' : '#e5e5e5',
    text: darkMode ? '#e6edf3' : '#1a1a1a',
    textMuted: darkMode ? '#8b949e' : '#666666',
    textSecondary: darkMode ? '#c9d1d9' : '#333333',
    accent: '#007BFF',
    accentHover: '#0056b3',
    userBubble: darkMode ? '#1a1a24' : '#f0f0f0',
    aiBubble: darkMode ? 'transparent' : 'transparent',
  };

  const chatHistory = [
    { id: 1, title: 'Возможности искусственного интеллекта', date: 'Сегодня' },
    { id: 2, title: 'Этика и ИИ', date: 'Сегодня' },
    { id: 3, title: 'Машинное обучение для начинающих', date: 'Вчера' },
    { id: 4, title: 'Нейронные сети: основы', date: 'Вчера' },
    { id: 5, title: 'Будущее ИИ в образовании', date: 'Позавчера' },
    { id: 6, title: 'ChatGPT vs DeepSeek', date: 'Позавчера' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput('');
    setError(null);
    setStreamingContent('');

    // Check for API key
    const key = apiKey || localStorage.getItem('openrouter_api_key');
    if (!key) {
      setShowApiKeyInput(true);
      return;
    }

    const newUserMessage = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Chat'
        },
        body: JSON.stringify({
          model: 'arcee-ai/trinity-large-preview:free',
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          stream: true
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Неверный API ключ. Проверьте ваш OpenRouter API ключ.');
        }
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: assistantContent
                    };
                    return updated;
                  });
                }
              } catch (e) {
                // Skip invalid JSON chunks
              }
            }
          }
        }
      }

    } catch (err) {
      setError(err.message);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Ошибка: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openrouter_api_key', apiKey.trim());
      setShowApiKeyInput(false);
      handleSend();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const AILogo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#007BFF"/>
      <path d="M8 22V10h4l4 6 4-6h4v12h-4v-7l-4 6-4-6v7H8z" fill="white"/>
      <circle cx="16" cy="16" r="3" fill="white"/>
    </svg>
  );

  const UserAvatar = () => (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-[#2a2a3a]' : 'bg-[#e0e0e0]'}`}>
      <User size={16} className={darkMode ? 'text-[#c9d1d9]' : '#666666'} />
    </div>
  );

  const AIAvatar = () => (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#007BFF]">
      <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 22V10h4l4 6 4-6h4v12h-4v-7l-4 6-4-6v7H8z" fill="white"/>
        <circle cx="16" cy="16" r="3" fill="white"/>
      </svg>
    </div>
  );

  const TypingIndicator = () => (
    <div className="flex gap-4">
      <AIAvatar />
      <div className="flex items-center gap-1 mt-2">
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '0ms' }} />
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '150ms' }} />
        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  return (
    <div 
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: theme.bg }}
    >
      {/* Sidebar */}
      <aside 
        className={`
          flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0'}
          ${darkMode ? 'bg-[#0d0d14]' : 'bg-[#f7f7f8]'}
          border-r ${darkMode ? 'border-[#2a2a3a]' : 'border-[#e5e5e5]'}
          overflow-hidden
        `}
      >
        {/* New Chat Button */}
        <div className="p-3">
          <button 
            onClick={() => {
              setMessages([{
                id: 1,
                role: 'assistant',
                content: 'Привет! Я AI ассистент на базе OpenRouter. Чем могу помочь вам сегодня?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl
              transition-colors duration-200
              ${darkMode 
                ? 'bg-[#1a1a24] hover:bg-[#1f1f2e] text-[#e6edf3]' 
                : 'bg-white hover:bg-[#f0f0f0] text-[#1a1a1a]'
              }
              border ${darkMode ? 'border-[#2a2a3a]' : 'border-[#e5e5e5]'}
            `}
          >
            <Plus size={18} />
            <span className="text-sm font-medium">Новый чат</span>
            <ChevronRight size={16} className="ml-auto opacity-50" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-xl
            ${darkMode ? 'bg-[#1a1a24]' : 'bg-white'}
            border ${darkMode ? 'border-[#2a2a3a]' : 'border-[#e5e5e5]'}
          `}>
            <Search size={16} className={theme.textMuted} />
            <input 
              type="text" 
              placeholder="Поиск чатов..."
              className={`
                flex-1 bg-transparent outline-none text-sm
                ${darkMode ? 'text-[#e6edf3] placeholder-[#6e7681]' : 'text-[#1a1a1a] placeholder-[#999999]'}
              `}
            />
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-xs font-medium mb-2 px-2" style={{ color: theme.textMuted }}>
            Сегодня
          </div>
          {chatHistory.filter(chat => chat.date === 'Сегодня').map(chat => (
            <button
              key={chat.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-colors duration-200 text-left
                ${darkMode 
                  ? 'hover:bg-[#1f1f2e] text-[#c9d1d9]' 
                  : 'hover:bg-[#e8e8eb] text-[#333333]'
                }
              `}
            >
              <MessageSquare size={16} />
              <span className="text-sm truncate flex-1">{chat.title}</span>
              <MoreVertical size={14} className="opacity-0 group-hover:opacity-50" />
            </button>
          ))}
          
          <div className="text-xs font-medium mt-4 mb-2 px-2" style={{ color: theme.textMuted }}>
            Вчера
          </div>
          {chatHistory.filter(chat => chat.date === 'Вчера').map(chat => (
            <button
              key={chat.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-colors duration-200 text-left
                ${darkMode 
                  ? 'hover:bg-[#1f1f2e] text-[#c9d1d9]' 
                  : 'hover:bg-[#e8e8eb] text-[#333333]'
                }
              `}
            >
              <MessageSquare size={16} />
              <span className="text-sm truncate flex-1">{chat.title}</span>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className={`
          p-3 border-t
          ${darkMode ? 'border-[#2a2a3a]' : 'border-[#e5e5e5]'}
        `}>
          <button 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-[#1f1f2e]' 
                : 'hover:bg-[#e8e8eb]'
              }
            `}
          >
            <div className="w-8 h-8 rounded-full bg-[#007BFF] flex items-center justify-center">
              <Key size={16} className="text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className={`text-sm font-medium ${darkMode ? 'text-[#e6edf3]' : '#1a1a1a'}`}>
                API Ключ
              </div>
              <div className={`text-xs ${darkMode ? 'text-[#8b949e]' : '#666666'}`}>
                {localStorage.getItem('openrouter_api_key') ? '✓ Настроен' : '✗ Не настроен'}
              </div>
            </div>
            <Settings size={16} className={theme.textMuted} />
          </button>
          
          {/* API Key Input */}
          {showApiKeyInput && (
            <div className={`
              mt-2 p-3 rounded-xl border
              ${darkMode ? 'bg-[#1a1a24] border-[#2a2a3a]' : 'bg-white border-[#e5e5e5]'}
            `}>
              <div className="flex items-center gap-2 mb-2">
                <Key size={14} className={theme.textMuted} />
                <span className={`text-xs ${darkMode ? 'text-[#8b949e]' : '#666666'}`}>
                  Введите ваш OpenRouter API ключ
                </span>
              </div>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={`
                  w-full px-3 py-2 rounded-lg text-sm outline-none
                  ${darkMode 
                    ? 'bg-[#0a0a0f] text-[#e6edf3] border-[#2a2a3a]' 
                    : 'bg-[#f0f0f0] text-[#1a1a1a] border-[#e5e5e5]'
                  }
                  border
                `}
              />
              <button
                onClick={handleSaveApiKey}
                className="w-full mt-2 px-3 py-2 rounded-lg bg-[#007BFF] text-white text-sm hover:bg-[#0056b3] transition-colors"
              >
                Сохранить и отправить
              </button>
            </div>
          )}
          
          <button 
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1
              transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-[#1f1f2e]' 
                : 'hover:bg-[#e8e8eb]'
              }
            `}
          >
            <div className="w-8 h-8 rounded-full bg-[#2a2a3a] flex items-center justify-center">
              <User size={16} className="text-[#c9d1d9]" />
            </div>
            <div className="flex-1 text-left">
              <div className={`text-sm font-medium ${darkMode ? 'text-[#e6edf3]' : '#1a1a1a'}`}>
                Пользователь
              </div>
              <div className={`text-xs ${darkMode ? 'text-[#8b949e]' : '#666666'}`}>
                Plus
              </div>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header 
          className={`
            flex items-center justify-between px-4 py-3
            border-b
            ${darkMode ? 'border-[#2a2a3a] bg-[#0a0a0f]' : 'border-[#e5e5e5] bg-[#ffffff]'}
          `}
        >
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`
                p-2 rounded-xl transition-colors duration-200
                ${darkMode 
                  ? 'hover:bg-[#1f1f2e] text-[#8b949e]' 
                  : 'hover:bg-[#f0f0f0] text-[#666666]'
                }
              `}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            <div className="flex items-center gap-2">
              <AILogo />
              <span className={`text-lg font-semibold ${darkMode ? 'text-[#e6edf3]' : '#1a1a1a'}`}>
                OpenRouter AI
              </span>
            </div>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`
              p-2 rounded-xl transition-colors duration-200
              ${darkMode 
                ? 'hover:bg-[#1f1f2e] text-[#8b949e]' 
                : 'hover:bg-[#f0f0f0] text-[#666666]'
              }
            `}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* Error Banner */}
        {error && (
          <div className={`
            px-4 py-3 flex items-center gap-2
            ${darkMode ? 'bg-[#1a1a24] border-b border-[#2a2a3a]' : 'bg-[#f0f0f0] border-b border-[#e5e5e5]'}
          `}>
            <AlertCircle size={16} className="text-red-500" />
            <span className={`text-sm ${darkMode ? 'text-[#e6edf3]' : '#1a1a1a'}`}>
              {error}
            </span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-xs underline"
              style={{ color: theme.textMuted }}
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`
                  flex gap-4 mb-6
                  ${message.role === 'user' ? 'flex-row-reverse' : ''}
                `}
              >
                {message.role === 'assistant' ? <AIAvatar /> : <UserAvatar />}
                
                <div 
                  className={`
                    flex-1 max-w-[80%]
                    ${message.role === 'user' ? 'text-right' : ''}
                  `}
                >
                  <div 
                    className={`
                      inline-block px-4 py-3 rounded-2xl
                      ${message.role === 'user' 
                        ? darkMode 
                          ? 'bg-[#1a1a24] text-[#e6edf3]' 
                          : 'bg-[#f0f0f0] text-[#1a1a1a]'
                        : darkMode 
                          ? 'text-[#e6edf3]' 
                          : 'text-[#1a1a1a]'
                      }
                    `}
                    style={{ 
                      textAlign: 'left',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </div>
                  <div 
                    className={`text-xs mt-2 ${darkMode ? 'text-[#6e7681]' : '#999999'}`}
                  >
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <AIAvatar />
                <div className="flex items-center gap-1 mt-2">
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                  <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-[#8b949e]' : '#999'} animate-bounce`} style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div 
          className={`
            px-4 py-4
            border-t
            ${darkMode ? 'border-[#2a2a3a] bg-[#0a0a0f]' : 'border-[#e5e5e5] bg-[#ffffff]'}
          `}
        >
          <div className="max-w-3xl mx-auto">
            <div 
              className={`
                flex items-end gap-2 px-4 py-3 rounded-2xl
                ${darkMode 
                  ? 'bg-[#1a1a24] border border-[#2a2a3a]' 
                  : 'bg-[#f0f0f0] border border-[#e5e5e5]'
                }
                focus-within:border-[#007BFF] focus-within:ring-1 focus-within:ring-[#007BFF]
                transition-all duration-200
              `}
            >
              {/* Attachment Button */}
              <button 
                className={`
                  p-2 rounded-xl transition-colors duration-200
                  ${darkMode 
                    ? 'hover:bg-[#2a2a3a] text-[#8b949e]' 
                    : 'hover:bg-[#e0e0e0] text-[#666666]'
                  }
                `}
              >
                <Paperclip size={20} />
              </button>
              
              {/* Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Отправьте сообщение..."
                disabled={isLoading}
                className={`
                  flex-1 bg-transparent outline-none resize-none
                  text-[15px] leading-relaxed
                  ${darkMode 
                    ? 'text-[#e6edf3] placeholder-[#6e7681]' 
                    : 'text-[#1a1a1a] placeholder-[#999999]'
                  }
                  max-h-[200px]
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                rows={1}
                style={{ 
                  minHeight: '24px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
              />
              
              {/* Web Search */}
              <button 
                className={`
                  p-2 rounded-xl transition-colors duration-200
                  ${darkMode 
                    ? 'hover:bg-[#2a2a3a] text-[#8b949e]' 
                    : 'hover:bg-[#e0e0e0] text-[#666666]'
                  }
                `}
              >
                <Globe size={20} />
              </button>
              
              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`
                  p-2 rounded-xl
                  transition-all duration-200
                  ${input.trim() && !isLoading
                    ? 'bg-[#007BFF] hover:bg-[#0056b3] text-white shadow-lg shadow-[#007BFF]/25' 
                    : 'bg-[#30363d] text-[#6e7681] cursor-not-allowed'
                  }
                `}
              >
                <Send size={20} />
              </button>
            </div>
            
            <div 
              className={`text-center mt-3 text-xs ${darkMode ? 'text-[#6e7681]' : '#999999'}`}
            >
              AI может допускать ошибки. Проверяйте важную информацию.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChat;
