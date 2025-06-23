"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChats] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;

      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // After creating a new chat, fetch updated chats
      await fetchUsersChat();
    } catch (error) {
      toast.error(error?.message || "Failed to create chat");
    }
  };

  const fetchUsersChat = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        // Sort chats by updated date descending
        const sortedChats = data.data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setChats(sortedChats);

        if (sortedChats.length === 0) {
          // If no chats, create one then fetch again
          await createNewChat();
        } else {
          // Set most recently updated chat as selected
          setSelectedChats(sortedChats[0]);
        }
      } else {
        toast.error(data.message || "Failed to fetch chats");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to fetch chats");
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsersChat();
    }
  }, [user]);

  const value = {
    user,
    chats,
    setChats,
    selectedChat,
    setSelectedChats,
    fetchUsersChat,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
