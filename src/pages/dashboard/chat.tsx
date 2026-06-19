import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import SideBar from '@/components/SideBar/sideBar';
import { useAuth } from '@/utils/auth';
import {
  getThreadsForUser,
  getThread,
  sendMessage,
  deleteMessageForEveryone,
  deleteMessageForMe,
  deleteThread,
  ChatThread,
  ChatMessage,
} from '@/utils/chatStorage';
import styles from './chat.module.css';
import layoutStyles from './Dashboard.module.css';
import { BARBER_DETAIL } from '@/data/mockBarber';

interface ContextMenu {
  messageId: string;
  senderId: string;
  x: number;
  y: number;
}

interface ConfirmDelete {
  type: 'thread';
  thread: ChatThread;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [inputText, setInputText] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // ──────────────────────────────────────────────
  // Auth guard
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // ──────────────────────────────────────────────
  // Tutup context menu saat klik di luar
  // ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ──────────────────────────────────────────────
  // Load threads whenever user changes
  // ──────────────────────────────────────────────
  const loadThreads = useCallback((autoSelect = false) => {
    if (!user) return;

    const lookupId = user.role === 'owner' ? BARBER_DETAIL.id : user.id;
    const loaded = getThreadsForUser(lookupId, user.role);

    if (user.role === 'customer' && loaded.length === 0) {
      const emptyThread: ChatThread = {
        threadId: `${user.id}_${BARBER_DETAIL.id}`,
        customerId: user.id,
        customerName: user.name,
        ownerId: BARBER_DETAIL.id,
        ownerName: BARBER_DETAIL.name,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
      setThreads([emptyThread]);
      if (autoSelect) setActiveThread(emptyThread);
    } else {
      setThreads(loaded);
      if (autoSelect && loaded.length > 0) {
        const full = getThread(loaded[0].customerId, loaded[0].ownerId) || loaded[0];
        setActiveThread(full);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) loadThreads(true);
  }, [user, loadThreads]);

  // ──────────────────────────────────────────────
  // Auto scroll ke bawah setiap ada pesan baru
  // ──────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages?.length]);

  // ──────────────────────────────────────────────
  // Handlers
  // ──────────────────────────────────────────────
  const handleSelectThread = (thread: ChatThread) => {
    const full = getThread(thread.customerId, thread.ownerId) || thread;
    setActiveThread(full);
    setContextMenu(null);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !activeThread) return;

    const newMsg = sendMessage(
      activeThread.customerId,
      activeThread.customerName,
      activeThread.ownerId,
      activeThread.ownerName,
      {
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        text: inputText.trim(),
      }
    );

    setActiveThread(prev =>
      prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev
    );
    setInputText('');
    loadThreads(false);
  };

  // ── Context menu (klik kanan / long press) ──
  const handleMessageContextMenu = (
    e: React.MouseEvent,
    msg: ChatMessage
  ) => {
    e.preventDefault();
    // Hitung posisi agar menu tidak keluar layar
    const menuWidth = 220;
    const menuHeight = 110;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);
    setContextMenu({ messageId: msg.id, senderId: msg.senderId, x, y });
  };

  const handleDeleteForEveryone = () => {
    if (!contextMenu || !activeThread || !user) return;
    const updated = deleteMessageForEveryone(
      activeThread.customerId,
      activeThread.ownerId,
      contextMenu.messageId
    );
    if (updated) setActiveThread({ ...updated });
    setContextMenu(null);
    loadThreads(false);
  };

  const handleDeleteForMe = () => {
    if (!contextMenu || !activeThread || !user) return;
    const updated = deleteMessageForMe(
      activeThread.customerId,
      activeThread.ownerId,
      contextMenu.messageId,
      user.id
    );
    if (updated) setActiveThread({ ...updated });
    setContextMenu(null);
    loadThreads(false);
  };

  // ── Hapus seluruh thread (owner only) ──
  const handleDeleteThread = (thread: ChatThread) => {
    setConfirmDelete({ type: 'thread', thread });
  };

  const confirmDeleteThread = () => {
    if (!confirmDelete || !user) return;
    const { thread } = confirmDelete;
    deleteThread(thread.customerId, thread.ownerId);
    // Jika thread yang dihapus sedang aktif, reset
    if (activeThread?.threadId === thread.threadId) {
      setActiveThread(null);
    }
    setConfirmDelete(null);
    loadThreads(false);
  };

  // Apakah user bisa "hapus untuk semua"? Hanya pengirim pesan itu
  const canDeleteForEveryone = contextMenu
    ? contextMenu.senderId === user?.id
    : false;

