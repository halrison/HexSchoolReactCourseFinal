import {ClipLoader} from "react-spinners";
function Loading ({loading}) {
    return loading&&(
        <div className="position-relative vh-100">
            <ClipLoader size={50} loading={loading} className="position-absolute top-50 start-50"/>
        </div>
    )
}
export default Loading