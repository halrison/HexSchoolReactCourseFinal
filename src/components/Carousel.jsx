import {Children, useEffect, useImperativeHandle, useRef} from "react"
import {Carousel as bootstrapCarousel} from "bootstrap"
function Carousel ({children, ref}) {
    const carouselRef = useRef(null)
    const bsCarousel = useRef(null)
    useEffect(
        () => {
            bsCarousel.current = new bootstrapCarousel(
                carouselRef.current,
                {
                    touch: true,
                    interval: 3000,
                    ride: "carousel",
                    pause: "hover",
                    wrap: true
                }
            )
        },
        []
    )
    useImperativeHandle(
        ref,
        function () {
            return {
                prev: () => {bsCarousel.current.prev()},
                next: () => {bsCarousel.current.next()}
            }
        }
    )
    return (
        <div ref={carouselRef} className="carousel carousel-dark slide">
            <div className="carousel-inner ">
                {children}
            </div>
            {Children.count(children)>1 &&
                <>
                    <button className="carousel-control-prev" type="button" onClick={() => {bsCarousel.current.prev()}}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" onClick={() => {bsCarousel.current.next()}}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </>
            }
        </div>
    )
}
export default Carousel