import {useEffect, useImperativeHandle, useRef} from 'react';
import {Modal as BootstrapModal} from 'bootstrap';
// 1. 主要父元件
const Modal = ({children, ref, size}) => {
    const modalRef = useRef(null);
    let bsModal = useRef(null);
    useEffect(
        () => {
            if (modalRef.current) {
                // 初始化 Bootstrap Modal 實例
                bsModal.current = new BootstrapModal(
                    modalRef.current,
                    {backdrop: 'static'}
                );
            }
            return () => {bsModal.current.hide()}
        },
        []
    );
    useImperativeHandle(
        ref,
        function () {
            return {
                show: () => {bsModal.current.show()},
                hide: () => {bsModal.current.hide()}
            }
        }
    )
    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1">
            <div className={`modal-dialog modal-${size}`}>
                <div className="modal-content">{children}</div>
            </div>
        </div>
    );
};
// 2. 子元件：Header
Modal.Header = function Header ({title}) {
    return (
        <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
        </div>
    );
};
// 3. 子元件：Body
Modal.Body = function Body ({children}) {return <div className="modal-body">{children}</div>}
// 4. 子元件：Footer
Modal.Footer = function Footer ({children}) {return <div className="modal-footer">{children}</div>}

export default Modal