import {useContext, useEffect, useRef} from "react"
import {Outlet} from "react-router"
import {NavLink, useNavigate} from "react-router-dom"
import {Offcanvas} from "bootstrap"
import {http} from "../utils.js"
import Toast from "../components/Toast"
import ToastContext from "../contexts/useToast.js"
import appleIcon from "../assets/images/apple-icon.png"
function SideBar () {
    const offcanvasRef = useRef(null)
    const bsOffcanvas = useRef(null)
    const navigate = useNavigate()
    const logout = () => {
        http({
            url: '/v2/logout',
            method: 'post'
        }).then(res => {if (res.status === 200) navigate('/login')})
    }
    useEffect(
        () => {
            bsOffcanvas.current = new Offcanvas(
                offcanvasRef.current,
                {backdrop: true}
            )
        },
        []
    )
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <p className="text-white mb-0">
                    <img src={appleIcon} alt="logo" className="me-2" style={{width: '30px'}} />
                    後台管理系統
                </p>
                <button
                    className="navbar-toggler"
                    type="button"
                    aria-labelledby="OffcanvasNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                    onClick={() => bsOffcanvas.current.show()}
                >
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="offcanvas offcanvas-end justify-content-end" id="OffcanvasNav" ref={offcanvasRef}>
                    <div className="offcanvas-header">
                        <h5 className="offcanvas-title" id="OffcanvasNavbarLabel">後台管理系統</h5>
                        <button type="button" className="btn-close" onClick={() => bsOffcanvas.current.hide()}></button>
                    </div>
                    <div className="bg-light vh-100">
                        <ul className="nav flex-column">
                            <li className="nav-item">
                                <NavLink to="/admin/products" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                    <div className="mt-1 text-dark">
                                        <i className="fa-brands fa-product-hunt me-2" />
                                        產品列表
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/admin/coupons" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                    <div className="mt-1 text-dark">
                                        <i className="bi bi-percent me-2" />
                                        優惠卷列表
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/admin/orders" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                    <div className="mt-1 text-dark">
                                        <i className="fa-solid fa-note-sticky me-2" />
                                        訂單列表
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/admin/articles" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                    <div className="mt-1 text-dark">
                                        <i className="bi bi-card-text me-2" />
                                        文章列表
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <div className="mt-1 text-dark">
                                    <button type="button" className="btn btn-danger w-100" onClick={logout}>
                                        <i className="bi bi-box-arrow-right me-2" />
                                        登出
                                    </button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    )
}
function Back () {
    const {messages} = useContext(ToastContext)
    return <div className="container vh-100">
        <div className="row">
            <div className="col-lg-2">
                <SideBar />
            </div>
            <div className="col-lg-10">
                <div className="position-relative">
                    <Toast messages={messages} />
                    <Outlet />
                </div>
            </div>
        </div>
    </div>
}
export default Back