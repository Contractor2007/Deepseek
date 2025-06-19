"use client"
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = ()=>{
    return useContext(AppContext)
}

export const AppContextProvider =({children})=>{
    const {user}=useUser()
    const {getToken}=useAuth()

    const [chats,setChats]=useState([])
    const [selectedChat,setSelectedChats]=useState(null)

    const createNewChat = async ()=>{
       try {
        if (!user) return null;

        const token = await getToken();

        await axios.post('/api/chat/create',{},{headers:{
            Authorization:`Bearer ${token}`
        }})

        fetchUsersChat();
       } catch (error) {
          toast.error(error.message)
       }
    }

    const fetchUsersChat=async()=>{
        try {
            const token = await getToken();

        const {data}= await axios.get('/api/chat/get',{headers:{
            Authorization:`Bearer ${token}`
        }})
        if(data.success){
            console.log(data.data)
            setChats(data.data)

            //If User has no chats create one 
            if(data.data.length===0){
                await createNewChat();
                return fetchUsersChat();
            }else{
                //sort chats by updated date
                data.data.sort((a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt));

                //Set recently updated chat as selected chat
                setSelectedChats(data.data[0]);
                console.log(data.data[0])
            }
        }else{
            toast.error(data.message)
        }
        } catch (error) {
             toast.error(data.message)
        }
    }

    useEffect(()=>{
           if(user){
            fetchUsersChat()
           }
    },[user])


    const value= {
        user,
        chats,
        setChats,
        selectedChat,
        setSelectedChats,
        fetchUsersChat,
        createNewChat
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}