// динамический адаптив: на указанном медиа-запросе (max-width=${query}px) перемещает блоки из одного места в другое посредством замены другого элемента
/* Чтобы работало, нужно: 
    1) создать элемент-"якорь", который будет заменен при адаптиве (достижении медиа-запроса max-width) и указать ему класс, id или любой другой селектор;
    2) элементу, который перемещается при адаптиве, задать атрибут data-dynamic-adaptive="query, selector", где query - значение медиа-запроса (max-width=${query}px), а selector - селектор заменяемого элемента (из шага 1)
*/
class DynamicAdaptive {
    constructor(node) {
        this.onMediaChange = this.onMediaChange.bind(this);

        this.rootElem = node;
        let data = this.rootElem.dataset.dynamicAdaptive.split(", ");
        this.mediaValue = data[0];
        this.mediaQuery = window.matchMedia(`(max-width: ${this.mediaValue}px)`);
        this.adaptiveSelector = data[1];
        this.adaptiveNode = findClosest(this.rootElem, this.adaptiveSelector);
        this.backAnchor = createElement("div");

        this.onMediaChange();
        this.mediaQuery.addEventListener("change", this.onMediaChange);
    }
    onMediaChange() {
        if (this.mediaQuery.matches) {
            this.rootElem.replaceWith(this.backAnchor);
            this.adaptiveNode.replaceWith(this.rootElem);
            this.isReplaced = true;
        } else if (this.isReplaced) {
            this.rootElem.replaceWith(this.adaptiveNode);
            this.backAnchor.replaceWith(this.rootElem);
        }
    }
}

// создает оверлей "под полем" (в разметке - вставляется через .before()) при фокусировке на нем
class OverlayInputs {
    constructor() {
        this.elems = [];

        this.getElems();
    }
    getElems() {
        const newElems = Array.from(document.querySelectorAll("[data-overlay-input]"))
            .filter(el => !this.elems.find(elemsEl => elemsEl === el));
        this.elems = this.elems.concat(newElems);

        newElems.forEach(el => {
            onFocus = onFocus.bind(this);

            const types = ["text", "email", "tel"];
            el.removeAttribute("data-overlay-input");
            const inputs = Array.from(el.querySelectorAll("input"))
                .filter(inp => types.includes(inp.getAttribute("type")))
                .concat(Array.from(el.querySelectorAll("textarea")));
            inputs.forEach(input => {
                input.addEventListener("focus", onFocus);
                input.addEventListener("blur", onBlur);
            });

            function onFocus() {
                selectsOverlay.append(el);
            }
            function onBlur() {
                setTimeout(() => {
                    if (!document.activeElement || document.activeElement === document.body)
                        selectsOverlay.remove();
                }, 150);
            }
        });
    }
}
const overlayInputs = new OverlayInputs();

class FullsizeImage {
    constructor(node) {
        this.onImageClick = this.onImageClick.bind(this);
        this.onPopupClick = this.onPopupClick.bind(this);
        this.setCrossPosition = this.setCrossPosition.bind(this);
        this.removePopup = this.removePopup.bind(this);

        this.rootElem = node;
        this.rootElem.addEventListener("click", this.onImageClick);
    }
    onImageClick() {
        this.createPopup();
        const img = new Image();
        img.src = this.rootElem.src;
        img.onload = () => {
            this.img = img;
            this.insertBody(img);
        };
    }
    createPopup() {
        const popup = createElement("div", "fullsize-image-popup");
        const body = createElement("div", "fullsize-image-popup__body");

        body.insertAdjacentHTML("afterbegin", `<div class="fullsize-image-popup__cross popup__cross"></div>`);
        popup.append(body);
        this.insertPopup(popup);
        const cross = body.querySelector(".fullsize-image-popup__cross");

        popup.addEventListener("click", this.onPopupClick);
        cross.addEventListener("click", this.removePopup);

        this.popup = { popup, body, cross };
    }
    insertPopup(popup) {
        popup.style.cssText = "background: rgba(0, 0, 0, 0); transition: 0;";
        document.body.append(popup);
        document.body.classList.add("__locked-scroll");
        setTimeout(() => {
            popup.style.removeProperty("background");
            popup.style.removeProperty("transition");
        }, 50);
    }
    insertBody(popupBodyContent) {
        this.popup.body.style.cssText = "transform: translate(0, -100%); transition: 0s;";
        this.popup.body.append(popupBodyContent);
        setTimeout(() => {
            this.popup.body.style.cssText = "transfrom: translate(0, 0);";
        }, 50);

        this.setCrossPosition();
        window.addEventListener("resize", this.setCrossPosition);
    }
    setCrossPosition() {
        const imgCoords = getCoords(this.img);
        this.popup.cross.style.left =
            `${imgCoords.right - this.popup.cross.getBoundingClientRect().width}px`;
        this.popup.cross.style.top = "0";
    }
    onPopupClick(event) {
        const isException = event.target.closest(".fullsize-image-popup__body")
            && event.target !== this.popup.body;
        if (isException) return;

        this.removePopup();
    }
    removePopup() {
        this.popup.popup.style.cssText = "background: rgba(0, 0, 0, 0); transition-duration: .5s;";
        this.popup.body.style.cssText = "transform: translate(0, -100%); transition-duration: .5s;";
        document.body.classList.remove("__locked-scroll");
        setTimeout(() => {
            this.popup.popup.remove();
            window.removeEventListener("resize", this.setCrossPosition);
        }, 500);
    }
}

