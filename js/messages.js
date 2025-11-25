let currentChatUser = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadConversations();
    
    // Check if we need to open a specific chat
    const openChatWith = localStorage.getItem('openChatWith');
    if (openChatWith) {
        setTimeout(() => {
            openChat(parseInt(openChatWith));
            localStorage.removeItem('openChatWith');
        }, 1000);
    }
    
    // Auto-refresh messages every 5 seconds
    setInterval(refreshCurrentChat, 5000);
});

function checkAuth() {
    currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

async function loadConversations() {
    try {
        // Get all messages for current user
        const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
        const userMessages = allMessages.filter(m => 
            m.sender_id === currentUser.id || m.receiver_id === currentUser.id
        );

        // Group by conversation partner
        const conversations = {};
        userMessages.forEach(message => {
            const partnerId = message.sender_id === currentUser.id ? message.receiver_id : message.sender_id;
            if (!conversations[partnerId]) {
                conversations[partnerId] = {
                    partnerId: partnerId,
                    partnerName: getPartnerName(partnerId),
                    lastMessage: message.message,
                    lastMessageTime: message.created_at,
                    unreadCount: 0
                };
            }
            
            // Update last message if this is newer
            if (new Date(message.created_at) > new Date(conversations[partnerId].lastMessageTime)) {
                conversations[partnerId].lastMessage = message.message;
                conversations[partnerId].lastMessageTime = message.created_at;
            }
            
            // Count unread messages
            if (message.receiver_id === currentUser.id && !message.is_read) {
                conversations[partnerId].unreadCount++;
            }
        });

        displayConversations(Object.values(conversations));
        updateMessageBadge(Object.values(conversations));
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function getPartnerName(partnerId) {
    // Get from localStorage or use User ID
    const currentUser = JSON.parse(localStorage.getItem('user'));
    
    // If it's a real user from items, get their name
    const allItems = JSON.parse(localStorage.getItem('allItems') || '[]');
    const userItem = allItems.find(item => item.user_id == partnerId);
    
    if (userItem && userItem.owner_name) {
        return userItem.owner_name;
    }
    
    // Fallback to stored user names or generic name
    const userNames = JSON.parse(localStorage.getItem('userNames') || '{}');
    return userNames[partnerId] || `User ${partnerId}`;
}

function displayConversations(conversations) {
    const container = document.getElementById('chatList');
    
    if (conversations.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No conversations yet.</p>';
        return;
    }

    // Sort by last message time
    conversations.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    container.innerHTML = conversations.map(conv => `
        <div class="chat-item ${conv.unreadCount > 0 ? 'unread' : ''}" onclick="openChat(${conv.partnerId})">
            <div class="avatar avatar-sm">${conv.partnerName.charAt(0)}</div>
            <div class="chat-item-content">
                <div class="chat-item-header">
                    <span class="chat-item-name">${conv.partnerName}</span>
                    <span class="chat-item-time">${formatMessageTime(conv.lastMessageTime)}</span>
                </div>
                <div class="chat-item-message">${conv.lastMessage}</div>
                ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
            </div>
        </div>
    `).join('');
}

function updateMessageBadge(conversations) {
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const badge = document.getElementById('messageBadge');
    
    if (badge) {
        if (totalUnread > 0) {
            badge.textContent = totalUnread;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function openChat(partnerId) {
    currentChatUser = {
        id: partnerId,
        name: getPartnerName(partnerId)
    };

    // Update chat header
    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputContainer').style.display = 'flex';
    document.getElementById('chatAvatar').textContent = currentChatUser.name.charAt(0);
    document.getElementById('chatUserName').textContent = currentChatUser.name;
    document.getElementById('chatUserStatus').textContent = 'Online';

    // Load messages
    loadChatMessages(partnerId);
    
    // Mark messages as read
    markMessagesAsRead(partnerId);
    
    // Update active chat item
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.chat-item')?.classList.add('active');
}

function loadChatMessages(partnerId) {
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const chatMessages = allMessages.filter(m => 
        (m.sender_id === currentUser.id && m.receiver_id === partnerId) ||
        (m.sender_id === partnerId && m.receiver_id === currentUser.id)
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    displayChatMessages(chatMessages);
}

function displayChatMessages(messages) {
    const container = document.getElementById('chatMessages');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="empty-chat">
                <h3>👋 Start a conversation</h3>
                <p>Send a message to ${currentChatUser.name}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = messages.map(message => `
        <div class="message-bubble ${message.sender_id === currentUser.id ? 'own' : ''}">
            <div class="message-content">
                ${message.message}
                <div class="message-time">${formatMessageTime(message.created_at)}</div>
            </div>
        </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

function formatMessageTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else {
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    }
}

async function sendMessage(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentChatUser) return;

    const message = {
        id: Date.now(),
        sender_id: currentUser.id,
        receiver_id: currentChatUser.id,
        message: messageText,
        is_read: false,
        created_at: new Date().toISOString()
    };

    // Save message
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('messages', JSON.stringify(allMessages));

    // Create notification for receiver
    await createNotification(currentChatUser.id, 'New Message', 
        `${currentUser.name}: ${messageText}`, 'message');

    // Clear input
    messageInput.value = '';

    // Refresh chat
    loadChatMessages(currentChatUser.id);
    loadConversations();
}

function markMessagesAsRead(partnerId) {
    const allMessages = JSON.parse(localStorage.getItem('messages') || '[]');
    const updatedMessages = allMessages.map(message => {
        if (message.sender_id === partnerId && message.receiver_id === currentUser.id) {
            return { ...message, is_read: true };
        }
        return message;
    });
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
}

function refreshCurrentChat() {
    if (currentChatUser) {
        loadChatMessages(currentChatUser.id);
        loadConversations();
    }
}

function viewUserProfile() {
    if (currentChatUser) {
        alert(`Viewing profile of ${currentChatUser.name}`);
    }
}

async function createNotification(userId, title, message, type) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({
        id: Date.now(),
        user_id: userId,
        title: title,
        message: message,
        type: type,
        is_read: false,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
}