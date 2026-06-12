import {useContext, useEffect, useCallback, useMemo, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {currency, http, transDate} from "../../utils.js"
import ToastContext from "../../contexts/useToast.js"
import Modal from "../../components/Modal"
import Pagination from "../../components/Pagination"
import Loading from "../../components/Loading"
function PayModal ({getOrders, order, pushMessages, ref}) {
    const {formState: {errors}, handleSubmit, register, watch} = useForm()
    const watchPayMethod = watch('payMethod')
    const payOrder = () => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/pay/${order.id}`,
            method: 'post'
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '付款成功',
                    content: response.data.message
                })
                getOrders()
            } else pushMessages({
                type: 'warning',
                title: '付款失敗',
                content: response.data.message
            })
        }).catch(error => {
            pushMessages({
                type: 'danger',
                title: '付款發生錯誤',
                content: error.response.data.message
            })
        })
    }
    return (
        <form onSubmit={handleSubmit(payOrder)} onReset={() => {ref.current.hide()}}>
            <Modal ref={ref} size='md'>
                <Modal.Header title={`訂單編號 : ${order.id}`} />
                <Modal.Body>
                    <div className="container">
                        <div className="row">
                            <div className="col">付款方式</div>
                            <div className="col">
                                <select className={`form-select   ${errors.payMethod && 'is-invalid'}`}
                                    {...register(
                                        'payMethod',
                                        {required: '欄位必選'}
                                    )}>
                                    <option disabled>請選擇</option>
                                    <option value="credit-card">信用卡</option>
                                    <option value="bank-account">銀行帳戶</option>
                                    <option value="mobile-pay">行動支付</option>
                                </select>
                                <span name="method" className="invalid-feedback">{errors.payMethod?.message}</span>
                            </div>
                        </div>
                    </div>
                    {watchPayMethod === 'credit-card' ?
                        <div className="container">
                            <div className="row mt-1">
                                <div className="col">發卡銀行</div>
                                <div className="col">
                                    <input className={`form-control ${errors.bank && 'is-invalid'}`}
                                        {...register(
                                            'bank',
                                            {required: '欄位必填'}
                                        )} />
                                    <span name="bank" className="invalid-feedback">{errors.bank?.message}</span>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col">卡號</div>
                                <div className="col">
                                    <input className={`form-control ${errors.card_no && 'is-invalid'}`}
                                        {...register(
                                            'card_no',
                                            {
                                                required: '欄位必填',
                                                pattern: {
                                                    value: /\d{13,16}/,
                                                    message: '格式錯誤'
                                                }
                                            }
                                        )} />
                                    <span name="card_no" className="invalid-feedback">{errors.card_no?.message}</span>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col">持有人</div>
                                <div className="col">
                                    <input className={`form-control ${errors.owner && 'is-invalid'}`}
                                        {...register(
                                            'owner',
                                            {required: '欄位必填'}
                                        )} />
                                    <span name="owner" className="invalid-feedback">{errors.owner?.message}</span>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col">效期</div>
                                <div className="col">
                                    <input className={`form-control ${errors.validThru && 'is-invalid'}`}
                                        {...register(
                                            'validThru',
                                            {
                                                required: '欄位必填',
                                                pattern: {
                                                    value: /\d{2}-(0[1-9]|1[012])/,
                                                    message: '格式錯誤'
                                                }
                                            }
                                        )} />
                                    <span name="validThru" className="invalid-feedback">{errors.validThru?.message}</span>
                                </div>
                            </div>
                            <div className="row mt-1">
                                <div className="col">檢核碼</div>
                                <div className="col">
                                    <input className={`form-control ${errors.checkSum && 'is-invalid'}`}
                                        {...register(
                                            'checkSum',
                                            {
                                                required: '欄位必填',
                                                pattern: {
                                                    value: /\d{3}/,
                                                    message: '格式錯誤'
                                                }
                                            }
                                        )} />
                                    <span name="checkSum" className="invalid-feedback">{errors.checkSum?.message}</span>
                                </div>
                            </div>
                        </div> : watchPayMethod === 'bank-account' ?
                            <div className="container">
                                <div className="row mt-1">
                                    <div className="col">開戶總行</div>
                                    <div className="col">
                                        <input className={`form-control ${errors.headOffice && 'is-invalid'}`}
                                            {...register(
                                                'headOffice',
                                                {required: '欄位必填'}
                                            )} />
                                        <span name="headOffice" className="invalid-feedback">{errors.headOffice?.message}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col">開戶分行</div>
                                    <div className="col">
                                        <input className={`form-control ${errors.branch && 'is-invalid'}`}
                                            {...register(
                                                'branch',
                                                {required: '欄位必填'}
                                            )} />
                                        <span name="branch" className="invalid-feedback">{errors.branch?.message}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col">帳號</div>
                                    <div className="col">
                                        <input className={`form-control ${errors.account && 'is-invalid'}`}
                                            {...register(
                                                'account',
                                                {
                                                    required: '欄位必填',
                                                    pattern: {
                                                        value: /\d{10}|\d{14}/
                                                    }
                                                }
                                            )} />
                                        <span name="account" className="invalid-feedback" >{errors.account?.message}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col">戶名</div>
                                    <div className="col">
                                        <input className={`form-control ${errors.name && 'is-invalid'}`}
                                            {...register(
                                                'name',
                                                {required: '欄位必填'}
                                            )} />
                                        <span name="name" className="invalid-feedback">{errors.name?.message}</span>
                                    </div>
                                </div>
                                <div className="row mt-1">
                                    <div className="col">一次性密碼</div>
                                    <div className="col">
                                        <input className={`form-control ${errors.otp && 'is-invalid'}`}
                                            {...register(
                                                'otp',
                                                {
                                                    required: '欄位必填',
                                                    pattern: {
                                                        value: /\d{6}/,
                                                        message: '格式錯誤'
                                                    }
                                                }
                                            )} />
                                        <span name="otp" className="invalid-feedback">{errors.otp?.message}</span>
                                    </div>
                                </div>
                            </div> : watchPayMethod === 'mobile-pay' ?
                                <div className="container">
                                    <div className="row mt-1">
                                        <div className="col">支付服務</div>
                                        <div className="col">
                                            <div className="form-check">
                                                <input type="radio" id="line-pay" value="linePay"
                                                    className={`form-check-input ${errors.service && 'is-invalid'}`}
                                                    {...register(
                                                        'service',
                                                        {required: '欄位必選'}
                                                    )} />
                                                <label className="form-check-label" htmlFor="line-pay">Line Pay</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" id="apple-pay" value="applePay"
                                                    className={`form-check-input ${errors.service && 'is-invalid'}`}
                                                    {...register(
                                                        'service',
                                                        {required: '欄位必選'}
                                                    )} />
                                                <label className="form-check-label" htmlFor="apple-pay">Apple Pay</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" id="samsung-pay" value="samsungPay"
                                                    className={`form-check-input ${errors.service && 'is-invalid'}`}
                                                    {...register(
                                                        'service',
                                                        {required: '欄位必選'}
                                                    )} />
                                                <label className="form-check-label" htmlFor="samsung-pay">Samsung Pay</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" id="google-pay" value="googlePay"
                                                    className={`form-check-input ${errors.service && 'is-invalid'}`}
                                                    {...register(
                                                        'service',
                                                        {required: '欄位必選'}
                                                    )} />
                                                <label className="form-check-label" htmlFor="google-pay">Google Pay</label>
                                            </div>
                                            <div className="form-check">
                                                <input type="radio" id="jko-pay" value="jkoPay"
                                                    className={`form-check-input ${errors.service && 'is-invalid'}`}
                                                    {...register(
                                                        'service',
                                                        {required: '欄位必選'}
                                                    )} />
                                                <label className="form-check-label" htmlFor="jko-pay">街口支付</label>
                                                <p name="service" className="invalid-feedback">{errors.service?.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-1">
                                        <div className="col">付款代碼</div>
                                        <div className="col">
                                            <input type="tel"
                                                className={`form-control ${errors.code && 'is-invalid'}`}
                                                {...register(
                                                    'code',
                                                    {
                                                        required: '欄位必填',
                                                        pattern: {
                                                            value: /^[0-9]+$/,
                                                            message: '格式錯誤'
                                                        }
                                                    }
                                                )} />
                                            <span name="code" className="invalid-feedback">{errors.code?.message}</span>
                                        </div>
                                    </div>
                                    <div className="row mt-1">
                                        <div className="col">付款密碼</div>
                                        <div className="col">
                                            <input type="password"
                                                className={`form-control ${errors.password && 'is-invalid'}`}
                                                {...register(
                                                    'password', {
                                                    required: '欄位必填',
                                                    pattern: {
                                                        value: /^[0-9A-Za-z]+$/,
                                                        message: '格式錯誤'
                                                    }
                                                })
                                                } />
                                            <span name="password" className="invalid-feedback">{errors.password?.message}</span>
                                        </div>
                                    </div>
                                </div> :
                                <></>}
                </Modal.Body>
                <Modal.Footer>
                    <input type="reset" className="btn btn-secondary" value="取消" />
                    <input type="submit" className="btn btn-primary" value="確認付款" />
                </Modal.Footer>
            </Modal>
        </form>
    )
}
function OrderModal ({order, pushMessages, ref}) {
    const [tempOrder, setTempOrder] = useState({
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
    })
    const products = useMemo(
        () => Object.values(tempOrder?.products ?? {}),
        [tempOrder]
    )
    const [isLoading, setIsLoading] = useState(false)
    const finalTotal = products?.reduce((previous, current) => previous + current.final_total, 0)
    const subTotal = products?.reduce((previous, current) => previous + current.total, 0)
    useEffect(
        () => {
            setIsLoading(true)
            http(`/api/${process.env.REACT_APP_PATH}/order/${order.id}`)
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
                ).finally(() => setIsLoading(false))
        },
        [order, pushMessages]
    )
    return (
        <Modal ref={ref} size="lg">
            <Modal.Header title={`訂單編號 : ${tempOrder?.id}`} />
            <Modal.Body>
                {isLoading ? <Loading loading={isLoading} /> :
                    <>
                        <div className="container">
                            <p className="row">
                                <span className="col-6 col-sm">建立日期</span>
                                <span className="col-6 col-sm">{tempOrder?.create_at ? transDate(tempOrder.create_at * 1000) : '-'}</span>
                                <span className="col-6 col-sm">付款日期</span>
                                <span className="col-6 col-sm">{tempOrder?.is_paid ? transDate(tempOrder.paid_date * 1000) : '等待付款中'}</span>
                            </p>
                            <p className="row">
                                <span className="col-6 col-sm-3">留言</span>
                                <span className="col-6 col-sm-9">{tempOrder?.message}</span>
                            </p>
                        </div>
                        <hr />
                        <div className="container">
                            <p className="row">
                                <span className="col-12 col-sm-6">商品名稱</span>
                                <span className="col-4 col-sm-2 text-end">單價</span>
                                <span className="col-4 col-sm-2 text-end">數量</span>
                                <span className="col-4 col-sm-2 text-end">小計</span>
                            </p>
                            {products.map(product =>
                                <p className="row" key={product.product_id}>
                                    <span className="col-12 col-sm-6">{product.product.title}</span>
                                    <span className="col-4 col-sm-2 text-end">{currency(product.product.price)}</span>
                                    <span className="col-4 col-sm-2 text-end">{product.qty}</span>
                                    <span className="col-4 col-sm-2 text-end">{currency(product.total)}</span>
                                </p>
                            )}
                            {products.some(product => product.coupon) ?
                                <p className="row border-top border-danger">
                                    <span className="col-6 col-sm-2">總計</span>
                                    <span className="col-6 col-sm-2 text-end">{currency(subTotal)}</span>
                                    <span className="col-6 col-sm-2">折扣</span>
                                    <span className="col-6 col-sm-2 text-end">{currency(subTotal - finalTotal)}</span>
                                    <span className="col-6 col-sm-2 text-sm-end">優惠價</span>
                                    <span className="col-6 col-sm-2 text-end border border-danger">{currency(finalTotal)}</span>
                                    <br />
                                    <span className="text-info text-end">四捨五入至整數位，些微誤差不影響付款</span>
                                </p> :
                                <p className="row border-top border-danger">
                                    <span className="col-9 col-sm-10">合計</span>
                                    <span className="col-3 col-sm-2 text-end border border-danger">{currency(tempOrder?.total)}</span>
                                </p>
                            }
                        </div>
                        <hr />
                        <div className="container">
                            <p className="row">
                                <span className="col-3">地址</span>
                                <span className="col-9 text-end">{order.user?.address}</span>
                            </p>
                            <p className="row">
                                <span className="col-4 col-sm-3">電子信箱</span>
                                <span className="col-8 col-sm-9 text-end">{order.user?.email}</span>
                            </p>
                            <p className="row">
                                <span className="col-6 col-sm-2">姓名</span>
                                <span className="col-6 col-sm-4 text-end">{order.user?.name}</span>
                                <span className="col-6 col-sm-2">電話</span>
                                <span className="col-6 col-sm-4 text-end">{order.user?.tel}</span>
                            </p>
                        </div>
                    </>
                }
            </Modal.Body >
            <Modal.Footer>
                <button className="btn btn-primary" onClick={() => {ref.current.hide()}}>返回</button>
            </Modal.Footer>
        </Modal>)
}
function OrderList () {
    const {pushMessages} = useContext(ToastContext)
    const orderModal = useRef(null)
    const payModal = useRef(null)
    const [isLoading, setIsLoading] = useState(false)
    const [order, setOrder] = useState({})
    const [orders, setOrders] = useState([])
    const [pagination, setPagination] = useState({})
    const getOrders = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/orders`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setOrders(response.data.orders)
                    setPagination(response.data.pagination)
                } else pushMessages({
                    type: 'warning',
                    title: '取得訂單列表失敗',
                    content: response.data.messages
                })
            }).catch(error =>
                pushMessages({
                    type: 'warning',
                    title: '取得訂單列表失敗',
                    content: error.response.data.message
                })
            ).finally(() => setIsLoading(false))
        },
        [pushMessages]
    )
    const openModal = (action, id) => {
        setOrder(orders.find(order => order.id === id) ?? {})
        if (action === 'view') orderModal.current?.show()
        else if (action === 'pay') payModal.current?.show()
        else return
    }
    useEffect(
        () => {getOrders(1)},
        [getOrders]
    )
    return isLoading ?
        <Loading loading={isLoading} /> : (
            <div className="container">
                {orders?.length ?
                    <div className="table-responsive-sm overflow-x-hidden">
                        <table className="table table-striped">
                            <thead className="sticky-top">
                                <tr className="row mx-0">
                                    <th className="col-md-1 col-lg-4">
                                        <span className="d-block d-md-none d-lg-block">訂單編號</span>
                                        <span className="d-none d-md-block d-lg-none">#</span>
                                    </th>
                                    <th className="col-6 col-md-3 col-lg-2">建立日期</th>
                                    <th className="col-6 col-md-3 col-lg-2">付款日期</th>
                                    <th className="col-6 col-md-2 text-end">金額</th>
                                    <th className="col-6 col-md-3 col-lg-2 text-center">動作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.map(order =>
                                    <tr className="row mx-0" key={order.id}>
                                        <td className="col-md-1 col-lg-4">
                                            <span className="d-block d-md-none d-lg-block">{order.id}</span>
                                            <span className="d-none d-md-block d-lg-none">{order.num}</span>
                                        </td>
                                        <td className="col-6 col-md-3 col-lg-2">{order.create_at ? transDate(order.create_at * 1000) : '-'}</td>
                                        <td className="col-6 col-md-3 col-lg-2">{order.paid_date ? transDate(order.paid_date * 1000) : '尚未付款'}</td>
                                        <td className="col-6 col-md-2 col-lg-2 text-end">{currency(order.total)}</td>
                                        <td className="col-6 col-md-3 col-lg-2 text-center">
                                            {order.is_paid ?
                                                <button className="btn btn-sm btn-outline-primary w-100" onClick={() => openModal('view', order.id)}>
                                                    <i className="bi bi-eye me-1"></i>
                                                    檢視
                                                </button> :
                                                <div className="btn-group btn-group-sm w-100" role="group">
                                                    <button className="btn btn-outline-primary" onClick={() => openModal('view', order.id)}>
                                                        <i className="bi bi-eye me-1"></i>
                                                        檢視
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-info" onClick={() => openModal('pay', order.id)}>
                                                        <i className="bi bi-wallet me-1"></i>
                                                        付款
                                                    </button>
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {pagination?.total_pages > 1 && <Pagination paginator={pagination} onPaginate={getOrders} />}
                    </div>
                    : <h1 className="text-center vh-100">未送出任何訂單</h1>
                }
                <OrderModal order={order} ref={orderModal} pushMessages={pushMessages} />
                <PayModal order={order} ref={payModal} pushMessages={pushMessages} />
            </div>
        )
}
export default OrderList