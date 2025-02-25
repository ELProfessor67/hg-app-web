import React from 'react'
import { MdStarRate } from "react-icons/md";

const Message = ({ message, name, isOwner }) => {
  return (
    <div class="flex flex-row items-center gap-2 other my-4">
      <div class="avatar">{name?.slice(0,2)?.toUpperCase()}</div>
      <div class="w-100">
        <div class="d-flex align-items-center flex flex-row items-center gap-5">
          <div class="fw-bold text-black/60">{isOwner && <MdStarRate size={20} color='yellow'/>} {name}</div>
          <div class="message-info text-black opacity-40">June 1 2024, 10:30 AM</div>
        </div>
        <div class="">
          <div class="message-content text-black/90 mt-1">{message}</div>
        </div>
      </div>
    </div>
  )
}

export default Message