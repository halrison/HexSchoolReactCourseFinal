import {useCallback, useContext, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {currency, http, addImage, uploadImage} from "../../utils.js"
import ToastContext from "../../contexts/useToast.js"
import Loading from "../../components/Loading"
import Modal from "../../components/Modal"
import Pagination from "../../components/Pagination"
const initProduct = {
    title: '',
    imageUrl: '',
    imagesUrl: [],
    category: '',
    content: '',
    description: '',
    origin_price: 0,
    price: 0,
    is_enabled: 0,
    unit: ''
}
function ProductModal ({getProducts, product, pushMessages, ref}) {
    const [tempProduct, setTempProduct] = useState(initProduct)
    const [tempUrl, setTempUrl] = useState('')
    const [fileError, setFileError] = useState('')
    const [urlError, setUrlError] = useState('')
    const {formState: {errors}, getValues, handleSubmit, register} = useForm({
        defaultValues: initProduct,
        values: tempProduct
    })
    const saveUrl = url => {
        if (!url) setUrlError('')
        addImage(
            url,
            () => {
                if (tempProduct.imageUrl) setTempProduct({
                    ...tempProduct,
                    imagesUrl: [...tempProduct.imagesUrl, tempUrl]
                })
                else setTempProduct({
                    ...tempProduct,
                    imageUrl: tempUrl
                })
            },
            () => setUrlError('此網址並非圖片')
        )
    }
    const saveImage = file => {
        setFileError('')
        if (file?.size > 3145728) setFileError('檔案大小超過3MB')
        else if (['image/jpeg', 'image/gif'].includes(file?.type)) uploadImage(
            file,
            response => {
                if (response.data.success) {
                    setTempProduct(tempProduct.imageUrl ? {
                        ...tempProduct,
                        imagesUrl: [...tempProduct.imagesUrl, response.data.imageUrl]
                    } : {
                        ...tempProduct,
                        imageUrl: response.data.imageUrl
                    })
                } else if (typeof response.data.message === 'string') setFileError(response.data.message)
                else setFileError(response.data.message.message)
            }
        )
        else if (file) setFileError('檔案格式錯誤，僅限上傳 jpg、jpeg 與 png 格式。')
    }
    const saveProduct = () => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/product/${tempProduct.id ? tempProduct.id:''}`,
            method: tempProduct.id ? 'put' : 'post',
            data: {
                data: {
                    ...getValues(),
                    imageUrl: tempProduct.imageUrl,
                    imagesUrl: tempProduct.imagesUrl,
                    is_enabled:getValues('is_enabled')?1:0
                }
            }
        }).then(response => {
            if (response?.data.success) {
                pushMessages({
                    title: '商品儲存成功',
                    content: response?.data.message,
                    type: 'success'
                })
                getProducts(1)
            } else pushMessages({
                title: '商品儲存失敗',
                content: response.data.message,
                type: 'warning'
            })
        }).catch(error => {
            pushMessages({
                title: '商品儲存發生錯誤',
                content: error.response.data.message,
                type: 'danger'
            })
        })
    }
    useEffect(
        () => setTempProduct(product.id ? product : initProduct),
        [product, pushMessages]
    )
    return (
        <form onSubmit={handleSubmit(saveProduct)} onReset={() => {ref.current.hide?.()}}>
            <Modal ref={ref} size='xl'>
                <Modal.Header title={product.id ? '編輯商品' : '新增商品'} />
                <Modal.Body>
                    <div className="row">
                        <div className="col-xl-4">
                            <div className="mb-3">
                                <label htmlFor="image" className="form-label">輸入圖片網址</label>
                                <br />
                                <p className="input-group mb-0">
                                    <input type="url" placeholder="請輸入圖片連結"
                                        value={tempUrl}
                                        onChange={event => {setTempUrl(event.target.value)}}
                                        className={`form-control ${urlError && 'is-invalid'}`}
                                    />
                                    <input type="button" className="btn btn-secondary" value="新增連結"
                                        onClick={() => {saveUrl(tempUrl)}}
                                    />
                                </p>
                                <span className="text-danger">{urlError}</span>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="input" className="form-label">或上傳圖片</label>
                                <input className={`form-control ${fileError && 'is-invalid'}`} type="file" accept="image/*"
                                    onChange={event => {saveImage(event.target.files[0])}}
                                />
                                <p className="text-danger">{fileError}</p>
                            </div>
                            <div className="mt-5 mb-3 input-group">
                                {tempProduct.imageUrl &&
                                    <div className="mb-3 input-group">
                                        主圖片
                                        <input type="url" className="form-control" readOnly
                                            value={tempProduct.imageUrl} />
                                        <button type="button" className="btn btn-outline-danger"
                                            onClick={() => {setTempProduct({...tempProduct, imageUrl: ''})}}>
                                            移除
                                        </button>
                                    </div>}
                                {tempProduct.imagesUrl?.map(function (url, index) {
                                    return (
                                        <div className="mb-3 input-group" key={index}>
                                            副圖片{index + 1}
                                            <input type="url" className="form-control" readOnly placeholder="請輸入連結"
                                                value={url} />
                                            <button type="button" className="btn btn-outline-danger"
                                                onClick={() => {setTempProduct({...tempProduct, imagesUrl: tempProduct.imagesUrl.filter((_, i) => i !== index)})}}>
                                                移除
                                            </button>
                                        </div>)
                                })}
                            </div>
                        </div>
                        <div className="col-xl-8">
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">標題</label>
                                <input type="text" id="title" placeholder="請輸入標題"
                                    defaultValue={tempProduct.title}
                                    className={`form-control ${errors?.title && 'is-invalid'}`}
                                    {...register(
                                        'title',
                                        {required: '欄位必填'}
                                    )} />
                                <p className="invalid-feedback" name="title">{errors.title?.message}</p>
                            </div>
                            <div className="row gx-2">
                                <div className="mb-3 col-6">
                                    <label htmlFor="category" className="form-label">分類</label>
                                    <input type="text" id="category" placeholder="請輸入分類"
                                        className={`form-control ${errors?.category && 'is-invalid'}`}
                                        defaultValue={tempProduct.category}
                                        {...register(
                                            'category',
                                            {required: '欄位必填'})} />
                                    <p className="invalid-feedback" name="category">{errors.category?.message}</p>
                                </div>
                                <div className="mb-3 col-6">
                                    <label htmlFor="price" className="form-label">單位</label>
                                    <input type="text" id="unit" placeholder="請輸入單位"
                                        defaultValue={tempProduct.unit}
                                        className={`form-control ${errors?.unit && 'is-invalid'}`}
                                        {...register(
                                            'unit',
                                            {required: '欄位必填'})} />
                                    <p className="invalid-feedback" name="unit">{errors.unit?.message}</p>
                                </div>
                            </div>
                            <div className="row gx-2">
                                <div className="mb-3 col-6">
                                    <label htmlFor="origin_price" className="form-label">原價</label>
                                    <input type="number" id="origin_price" placeholder="請輸入原價"
                                        defaultValue={tempProduct.origin_price}
                                        className={`form-control ${errors?.origin_price && 'is-invalid'}`}
                                        {...register(
                                            'origin_price',
                                            {
                                                required: '欄位必填',
                                                min: {
                                                    value: 1,
                                                    message: '價格必須大於0'
                                                },
                                                valueAsNumber: true
                                            }
                                        )}
                                    />
                                    <p className="invalid-feedback" name="origin_price">{errors.origin_price?.message}</p>
                                </div>
                                <div className="mb-3 col-6">
                                    <label htmlFor="price" className="form-label">售價</label>
                                    <input type="number" id="price" placeholder="請輸入售價"
                                        defaultValue={tempProduct.price}
                                        className={`form-control ${errors?.price && 'is-invalid'}`}
                                        {...register(
                                            'price',
                                            {
                                                required: '欄位必填',
                                                min: {
                                                    value: 1,
                                                    message: '價格必須大於0'
                                                },
                                                valueAsNumber: true
                                            }
                                        )} />
                                    <p className="invalid-feedback" name="price"> {errors.price?.message}</p>
                                </div>
                            </div>
                            <hr />
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">產品描述</label>
                                <textarea className="form-control" id="description" placeholder="請輸入產品描述"
                                    defaultValue={tempProduct.description}
                                    {...register('description')} />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="content" className="form-label">說明內容</label>
                                < textarea className="form-control" id="content" placeholder="請輸入產品說明內容"
                                    defaultValue={tempProduct.content}
                                    {...register('content')} />
                            </div>
                            <div className="mb-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" id="is_enabled"
                                        defaultChecked={!!tempProduct.is_enabled} defaultValue={tempProduct.is_enabled}
                                        {...register('is_enabled')} />
                                    <label className="form-check-label" htmlFor="is_enabled">
                                        是否啟用
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <input className="btn btn-secondary" value="取消" type="reset" />
                    <input className="btn btn-primary" value="儲存" type="submit" />
                </Modal.Footer>
            </Modal>
        </form>
    )
}
function DeleteModal ({getProducts, product, pushMessages, ref}) {
    const deleteProduct = id => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/product/${id}`,
            method: 'delete'
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '刪除商品成功',
                    content: response.data.message
                })
                getProducts(1)
            } else pushMessages({
                type: 'warning',
                title: '刪除商品失敗',
                content: response.data.message
            })
        }).catch(error => {
            pushMessages({
                type: 'danger',
                title: '刪除商品發生錯誤',
                content: error.response.data.message
            })
        })
    }
    return (
        <Modal ref={ref} size='sm'>
            <Modal.Header title='刪除產品' />
            <Modal.Body>
                <p>要刪除「 {product.title} 」嗎？</p>
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => {ref.current.hide?.()}}>取消</button>
                <button className="btn btn-danger" onClick={() => {deleteProduct(product.id)}}>確定</button>
            </Modal.Footer>
        </Modal>
    )
}
function Product () {
    const {pushMessages} = useContext(ToastContext)
    const productModal = useRef(null)
    const removeModal = useRef(null)
    const [paginator, setPaginator] = useState({})
    const [product, setProduct] = useState({})
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const openProductModal = (type, id = '') => {
        setProduct(products.find(p => p.id === id) ?? {})
        if (type === 'remove') removeModal.current.show()
        else productModal.current.show()
    }
    const getProducts = useCallback(
        page => {
            setLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/admin/products`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setProducts(response.data.products)
                    setPaginator(response.data.pagination)
                } else pushMessages({
                    title: '取得商品列表失敗',
                    content: response.data.message,
                    type: 'warning'
                })
            }).catch(error =>
                pushMessages({
                    title: '取得商品列表發生錯誤',
                    content: error.response.data.message,
                    type: 'danger'
                })
            ).finally(() => setLoading(false));
        },
        [pushMessages]
    )
    useEffect(
        () => {getProducts(1)},
        [getProducts]
    )
    return loading ?
        <Loading loading={loading} /> : (
            <div className="p-3">
                <div className="text-end">
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm mt-2"
                        onClick={() => openProductModal('add', '')}
                    >
                        <i className="bi bi-plus me-1"></i>
                        建立新商品
                    </button>
                </div>
                <div className="table-responsive-sm overflow-x-hidden mt-2">
                    <table className="table table-striped">
                        <thead>
                            <tr className="row mx-0">
                                <th className="col-4 col-lg-2">分類</th>
                                <th className="col-8 col-lg-4">名稱</th>
                                <th className="col-4 col-sm-3 col-lg-1 text-lg-end">原價</th>
                                <th className="col-4 col-sm-3 col-lg-1 text-lg-end">售價</th>
                                <th className="col-4 col-sm-2 col-lg-1">狀態</th>
                                <th className="col-sm-4 col-lg-3 text-center">動作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.num} className="row mx-0">
                                    <td className="col-4 col-lg-2">{product.category}</td>
                                    <td className="col-8 col-lg-4">{product.title}</td>
                                    <td className="col-4 col-sm-3 col-lg-1 text-lg-end">{currency(product.origin_price)}</td>
                                    <td className="col-4 col-sm-3 col-lg-1 text-lg-end">{currency(product.price)}</td>
                                    <td className="col-4 col-sm-2 col-lg-1">
                                        <div className={product.is_enabled === 1 ? 'text-success' : 'text-danger'}>
                                            {product.is_enabled === 1 ? '啟' : '停'}用
                                        </div>
                                    </td>
                                    <td className="col-sm-4 col-lg-3 text-center">
                                        <div className="btn-group btn-group-sm w-100" role="group" aria-label="Basic Example">
                                            <button
                                                type="button"
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() => {openProductModal('edit', product.id)}}
                                            >
                                                <i className="bi bi-pencil-square me-1"></i>
                                                編輯
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => {openProductModal('remove', product.id)}}
                                            >
                                                <i className="bi bi-trash me-1"></i>
                                                移除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getProducts} />}
                <ProductModal ref={productModal} product={product} getProducts={getProducts} pushMessages={pushMessages} />
                <DeleteModal ref={removeModal} product={product} getProducts={getProducts} pushMessages={pushMessages} />
            </div>
        )
}
export default Product