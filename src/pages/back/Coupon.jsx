import {useCallback, useContext, useEffect, useRef, useState} from "react"
import {useForm} from "react-hook-form"
import {http, transDate} from "../../utils.js"
import ToastContext from "../../contexts/useToast.js"
import Loading from "../../components/Loading"
import Modal from "../../components/Modal"
import Pagination from "../../components/Pagination.jsx"
const initCoupon = {
    code: '',
    percent: 0,
    title: '',
    due_date: Date.now(),
    is_enabled: 0
}
function CouponModal ({coupon, getCoupons, ref, pushMessages}) {
    const [tempCoupon, setTempCoupon] = useState(initCoupon)
    const {formState: {errors}, register, getValues, handleSubmit} = useForm({
        defaultValues: {
            ...initCoupon,
            due_date: transDate(initCoupon.due_date)
        },
        values: {
            ...tempCoupon,
            due_date: transDate(tempCoupon.due_date)
        }
    })
    const saveCoupon = () => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/coupon/${tempCoupon.id ? tempCoupon.id:''}`,
            method: tempCoupon.id ? 'put' : 'post',
            data: {
                data: {
                    ...getValues(),
                    is_enabled:getValues('is_enabled')?1:0,
                    due_date: Date.parse(getValues('due_date'))
                }
            }
        }).then(response => {
            if (response.data.success) {
                getCoupons(1)
                pushMessages({
                    type: 'success',
                    title: '儲存優惠券成功',
                    content: response.data.message
                })
            } else pushMessages({
                type: 'warning',
                title: '儲存優惠券失敗',
                content: response.data.message
            })
        }
        ).catch(error =>
            pushMessages({
                type: 'danger',
                title: '儲存優惠券發生錯誤',
                content: error.response.data.message
            })
        )
    }
    useEffect(
        () => {
            if (coupon.id) {
                setTempCoupon({
                    ...coupon,
                    due_date: transDate(coupon.due_date)
                })
            }
            else {
                setTempCoupon({
                    ...initCoupon,
                    due_date: transDate(initCoupon.due_date)
                })
            }
        },
        [coupon]
    )
    return (
        <form onSubmit={handleSubmit(saveCoupon)} onReset={() => ref.current.hide()}>
            <Modal ref={ref} size='lg'>
                <Modal.Header title={`${tempCoupon.id ? '編輯' : '建立'}優惠券`} />
                <Modal.Body>
                    <div className="mb-2">
                        <label className="w-100" htmlFor="title">標題</label>
                        <input
                            type="text"
                            id="title"
                            placeholder="請輸入標題"
                            className={`form-control mt-1 ${errors.title && ' is-invalid'}`}
                            defaultValue={tempCoupon.title}
                            {...register(
                                'title',
                                {required: "欄位必填"}
                            )}
                        />
                        <p className="invalid-feedback">{errors.title?.message}</p>
                    </div>
                    <div className="mb-2">
                            <label className="w-100" htmlFor="code">優惠碼</label>
                            <input
                                type="text"
                                id="code"
                                placeholder="請輸入優惠碼"
                                className={`form-control mt-1 ${errors.code && ' is-invalid'}`}
                                defaultValue={tempCoupon.code}
                                {...register(
                                    'code',
                                    {required: '欄位必填'}
                                )}
                            />
                            <p className="invalid-feedback">{errors.code?.message}</p>
                    </div>
                    <div className="row">                        
                        <div className="col-6 mb-2">
                            <label className="w-100" htmlFor="due_date">到期日</label>
                            <input
                                type="date"
                                id="due_date"
                                placeholder="請輸入到期日"
                                defaultValue={tempCoupon.due_date}
                                className={`form-control mt-1 ${errors.due_date && ' is-invalid'}`}
                                {...register(
                                    'due_date',
                                    {
                                        required: '必填欄位',
                                        validate: {
                                            minDate (value) {if (!tempCoupon.id && value < Date.now()) return '不得比今日還早'}
                                        }
                                    }
                                )}
                            />
                            <p className="invalid-feedback">{errors.due_date?.message}</p>
                        </div>
                        <div className="col-3 mb-2">
                            <label className="w-100" htmlFor="percent">折扣</label>
                            <input
                                type="number"
                                id="percent"
                                placeholder="請輸入折扣（%）"
                                className={`form-control mt-1 ${errors.percent && ' is-invalid'}`}
                                defaultValue={tempCoupon.percent}
                                {...register(
                                    'percent',
                                    {
                                        min: {
                                            value: 1,
                                            message: '不得免費'
                                        },
                                        max: {
                                            value: 99,
                                            message: '不得超出原價'
                                        },
                                        valueAsNumber: true
                                    }
                                )}
                            />
                            <p className="invalid-feedback">{errors.percent?.message}</p>
                        </div>
                        <div className="col-3 mb-2">
                            <label className="w-100" htmlFor="is_enabled">啟用</label>
                            <input className="form-check-input" type="checkbox" id="is_enabled"
                                defaultChecked={!!tempCoupon.is_enabled} defaultValue={tempCoupon.is_enabled}
                                {...register('is_enabled')} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <input type="reset" className="btn btn-secondary" value="取消" />
                    <input type="submit" className="btn btn-primary" value="儲存" />
                </Modal.Footer>
            </Modal>
        </form>
    )
}
function DeleteModal ({coupon, getCoupons, ref, pushMessages}) {
    const deleteCoupon = id => {
        http({
            url: `/api/${process.env.REACT_APP_PATH}/admin/coupon/${id}`,
            method: 'delete'
        }).then(response => {
            if (response.data.success) {
                ref.current.hide()
                getCoupons(1)
                pushMessages({
                    type: 'success',
                    title: '刪除優惠券成功',
                    content: response.data.message
                })
            } else pushMessages({
                type: 'warning',
                title: '刪除優惠券失敗',
                content: response.data.message
            })
        }).catch(error =>
            pushMessages({
                type: 'danger',
                title: '刪除優惠券發生錯誤',
                content: error.response.data.message
            })
        )
    }
    return (
        <Modal ref={ref} size='sm'>
            <Modal.Header title='刪除優惠券' />
            <Modal.Body>要刪除「 {coupon.title} 」嗎</Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => {ref.current.hide()}}>取消</button>
                <button className="btn btn-danger" onClick={() => {deleteCoupon(coupon.id)}}>確定</button>
            </Modal.Footer>
        </Modal>
    )
}
function Coupon () {
    const {pushMessages} = useContext(ToastContext)
    const [coupons, setCoupons] = useState([])
    const [coupon, setCoupon] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [paginator, setPaginator] = useState({})
    const couponModal = useRef(null)
    const removeModal = useRef(null)
    const openCouponModal = (action, id) => {
        setCoupon(coupons.find(c => c.id === id) ?? {})
        if (action === 'remove') removeModal.current.show()
        else couponModal.current.show()
    }
    const getCoupons = useCallback(
        page => {
            setIsLoading(true)
            http({
                url: `/api/${process.env.REACT_APP_PATH}/admin/coupons`,
                params: {page}
            }).then(response => {
                if (response.data.success) {
                    setCoupons(response.data.coupons)
                    setPaginator(response.data.pagination)
                } else pushMessages({
                    type: 'warning',
                    title: '',
                    content: response.data.message
                })
            }).catch(error =>
                pushMessages({
                    type: 'danger',
                    title: '',
                    content: error.response.data.message
                })
            ).finally(() => setIsLoading(false))
        },
        [pushMessages]
    )
    useEffect(
        () => {getCoupons(1)},
        [getCoupons]
    )
    return isLoading ?
        <Loading loading={isLoading} /> :
        <>
            <div className="p-3">
                <div className="text-end">
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm mt-2"
                        onClick={() => openCouponModal('add', '')}
                    >
                        <i className="bi bi-plus me-1"></i>
                        建立新優惠券
                    </button>
                </div>
                <div className="table-responsive-sm overflow-x-hidden mt-2">
                    <table className="table table-striped">
                        <thead>
                            <tr className="row mx-0">
                                <th className="col-6 col-lg-2">標題</th>
                                <th className="col-6 col-lg-3">代碼</th>
                                <th className="col-6 col-lg-3 text-lg-end">到期日</th>
                                <th className="col-3 col-lg-1 text-lg-end">折扣</th>
                                <th className="col-3 col-lg-1">狀態</th>
                                <th className="col-lg-2">動作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(coupon =>
                                <tr key={coupon.num} className="row mx-0">
                                    <td className="col-6 col-lg-2">{coupon.title}</td>
                                    <td className="col-6 col-lg-3">{coupon.code}</td>
                                    <td className="col-6 col-lg-3 text-lg-end">{transDate(coupon.due_date)}</td>
                                    <td className="col-3 col-lg-1 text-lg-end">{coupon.percent}</td>
                                    <td className="col-3 col-lg-1">
                                        <div className={coupon.is_enabled ? 'text-success' : 'text-danger'}>
                                            {coupon.is_enabled ? '啟' : '停'}用
                                        </div>
                                    </td>
                                    <td className="col-lg-2">
                                        <div className="btn-group btn-group-sm w-100" role="group" aria-label="Basic Example">
                                            <button onClick={() => openCouponModal('edit', coupon.id)} className="btn btn-outline-warning btn-sm">
                                                <i className="bi bi-pencil-square me-1"></i>
                                                編輯
                                            </button>
                                            <button onClick={() => openCouponModal('remove', coupon.id)} className="btn btn-outline-danger btn-sm">
                                                <i className="bi bi-trash me-1"></i>
                                                移除
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {paginator.total_pages > 1 && <Pagination paginator={paginator} onPaginate={getCoupons} />}
            <CouponModal ref={couponModal} coupon={coupon} getCoupons={getCoupons} pushMessages={pushMessages} />
            <DeleteModal ref={removeModal} coupon={coupon} pushMessages={pushMessages} />
        </>
}
export default Coupon