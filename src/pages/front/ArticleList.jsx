import {useState, useMemo, useEffect, useContext, useCallback} from "react"
import {NavLink} from "react-router"
import {http} from "../../utils"
import ToastContext from "../../contexts/useToast"
import Loading from "../../components/Loading"
import Pagination from "../../components/Pagination"
import Card from "../../components/Card"
function ArticleCard ({article}) {
    return (
        <div className="m-1 justify-content-center">
            <Card
                image={{
                    url: article.image,
                    alt: article.title
                }}
                slot={{
                    header: (
                        <div className="card-header justify-content-center ">
                            <NavLink className=" text-decoration-none" to={`/article?id=${article.id}`}>
                                <h4 className="mt-1 text-center">{article.title}</h4>
                            </NavLink>
                        </div>),
                    footer: (
                        <div className="card-footer">
                            <div className="text-muted">
                                <span className=" text-truncate d-block">{article.description}</span>
                            </div>
                        </div>)
                }} />
        </div>
    )
}
function ArticleList () {
    const {pushMessages} = useContext(ToastContext)
    const [articles, setArticles] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [paginator, setPaginator] = useState({})
    const [selected, setSelected] = useState('')
    const filterArticles = useMemo(
        () => selected ? articles.filter(article => article.tag.some(t => t === selected)) : articles,
        [articles, selected]
    )
    const tags = articles.flatMap(article => article.tag).filter((article, index, array) => array.indexOf(article) === index)
    const getArticles = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/articles`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setArticles(response.data.articles)
                    setPaginator(response.data.pagination)
                } else pushMessages({
                    type: 'warning',
                    title: '取得文章列表失敗',
                    content: response.data.messages
                })
            }).catch(error => {
                pushMessages({
                    type: 'danger',
                    title: '取得文章列表發生錯誤',
                    content: error.response.data.messages
                })
            }).finally(() => {setIsLoading(false)})
        },
        [pushMessages]
    )
    useEffect(
        () => {getArticles(1)},
        [getArticles]
    )
    return isLoading ? <Loading loading={isLoading} /> :
        <div className="container">
            <div className="row">
                <nav className="col-sm-3 bg-light">
                    <div className="position-sticky pt-3">
                        <p>標籤篩選</p>
                        {tags.map(tag =>
                            <p className="form-check" key={tag}>
                                <input className="form-check-input" type="checkbox"
                                    value={tag} onChange={event => {setSelected(event.target.checked ? event.target.value : '')}} />
                                <label className="form-check-label">{tag}</label>
                            </p>)}
                    </div>
                </nav>
                <div className="col-sm-9 mt-1">
                    <div className="card-group row">
                        {filterArticles.map(article =>
                            <div className="col-md-6 col-lg-4 row" key={article.num}>
                                <ArticleCard article={article} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getArticles} />}
        </div>
}
export default ArticleList