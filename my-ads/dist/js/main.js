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

class HoverTitle {
    constructor(node) {
        this.onPointerover = this.onPointerover.bind(this);
        this.onPointerleave = this.onPointerleave.bind(this);

        this.rootElem = node;
        this.text = this.rootElem.getAttribute("data-hover-title");
        this.block = createElement("span", "hint hint--triangle hover-title __shown", this.text);

        this.rootElem.addEventListener("pointerover", this.onPointerover);
        this.rootElem.addEventListener("pointerleave", this.onPointerleave);

        setTextChangeObserver.call(this);

        function setTextChangeObserver() {
            const observer = new MutationObserver(callback.bind(this));
            observer.observe(this.rootElem, { attributes: true });

            function callback() {
                let newText = this.rootElem.getAttribute("data-hover-title");
                if (typeof newText === "string") newText = newText.trim();
                if (newText === this.text) return;

                if (!newText) {
                    this.text = null;
                    return;
                }
                this.text = newText;
                this.block.innerHTML = "";
                this.block.insertAdjacentHTML("afterbegin", this.text);
            }
        }
    }
    onPointerover() {
        if (!this.text) return;
        this.rootElem.append(this.block);
    }
    onPointerleave() {
        if (!this.text) return;

        this.block.remove();
    }
}

class EditableList {
    constructor(node) {
        this.rootElem = node;
        this.itemsList = this.rootElem.querySelector(".editable-list__items-list");
        this.params = getParams(this);
        this.items = [];
        this.showMore = {
            container: createElement(
                "div",
                "editable-list__show-more",
                `<button class="link link--purple editable-list__more-button" type="button">Ещё</button>`
            )
        }

        this.hintMethods = this.createHintMethods();
        initHint.call(this);
        this.rootElem.append(this.showMore.container);
        this.showMore.button = this.showMore.container.querySelector("button");
        this.showMore.button.addEventListener("click", this.hintMethods.toggle);
        document.addEventListener("click", onDocumentClick.bind(this));

        this.getItems();

        function initHint() {
            const hintInner = renderMisc.hintInner({ title: this.params.title });
            const node = createElement("div", "editable-list__hint hint", hintInner);
            const body = node.querySelector(".hint__body");
            const cross = node.querySelector(".hint__close");
            cross.addEventListener("click", this.hintMethods.close);

            this.hint = { node, body, cross };
            this.rootElem.append(this.hint.node);
        }
        function onDocumentClick(event) {
            if (checkIfTargetOrClosest(event.target, [this.hint.node, this.rootElem])) return;

            this.hintMethods.close();
        }
    }
    getItems() {
        if (!this.items) this.items = [];
        this.items = this.items.concat(getNewItems.call(this));

        getVisibleAndExtras.call(this);
        renderLists.call(this);

        function getNewItems() {
            const items = Array.from(this.itemsList.querySelectorAll(".editable-list__item"))
                .filter(node => {
                    return !node.classList.contains("editable-list__item--more")
                        && !this.items.find(obj => obj.node === node);
                })
                .map(node => {
                    const valueNode = node.querySelector(".editable-list__item-text");
                    const valueText = textContentMethods.getContent(valueNode).trim();
                    const container = createElement("div", "editable-list__item-container");
                    container.append(valueNode);
                    node.append(container);
                    return { node, container, valueNode, valueText };
                });

            items.forEach(obj => this.initNode(obj.node, obj));
            return items;
        }
        function getVisibleAndExtras() {
            handleNoExtras = handleNoExtras.bind(this);

            const maxShown = parseInt(this.params.maxShown);
            if (!maxShown) {
                handleNoExtras();
                return;
            }

            this.itemsList.after(this.showMore.container);
            this.visibleItems = this.items.slice(0, maxShown);
            this.extraItems = this.items.slice(maxShown);

            if (this.extraItems.length < 1) handleNoExtras();
            this.extraItems.forEach(obj => obj.node.remove());

            function handleNoExtras() {
                this.showMore.container.remove();
                this.visibleItems = this.items;
                this.extraItems = [];
            }
        }
        function renderLists() {
            this.itemsList.innerHTML = "";
            this.hint.body.innerHTML = "";

            this.visibleItems.forEach(obj => {
                this.itemsList.append(obj.node);
            });
            this.items.forEach(obj => {
                const listItem = obj.node.cloneNode(true);
                const cross = listItem.querySelector(".editable-list__item-cross");
                if (cross) cross.remove();
                this.hint.body.append(listItem);
                this.initNode(listItem, obj);
                obj.cloneInHint = listItem;
            });
            textContentMethods.setContent(this.showMore.button, `Ещё ${this.extraItems.length}`);
        }
    }
    createHintMethods() {
        const methods = bindMethods(this, {
            open() {
                this.hint.node.classList.add("__shown");
            },
            close() {
                this.hint.node.classList.remove("__shown");
            },
            toggle() {
                this.hint.node.classList.contains("__shown")
                    ? methods.close()
                    : methods.open();
            }
        });

        return methods;
    }
    initNode(node, obj) {
        let cross = node.querySelector(".editable-list__item-cross");
        if (!cross) {
            cross = createElement("button", "editable-list__item-cross icon-cross");
            cross.setAttribute("type", "button");
            const container = node.querySelector(".editable-list__item-container");
            container.prepend(cross);
            cross.addEventListener("click", onCrossClick.bind(this));
        }

        function onCrossClick() {
            obj.node.remove();
            obj.cloneInHint.remove();
            const index = this.items.findIndex(o => o.node === obj.node);
            this.items.splice(index, 1);
            this.getItems();
        }
    }
}

