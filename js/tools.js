;
(function(window) {
    window.css = function(node, type, val) {
        if (typeof node === "object" && typeof node["transform"] === "undefined") {
            node["transform"] = {};
        }

        if (arguments.length >= 3) {
            // 设置
            let text = ''
            node['transform'][type] = val

            for (let item in node['transform']) {
                if (node['transform'].hasOwnProperty(item)) {
                    switch (item) {
                        case 'translateX':
                        case 'translateY':
                            text += `${item}(${node['transform'][item]}px)`
                            break
                        case 'scale':
                            text += `${item}(${node['transform'][item]})`
                            break
                        case 'rotate':
                            text += `${item}(${node['transform'][item]}deg)`
                            break
                    }
                }
            }
            node.style.transform = node.style.webkitTransform = text
        } else if (arguments.length === 2) {
            val = node['transform'][type]
            if (typeof val === "undefined") {
                switch (type) {
                    case 'translateX':
                    case 'translateY':
                    case 'rotate':
                        val = 0
                        break
                    case 'scale':
                        val = 1
                        break
                }
            }
            return val
        }
    }
    window.carousel = function(arr) {
        const carouselWrap = document.querySelector('.carousel-wrap')
        const pointsWrap = document.querySelector('.carousel-wrap .points-wrap')
        const pointsLengths = arr.length
        let needCarousel = carouselWrap.getAttribute('needCarousel')
        needCarousel = needCarousel === null ? false : true
        let needAuto = carouselWrap.getAttribute('needAuto')
        needAuto = needAuto == null ? false : true
        const ulNode = document.createElement('ul')
            // 布局
        if (carouselWrap) {
            // 无缝
            if (needCarousel) {
                arr = arr.concat(arr)
            }
            const styleNode = document.createElement('style')
            ulNode.classList.add('list')
            for (let i = 0; i < arr.length; i++) {
                ulNode.innerHTML += `<li><a href="javascript:;"><img src="${arr[i]}"></a></li>`
            }
            styleNode.innerHTML += `.carousel-wrap .list li{width: ${1/arr.length*100}%;} .carousel-wrap .list{width: ${arr.length}00%}`
            carouselWrap.appendChild(ulNode)
            document.head.appendChild(styleNode)

            const imgNodes = document.querySelector('.carousel-wrap .list li img')
            setTimeout(() => {
                carouselWrap.style.height = imgNodes.offsetHeight + "px"
            }, 100)
        }

        if (pointsWrap) {
            for (let i = 0; i < pointsLengths; i++) {
                if (i === 0) {
                    pointsWrap.innerHTML += `<span class="active"></span>`
                } else {
                    pointsWrap.innerHTML += `<span></span>`
                }
            }
        }


        // 滑屏
        // 1. 拿到元素一开始的位置
        // 2. 拿到手指一开始的位置
        // 3. 拿到手指move的距离
        // 4. 将手指移动的距离添加给元素

        let startX = 0
        let elementX = 0
        let disX = 0
        let index = 0
        let timer = 0
        const point = (index) => {
            if (!pointsWrap) {
                return
            }
            const pointsSpan = document.querySelectorAll('.carousel-wrap .points-wrap span')
            for (let i = 0; i < pointsSpan.length; i++) {
                pointsSpan[i].classList.remove('active')
            }
            pointsSpan[-index % pointsLengths].classList.add('active')
        }
        const auto = () => {
            clearInterval(timer)
            timer = setInterval(() => {
                if (index == 1 - arr.length) {
                    ulNode.style.transition = "none";
                    index = 1 - arr.length / 2;
                    css(ulNode, "translateX", index * document.documentElement.clientWidth);
                }
                setTimeout(function() {
                    index--;
                    ulNode.style.transition = "1s transform";
                    point(index);
                    css(ulNode, "translateX", index * document.documentElement.clientWidth);
                }, 50)
            }, 2000)
        }

        carouselWrap.addEventListener('touchstart', (ev) => {
            ev = ev || window.event
            const TouchC = ev.changedTouches[0]
            ulNode.style.transition = 'none'
            clearInterval(timer)
                // 无缝
            index = css(ulNode, 'translateX') / document.documentElement.clientWidth
            if (needCarousel) {
                if (index === 0) {
                    index = -pointsLengths
                } else if (-index === (pointsLengths * 2 - 1)) {
                    index = -(pointsLengths - 1)
                }
                css(ulNode, 'translateX', index * (document.documentElement.clientWidth))
            }
            startX = TouchC.clientX
            elementX = css(ulNode, 'translateX')
        })

        carouselWrap.addEventListener('touchmove', (ev) => {
            ev = ev || window.event
            const TouchC = ev.changedTouches[0]
            const nowX = TouchC.clientX
            disX = nowX - startX
            css(ulNode, 'translateX', elementX + disX)
        })

        carouselWrap.addEventListener('touchend', () => {
            index = css(ulNode, 'translateX') / document.documentElement.clientWidth
            if (index > 0) {
                index = 0
            } else if (index < 1 - arr.length) {
                index = 1 - arr.length
            }
            index = Math.round(index)

            const pointsSpan = document.querySelectorAll('.carousel-wrap .points-wrap span')
            for (let i = 0; i < pointsSpan.length; i++) {
                pointsSpan[i].classList.remove('active')
            }
            pointsSpan[-index % pointsLengths].classList.add('active')
            ulNode.style.transition = 'transform .5s'
            css(ulNode, 'translateX', index * (document.documentElement.clientWidth))
            if (needAuto) {
                auto()
            }
        })

        if (needAuto) {
            auto()
        }
    }
})(window)