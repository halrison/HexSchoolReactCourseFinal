import {useCallback, useContext, useEffect, useRef, useState} from "react"
import {Outlet, useLocation, useSearchParams} from "react-router"
import {NavLink} from "react-router-dom"
import {Collapse} from "bootstrap"
import {http} from "../utils"
import Toast from "../components/Toast"
import useToast from "../contexts/useToast"
import appleIcon from "../assets/images/apple-icon.png"
function NavBar ({carts}) {
    const collapseRef = useRef(null)
    const bsCollapse = useRef({})
    const {key} = useLocation()
    const [serarchParam] = useSearchParams()
    const id = serarchParam.get('id')
    useEffect(
        () => {
            bsCollapse.current = new Collapse(
                collapseRef.current,
                {toggle: false}
            )
        },
        []
    )
    useEffect(
        () => {
            if (document.body.offsetWidth < 992) bsCollapse.current.hide?.()
        },
        [bsCollapse, key, id]
    )
    return (
        <header className="navbar px-0 navbar-expand-lg navbar-light nav-pills">
            <NavLink
                className="navbar-brand d-flex justify-content-center"
                to="/"
                onClick={() => bsCollapse.current.hide()}
            >
                <img src={appleIcon} alt="logo" width="30" height="30" className=" align-text-top me-2" />
            </NavLink>
            <button
                className="navbar-toggler"
                type="button"
                onClick={() => bsCollapse.current.toggle()}
            >
                <span className="navbar-toggler-icon" />
            </button>
            <nav
                className="collapse navbar-collapse bg-white custom-header-md-open mt-1"
                ref={collapseRef}
            >
                <ul className="navbar-nav">
                    <li className="nav-item ms-2">
                        <NavLink to="/articles" className={({isActive}) => `nav-link ${isActive && 'active'}`}>
                            <div className="text-muted">
                                <i className="bi bi-card-text mx-1" />
                                文章
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-2">
                        <NavLink to="/products" className={({isActive}) => `nav-link ${isActive && 'active'}`}>
                            <div className="text-muted">
                                <i className="bi bi-boxes mx-1" />
                                商品
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-2">
                        <NavLink to="/orders" className={({isActive}) => `nav-link ${isActive && 'active'}`}>
                            <div className="text-muted">
                                <i className="bi bi-list-ul mx-1" />
                                訂單
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-2">
                        <NavLink to="/cart" className={({isActive}) => `nav-link position-relative ${isActive && 'active'}`}>
                            <div className="text-muted">
                                <i className="bi bi-cart mx-1" />
                                {carts?.carts?.length > 0 && <span className="position-absolute top-0 start-10 translate-middle badge rounded-pill bg-danger">
                                    {carts?.carts.length}
                                </span>}
                                購物車
                            </div>
                        </NavLink>
                    </li>
                    <li className="nav-item ms-2">
                        <NavLink to="/login" className={({isActive}) => `nav-link ${isActive && 'active'}`}>
                            <div className="text-decoration-none">
                                <i className="bi bi-box-arrow-in-right mx-1" />
                                登入
                            </div>
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    )
}
function Footer () {
    return (
        <footer className="container text-center text-white text-center">
            <div className="row">
                <div className="pt-1">© 2020 LOGO All Rights Reserved.</div>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <p className="mb-md-0 mt-2">
                    <a href="#" className="mx-3 text-white">
                        <i className="bi bi-facebook" />
                    </a>
                    <a href="#" className="mx-3 text-white">
                        <i className="bi bi-instagram" />
                    </a>
                    <a href="#" className="ms-3 text-white">
                        <i className="bi bi-line" />
                    </a>
                </p>
                <p className="mb-0">02-3456-7890</p>
                <p className="mb-0">service@mail.com</p>
                <p className="mb-0">? 2020 LOGO All Rights Reserved.</p>
            </div>
        </footer>
    )
}
function Front () {
    const {messages, postMessages} = useContext(useToast)
    const [carts, setCarts] = useState({})
    const getCarts = useCallback(() => {
        http(`/v2/api/${process.env.REACT_APP_PATH}/cart`)
            .then(response => {
                if (response.data.success) setCarts(response.data.data)
                else setCarts(response.data.messages)
            }).catch(error => {
                postMessages({type: 'danger', title: error.message})
            })
    },
        [postMessages])
    return (
        <main className="container">
            <div className="position-relative">
                <Toast messages={messages} />
            </div>
            <div className="bg-white sticky-top">
                <NavBar carts={carts} />
            </div>
            <Outlet context={{carts, getCarts}} />
            <div className="bg-dark py-1">
                <Footer />
            </div>
        </main>
    )
}
export default Front