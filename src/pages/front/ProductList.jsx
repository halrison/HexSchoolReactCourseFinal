import {useContext, useEffect, useCallback, useMemo, useState} from "react"
import {NavLink} from "react-router"
import {http} from "../../utils"
import ToastContext from "../../contexts/useToast"
import Card from "../../components/Card"
import Loading from "../../components/Loading"
import Pagination from "../../components/Pagination"
function ProductList () {
    const {pushMessages} = useContext(ToastContext)
    const [isLoading, setIsLoading] = useState(false)
    const [paginator, setPaginator] = useState({})
    const [products, setProducts] = useState([])
    const [selectedCategory, setSelectedCategory] = useState("")
    const getProducts = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/products`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setPaginator(response.data.pagination)
                    setProducts(response.data.products)
                }
                else pushMessages({
                    type: 'warning',
                    title: '取得商品失敗'
                })
            }).catch(error => {
                pushMessages({
                    type: 'danger',
                    title: '取得產品列表失敗',
                    content: error.response.data.message
                })
            }).finally(() => {setIsLoading(false)})
        },
        [pushMessages]
    )
    const categories = useMemo(
        () => products.map(product => product.category),
        [products]
    )
    const filteredProducts = useMemo(
        () => {
            if (selectedCategory === "favorite") {
                const favoriteList = localStorage.getItem('favorite') ? JSON.parse(localStorage.getItem('favorite')) : []
                return products.filter(product => favoriteList.includes(product.id))
            }else if(selectedCategory)return products.filter(product=>product.category===selectedCategory)
            else return products
        },
        [products, selectedCategory]
    )
    useEffect(
        () => {getProducts(1)},
        [getProducts]
    )
    return isLoading ? <Loading loading={isLoading} /> : (
        <div className="container">
            <div className="row">
                <nav className="col-md-3 bg-light float-start">
                    <div className="position-sticky pt-3 h-100">
                        <p>分類篩選</p>
                        <select className="form-select" value={selectedCategory} onChange={event => {setSelectedCategory(event.target.value)}}>
                            <option value="">全部</option>
                            <option value="favorite">最愛</option>
                            {categories?.map(category =>
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            )}
                        </select>
                    </div>
                </nav>
                <div className="col-md-9 mt-1">
                    <div className="card-group row">
                        {filteredProducts?.map(product =>
                            <div className="col-12 col-md-6 col-lg-4 mb-3" key={product.id}>
                                <Card
                                    image={{url: product.imageUrl, alt: product.title}}
                                    slot={{
                                        header: (
                                            <div className="card-header">
                                                <NavLink to={`/product?id=${product.id}`} className="text-decoration-none">
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
                                    }}
                                />
                            </div>)
                        }
                    </div>
                </div>
            </div>
            {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getProducts} />}
        </div>
    )
}
export default ProductList