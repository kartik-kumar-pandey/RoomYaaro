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
          <div className={`w-full md:w-72 flex-shrink-0 md:border-r border-white/6 flex flex-col ${activeRoom ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-white/6 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conversations</p>
              <span className="badge badge-primary text-[10px] px-2 py-0.5">{rooms.length} active</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-white/4">
              {rooms.length === 0 ? (
                <div className="p-8 text-center mt-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">No active chats yet. Express interest and get accepted first to chat!</p>
                </div>
              ) : rooms.map((room) => {
                const isActive = activeRoom?.id === room.id;
                const title    = getRoomTitle(room);
                const initial  = title?.charAt(0).toUpperCase();
                return (
                  <button
                    key={room.id}
                    onClick={() => openRoom(room)}
                    className={`w-full text-left px-4 py-4 transition-all duration-200 flex items-center gap-3 ${
                      isActive ? 'bg-primary-500/10 border-l-4 border-l-primary-500' : 'hover:bg-white/4'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      isActive ? 'bg-primary-500/30 text-primary-300' : 'bg-white/5 text-slate-400 border border-white/5'
                    }`}>
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{getRoomSub(room)}</p>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Message pane ── */}
          <div className={`flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900/10 ${!activeRoom ? 'hidden md:flex' : 'flex'}`}>
            {activeRoom ? (
              <>
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 dark:border-white/6 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveRoom(null)} 
                      className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1 mr-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400 border border-primary-500/15">
                      {getRoomTitle(activeRoom).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-sm leading-snug">{getRoomTitle(activeRoom)}</p>
                      <p className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                        Online
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-100/30 dark:bg-slate-950/20">
                  {messages.map((msg, i) => {
                    const isMine = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id || i}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} msg-enter`}
                        style={{ animationDelay: msg._new ? '0ms' : `${Math.min(i * 20, 200)}ms` }}
                      >
                        <div className={`max-w-[85%] sm:max-w-xs lg:max-w-sm px-4 py-3 rounded-2xl text-sm shadow-sm transition-all ${
                          isMine
                            ? 'bg-gradient-to-tr from-primary-600 to-indigo-500 text-white rounded-br-none shadow-md shadow-primary-500/10'
                            : 'bg-white dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/80 dark:border-white/8 shadow-sm'
                        }`}>
                          {!isMine && msg.sender?.name && (
                            <p className="text-[10px] font-bold mb-1 opacity-60 tracking-wide uppercase">{msg.sender.name}</p>
                          )}
                          <p className="leading-relaxed break-words">{msg.content}</p>
                          <p className={`text-[10px] text-right mt-1.5 ${isMine ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                            {formatTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 dark:border-white/6 bg-white/80 dark:bg-slate-950/10 flex gap-3 flex-shrink-0">
                  <input
                    ref={inputRef}
                    className="input-field flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/8"
                    placeholder="Type a message…"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
                  />
                  <button
                    type="submit"
                    className="btn-primary w-11 h-11 p-0 flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-primary-600 to-indigo-500 hover:from-primary-700 hover:to-indigo-600 active:from-primary-800 active:to-indigo-700 shadow-md shadow-primary-500/10"
                    disabled={!newMessage.trim() || sending}
                  >
                    <SendIcon />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-slate-500 border border-white/5">
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
                <p className="text-slate-300 font-bold">Select a conversation</p>
                <p className="text-slate-500 text-xs mt-1">Choose a chat from the left panel to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Chat;
