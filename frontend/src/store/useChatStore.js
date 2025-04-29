import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";


export const useChatStore = create((set,get) => ({
    messages:[],
    users:[],
    selecteUser: null,
    isUserLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({isUserLoading: true});
        try {
            const res = await axiosInstance.get('/messages/users');
            set({users: res.data});
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response.data.message);
        }finally {
            set({isUserLoading: false});
        }
    },
    getMessages: async (id) => {
        set({isMessagesLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${id}`);
            set({messages: res.data.data});
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error(error.response.data.message);
        }finally {
            set({isMessagesLoading: false});
        }
    },

    sendMessage: async (messageData) => {
        const { selecteUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selecteUser._id}`, messageData);
            set({ messages: [...messages || [], res.data] });
            // toast.success('Message sent successfully!');
        } catch (error) {
            console.error('Error sending message:', error);
            // toast.error(error.response?.data?.message || "Something went wrong!");
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    
    subscribeToMessages: () => {
        const { selecteUser } = get();
        if(!selecteUser) return;

        const socket = useAuthStore.getState().socket;
        socket.on("newMessage", (message) => {
            if(message.senderId !== selecteUser._id) return;
            set({
                messages: [...get().messages, message],

            });
        });
    },

    unSubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selecteUser) => set({selecteUser}),

}));