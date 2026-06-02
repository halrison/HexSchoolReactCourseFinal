import {useRef, useState} from 'react'
import {useNavigate} from 'react-router'
import axios from 'axios'
function Login () {
    const form = useRef(null)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [usernameError, setUsernameError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const [error, setError] = useState({})
    const navigate = useNavigate()
    const login = event => {
        event.preventDefault()
        setError({})
        setUsernameError(username === '' ? '欄位必填' : '')
        if (password === '') {
            setPasswordError('欄位必填')
            return
        } else {
            setPasswordError('')
            axios({
                url: `${process.env.REACT_APP_API}/admin/signin`,
                method: 'post',
                data: {username, password}
            }).then(response => {
                if (response.data.success) {
                    const {token, expired} = response.data;
                    document.cookie = `hexToken=${token}; expires=${new Date(expired)}; path=/`
                    navigate('/admin/products');
                } else setError(response.data.error)
            }).catch(error => setError({...error}))
        }
    }
    return (
        <div className="position-relative">
            <div className="posttion-absolute w-100"></div>
            <form className="justify-content-center" onSubmit={login} ref={form}>
                <div className="container my-3">
                    <h2 className="font-weight-normal text-center">登入帳號</h2>
                    <div className="row mb-2">
                        <div className="col-3 text-center">
                            <label htmlFor="email" className="form-label">電子信箱</label>
                        </div>
                        <div className="col-9">
                            <input id="email" name="username" type="email" placeholder="Email Address" autoComplete="true" aria-describedby="UsernameErrorFeedback"
                                value={username} onChange={event => setUsername(event.target.value)} className={`form-control ${usernameError && 'is-invalid'}`}
                            />
                            <p id="UsernameErrorFeedback" className="invalid-feedback">{usernameError}</p>
                        </div>
                    </div>
                    <div className="row mb-2">
                        <div className="col-3 text-center">
                            <label htmlFor="password" className="form-label">密碼 </label>
                        </div>
                        <div className="col-9">
                            <input type="password" name="password" id="password" placeholder="Password" aria-describedby="PasswordErrorFeedback" autoComplete="true"
                                value={password} onChange={event => setPassword(event.target.value)} className={`form-control ${passwordError && 'is-invalid'}`}
                            />
                            <p id="PasswordErrorFeedback" className="invalid-feedback">{passwordError}</p>
                        </div>
                    </div>
                    <div className="text-center my-4">
                        <input type="submit" className="btn btn-lg btn-primary mb-1" value="登入" />
                    </div>
                </div>
                {Object.keys(error).length > 0 &&
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">{error?.code === 'auth/user-not-found' ? '帳號錯誤' : '密碼錯誤'}</h4>
                        <h6>{error?.code === 'auth/user-not-found' ? '帳號輸入錯誤或未註冊' : '密碼錯誤或未設置'}</h6>
                    </div>
                }
            </form>
        </div>
    )
}
export default Login