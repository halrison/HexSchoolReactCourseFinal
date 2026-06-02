import {useContext, useEffect, useState} from "react"
import {useSearchParams} from "react-router"
import {http} from "../../utils"
import ToastContext from "../../contexts/useToast"
import Loading from "../../components/Loading"
function ArticleDetail () {
    const {pushMessages} = useContext(ToastContext)
    const [searchParam] = useSearchParams()
    const [article, setArticle] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const id = searchParam.get('id')
    useEffect(
        () => {
            setIsLoading(true)
            http(`/v2/api/${process.env.REACT_APP_PATH}/article/${id}`)
                .then(response => {
                    if (response.data.success) setArticle(response.data.article)
                    else pushMessages({
                        type: 'warning',
                        title: '取得文章資訊失敗',
                        content: response.data.messages
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'danger',
                        title: '取得文章資訊失敗',
                        content: error.response.data.message
                    })
                ).finally(() => setIsLoading(false))
        },
        [id, pushMessages]
    )
    return isLoading ? <Loading loading={isLoading} /> :
        <div className="container">
            <div className="row">
                <h1 className=" text-center">{article.title}</h1>
            </div>
            <div className="row">
                <h6 className="text-center">{article.description}</h6>
            </div>
            <img className="d-block mx-auto w-100" src={article.image} />
            <p className="row">{article.content}</p>
        </div>
}
export default ArticleDetail