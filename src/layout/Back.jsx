import {useContext, useEffect, useRef} from "react"
import {Outlet, useLocation} from "react-router"
import {NavLink, useNavigate} from "react-router-dom"
import {Offcanvas} from "bootstrap"
import {http} from "../utils.js"
import Toast from "../components/Toast"
import ToastContext from "../contexts/useToast.js"
import appleIcon from "../assets/images/apple-icon.png"
function SideBar () {
    const offcanvasRef = useRef(null)
    const bsOffcanvas = useRef(null)
    const location = useLocation()
    const navigate = useNavigate()
    const logout = () => {
        http({
            url: '/logout',
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
    useEffect(
        () => {
            if (document.body.offsetWidth < 992) bsOffcanvas.current.hide()
        },
        [location]
    )
    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top h-100 d-flex flex-lg-column">
            <span className="navbar-brand d-flex align-items-center">
                <img src={appleIcon} alt="logo" className="mx-1" width="30" height="30" />
                後台管理系統
            </span>
            <button
                className="navbar-toggler me-1"
                type="button"
                aria-labelledby="OffcanvasNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
                onClick={() => bsOffcanvas.current.show()}
            >
                <span className="navbar-toggler-icon" />
            </button>
            <div className="offcanvas offcanvas-end" id="OffcanvasNav" ref={offcanvasRef}>
                <div className="offcanvas-header">
                    <h5 className="offcanvas-title" id="OffcanvasNavbarLabel">後台管理系統</h5>
                    <button type="button" className="btn-close" onClick={() => bsOffcanvas.current.hide()}></button>
                </div>
                <div className="offcanvas-body">
                    <ul className="nav nav-pills flex-column">
                        <li className="mt-1 nav-item">
                            <NavLink to="/admin/products" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                <div className="text-center text-dark">
                                    <i className="fa-brands fa-product-hunt me-2" />
                                    產品
                                </div>
                            </NavLink>
                        </li>
                        <li className="mt-1 nav-item">
                            <NavLink to="/admin/coupons" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                <div className="text-center text-dark">
                                    <i className="bi bi-percent me-2" />
                                    優惠卷
                                </div>
                            </NavLink>
                        </li>
                        <li className="mt-1 nav-item">
                            <NavLink to="/admin/orders" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                <div className="text-center text-dark">
                                    <i className="bi bi-sticky me-2" />
                                    訂單
                                </div>
                            </NavLink>
                        </li>
                        <li className="mt-1 nav-item">
                            <NavLink to="/admin/articles" className={({isActive}) => `nav-link ${isActive && 'bg-primary'}`}>
                                <div className="text-center text-dark">
                                    <i className="bi bi-card-text me-2" />
                                    文章
                                </div>
                            </NavLink>
                        </li>
                        <li className="mt-1 nav-item">
                            <button type="button" className="btn btn-danger w-100" onClick={logout}>
                                <div className="text-center text-dark">
                                    <i className="bi bi-box-arrow-right me-2" />
                                    登出
                                </div>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
function Back () {
    const {messages} = useContext(ToastContext)
    return <div className="container vh-100">
        <div className="row">
            <div className="col-lg-3 col-xl-2 ms-sm-auto px-md-1">
                <SideBar />
            </div>
            <div className="col-lg-9 col-xl-10 ms-sm-auto px-md-1">
                <div className="position-relative">
                    <Toast messages={messages} />
                    <Outlet />
                </div>
            </div>
        </div>
    </div>
}
export default Back