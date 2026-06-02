import axios from "axios";

const http = axios.create({
    baseURL: process.env.REACT_APP_API,
    headers: {
        'cache-control': 'no-cache'
    }
})

const addImage = (tempUrl, callback1, callback2) => {
    const image = new Image()
    image.src = tempUrl
    if (image.complete) callback1()
    else callback2()
}
const uploadImage = (file, callback) => {
    const form = new FormData
    if (file) {
        form.append('image', file)
        http.post(
            `${process.env.REACT_APP_API}/api/${process.env.REACT_APP_PATH}/admin/upload`,
            form
        ).then(response => callback(response)
        ).catch(error => callback(error?.response)
        ).finally(() => {file = {}})
    } else return
}

function transDate (date=Date.now()) {
    const localDate = new Date(date)
    const formatter = Intl.DateTimeFormat(
        'zh-tw',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }
    )
    return formatter.format(localDate).replaceAll('/', '-')
}
function currency (num) {
    const n = parseInt(num, 10);
    return `${n.toFixed(0).replace(/./g, (c, i, a) => (i && c !== '.' && ((a.length - i) % 3 === 0) ? `, ${c}`.replace(/\s/g, '') : c))}`;
}
export {http, transDate, currency, uploadImage, addImage}