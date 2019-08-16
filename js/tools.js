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
        let startY = 0
        let elementX = 0
        let elementY = 0
        let disX = 0
        let disY = 0
        let index = 0
        let timer = 0

        // 判断首次滑屏方向
        let isX = true
        let isFirst = true
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
            startY = TouchC.clientY
            elementX = css(ulNode, 'translateX')
            elementY = css(ulNode, 'translateY')
        })

        carouselWrap.addEventListener('touchmove', (ev) => {
            if (!isX) {
                return
            }
            ev = ev || window.event
            const TouchC = ev.changedTouches[0]
            const nowX = TouchC.clientX
            const nowY = TouchC.clientY
            disX = nowX - startX
            disY = nowY - startY
            if (isFirst) {
                isFirst = false
                if (Math.abs(disY) > Math.abs(disX)) {
                    isX = false
                        // 首次防抖动
                    return
                }
            }
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
            isX = true
            isFirst = true
            if (needAuto) {
                auto()
            }
        })

        if (needAuto) {
            auto()
        }
    }
    window.drag = () => {
        // 滑屏区域
        const wrap = document.querySelector('.wrap .top .nav')
            // 滑屏元素
        const item = document.querySelector('.wrap .top .nav .list')
        let startX = 0
        let elementX = 0
            // 快速滑屏所需要的元素
        let lastTime = 0
        let timeDis = 1
        let pointDis = 0
        let lastPoint = 0
        const minX = wrap.clientWidth - item.clientWidth
        wrap.addEventListener('touchstart', (ev) => {
            ev = ev || window.event
            const TouchC = ev.changedTouches[0]
            item.style.transition = 'none'
            startX = TouchC.clientX
            elementX = css(item, 'translateX')
            lastTime = new Date().getTime()
            lastPoint = css(item, 'translateX')
            pointDis = 0
            item.headMove = false
        })
        wrap.addEventListener('touchmove', (ev) => {
            ev = ev || window.event
            const TouchC = ev.changedTouches[0]
            const nowX = TouchC.clientX
            const disX = nowX - startX
            let translateX = elementX + disX
                // 橡皮筋效果
                // 在touchmove过程中, 每一次touchmove真正的有效距离在减小, 但是元素的滑动距离在增大
            if (translateX > 0) {
                item.headMove = true
                const scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateX) * 2)
                translateX = elementX + disX * scale
            } else if (translateX < minX) {
                item.headMove = true
                const over = minX - translateX
                const scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + over) * 2)
                translateX = elementX + disX * scale
            }
            css(item, 'translateX', translateX)
            const nowTime = new Date().getTime()
            const nowPoint = css(item, 'translateX')
            timeDis = nowTime - lastTime
            pointDis = nowPoint - lastPoint
            lastTime = nowTime
            lastPoint = nowPoint
        })
        wrap.addEventListener('touchend', (ev) => {
            ev = ev || window.event
            if (!item.headMove) {
                let translateX = css(item, 'translateX')
                const speed = Math.abs(pointDis / timeDis) < 0.5 ? 0 : (pointDis / timeDis)
                let targetX = translateX + speed * 200
                let time = Math.abs(speed) * 0.2 < 1 ? 1 : Math.abs(speed) * 0.2
                time = time > 2 ? 2 : time
                    // 滑屏的橡皮筋效果
                let bsr = ''
                if (targetX > 0) {
                    targetX = 0
                    bsr = 'cubic-bezier(.26, 1.51, .68, 1.54)'
                } else if (targetX < minX) {
                    targetX = minX
                    bsr = 'cubic-bezier(.26, 1.51, .68, 1.54)'
                }
                item.style.transition = `${time}s ${bsr} transform`
                css(item, 'translateX', targetX)
            } else {
                item.headMove = false
                let translateX = css(item, 'translateX')
                item.style.transition = '1s transform'
                if (translateX > 0) {
                    translateX = 0;
                    css(item, 'translateX', translateX)
                } else if (translateX < minX) {
                    translateX = minX;
                    css(item, 'translateX', translateX)
                }
            }

        })
    }
    window.card = (title, contentArr, id) => {
        const cardNavContent = document.querySelector(`.${id} .card-nav .card-nav-content`)
        const cardContent = document.querySelector(`.${id} .card-content`)

        cardNavContent.innerHTML = title
        for (let i = 0; i < contentArr.length; i++) {
            cardContent.innerHTML += `
            <div class='py-1'>
                    <img src="${contentArr[i].img}">
                    <div class="card-content-box">
                        <p class='img-content'>${contentArr[i].content}</p>
                        <p class='img-author text-gray'>${contentArr[i].author}</p>
                    </div>
                </div>
                `
        }
    }
    window.vMove = (wrap, callBack) => {
        // 元素一开始的位置, 手指一开始的位置
        let item = document.querySelector('.wrap .content')
        let item1 = document.querySelector('.wrap .bottom')
        let item2 = document.querySelector('.wrap .top')
        let start = {}
        let element = {}
        let minY = wrap.clientHeight - item.clientHeight - item1.clientHeight - item2.clientHeight
            // 快速滑屏的必要元素
        let lastTime = 0
        let nowTime = 0
        let timeDis = 0
        let startPoint = 0

        let isY = true
        let isFirst = true

        // 即点即停
        let cleartime = 0
        let type = 'Linear'
        const Tween = {
            // t: 当前是哪一次
            // b: 初始位置
            // c: 最终位置
            // d: 总次数
            Linear: (t, b, c, d) => { return c * t / d + b },
            back: (t, b, c, d, s) => {
                if (s === undefined) {
                    s = 1.70158
                }
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
            }
        }

        const bsr = (type, targetY, time) => {
            clearInterval(cleartime)
                // 当前次数
            let t = 0
                // 初始位置
            const b = css(item, 'translateY')
                // 最终位置-初始位置
            const c = targetY - b
                // 总次数
            const d = time * 60
            cleartime = setInterval(() => {
                t++
                if (callBack && typeof callBack['move'] === 'function') {
                    callBack['move'].call(item)
                }
                if (t > d) {
                    clearInterval(cleartime)
                    if (callBack && typeof callBack['end'] === 'function') {
                        callBack['end'].call(item)
                    }
                }
                const point = Tween[type](t, b, c, d, s = 1.7)
                css(item, 'translateY', point)
            }, 1000 / 60)
        }

        wrap.addEventListener('touchstart', (ev) => {
            ev = ev || window.event
            const touchC = ev.changedTouches[0]
            minY = wrap.clientHeight - item.clientHeight - item1.clientHeight - item2.clientHeight
            console.log(minY)
            item.style.transition = 'none'
            start = { clientX: touchC.clientX, clientY: touchC.clientY }
            element = { x: css(item, 'translateX'), y: css(item, 'translateY') }
            lastTime = new Date().getTime()
            startPoint = lastPoint = touchC.clientY
            pointDis = 0

            isY = true
            isFirst = true

            clearInterval(cleartime)

            if (callBack && typeof callBack['start'] === 'function') {
                callBack['start']()
            }
        })
        wrap.addEventListener('touchmove', (ev) => {
            minY = wrap.clientHeight - item.clientHeight - item1.clientHeight - item2.clientHeight

            if (!isY) {
                return
            }

            ev = ev || window.event
            const touchC = ev.changedTouches[0]
            const now = touchC
            const dis = { x: now.clientX - start.clientX, y: now.clientY - start.clientY }
            let translateY = element.y + dis.y

            if (isFirst) {
                isFirst = false
                if (Math.abs(dis.x) > Math.abs(dis.y)) {
                    isY = false
                    return
                }
            }
            nowTime = new Date().getTime()
            const nowPoint = touchC.clientY
            timeDis = nowTime - lastTime
            pointDis = nowPoint - lastPoint
            lastTime = nowTime
            lastPoint = nowPoint

            // 橡皮筋效果
            // 在touchmove过程中, 每一次touchmove真正的有效距离在减小, 但是元素的滑动距离在增大
            if (translateY > 0) {
                item.handMove = true
                const scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + translateY) * 2)
                translateY = css(item, 'translateY') + pointDis * scale
            } else if (translateY < minY) {
                // translateY = minY
                item.handMove = true
                const over = minY - translateY
                const scale = document.documentElement.clientHeight / ((document.documentElement.clientHeight + over) * 2)
                translateY = css(item, 'translateY') + pointDis * scale
            }
            css(item, 'translateY', translateY)
            if (callBack && typeof callBack['move'] === 'function') {
                callBack['move'].call(item)
            }
        })
        wrap.addEventListener('touchend', () => {
            minY = wrap.clientHeight - item.clientHeight - item1.clientHeight - item2.clientHeight
            if (!item.handMove) {
                const translateY = css(item, 'translateY')
                const speed = Math.abs(pointDis / timeDis) < 0.5 ? 0 : pointDis / timeDis
                let targetY = translateY + speed * 200
                let time = Math.abs(speed) * 0.2 < 1 ? 1 : Math.abs(speed) * 0.2
                time = time > 2 ? 2 : time
                    // 滑屏的橡皮筋效果
                if (targetY > 0) {
                    targetY = 0
                    type = 'back'
                } else if (targetY < minY) {
                    targetY = minY
                    type = 'back'
                }
                bsr(type, targetY, time)
            } else {
                let translateY = css(item, 'translateY')
                item.style.transition = '1s transform'
                if (translateY > 0) {
                    translateY = 0
                    css(item, 'translateY', translateY)
                } else if (translateY < minY) {
                    translateY = minY
                    css(item, 'translateY', translateY)
                }
                item.handMove = false
                if (callBack && typeof callBack['end'] === 'function') {
                    callBack['end'].call(item)
                }
            }
        })

    }
    window.tools = {};
    tools.addClass = function(node, className) {
        var reg = new RegExp("\\b" + className + "\\b");
        if (!reg.test(node.className)) {
            node.className += (" " + className);
        }
    }

    tools.removeClass = function(node, className) {
        if (node.className) {
            var reg = new RegExp("\\b" + className + "\\b");
            var classes = node.className;
            node.className = classes.replace(reg, "");
            if (/^\s*$/g.test(node.className)) {
                node.removeAttribute("class");
            }
        } else {
            node.removeAttribute("class");
        }
    }
})(window)