import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/Loader';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const SendIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
  </svg>
);

const Chat = () => {
  const [rooms, setRooms]         = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading]     = useState(true);
  const [sending, setSending]     = useState(false);
  const socketRef    = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef     = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    chatAPI.getRooms()
      .then(({ data }) => setRooms(data.data))
      .finally(() => setLoading(false));

    const token = localStorage.getItem('token');
    socketRef.current = io(SOCKET_URL, { auth: { token } });

    socketRef.current.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, _new: true }]);
    });

    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openRoom = async (room) => {
    setActiveRoom(room);
    socketRef.current?.emit('join-room', { roomId: room.id });
    const { data } = await chatAPI.getMessages(room.id);
    setMessages(data.data.messages);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom || sending) return;
    setSending(true);
    socketRef.current?.emit('send-message', { roomId: activeRoom.id, content: newMessage.trim() });
    setNewMessage('');
    setTimeout(() => setSending(false), 300);
  };

  const getRoomTitle = (room) => {
    if (user.role === 'TENANT') return room.listing?.title || 'Chat';
    return room.interest?.tenant?.name || 'Chat';
  };

  const getRoomSub = (room) => {
    if (user.role === 'TENANT') return room.listing?.location || '';
    return room.interest?.tenant?.email || '';
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <DashboardLayout>
      <div className="mb-6" style={{ animation: 'fadeUp .4s ease both' }}>
        <p className="section-label mb-1">Messaging</p>
        <h1 className="text-3xl font-black text-white">Chat</h1>
      </div>

      {loading ? <Loader /> : (
        <div className="card flex overflow-hidden" style={{ height: 'calc(100vh - 13rem)', animation: 'fadeUp .4s .1s ease both', opacity:0, animationFillMode:'forwards' }}>

          {/* ── Room list ── */}
          <div className="w-72 flex-shrink-0 border-r border-white/6 flex flex-col">
            <div className="p-4 border-b border-white/6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rooms.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-600">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">No active chats yet. Interest must be accepted first.</p>
                </div>
              ) : rooms.map((room) => {
                const isActive = activeRoom?.id === room.id;
                const title    = getRoomTitle(room);
                const initial  = title?.charAt(0).toUpperCase();
                return (
                  <button
                    key={room.id}
                    onClick={() => openRoom(room)}
                    className={`w-full text-left px-4 py-3.5 border-b border-white/4 transition-all duration-200 flex items-center gap-3 ${
                      isActive ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : 'hover:bg-white/4'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isActive ? 'bg-primary-500/30 text-primary-300' : 'bg-white/8 text-slate-400'
                    }`}>
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {title}
                      </p>
                      <p className="text-xs text-slate-600 truncate">{getRoomSub(room)}</p>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Message pane ── */}
          <div className="flex-1 flex flex-col min-w-0">
            {activeRoom ? (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-white/6 flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
                    {getRoomTitle(activeRoom).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{getRoomTitle(activeRoom)}</p>
                    <p className="text-xs text-emerald-400">Active</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} msg-enter`}
                        style={{ animationDelay: msg._new ? '0ms' : `${Math.min(i * 20, 200)}ms` }}
                      >
                        <div className={`max-w-xs lg:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-primary-500 text-white rounded-br-sm'
                            : 'glass text-slate-200 rounded-bl-sm border border-white/8'
                        }`}>
                          {!isMine && msg.sender?.name && (
                            <p className="text-xs font-semibold mb-1 opacity-60">{msg.sender.name}</p>
                          )}
                          <p className="leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1.5 ${isMine ? 'text-primary-200 opacity-70' : 'text-slate-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-white/6 flex gap-3 flex-shrink-0">
                  <input
                    ref={inputRef}
                    className="input-field flex-1"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                  />
                  <button
                    type="submit"
                    className="btn-primary px-4 py-2.5 flex-shrink-0"
                    disabled={!newMessage.trim() || sending}
                  >
                    <SendIcon />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-600">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Select a conversation</p>
                <p className="text-slate-600 text-sm mt-1">Choose a chat from the left to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Chat;
