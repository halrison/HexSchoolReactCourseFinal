import {useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {NavLink, useOutletContext, useSearchParams} from "react-router"
import {http} from "../../utils.js"
import ToastContext from "../../contexts/useToast.js"
import Loading from "../../components/Loading"
import Carousel from "../../components/Carousel"
import Card from "../../components/Card"
import MySwiper from "../../components/Swiper"
function ImageCarousel ({product}) {    
    const carousel = useRef(null)
    return (
        <Carousel ref={carousel}>
                        {Array.from(product.imagesUrl ? [product.imageUrl, ...product.imagesUrl] : [product.imageUrl]).map((image, index) => (
                            <div className={`ratio ratio-1x1 carousel-item ${index === 0 && 'active'}`} key={index}>
                                <img className="d-block img-fluid" src={image} />
                            </div>)
                        )}
        </Carousel>
    )
}
function ProductSwiper ({products}) {
    return (
        <MySwiper>
            {products.map(product =>
                <Card
                        key={product.id}
                        image={{
                            url: product.imageUrl,
                            alt: product.title
                        }}
                        slot={{
                            header: (
                                <div className="card-header">
                                    <NavLink className="text-decoration-none" to={`/product?id=${product.id}`}>
                                        <h6 className="text-center">{product.title}</h6>
                                    </NavLink>
                                </div>),
                            body: (
                                <div className="card-body">
                                    <div className="card-text" >
                                        {product.origin_price === product.price ?
                                            <div className="text-center">台幣{product.price}元</div>
                                            : <>
                                                <span className="float-start">原價{product.origin_price}元</span>
                                                <span className="float-end">特價{product.price}元</span>
                                            </>
                                        }
                                    </div>
                                </div>),
                            footer: (
                                <div className="card-footer">
                                    <div className="text-center">剩餘{product.num}{product.unit}</div>
                                </div>)
                        }} />
            )}
        </MySwiper>
    )
}
function ProductDetail () {
    const {pushMessages} = useContext(ToastContext)
    const {getCarts} = useOutletContext()
    const [searchParams] = useSearchParams()
    const [isFavorite, setIsFavorite] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [product, setProduct] = useState({})
    const [products, setProducts] = useState([])
    const [quantity, setQuantity] = useState(1)
    const id = searchParams.get("id")
    const filterProducts = useMemo(
        () => products.filter(product => product.id !== id),
        [products, id]
    )
    const favoriteList = localStorage.getItem("favorite") ? JSON.parse(localStorage.getItem("favorite")) : []
    const addToCart = () => {
        http({
            url: `/v2/api/${process.env.REACT_APP_PATH}/cart`,
            method: "post",
            data: {
                data: {
                    product_id: product.id,
                    qty: quantity
                }
            }
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: "成功加入購物車"
                })
                getCarts()
            }
            else pushMessages({
                type: 'warning',
                title: "加入購物車失敗",
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'danger',
                title: '加入購物車失敗',
                content: error
            })
        )
    }
    const favorite = () => {
        setIsFavorite(!isFavorite)
        if (favoriteList.includes(id)) {
            favoriteList.splice(favoriteList.indexOf(id), 1)
            pushMessages({
                type: 'success',
                title: "已從最愛移除"
            })
        } else {
            favoriteList.push(id)
            pushMessages({
                type: 'success',
                title: "已加入最愛"
            })
        }
        localStorage.setItem("favorite", JSON.stringify(favoriteList))
    }
    useEffect(
        () => {
            setIsLoading(true)
            http(`/v2/api/${process.env.REACT_APP_PATH}/product/${id}`)
                .then(response => {
                    if (response.data.success) setProduct(response.data.product)
                    else pushMessages({
                        type: 'warning',
                        title: "取得產品資訊失敗"
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'danger',
                        title: '取得產品資訊失敗',
                        content: error
                    })
                ).finally(() => setIsLoading(false))
        },
        [id, pushMessages]
    )
    useLayoutEffect(
        () => {
            http(`/v2/api/${process.env.REACT_APP_PATH}/products/all`)
                .then(response => {
                    if (response.data.success) setProducts(response.data.products)
                    else pushMessages({
                        type: 'warning',
                        title: "取得產品列表失敗"
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'danger',
                        title: '取得產品列表失敗',
                        content: error
                    })
                ).finally(() => getCarts())
        },
        [getCarts, pushMessages]
    )
    return isLoading ? <Loading loading={isLoading} /> :
        <div className="container mt-1">
            <div className="row justify-content-center">
                <figure className="col figure">
                    <ImageCarousel product={product}/>
                </figure>
                <div className="col">
                    <nav className="row mt-1" aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">所有商品</li>
                            <li className="breadcrumb-item active" aria-current="page">{product.category}</li>
                        </ol>
                    </nav>
                    <h2 className="fw-bold mb-1">{product.title}</h2>
                    <div className="row">
                        <div className="col-12 col-md-6">
                            {product.origin_price === product.price ?
                                <h4>{product.price} 元</h4> :
                                <>
                                    <p className="mb-0 text-muted text-end">
                                        原價<del>{product.origin_price}</del> 元
                                    </p>
                                    <h4 className="fw-bold text-end">現在只要 {product.price} 元</h4>
                                </>
                            }
                        </div>
                        <div className="col-12 col-md-6">
                            {isFavorite ?
                                <button className="btn btn-secondary input-group-prepend w-100 py-2" onClick={favorite}>
                                    <i className="fa-solid fa-heart border-0"></i> 移除最愛
                                </button> :
                                <button className="btn btn-outline-secondary input-group-prepend w-100 py-2" onClick={favorite}>
                                    <i className="fa-regular fa-heart border-0"></i> 加入最愛
                                </button>}
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-12 col-md-6">
                            <div className="input-group my-3 bg-light rounded">
                                <div className="input-group-prepend">
                                    <button className="btn btn-outline-dark border-0 py-2" type="button" onClick={() => setQuantity(quantity - 1)} disabled={quantity < 1}>
                                        <i className="bi bi-dash"></i>
                                    </button>
                                </div>
                                <input
                                    aria-label="Example text with button addon" aria-describedby="button-addon1"
                                    className="form-control border-0 text-center my-auto shadow-none bg-light"
                                     readOnly type="number" value={quantity} />
                                <div className="input-group-append">
                                    <button className="btn btn-outline-dark border-0 py-2" type="button" onClick={() => setQuantity(quantity + 1)}>
                                        <i className="bi-plus bi"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <button type="button" className="text-nowrap btn btn-dark w-100 py-2" onClick={() => addToCart(product.id)}>
                                <i className="bi bi-cart-plus"></i> 加到購物車
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row my-2">
                <div className="col border-end">
                    <h3 className="text-center">商品描述</h3>
                    <p>{product.description}</p>
                </div>
                <div className="col">
                    <h3 className="text-center">商品說明</h3>
                    <p>{product.content}</p>
                </div>
            </div>
            <h3 className="text-center">更多商品</h3>
            <div className="mb-3">
                <ProductSwiper products={filterProducts} />
            </div>
        </div>
}
export default ProductDetail;