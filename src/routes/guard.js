import {redirect} from "react-router";
import {http} from "../utils";
export default async function () {
    const token = document.cookie.split('; ').find((row) => row.startsWith('hexToken='))?.split('=')[1]
    http.defaults.headers.common['Authorization'] = token
    try {await http.post(`/v2/api/user/check`)}
    catch(error) {throw redirect('/login')}        
}