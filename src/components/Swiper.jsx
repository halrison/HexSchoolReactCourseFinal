import { Children } from "react"
import {Autoplay, Navigation} from "swiper/modules"
import {Swiper, SwiperSlide} from "swiper/react"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/autoplay"
const swiperOptions = {
    autoplay: {
        delay: 2500,
        disableOnInteraction: false
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    loop: true,
    spaceBetween: 1,
    slidesPerView: 1,
    breakpoints: {
        576: {
            slidesPerView: 2,
            spaceBetween: 5
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 10
        }
    },
    modules: [Autoplay, Navigation]
}
function MySwiper ({children}) {

    return (
        <Swiper {...swiperOptions}>
            {Children.map(
                children,
                child=> (
                <SwiperSlide>
                    {child}
                </SwiperSlide>
                )
            )}
        </Swiper>
    )
}
export default MySwiper