  // ──────────────────────────────────────────────
  // Guard: tunggu auth selesai
  // ──────────────────────────────────────────────
  if (isLoading || !isAuthenticated || !user) return null;

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  return (
    <>
      <title>Chat | Cukurin</title>
      <div className={layoutStyles.dashboard}>
        <SideBar />

        <div className={styles.chatContainer}>
          <div className={styles.chatLayout}>

            {/* ── Sidebar Kontak ── */}
            <div className={styles.contactsSidebar}>
              <div className={styles.contactsHeader}>
                <h2 className={styles.contactsTitle}>
                  {user.role === 'owner' ? '📥 Pesan Pelanggan' : '💬 Pesan'}
                </h2>
              </div>

              <div className={styles.contactList}>
                {threads.length === 0 ? (
                  <p style={{ padding: '20px', color: 'var(--text-secondary)', textAlign: 'center', fontSize: '0.9rem' }}>
                    {user.role === 'owner'
                      ? 'Belum ada pesan masuk dari pelanggan.'
                      : 'Belum ada percakapan.'}
                  </p>
                ) : (
                  threads.map(t => {
                    const isActive = activeThread?.threadId === t.threadId;
                    const displayName = user.role === 'owner' ? t.customerName : t.ownerName;
                    const visibleMsgs = t.messages.filter(m =>
                      !m.deletedForEveryone &&
                      !(m.deletedFor?.includes(user.id))
                    );
                    const lastMsg = visibleMsgs.length > 0
                      ? visibleMsgs[visibleMsgs.length - 1].text
                      : 'Mulai percakapan...';

                    return (
                      <div
                        key={t.threadId}
                        className={`${styles.contactItem} ${isActive ? styles.contactItemActive : ''}`}
                        onClick={() => handleSelectThread(t)}
                      >
                        <div className={styles.contactAvatar}>
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.contactInfo}>
                          <div className={styles.contactName}>{displayName}</div>
                          <div className={styles.contactPreview}>{lastMsg}</div>
                        </div>
                        {/* Tombol hapus percakapan — tampil untuk semua role */}
                        <button
                          className={styles.deleteThreadBtn}
                          title="Hapus percakapan"
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteThread(t);
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Area Chat Utama ── */}
            <div className={styles.chatArea} onClick={() => setContextMenu(null)}>
              {!activeThread ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateIcon}>💬</div>
                  <h2>Pilih percakapan</h2>
                  <p>Klik kontak di kiri untuk membuka pesan.</p>
                </div>
              ) : (
                <>
                  {/* Header chat */}
                  <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderAvatar}>
                      {(user.role === 'owner'
                        ? activeThread.customerName
                        : activeThread.ownerName
                      ).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.chatHeaderName}>
                        {user.role === 'owner'
                          ? activeThread.customerName
                          : activeThread.ownerName}
                      </div>
                      <div className={styles.chatHeaderStatus}>Online</div>
                    </div>
                  </div>

                  {/* Daftar pesan */}
                  <div className={styles.messageList}>
                    {activeThread.messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                        Belum ada pesan. Kirim pesan pertamamu! 👋
                      </div>
                    ) : (
                      activeThread.messages.map(msg => {
                        // Sembunyikan pesan yang dihapus untuk user ini
                        const hiddenForMe = msg.deletedFor?.includes(user.id);
                        if (hiddenForMe) return null;

                        const isSelf = msg.senderRole === user.role;
                        const isDeletedForAll = msg.deletedForEveryone;

                        return (
                          <div
                            key={msg.id}
                            className={`${styles.messageWrapper} ${isSelf ? styles.messageWrapperSelf : styles.messageWrapperOther}`}
                            onContextMenu={e => !isDeletedForAll && handleMessageContextMenu(e, msg)}
                          >
                            {/* Label nama pengirim (hanya tampil di sisi lawan) */}
                            {!isSelf && !isDeletedForAll && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', marginLeft: '4px' }}>
                                {msg.senderName}
                              </div>
                            )}
                            <div
                              className={`${styles.messageBubble} ${isSelf ? styles.messageBubbleSelf : styles.messageBubbleOther} ${isDeletedForAll ? styles.messageBubbleDeleted : ''}`}
                            >
                              {isDeletedForAll ? (
                                <span className={styles.deletedText}>
                                  🚫 Pesan ini telah dihapus
                                </span>
                              ) : (
                                <>
                                  {msg.text}
                                  <div className={styles.messageTime}>
                                    {new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input pesan */}
                  <div className={styles.inputArea}>
                    <form className={styles.inputForm} onSubmit={handleSend}>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder={
                          user.role === 'owner'
                            ? 'Balas pesan pelanggan...'
                            : 'Tulis pesan ke barbershop...'
                        }
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                      />
                      <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={!inputText.trim()}
                        title="Kirim"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── Context Menu (klik kanan) ── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {canDeleteForEveryone && (
            <button
              className={styles.contextMenuItem}
              onClick={handleDeleteForEveryone}
            >
              {/* Trash icon – hapus untuk semua */}
              <svg className={styles.contextMenuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Hapus untuk semua
            </button>
          )}
          <button
            className={`${styles.contextMenuItem} ${styles.contextMenuItemSafe}`}
            onClick={handleDeleteForMe}
          >
            {/* Eye-off icon – hapus untuk saya */}
            <svg className={styles.contextMenuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            Hapus untuk saya
          </button>
          <button
            className={`${styles.contextMenuItem} ${styles.contextMenuItemCancel}`}
            onClick={() => setContextMenu(null)}
          >
            {/* X icon – batal */}
            <svg className={styles.contextMenuIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            Batal
          </button>
        </div>
      )}

      {/* ── Modal Konfirmasi Hapus Thread ── */}
      {confirmDelete && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className={styles.modalTitle}>Hapus Percakapan?</h3>
            <p className={styles.modalDesc}>
              Semua pesan dalam percakapan ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setConfirmDelete(null)}
              >
                Batal
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={confirmDeleteThread}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
