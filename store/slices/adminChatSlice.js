import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  activeConversation: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  isMessagesLoading: false,
  error: null,
  conversationsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  messagesPagination: {
    page: 1,
    limit: 30,
    total: 0,
    totalPages: 0,
  },
};

const adminChatSlice = createSlice({
  name: "adminChat",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMessagesLoading: (state, action) => {
      state.isMessagesLoading = action.payload;
    },
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    setConversationsPagination: (state, action) => {
      state.conversationsPagination = {
        ...state.conversationsPagination,
        ...action.payload,
      };
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    appendMessages: (state, action) => {
      state.messages = [...action.payload, ...state.messages];
    },
    addNewMessage: (state, action) => {
      const msg = action.payload;
      if (!msg) return;
      const exists = state.messages.find((m) => m.id === msg.id);
      if (!exists) state.messages.push(msg);
    },
    setMessagesPagination: (state, action) => {
      state.messagesPagination = {
        ...state.messagesPagination,
        ...action.payload,
      };
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    markConversationRead: (state, action) => {
      const convId = action.payload;
      const idx = state.conversations.findIndex(
        (c) => c.id === convId
      );
      if (idx !== -1) {
        state.conversations[idx] = {
          ...state.conversations[idx],
          unreadCount: 0,
        };
      }
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      const idx = state.conversations.findIndex(
        (c) => c.id === conversationId
      );
      if (idx !== -1) {
        state.conversations[idx] = {
          ...state.conversations[idx],
          lastMessage: message,
          lastMessageAt: message.createdAt,
        };
      }
    },
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        (c) => c.id !== action.payload
      );
      if (state.activeConversation?.id === action.payload) {
        state.activeConversation = null;
        state.messages = [];
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (m) => m.id !== action.payload
      );
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setMessagesLoading,
  setConversations,
  setConversationsPagination,
  setActiveConversation,
  setMessages,
  appendMessages,
  addNewMessage,
  setMessagesPagination,
  setUnreadCount,
  markConversationRead,
  updateConversationLastMessage,
  removeConversation,
  removeMessage,
  setError,
  clearError,
} = adminChatSlice.actions;

export default adminChatSlice.reducer;