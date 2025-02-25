import { BiSend } from 'react-icons/bi';
import { IoMdClose } from 'react-icons/io';
import { TbCircleX } from 'react-icons/tb';
import ScrollToBottom from 'react-scroll-to-bottom';


export default function ChatBox({ open, onClose, children, setName, name, message, setMessage, handleSendMessage }) {
    return (
      
        <div className={`absolute top-0 left-0 px-4 right-0 bottom-0 z-10 bg-black/5 ${open ? '' : 'hidden'}`}>
            <div className="max-w-[40rem] mx-auto mt-32 min-h-[35rem] bg-white shadow-md p-3 px-3 rounded-md flex flex-col">
                <div class="modal-dialog modal-lg modal-dialog-scrollable" style={{ display: "block", margin: 0 }}>
                    <div class="modal-content" >
                        <div class=" pb-2 mb-4 flex flex-row items-center justify-between" style={{ margin: "1rem 0", margin: 0, marginBottom: ".5rem", borderBottom: "1px solid gray", }}>
                            <h5 class="text-xl text-black" id="chatModalLabel">Chat with Radio Broadcaster</h5>
                            <button type="button" class="text-black text-2xl" onClick={onClose}>X</button>
                        </div>
                        <div className="body py-4 flex-1 overflow-auto relative" style={{ flex: 'none', height: '28rem', overflowY: 'auto' }}>
                            <ScrollToBottom className='w-full h-full'>
                                {children}
                               
                            </ScrollToBottom>
                        </div>
                        <div class="modal-footer pt-2 mt-2 border-t border-gray-600" style={{borderTop: "1px solid gray"}}>
                            <div class="w-full flex items-center flow-row gap-4">
                                <input type="text" class="flex-1 p-2 outline-none text-black fs-5 bg-gray-300 rounded-3xl" placeholder="Type your message" style={{height: "2.5rem", }} id='name' name='name' value={message} onChange={(e) => setMessage(e.target.value)}/>
                                <button type="button" class="bg-blue-500 p-2 rounded-full" onClick={handleSendMessage}><BiSend size={25}/></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}