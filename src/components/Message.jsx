import {Toast} from "bootstrap"
import {useEffect, useRef} from "react"
function Message ({message}) {
    const toastRef = useRef(null)
    const bsToast = useRef(null)
    useEffect(
        () => {
            bsToast.current = new Toast(
                toastRef.current,
                {
                    delay: 5000,
                    animation: true
                }
            )
            bsToast.current.show()
        },
        []
    )
return (
        <div
        className='toast show'
        role='alert'
        aria-live='assertive'
        aria-atomic='true'
        ref={toastRef}
        >
            <div className='toast-header text-black'>
                <span className={`p-2 me-2 d-inline-block badge rounded-pill bg-${message.type}`}> </span>
                <strong className="me-auto">{message.title}</strong>
                <small className="text-muted">{new Date().toLocaleTimeString()}</small>
            </div>
        {message?.content&&<div className='toast-body'>{message.content}</div>}
        </div>
    );
}
export default Message;
