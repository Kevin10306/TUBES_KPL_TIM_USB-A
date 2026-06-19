export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'owner';
  text: string;
  timestamp: string;
  deletedForEveryone?: boolean;         // true = dihapus untuk semua
  deletedFor?: string[];                // list userId yang menghapus "untuk saya"
}

export interface ChatThread {
  threadId: string; // usually `${customerId}_${ownerId}`
  customerId: string;
  customerName: string;
  ownerId: string;
  ownerName: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

const CHAT_STORAGE_KEY = 'cukurin_chats';

export const getChats = (): Record<string, ChatThread> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveChats = (chats: Record<string, ChatThread>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
  }
};

export const getThread = (customerId: string, ownerId: string): ChatThread | null => {
  const chats = getChats();
  const threadId = `${customerId}_${ownerId}`;
  return chats[threadId] || null;
};

export const sendMessage = (
  customerId: string,
  customerName: string,
  ownerId: string,
  ownerName: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  const chats = getChats();
  const threadId = `${customerId}_${ownerId}`;
  
  const newMessage: ChatMessage = {
    ...message,
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  if (!chats[threadId]) {
    chats[threadId] = {
      threadId,
      customerId,
      customerName,
      ownerId,
      ownerName,
      messages: [newMessage],
      lastUpdated: new Date().toISOString(),
    };
  } else {
    chats[threadId].messages.push(newMessage);
    chats[threadId].lastUpdated = new Date().toISOString();
  }

  saveChats(chats);
  return newMessage;
};

/** Hapus pesan untuk semua orang — pesan diganti placeholder */
export const deleteMessageForEveryone = (
  customerId: string,
  ownerId: string,
  messageId: string
): ChatThread | null => {
  const chats = getChats();
  const threadId = `${customerId}_${ownerId}`;
  const thread = chats[threadId];
  if (!thread) return null;

  thread.messages = thread.messages.map(m =>
    m.id === messageId
      ? { ...m, deletedForEveryone: true, text: '' }
      : m
  );

  saveChats(chats);
  return thread;
};

/** Hapus pesan hanya untuk saya — pesan tetap ada tapi disembunyikan untuk userId ini */
export const deleteMessageForMe = (
  customerId: string,
  ownerId: string,
  messageId: string,
  userId: string
): ChatThread | null => {
  const chats = getChats();
  const threadId = `${customerId}_${ownerId}`;
  const thread = chats[threadId];
  if (!thread) return null;

  thread.messages = thread.messages.map(m => {
    if (m.id !== messageId) return m;
    const existing = m.deletedFor || [];
    return { ...m, deletedFor: [...existing, userId] };
  });

  saveChats(chats);
  return thread;
};

/** Hapus seluruh thread percakapan (khusus owner) */
export const deleteThread = (customerId: string, ownerId: string): void => {
  const chats = getChats();
  const threadId = `${customerId}_${ownerId}`;
  if (chats[threadId]) {
    delete chats[threadId];
    saveChats(chats);
  }
};

export const getThreadsForUser = (userId: string, role: 'customer' | 'owner'): ChatThread[] => {
  const chats = getChats();
  const threads = Object.values(chats);
  
  return threads
    .filter((t) => (role === 'customer' ? t.customerId === userId : t.ownerId === userId))
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
};
