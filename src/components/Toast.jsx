import Message from "./Message"
function Toast ({messages}) {    
    return (
        <div className="toast-container position-fixed top-0 end-0 p-3">
            {messages?.map((message, index) => <Message key={index} message={message} />)}
        </div>
    )
}
export default Toast