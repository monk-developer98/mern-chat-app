import React from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { X } from 'lucide-react';

const ChatHeader = () => {
    const {selecteUser , setSelectedUser} = useChatStore();
    const {onlineUsers} = useAuthStore()
  return (
    <div className='p-2.5 border-b border-base-300 '>
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
                <div className='avatar'>
                    <div className='size-12 rounded-full relative'>
                        <img src={selecteUser.profilePic || "/avatar.png"} alt={selecteUser.fullName} />
                    </div>
                </div>

                <div>
                    <h3 className='font-medium'> {selecteUser.fullName}</h3>
                    <p className='text-sm text-base-content/70'>
                        {onlineUsers.includes(selecteUser._id) ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            <button onClick={()=>setSelectedUser(null)}>
                <X />
            </button>
        </div>
    </div>
  )
}

export default ChatHeader