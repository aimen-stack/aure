import React from "react"
import { Swiper, SwiperSlide } from "swiper/react"

import "swiper/css"
import "swiper/css/effect-coverflow"
import "swiper/css/pagination"
import "swiper/css/navigation"
import { SparklesIcon } from "lucide-react"
import {
  Autoplay,
  EffectCoverflow,
  Navigation,
  Pagination,
} from "swiper/modules"

import { Badge } from "@/components/ui/badge"

export const CardCarousel = ({
  images,
  autoplayDelay = 1500,
  showPagination = true,
  showNavigation = true,
}) => {
  const css = `
  .swiper {
    width: 100%;
    padding-bottom: 50px;
  }
  
  .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 300px;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
  }
  
  .swiper-3d .swiper-slide-shadow-left {
    background-image: none;
  }
  .swiper-3d .swiper-slide-shadow-right{
    background: none;
  }
  `
  return (
    <section className="w-full text-white">
      <style>{css}</style>
      <div className="mx-auto w-full max-w-5xl rounded-[24px] border border-white/10 p-2 shadow-sm md:rounded-t-[44px]">
        <div className="relative mx-auto flex w-full flex-col rounded-[24px] border border-white/10 bg-[#111] p-2 shadow-sm md:items-start md:gap-8 md:rounded-b-[20px] md:rounded-t-[40px] md:p-2">
          <Badge
            variant="outline"
            className="absolute left-4 top-6 rounded-[14px] border border-white/10 text-base md:left-6 text-white"
          >
            <SparklesIcon className="fill-[#FF2E93] stroke-1 text-[#FF2E93] mr-2" />
            Featured Work
          </Badge>
          <div className="flex flex-col justify-center pb-2 pl-4 pt-20 md:items-center w-full">
            <div className="flex gap-2">
              <div className="text-center">
                <h3 className="text-4xl opacity-85 font-bold tracking-tight text-white mb-2">
                  Our Portfolio
                </h3>
                <p className="text-gray-400">Seamless Images carousel animation.</p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-4">
            <div className="w-full">
              <Swiper
                spaceBetween={50}
                autoplay={{
                  delay: autoplayDelay,
                  disableOnInteraction: false,
                }}
                effect={"coverflow"}
                grabCursor={true}
                centeredSlides={true}
                loop={true}
                slidesPerView={"auto"}
                coverflowEffect={{
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }}
                pagination={showPagination}
                navigation={
                  showNavigation
                    ? {
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                      }
                    : undefined
                }
                modules={[EffectCoverflow, Autoplay, Pagination, Navigation]}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="w-full h-full rounded-3xl">
                      <img
                        src={image.src}
                        className="w-full h-full rounded-xl object-cover aspect-[3/4]"
                        alt={image.alt || 'Portfolio image'}
                      />
                    </div>
                  </SwiperSlide>
                ))}
                {images.map((image, index) => (
                  <SwiperSlide key={index + 'b'}>
                    <div className="w-full h-full rounded-3xl">
                      <img
                        src={image.src}
                        className="w-full h-full rounded-xl object-cover aspect-[3/4]"
                        alt={image.alt || 'Portfolio image'}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
