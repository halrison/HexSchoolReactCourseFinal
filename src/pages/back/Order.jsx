import {useCallback, useMemo, useEffect, useState, useRef, useContext} from 'react'
import {useForm} from "react-hook-form"
import {currency, http, transDate} from '../../utils.js'
import ToastContext from '../../contexts/useToast.js'
import Loading from '../../components/Loading'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
const initOrder = {
    "create_at": 0,
    "id": "",
    "is_paid": false,
    "message": "",
    "products": {},
    "user": {
        "address": "",
        "email": "",
        "name": "",
        "tel": ""
    },
    "num": 0
}
function OrderModal ({getOrders, order, pushMessages, ref}) {
    const [tempOrder, setTempOrder] = useState(initOrder)
    const {formState: {errors}, register, getValues, handleSubmit} = useForm({
        defaultValues: initOrder,
        values: tempOrder
    })
    const products = useMemo(
        () => Object.values(tempOrder?.products ?? {}),
        [tempOrder]
    )
    const finalTotal = products?.reduce((previous, current) => previous + current.final_total, 0)
    const subTotal = products?.reduce((previous, current) => previous + current.total, 0)
    const recount = useCallback(
        (productId, qty) => {
            const index = tempOrder.products.findIndex(product => product.id === productId)
            tempOrder.products[index].total = tempOrder.products[index].product.price * qty
        },
        [tempOrder]
    )
    const saveOrder = () => {
        http({
            url: `/v2/api/${process.env.REACT_APP_PATH}/admin/order/${tempOrder.id}`,
            method: 'put',
            data: {data: getValues()}
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '變更訂單成功',
                    content: response.data.message
                })
                getOrders(1)
            } else pushMessages({
                type: 'success',
                title: '變更訂單成功',
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'success',
                title: '變更訂單成功',
                content: error.response.data.message
            })
        )
    }
    useEffect(
        () => {
            http(`/v2/api/${process.env.REACT_APP_PATH}/order/${order.id}`)
                .then(response => {
                    if (response.data.success) setTempOrder(response.data.order)
                    else pushMessages({
                        type: 'warning',
                        title: '取得訂單資訊失敗',
                        content: response.data.messages
                    })
                }).catch(error =>
                    pushMessages({
                        type: 'error',
                        title: '取得訂單資訊失敗',
                        content: error.response.data.messages
                    })
                )
        },
        [order, pushMessages]
    )
    return (
        <Modal ref={ref} size='xl'>
            <Modal.Header title={`訂單編號 : ${tempOrder?.id}`} />
            <Modal.Body>
                <div className="table">
                    <section className="container-md">
                        <p className="row">
                            <span className="col-6 col-sm">建立日期</span>
                            <span className="col-6 col-sm">{tempOrder?.create_at ? transDate(tempOrder.create_at * 1000) : '-'}</span>
                            <span className="col-6 col-sm">付款日期</span>
                            <span className="col-6 col-sm">{tempOrder?.is_paid ? transDate(tempOrder.paid_date * 1000) : '等待付款中'}</span>
                        </p>
                    </section>
                    <section className="container-md">
                        <p className="row">
                            <span className="col-sm-6">商品名稱</span>
                            <span className="col-4 col-sm-2 text-end">單價</span>
                            <span className="col-4 col-sm-2 text-center">數量</span>
                            <span className="col-4 col-sm-2 text-end">小計</span>
                        </p>
                        {products.map(product =>
                            <p className="row" key={product.product.id}>
                                <span className="col-sm-6 mt-1">{product.product.title}</span>
                                <span className="col-4 col-sm-2 text-end mt-1">{currency(product.product.price)}</span>
                                <span className="col-4 col-sm-2 text-center">
                                    <input type="number" min="1"
                                        value={product.qty} className="form-control text-end" onChange={event => recount(product.id, event.target.value)} />
                                </span>
                                <span className="col-4 col-sm-2 text-end mt-1">{currency(product.total)}</span>
                            </p>
                        )}

                        <p className="row border-top border-danger">
                            {products.some(product => product.coupon) ?
                                <>
                                    <span className="col-6 col-sm-2">總計</span>
                                    <span className="col-6 col-sm-2 text-end">{currency(subTotal)}</span>
                                    <span className="col-6 col-sm-2">折扣</span>
                                    <span className="col-6 col-sm-2 text-end">{currency(subTotal - finalTotal)}</span>
                                    <span className="col-6 col-sm-2">優惠價</span>
                                    <span className="col-6 col-sm-2 text-end border border-danger">{currency(finalTotal)}</span>
                                </>
                                :
                                <>
                                    <span className="col-9 col-sm-10">合計</span>
                                    <span className="col-3 col-sm-2 text-end border border-danger">{currency(tempOrder?.total)}</span>
                                </>
                            }
                        </p>
                    </section>
                    <hr />
                    <section className="container-md">
                        <p className="row">
                            <span className="col-sm-3">地址</span>
                            <span className="col-sm-9">
                                <input type="text"
                                    className={`form-control w-100 ${errors?.address && 'is-invalid'}`}
                                    defaultValue={tempOrder?.user?.address}
                                    {...register(
                                        'user.address', {
                                        required: '必填欄位'
                                    })} />
                            </span>
                            <span className="invalid-feedback" name="address">{errors.address?.message}</span>
                        </p>
                        <p className="row">
                            <span className="col-sm-3">電子信箱</span>
                            <span className="col-sm-9">
                                <input type="email"
                                    className={`form-control w-100 ${errors?.email && 'is-invalid'}`}
                                    defaultValue={tempOrder?.user?.email}
                                    {...register(
                                        'user.email', {
                                        required: '必填欄位'
                                    })} />
                            </span>
                            <span className="invalid-feedback" name="email">{errors.email?.message}</span>
                        </p>
                        <p className="row">
                            <span className="col-3 col-lg">姓名</span>
                            <span className="col-9 col-lg">
                                <input type="text"
                                    className={`form-control w-100 ${errors?.name && 'is-invalid'}`}
                                    defaultValue={tempOrder?.user?.name}
                                    {...register(
                                        'user.name', {
                                        required: '必填欄位'
                                    })} />
                            </span>
                            <span className="invalid-feedback" name="name">{errors.name?.message}</span>
                            <span className="col-3 col-lg">電話</span>
                            <span className="col-9 col-lg">
                                <input type="tel"
                                    className={`form-control w-100 ${errors?.tel && 'is-invalid'}`}
                                    defaultValue={tempOrder?.user?.tel}
                                    {...register(
                                        'user.tel', {
                                        required: '必填欄位'
                                    })} />
                            </span>
                            <span className="invalid-feedback" name="tel">{errors.tel?.message}</span>
                        </p>
                    </section>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <>
                    <button type="button" className="btn btn-secondary" onClick={() => {ref.current.hide()}}>返回</button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit(saveOrder)}>儲存</button>
                </>
            </Modal.Footer>
        </Modal>
    )
}
function DeleteModal ({getOrders, order, pushMessages, ref}) {
    const deleteOrder = () => {
        http({
            url: order.id ? `/v2/api/${process.env.REACT_APP_PATH}/admin/order/${order.id}` : `/v2/api/${process.env.REACT_APP_PATH}/admin/order/all`,
            method: 'delete'
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '刪除訂單成功',
                    content: response.data.message
                })
                getOrders(1)
            } else pushMessages({
                type: 'warning',
                title: '刪除訂單成功',
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'danger',
                title: '刪除訂單發生錯誤',
                content: error.response.data.message
            })
        )
    }
    return (
        <Modal ref={ref} size="md">
            <Modal.Header title={order.id ? '刪除訂單' : '清空訂單'} />
            <Modal.Body>要{order.id ? `刪除編號「 ${order.id} 」的` : '清空所有'}訂單嗎？</Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => {ref.current.hide()}}>取消</button>
                <button className="btn btn-danger" onClick={deleteOrder}>確定</button>
            </Modal.Footer>
        </Modal>
    )
}
function Order () {
    const {pushMessages} = useContext(ToastContext)
    const [orders, setOrders] = useState([])
    const [order, setOrder] = useState({})
    const [paginator, setPaginator] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const orderModal = useRef(null)
    const removeModal = useRef(null)
    const openOrderModal = (action, id) => {
        setOrder(orders.find(o => o.id === id) ?? {})
        if (action === 'remove') removeModal.current.show()
        else orderModal.current.show()
    }
    const getOrders = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/v2/api/${process.env.REACT_APP_PATH}/admin/orders`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setOrders(response.data.orders)
                    setPaginator(response.data.pagination)
                } else pushMessages({
                    type: 'warning',
                    title: '取得訂單列表失敗',
                    content: response.data.message
                })
            }).catch(error =>
                pushMessages({
                    type: 'danger',
                    title: '取得訂單列表發生錯誤',
                    content: error.response.data.message
                })
            ).finally(() => {
                setIsLoading(false)
            })
        },
        [pushMessages]
    )
    useEffect(
        () => {
            getOrders(1)
        },
        [getOrders]
    )
    return isLoading ?
        <Loading loading={isLoading} /> :
        <>
            <div className="p-3">
                <div className="text-end">
                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-2"
                        onClick={() => {openOrderModal('remove', '')}}
                    >
                        <i className="bi bi-trash3 me-1"></i>
                        清空所有訂單
                    </button>
                </div>
                <div className="table-responsive-sm overflow-x-hidden mt-2">
                    <table className="table table-striped">
                        <thead className="sticky-top">
                            <tr className="row mx-0">
                                <th className="col-sm-1 col-lg-4">
                                    <span className="d-block d-md-none d-lg-block">訂單編號</span>
                                    <span className="d-none d-md-block d-lg-none">#</span>
                                </th>
                                <th className="col-6 col-sm-3 col-lg-2">建立日期</th>
                                <th className="col-6 col-sm-3 col-lg-2">付款日期</th>
                                <th className="col-3 col-sm-2 col-lg-2 text-lg-end">總金額</th>
                                <th className="col-9 col-sm-3 col-lg-2 text-center">動作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.num} className="row mx-0">
                                    <td className="col-sm-1 col-lg-4">
                                        <span className="d-block d-md-none d-lg-block">{order.id}</span>
                                        <span className="d-none d-md-block d-lg-none">{order.num}</span>
                                    </td>
                                    <td className="col-6 col-sm-3 col-lg-2">{transDate(order.create_at * 1000)}</td>
                                    <td className="col-6 col-sm-3 col-lg-2">{order.is_paid ? transDate(order.paid_date * 1000) : '等待付款中'}</td>
                                    <td className="col-3 col-sm-2 col-lg-2 text-lg-end">{currency(order.total)}</td>
                                    <td className="col-9 col-sm-3 col-lg-2">
                                        <div className="btn-group btn-group-sm w-100" role="group" aria-label="Basic example">
                                            <button className="btn btn-outline-warning" onClick={() => openOrderModal('edit', order.id)}>
                                                <i className="bi bi-pencil-square"></i>
                                                編輯
                                            </button>
                                            <button className="btn btn-outline-danger" onClick={() => openOrderModal('remove', order.id)}>
                                                <i className="bi bi-x-lg"></i>
                                                移除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getOrders} />}
            <OrderModal order={order} ref={orderModal} getOrders={getOrders} pushMessages={pushMessages} />
            <DeleteModal ref={removeModal} order={order} getOrders={getOrders} pushMessages={pushMessages} />
        </>
}
export default Order