import {useCallback, useContext, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {addImage, uploadImage, http, transDate} from "../../utils.js"
import ToastContext from "../../contexts/useToast.js"
import Loading from "../../components/Loading"
import Modal from "../../components/Modal"
import Pagination from "../../components/Pagination"
const initArticle = {
    id: '',
    title: '',
    content: '',
    description: '',
    image: '',
    author: '',
    isPublic: false,
    create_at: Date.now(),
    tag: []
}
function ArticleModal ({article, getArticles, pushMessages, ref}) {
    const [isLoading, setIsLoading] = useState(false)
    const [fileError, setFileError] = useState('')
    const [tempArticle, setTempArticle] = useState(initArticle)
    const [tempTag, setTempTag] = useState('')
    const [tempUrl, setTempUrl] = useState('')
    const [urlError, setUrlError] = useState('')
    const {register, formState: {errors}, getValues, handleSubmit} = useForm({
        defaultValues: {
            ...initArticle,
            content: initArticle.content,
            create_at: transDate(initArticle.create_at)
        },
        values: {
            ...article,
            content: tempArticle.content,
            create_at: transDate(tempArticle.create_at)
        }
    })
    const addTag = t => {
        if (tempArticle.tag?.includes(t)) return
        else if (Array.isArray(tempArticle.tag))
            setTempArticle({
                ...tempArticle,
                tag: [...tempArticle.tag, t]
            })
        else
            setTempArticle({
                ...tempArticle,
                tag: [t]
            })
        setTempTag('')
    }
    const removeTag = tag => {
        if (Array.isArray(tempArticle.tag))
            setTempArticle({
                ...tempArticle,
                tag: tempArticle.tag.filter(t => t !== tag)
            })
        else return
    }
    const saveUrl = url => {
        setUrlError('')
        addImage(
            url,
            () => setTempArticle({
                ...article,
                image: url
            }),
            () => setUrlError('此網址並非圖片')
        )
    }
    const saveImage = file => {
        setFileError('')
        if (file?.size > 3145728) setFileError('檔案大小超過3MB')
        else if (file) uploadImage(
            file,
            response => {
                if (response.data.success) {
                    setTempArticle({
                        ...article,
                        image: response.data.imageUrl
                    })
                } else if (typeof response.data.message === 'string') setFileError(response.data.message)
                else setFileError(response.data.message.message)
            }
        )
    }
    const saveArticle = () => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/article/${tempArticle.id ? tempArticle.id:''}`,
            method: tempArticle.id ? 'put' : 'post',
            data: {
                data: {
                    ...getValues(),
                    create_at: Date.parse(getValues('create_at')),
                    isPublic: Boolean(getValues('isPublic'))
                }
            }
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '儲存文章成功',
                    content: response.data.message
                })
                getArticles(1)
            } else pushMessages({
                type: 'warning',
                title: '儲存文章失敗',
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'danger',
                title: '儲存文章發生錯誤',
                content: error.response.data.message
            })
        )
    }
    useEffect(
        () => {
            setFileError('')
            setUrlError('')
        },
        []
    )
    useEffect(
        () => {
            if (article.id) {
                setIsLoading(true)
                http(`/api/${process.env.REACT_APP_PATH}/admin/article/${article.id}`)
                    .then(response => {
                        if (response.data.success) setTempArticle({
                            ...response.data.article,
                            create_at: transDate(response.data.article.create_at)
                        })
                        else {
                            pushMessages({
                                type: 'warning',
                                title: '取得文章資訊失敗',
                                content: response.data.message
                            })
                            setTempArticle({
                                ...initArticle,
                                create_at: transDate(initArticle.create_at)
                            })
                        }
                    }).catch(error => {
                        pushMessages({
                            type: 'danger',
                            title: '取得文章資訊發生錯誤',
                            content: error.response.data.message
                        })
                        setTempArticle({
                            ...initArticle,
                            create_at: transDate(initArticle.create_at)
                        })
                    }).finally(() => setIsLoading(false))
            } else
                setTempArticle({
                    ...initArticle,
                    create_at: transDate(initArticle.create_at)
                })
        },
        [article, pushMessages]
    )
    return (
        <form onReset={() => {ref.current.hide()}} onSubmit={handleSubmit(saveArticle)}>
            <Modal ref={ref} size='lg'>
                <Modal.Header title={article.id ? '編輯文章' : '新增文章'} />
                <Modal.Body>
                    {isLoading ? <Loading loading={isLoading} /> :
                        <>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="title">標題</label>
                                </div>
                                <div className="col-9">
                                    <input id="title" type="text"
                                        defaultValue={tempArticle.title}
                                        className={`form-control ${errors?.title && ' is-invalid'}`}
                                        {...register(
                                            'title',
                                            {required: '必填欄位'}
                                        )}
                                    />
                                </div>
                                <p className="invalid-feedback">{errors.title?.message}</p>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="image">圖片</label>
                                </div>
                                <div className="col-9">
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="imageURL">輸入圖片網址</label>
                                        <br />
                                        <p className="input-group">
                                            <input type="url" id="imageURL" placeholder="請輸入圖片連結" name="image"
                                                value={tempUrl} className={`form-control ${urlError && 'is-invalid'}`}
                                                onChange={event => setTempUrl(event.target.value)} />
                                            <input type="button" value="新增圖片"
                                                className="btn btn-outline-primary btn-sm"
                                                disabled={!tempUrl} onClick={() => saveUrl(tempUrl)} />
                                        </p>
                                        <span className="text-danger">{urlError}</span>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="imageFile">或上傳圖片</label>
                                        <input id="imageFile" type="file"
                                            className={`form-control ${fileError && 'is-invalid'}`}
                                            onChange={event => saveImage(event.target.files[0])} />
                                    </div>
                                    <span className="text-danger">{fileError}</span>
                                    {tempArticle.image &&
                                        <div className="mb-3 input-group">
                                            <input type="url" className="form-control" readOnly
                                                value={tempArticle.image} />
                                            <input type="button" value="移除"
                                                className="btn btn-outline-danger"
                                                onClick={() => setTempArticle({
                                                    ...tempArticle,
                                                    image: ''
                                                })}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="tag">標籤</label>
                                </div>
                                <div className="col-9">
                                    <p className="input-group">
                                        <input className="form-control" id="tag" type="text" value={tempTag} onChange={event => setTempTag(event.target.value)} />
                                        <input type="button" className="btn btn-outline-primary" onClick={() => addTag(tempTag)} disabled={!tempTag} value="新增" />
                                    </p>
                                    {Array.isArray(tempArticle?.tag) &&
                                        <p>
                                            {tempArticle?.tag.map((t, index) => (
                                                <span className="badge rounded-pill bg-secondary" key={index}>
                                                    {t}
                                                    <button type="button" className="btn-close" aria-label="Close" onClick={() => removeTag(t)}></button>
                                                </span>
                                            ))
                                            }</p>
                                    }
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="description">描述</label>
                                </div>
                                <div className="col-9">
                                    <textarea id="description" rows="2" cols="40"
                                        className={`form-control ${errors?.description && 'is-invalid'} `}
                                        defaultValue={tempArticle.description}
                                        {...register('description',
                                            {required: '必填欄位'})} />
                                    <p name="description" className="invalid-feedback">{errors.description?.message}</p>
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="content">內容</label>
                                </div>
                                <div className="col-9">
                                    <textarea className={`form-control ${errors?.content && 'is-invalid'} `} id="content"
                                        defaultValue={tempArticle.content}
                                        {...register('content',
                                            {required: '必填欄位'})} />
                                    <p name="content" className="invalid-feedback">{errors.content?.message}</p>
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="author">作者</label>
                                </div>
                                <div className="col-9">
                                    <input type="text" id="author"
                                        className={`form-control ${errors?.author && ' is-invalid'} `}
                                        defaultValue={tempArticle.author}
                                        {...register('author',
                                            {required: '必填欄位'})} />
                                    <p name="isPublic" className="invalid-feedback">{errors.author?.message}</p>
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-check-label" htmlFor="public">是否公開</label>
                                </div>
                                <div className="col-9">
                                    <input className="form-check-input" id="public" type="checkbox"
                                        defaultChecked={tempArticle.isPublic}
                                        defaultValue={tempArticle.isPublic}
                                        {...register('isPublic')} />
                                    <p name="isPublic" className="invalid-feedback">{errors.isPublic?.message}</p>
                                </div>
                            </div>
                            <div className="row py-1">
                                <div className="col-3">
                                    <label className="form-label" htmlFor="date">建立日期</label>
                                </div>
                                <div className="col-9">
                                    <input id="date" type="date"
                                        className={`form-control ${errors?.create_at && ' is-invalid'} `}
                                        defaultValue={transDate(tempArticle.create_at)}
                                        {...register(
                                            'create_at',
                                            {
                                                required: '必填欄位',
                                                validate: {
                                                    minDate (due_date) {if (!tempArticle.id && due_date < Date.now()) return '不得比今日還早'}
                                                }
                                            }
                                        )} />
                                    <p name="isPublic" className="invalid-feedback">{errors.create_at?.message}</p>
                                </div>
                            </div>
                        </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <input type="reset" className="btn btn-secondary" value="關閉" />
                    <input type="submit" className="btn btn-primary" value="儲存" />
                </Modal.Footer>
            </Modal >
        </form>
    )
}
function DeleteModal ({article, getArticles, pushMessages, ref}) {
    const deleteArticle = id => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/article/${id}`,
            method: 'delete'
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '刪除文章成功',
                    content: response.data.message
                })
                ref.current.hide()
                getArticles(1)
            } else pushMessages({
                type: 'warning',
                title: '刪除文章失敗',
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'danger',
                title: '刪除文章發生錯誤',
                content: error.response.data.message
            })
        )
    }
    return (
        <Modal ref={ref} size='sm'>
            <Modal.Header title='刪除文章' />
            <Modal.Body>要刪除「 {article.title} 」嗎</Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => {ref.current.hide()}}>取消</button>
                <button className="btn btn-danger" onClick={() => {deleteArticle(article.id)}}>確定</button>
            </Modal.Footer>
        </Modal>
    )
}
function Article () {
    const {pushMessages} = useContext(ToastContext)
    const [articles, setArticles] = useState([])
    const [article, setArticle] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [paginator, setPaginator] = useState({})
    const articleModal = useRef(null)
    const removeModal = useRef(null)
    const openArticleModal = (action, id) => {
        setArticle(articles.find(a => a.id === id) ?? {})
        if (action === 'remove') removeModal.current.show()
        else articleModal.current.show()
    }
    const getArticles = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/admin/articles`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setArticles(response.data.articles)
                    setPaginator(response.data.pagination)
                } else pushMessages({
                    type: 'warning',
                    title: '取得文章列表失敗',
                    content: response.data.message
                })
            }).catch(error =>
                pushMessages({
                    type: 'danger',
                    title: '取得文章列表發生錯誤',
                    content: error.response.data.message
                })
            ).finally(() => setIsLoading(false))
        },
        [pushMessages]
    )
    useEffect(
        () => {getArticles(1)},
        [getArticles]
    )
    return isLoading ? <Loading loading={isLoading} /> :
        <>
            <div className="p-3">
                <div className="text-end">
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => openArticleModal('add', '')}
                    >
                        建立新文章
                    </button>
                </div>
                <div className="table-responsive-sm overflow-x-hidden mt-2">
                    <table className="table table-striped">
                        <thead>
                            <tr className="row mx-0">
                                <th className="col-6 col-sm-8 col-lg-4">標題</th>
                                <th className="col-6 col-sm-4 col-lg-2">作者</th>
                                <th className="col-6 col-sm-4 col-lg-2">發布日期</th>
                                <th className="col-6 col-sm-2 col-lg-1">公開</th>
                                <th className="col-sm-6 col-lg-3 text-center">動作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map(article =>
                                <tr key={article.num} className="row mx-0">
                                    <td className="col-6 col-sm-8 col-lg-4">{article.title}</td>
                                    <td className="col-6 col-sm-4 col-lg-2">{article.author}</td>
                                    <td className="col-6 col-sm-4 col-lg-2">{transDate(article.create_at)}</td>
                                    <td className="col-6 col-sm-2 col-lg-1">
                                        <div className={article.isPublic ? 'text-success' : 'text-danger'}>
                                            {article.isPublic ? '是' : '否'}
                                        </div>
                                    </td>
                                    <td className="col-sm-6 col-lg-3">
                                        <div className="btn-group btn-group-sm w-100" role="group" aria-label="Basic example">
                                            <button className="btn btn-outline-warning" onClick={() => openArticleModal('edit', article.id)}>
                                                <i className="bi bi-pencil-square"></i>
                                                編輯
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={() => openArticleModal('remove', article.id)}>
                                                <i className="bi bi-trash"></i>
                                                移除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getArticles} />}
            </div>
            <ArticleModal ref={articleModal} article={article} getArticles={getArticles} pushMessages={pushMessages} />
            <DeleteModal ref={removeModal} article={article} getArticles={getArticles} pushMessages={pushMessages} />
        </>
}
export default Article