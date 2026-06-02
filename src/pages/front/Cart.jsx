import {useContext, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {useOutletContext} from "react-router"
import {currency, http} from "../../utils"
import MessageContext from "../../contexts/useToast"
import Modal from "../../components/Modal"
import Loading from "../../components/Loading"
import {useNavigate} from "react-router";
function RemoveModal ({cart, ref, getCarts,pushMessages}) {
    const removeCart = () => {
        http({
            url: cart.id ? `/v2/api/${process.env.REACT_APP_PATH}/cart/${cart.id}` : `/v2/api/${process.env.REACT_APP_PATH}/carts`,
            method: 'delete'
        }).then(response => {
            if (response.data.success) {
                getCarts()
                pushMessages({type: 'success', title: '移除商品成功'})
            } else pushMessages({type: 'warning', title: '移除商品失敗'})
        }).catch(error => {pushMessages({type: 'danger', title: '移除商品失敗', content: error})})
    }
    return (
        <Modal ref={ref} size='sm'>
            <Modal.Header title="確認刪除" />
            <Modal.Body>
                確定要刪除 {cart.id ? cart.product?.title : '所有商品'} 嗎？
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => {ref.current.hide()}}>取消</button>
                <button className="btn btn-danger" data-bs-dismiss="modal" onClick={removeCart}>刪除</button>
            </Modal.Footer>
        </Modal>
    )
}
function Cart () {
    const {pushMessages} = useContext(MessageContext)
    const {formState: {errors}, getValues, handleSubmit, register} = useForm({
        mode: 'onChange',
        reValidateMode:'onBlur'
    })
    const navigate=useNavigate()
    const {carts, getCarts} = useOutletContext()
    const modal = useRef(null)
    const [cart, setCart] = useState({})
    const [code, setCode] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const addOrder = () => {
        http({
            url: `/v2/api/${process.env.REACT_APP_PATH}/order`,
            method: 'post',
            data: {
                data: {
                    user: {
                        name: getValues('name'),
                        email: getValues('email'),
                        tel: getValues('tel'),
                        address: getValues('address')
                    },
                    message: getValues('message')
                }
            }
        }).then(response => {
            if (response.data.success) navigate('/orders') 
            else pushMessages({
                type: 'warning',
                title: '訂購失敗',
                content: response.data.message
            })
        }).catch(error => {
            pushMessages({
                type: 'danger',
                title: '訂購失敗',
                content: error.response.data.message
            })
        })
    }
    const applyCoupon = () => {
        http({
            url: `/v2/api/${process.env.REACT_APP_PATH}/coupon`,
            method: 'post',
            data: {data: {code}}
        }).then(response => {
            if (response.data.success) {
                pushMessages({
                    type: 'success',
                    title: '套用成功'
                })
                getCarts()
            } else pushMessages({
                type: 'warning',
                title: '套用失敗',
                content: response.data.message
            })
        }).catch(error => {
            pushMessages({
                type: 'danger',
                title: '套用失敗',
                content: error.response.data.message
            })
        })
    }
    const editCart = (id, qty) => {
        if (isNaN(parseInt(qty)) || parseInt(qty) < 1) return
        else {
            http({
                url: `/v2/api/${process.env.REACT_APP_PATH}/cart/${id}`,
                method: 'put',
                data: {
                    data: {
                        product_id: id,
                        qty: parseInt(qty)
                    }
                }
            }).then(response => {
                if (response.data.success) {
                    pushMessages({
                        type: 'success',
                        title: '變更數量成功'
                    })
                    getCarts()
                } else pushMessages({
                    type: 'warning',
                    title: '變更數量失敗',
                    content: response.data.message
                })
            }).catch(error => {
                pushMessages({
                    type: 'danger',
                    title: '變更數量失敗',
                    content: error
                })
            })
        }
    }
    const openModal = cartId => {
        setCart(carts?.carts.find(cart => cart.id === cartId) ?? {})
        modal.current?.show()
    }
    useEffect(
        () => {
            (async () => {
                setIsLoading(true)
                try {
                    await getCarts()
                } catch (error) {
                    pushMessages({
                        type: 'danger',
                        title: '取得購物車失敗',
                        content: error
                    })
                } finally {
                    setTimeout(
                        () => {setIsLoading(false)},
                        1000)
                }
            })()
        },
        [getCarts, pushMessages]
    )
    return isLoading ? <Loading loading={isLoading} /> : (
        <div className="container">
            {carts?.carts?.length > 0 ?
                <>
                    <table className="table table-borderless mx-auto w-100">
                        <thead>
                            <tr className="row">
                                <th className="col-3 col-lg-1">刪除</th>
                                <th className="col-9 col-lg-6">品名</th>
                                <th className="col-6 col-lg-2 text-lg-end">數量</th>
                                <th className="col-6 col-lg-3 text-lg-end">小計</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carts.carts?.map(cart =>
                                <tr className="row" key={cart.id}>
                                    <td className="col-3 col-lg-1">
                                        <button type="button" className="btn btn-outline-danger"
                                            onClick={() => openModal(cart.id)}>
                                            <i className="bi bi-cart-x-fill"></i>
                                        </button>
                                    </td>
                                    <td className="col-9 col-lg-6 my-1">{cart.product.title}</td>
                                    <td className="col-6 col-lg-3 text-lg-end">
                                        <div className="input-group d-inline-block">
                                            <div className="input-group bg-light rounded">
                                                <div className="input-group-prepend">
                                                    <button className="btn btn-outline-dark border-0 py-2" type="button"
                                                        disabled={cart.qty < 2} onClick={() => {editCart(cart.id, cart.qty - 1)}}>
                                                        <i className="bi bi-dash"></i>
                                                    </button>
                                                </div>
                                                <input
                                                    aria-label="Example text with button addon" aria-describedby="button-addon1"
                                                    className={`form-control border-0 text-center my-auto shadow-none bg-light 
                                            ${(isNaN(parseInt(cart.qty)) || parseInt(cart.qty) < 1) && 'is-invalid'}`}
                                                    value={cart.qty} onChange={event => {editCart(cart.id, event.target.value)}}
                                                />
                                                <div className="input-group-append">
                                                    <button className="btn btn-outline-dark border-0 py-2" type="button"
                                                        onClick={() => {editCart(cart.id, cart.qty + 1)}}>
                                                        <i className="bi-plus bi"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {parseInt(cart.qty) < 1 && <span className="invalid-feedback">商品數量需大於一</span>}
                                    </td>
                                    <td className="col-6 col-lg-2 text-lg-end my-1">{currency(cart.total)}</td>
                                </tr>)}
                        </tbody>
                        <tfoot>
                            {carts.final_total === carts.total ?
                                <tr className="row">
                                    <th className="col-lg-6"></th>
                                    <td className="col-lg-3 text-end">總計</td>
                                    <td className="col-lg-3 text-end">{currency(carts.total || 0)}</td>
                                </tr> :
                                <tr className="row">
                                    <th className="col-3 col-lg-1">折扣</th>
                                    <td className="col-3 col-lg-6">{currency(carts.total - carts.final_total || 0)}</td>
                                    <th className="col-3 col-lg-2 text-lg-end">優惠價</th>
                                    <td className="col-3 col-lg-3 text-lg-end">{currency(carts.final_total || 0)}</td>
                                </tr>
                            }
                        </tfoot>
                    </table>
                    <div className="d-block d-md-none">
                        <div className="input-group mb-1">
                        <label className="input-group-text" htmlFor="code">輸入優惠碼</label>
                            <input className="form-control" id="code" type="text" value={code} onChange={event => setCode(event.target.value)} />
                        </div>
                        <div className="btn-group w-100">
                            <button className="btn btn-secondary"
                            onClick={applyCoupon}>
                            <i className="bi bi-percent pe-1"></i>
                            套用優惠碼
                        </button>
                        <button className="btn btn-danger"
                            onClick={() => {openModal('')}}>
                            <i className="bi bi-cart-x pe-1"></i>
                            清空購物車
                            </button>
                        </div>
                    </div>
                    <div className="d-none d-md-block">
                        <div className="input-group">
                            <label className="input-group-text" htmlFor="code">輸入優惠碼</label>
                            <input className="form-control" id="code" type="text" value={code} onChange={event => setCode(event.target.value)} />
                            <button className="btn btn-secondary"
                                onClick={applyCoupon}>
                                <i className="bi bi-percent pe-1"></i>
                                套用優惠碼
                            </button>
                            <button className="btn btn-danger"
                                onClick={() => {openModal('')}}>
                                <i className="bi bi-cart-x pe-1"></i>
                                清空購物車
                            </button>
                        </div>
                    </div>
                    <hr />
                    <form className="text-center" onSubmit={handleSubmit(addOrder)}>
                        <div className="row">
                            <div className="col-3">姓名</div>
                            <div className="col-9">
                                <input defaultValue="" className={`form-control ${errors?.name && ' is-invalid'}`}
                                    {...register(
                                        'name',
                                        {
                                            required: '欄位必填'
                                        }
                                    )}
                                />
                                <span className="invalid-feedback" name="name">{errors.name?.message}</span>
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-3">地址</div>
                            <div className="col-9">
                                <input defaultValue="" className={`form-control ${errors?.address && 'is-invalid'}`}
                                    {...register(
                                        'address',
                                        {
                                            required: '欄位必填'
                                        }
                                    )}
                                />
                                <span className="invalid-feedback" name="address">{errors.address?.message}</span>
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-3">電話</div>
                            <div className="col-9">
                                <input defaultValue="" type="tel" className={`form-control ${errors?.tel && ' is-invalid'}`}
                                    {...register(
                                        'tel',
                                        {
                                            required: '欄位必填',
                                            pattern: {
                                                value: /0[2-9]\d{8}|0[2-9]{2}\d{7}/,
                                                message: '格式錯誤'
                                            }
                                        }
                                    )}
                                />
                                <span className="invalid-feedback" name="tel">{errors.tel?.message}</span>
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-3">電子信箱</div>
                            <div className="col-9">
                                <input defaultValue="" type="email" className={`form-control ${errors?.email && ' is-invalid'}`}
                                    {...register(
                                        'email',
                                        {
                                            required: '欄位必填',
                                            pattern: {
                                                value: /\S+@\S+\.\S+/,
                                                message: '格式錯誤'
                                            }
                                        }
                                    )}
                                />
                                <span className="invalid-feedback" name="email">{errors.email?.message}</span>
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-3">留言</div>
                            <div className="col-9">
                                <textarea rows="2" cols="20" className="form-control" {...register('message')} />
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col">
                                <input className="btn btn-primary w-50" type="submit" value="前往付款" />
                            </div>
                        </div>
                    </form>
                    <RemoveModal ref={modal} cart={cart} getCarts={getCarts} pushMessages={pushMessages} />
                </> :
                <h1 className="text-center">未選購任何商品</h1>}
        </div>
    )
}
export default Cart