class Header {
    constructor(node) {
        this.onMenuBtnClick = this.onMenuBtnClick.bind(this);
        this.toggleMenu = this.toggleMenu.bind(this);

        this.rootElem = node;
        this.menuButtons = this.rootElem.querySelectorAll(".menu-button");

        this.menuButtons.forEach(menuBtn => {
            menuBtn.addEventListener("click", this.onMenuBtnClick);
        });
    }
    onMenuBtnClick(event) {
        const menuBtn = event.currentTarget;
        this.toggleMenu(menuBtn);
    }
    toggleMenu(btn, action = null) {
        show = show.bind(this);
        hide = hide.bind(this);

        if (action) {
            if (action === "show") return show();
            if (action === "hide") return hide();
        }

        btn.classList.contains("__active")
            ? hide()
            : show();

        function show() {
            btn.classList.add("__active")
        }
        function hide() {
            btn.classList.remove("__active")
        }
    }
}

class ScrollArrow {
    constructor(node) {
        this.onClick = this.onClick.bind(this);
        this.onScrollOrResize = this.onScrollOrResize.bind(this);

        this.rootElem = node;
        this.direction = getDirection.call(this);

        window.addEventListener("scroll", this.onScrollOrResize);
        window.addEventListener("resize", this.onScrollOrResize);
        this.rootElem.addEventListener("click", this.onClick);
        this.onScrollOrResize();
        setBodyMutationObserver.call(this);

        function getDirection() {
            if (this.rootElem.classList.contains("scroll-arrows__arrow--down")) return "down";
            if (this.rootElem.classList.contains("scroll-arrows__arrow--up")) return "up";
            if (this.rootElem.classList.contains("scroll-arrows__arrow--bottom")) return "bottom";
            if (this.rootElem.classList.contains("scroll-arrows__arrow--top")) return "top";
        }
        function setBodyMutationObserver() {
            const observer = new MutationObserver(this.onScrollOrResize);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }
    onScrollOrResize() {
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;
        const bodyHeight = document.body.offsetHeight;

        if (this.direction === "up" || this.direction === "top") {
            if (window.pageYOffset <= 100) this.rootElem.setAttribute("disabled", "");
            else this.rootElem.removeAttribute("disabled");
        } else if (this.direction === "down" || this.direction === "bottom") {
            if (window.pageYOffset >= bodyHeight - windowHeight - 100)
                this.rootElem.setAttribute("disabled", "");
            else this.rootElem.removeAttribute("disabled");
        }
    }
    onClick() {
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;

        switch (this.direction) {
            case "down":
                window.scrollTo({
                    top: window.pageYOffset + windowHeight,
                    behavior: "smooth"
                });
                break;
            case "up":
                window.scrollTo({
                    top: window.pageYOffset - windowHeight,
                    behavior: "smooth"
                });
                break;
            case "top":
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                })
                break;
            case "bottom":
                window.scrollTo({
                    top: document.body.offsetHeight,
                    behavior: "smooth"
                });
                break;
        }
    }
}

const lockScrollObserver = new MutationObserver(() => {
    const wrapper = document.querySelector(".wrapper");
    const header = document.querySelector(".header");
    const scrollWidth = getScrollWidth();
    if (document.body.classList.contains("__locked-scroll")) {
        wrapper.style.paddingRight = `${scrollWidth}px`;
        header.style.width = `calc(100% + ${scrollWidth}px)`;
    }
    else {
        wrapper.style.removeProperty("padding-right");
        header.style.removeProperty("width");
    }
});
lockScrollObserver.observe(document.body, { attributes: true });

let inittingSelectors = [
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: "[data-fullsize-image]", classInstance: FullsizeImage },
    { selector: ".header", classInstance: Header },
    { selector: ".scroll-arrows__arrow", classInstance: ScrollArrow },
];

function initInputs() {
    inittingSelectors.forEach(selectorData => {
        const selector = selectorData.selector;
        const classInstance = selectorData.classInstance;
        const notInittedNodes = Array.from(document.querySelectorAll(selector))
            .filter(node => {
                let isInitted = Boolean(
                    inittedInputs.find(inpClass => {
                        return inpClass.rootElem === node
                            && inpClass instanceof selectorData.classInstance
                    })
                );
                return isInitted ? false : true;
            });

        notInittedNodes.forEach(inittingNode => {
            if (inittingNode.closest("[data-addfield-hide]")) return;
            const inputParams = new classInstance(inittingNode);
            inittedInputs.push(inputParams);
        });
    });
    inittedInputs = inittedInputs.filter(inpParams => inpParams.rootElem);

    document.dispatchEvent(new CustomEvent("init-inputs"));
    browsersFix();
}

let isInitting = false;
const inittingInputsBodyObserver = new MutationObserver(() => {
    if (isInitting) return;

    isInitting = true;
    initInputs();
    setTimeout(() => {
        isInitting = false;
        initInputs();
    }, 0);
});
inittingInputsBodyObserver.observe(document.body, { childList: true, subtree: true });
initInputs();

// здесь проходят инициализации скриптов из других файлов
document.addEventListener("inputs-declared", () => {
    setTimeout(() => {
        
    }, 0);
});