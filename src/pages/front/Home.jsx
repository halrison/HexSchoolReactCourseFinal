import {useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {http} from "../../utils"
import ToastContext from "../../contexts/useToast"
import Loading from "../../components/Loading"
import MySwiper from "../../components/Swiper"
import Card from "../../components/Card"
import Comments from "../../Comments.json"
import Carousel from "../../components/Carousel"
function ProductSwiper ({products}) {
    return (
        <MySwiper>
            {products.map(product =>
                <div className="mx-1" key={product.id}>
                    <Card
                        image={{
                            url: product.imageUrl,
                            alt: product.title
                        }}
                        slot={{
                            header: (
                                <div className="card-header">
                                    <div className="text-decoration-none">
                                        <h6 className="text-center">{product.title}</h6>
                                    </div>
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
                </div>
            )}
        </MySwiper>
    )
}
function CommentCarousel ({comments}) {
    const carousel = useRef(null)
    return (
        <Carousel ref={carousel}>
            {comments.map((comment, index) =>
                <div key={index}
                    className={`carousel-item my-5 ${index === 0 && 'active'}`}>
                    <div className="py-7 text-center">
                        <h3>{comment.message}</h3>
                        <p>
                            <small>—{comment.author}—</small>
                        </p>
                    </div>
                </div>
            )}
        </Carousel>
    )
}
function ArticleCard ({articles}) {
    return articles.map(article =>
        <div className="row" key={article.id}>
            <div className="col-6  justify-content-center d-inline-flex">
                <img className="w-50" src={article.image} alt={article.title} />
            </div>
            <div className="col-6 m-auto justify-content-center">
                <div className="text-center">
                    <div className=" text-decoration-none">
                        <h4 className="mt-4">{article.title}</h4>
                    </div>
                    <p className="text-muted text-truncate">{article.description}</p>
                </div>
            </div >
        </div>
    )
}
function Home () {
    const {pushMessages} = useContext(ToastContext)
    const [products, setProducts] = useState([])
    const [articles, setArticles] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const filterProducts = useMemo(
        () => products.filter(product => product.is_enabled === 1),
        [products]
    )
    const filterArticles = useMemo(
        () => articles.filter(article => article.isPublic),
        [articles]
    )
    const scrollDown = () => {
        const discountArea = document.getElementById("discount-area")
        discountArea.scrollIntoView({behavior: "smooth"})
    }
    const copyCoupon = () => {
        const couponCode = document.getElementsByTagName("input")[0].value
        navigator.clipboard.writeText(couponCode)
            .then(() =>
                pushMessages({
                    type: 'success',
                    title: '折扣碼已複製',
                    content: `折扣碼已複製到剪貼簿`
                })
            )
            .catch(() =>
                pushMessages({
                    type: 'danger',
                    title: '複製失敗',
                    content: `無法複製折扣碼，請手動複製`
                })
            )
    }
    useEffect(
        () => {
            setIsLoading(true)
            http(`/v2/api/${process.env.REACT_APP_PATH}/articles`)
                .then(response => {
                    if (response.data.success) setArticles(response.data.articles)
                    else pushMessages({
                        type: 'warning',
                        title: "取得產品資訊失敗"
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'danger',
                        title: '取得產品資訊失敗',
                        content: error.response.data.message
                    })
                ).finally(() => setIsLoading(false))
        },
        [pushMessages]
    )
    useLayoutEffect(
        () => {
            http(`/v2/api/${process.env.REACT_APP_PATH}/products/all`)
                .then(response => {
                    if (response.data.success) setProducts(response.data.products)
                    else pushMessages({
                        type: 'warning',
                        title: "取得產品資訊失敗"
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'danger',
                        title: '取得產品資訊失敗',
                        content: error.response.data.message
                    })
                )
        },
        [pushMessages]
    )
    return isLoading ? <Loading loading={isLoading} /> : (
        <>
            <div className="bg-light py-7">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-4 text-center">
                            <h3 className="mt-1">Zay 生活用品店</h3>
                            <p className="text-muted">
                                你的品味，由你創造
                            </p>
                            <button className="btn btn-dark my-1 rounded-0" onClick={scrollDown}>
                                立即搶折扣
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="row mt-2">
                    <h2 className="text-center">熱門商品</h2>
                    <ProductSwiper products={filterProducts} />
                </div>
            </div>
            <div className="bg-light container">
                <div className="row m-2">
                    <h2 className="text-center mt-3">顧客評論</h2>
                    <CommentCarousel comments={Comments} />
                </div>
            </div>
            <div className="container my-5">
                <h2 className="text-center">最新文章</h2>
                <ArticleCard articles={filterArticles.slice(0, 3)} />
                <div className="row flex-md-row-reverse flex-column" id="discount-area">
                    <div className="col-md-6">
                        <img
                            src="https://images.unsplash.com/photo-1526038335545-4b96864eaee7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1867&q=80"
                            alt=""
                            className="img-fluid"
                        />
                    </div>
                    <div className="col-md-6 d-flex flex-column justify-content-center mt-md-0 mt-3">
                        <h2 className="fw-bold">領取優惠券</h2>
                        <h5 className="font-weight-normal text-muted mt-2">
                            輸入即享八折優惠
                        </h5>
                        <div className="input-group mb-0 mt-4">
                            <input readOnly
                                type="text"
                                className="form-control rounded-0"
                                value="mid-month"
                            />
                            <div className="input-group-append">
                                <button
                                    className="btn btn-dark rounded-0"
                                    type="button"
                                    id="search"
                                    onClick={copyCoupon}
                                >
                                    複製折扣碼
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default Home