class CopyLink {
    constructor(node) {
        this.rootElem = node;
        this.params = getParams(this);
        this.link = this.rootElem.dataset.copyLink;
        this.copyModalObj = renderMisc.copyLink({ link: this.link });
        this.modalMethods = this.createModalMethods();

        this.rootElem.removeAttribute("data-copy-link");
        initButton.call(this);
        initCopyButton.call(this);
        document.addEventListener("click", onDocumentClick.bind(this));

        function initButton() {
            this.rootElem.addEventListener("click", this.modalMethods.toggle);
        }
        function initCopyButton() {
            const btn = this.copyModalObj.button;
            btn.addEventListener("click", this.modalMethods.copyLink);
        }
        function onDocumentClick(event) {
            if (checkIfTargetOrClosest(event.target, [this.rootElem, this.copyModalObj.node]))
                return;
            // if (checkIfTargetOrClosest(event.target, this.rootElem)
            //     || checkIfTargetOrClosest(event.target, this.copyModalObj.node)) return;

            this.modalMethods.hide();
        }
    }
    createModalMethods() {
        const methods = bindMethods(this, {
            show() {
                this.copyModalObj.shown = true;
                this.rootElem.after(this.copyModalObj.node);
            },
            hide() {
                this.copyModalObj.shown = false;
                textContentMethods.setContent(this.copyModalObj.text, "Скопировать ссылку");
                this.copyModalObj.node.remove();
            },
            toggle() {
                this.copyModalObj.shown
                    ? methods.hide()
                    : methods.show();
            },
            copyLink() {
                navigator.clipboard.writeText(this.link);
                textContentMethods.setContent(this.copyModalObj.text, "Ссылка скопирована");
            }
        });

        return methods;
    }
}

class Spoiler {
    constructor(node) {
        this.rootElem = node;
        this.params = getParams(this);
        this.button = this.rootElem.querySelector(".spoiler__button");
        this.buttonBack = this.rootElem.querySelector(".spoiler__button--back");
        this.body = this.rootElem.querySelector(".spoiler__body");
        this.bodyStylesText = this.body.style.cssText;
        this.spoilerMethods = this.createSpoilerMethods();

        if (this.params.defaultShow) this.spoilerMethods.show();
        else this.spoilerMethods.hide();
        this.button.addEventListener("click", this.spoilerMethods.toggle);
        if (this.buttonBack) this.buttonBack.addEventListener("click", this.spoilerMethods.toggle);
    }
    createSpoilerMethods() {
        const methods = bindMethods(this, {
            toggle() {
                this.isShown
                    ? methods.hide()
                    : methods.show();
            },
            show() {
                const height = getHeight(this.body);

                this.rootElem.classList.add("__spoiler-shown");
                this.body.style.removeProperty("padding");
                this.body.style.removeProperty("margin");
                this.body.style.cssText = `max-height: ${height}px; ${this.bodyStylesText}`;
                if (this.buttonBack) {
                    this.button.classList.add("none");
                    this.buttonBack.classList.remove("none");
                }

                this.isShown = true;
            },
            hide() {
                this.rootElem.classList.remove("__spoiler-shown");
                this.body.style.removeProperty("max-height");
                this.body.style.padding = this.body.style.margin = "0";
                if (this.buttonBack) {
                    this.button.classList.remove("none");
                    if (!this.buttonBack.closest(".spoiler__body"))
                        this.buttonBack.classList.add("none");
                }

                this.isShown = false;
            }
        });

        return methods;
    }
}

let inittingSelectors = [
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: "[data-fullsize-image]", classInstance: FullsizeImage },
    { selector: ".header", classInstance: Header },
    { selector: "[data-hover-title]", classInstance: HoverTitle },
    { selector: ".editable-list", classInstance: EditableList },
    { selector: "[data-copy-link]", classInstance: CopyLink },
    { selector: ".spoiler", classInstance: Spoiler },
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

    setTimeout(() => document.dispatchEvent(new CustomEvent("init-inputs")), 0);
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

// позволяет запустить callback после события инициализации ("init-inputs")
function nextInitTick(callback = function () { }, args = []) {
    document.addEventListener("init-inputs", onNextTick);

    function onNextTick() {
        document.removeEventListener("init-inputs", onNextTick);
        setTimeout(() => callback(...args), 100);
    }
}

// здесь проходят инициализации скриптов из других файлов
document.addEventListener("inputs-declared", () => {
    setTimeout(callback, 0);

    function callback() { }
});