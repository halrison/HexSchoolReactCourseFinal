import {useEffect, useState} from "react"
function Pagination ({paginator, onPaginate}) {
    const [page, setPage] = useState(0)
    useEffect(
        () => {setPage(paginator.current_page)},
        [paginator]
    )
    return (
        <nav aria-label="Page navigation example">
            <ul className="pagination d-flex justify-content-center">
                {paginator?.has_pre &&
                    <li className="page-item">
                        <a className="page-link" onClick={() => {onPaginate(page - 1)}} aria-label="Previous">
                            <span aria-hidden="true">&laquo;</span>
                        </a>
                    </li>
                }
                {
                    [...new Array(paginator.total_pages)].map((_, i) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <li className="page-item" key={`${i}_page`}>
                            <a
                                className={`page-link ${(i + 1 === paginator.current_page) && 'active'}`}
                                onClick={() => {onPaginate(i + 1)}}
                            >
                                {i + 1}
                            </a>
                        </li>
                    ))
                }
                {paginator?.has_next &&
                    <li className="page-item">
                        <a className="page-link" onClick={() => {onPaginate(page + 1)}} aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                        </a>
                    </li>
                }
            </ul>
        </nav>
    )
}
export default Pagination