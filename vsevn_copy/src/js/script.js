// получить координаты элемента
function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        bottom: box.bottom + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset
    };
}

// определить браузер
function getBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    let browser = [
        userAgent.match(/chrome/),
        userAgent.match(/opera/),
        userAgent.match(/safari/),
        userAgent.match(/firefox/)
    ].find(br => br);
    if (browser) browser = browser[0];

    return browser;
}
const browser = getBrowser();

class Storage {
    constructor(storageName) {
        if (storageName === "local") this.storage = localStorage;
        if (storageName === "session") this.storage = sessionStorage;
    }
    getItem(key) {
        const item = this.storage.getItem(key);
        return JSON.parse(item);
    }
    setItem(key, value) {
        const item = JSON.stringify(value);
        this.storage.setItem(key, item);
    }
    removeItem(key) {
        this.storage.removeItem(key);
    }
}
const _localStorage = new Storage("local");
const _sessionStorage = new Storage("session");

function browsersFix() {
    if (browser !== "firefox" && browser !== "safari") {
        let translate1px = [];
        translate1px = translate1px
            .concat(Array.from(document.querySelectorAll(`[data-table-search-item="added-by"]`)));

        translate1px.forEach(block => {
            block.style.transform = "translate(0, 1px)";
        });
    }
    if (browser === "firefox") {
        let addMozfixClass = [];
        addMozfixClass = addMozfixClass
            .concat(Array.from(document.querySelectorAll(".fav-blacklist_container-child")))
            .concat(Array.from(document.querySelectorAll(".selectBox_value-text")))
            .concat(Array.from(document.querySelectorAll(".calendarouts_text")))
            .concat(Array.from(document.querySelectorAll(".foundation-clear_filter")))
            .concat(Array.from(document.querySelectorAll(".text-field__input")))
            .concat(Array.from(document.querySelectorAll(".text-field__input-subfield")))
            .concat(Array.from(document.querySelectorAll(".calendar__selectBox-input")))
            .concat(Array.from(document.querySelectorAll(".calendar__selectBox-delimeter")))
            .concat(Array.from(document.querySelectorAll(".selctexit_btn")))
            .concat(Array.from(document.querySelectorAll(".calendar-box__apply")));

        addMozfixClass.forEach(el => {
            el.classList.add("__moz-fix");
        });
        document.querySelectorAll(".comm_popup-textarea_btns")
            .forEach(textareaBtns => {
                textareaBtns.querySelectorAll("button")
                    .forEach(btn => btn.classList.add("__moz-fix"));
            });
    }
}
browsersFix();

let bodyOverflow;
let bodyOverflowObserver = new MutationObserver(() => {
    let wrapper = document.querySelector(".wrapper");

    if (document.body.classList.contains("body--locked-scroll")) {
        let scrollWidth = getScrollWidth();
        wrapper.style.paddingRight = `${scrollWidth}px`;
    } else {
        wrapper.style.removeProperty("padding-right");
    }
});

bodyOverflowObserver.observe(document.body, { attributes: true });

function getScrollWidth() {
    let block = document.createElement("div");
    block.style.cssText = `
        width: 100px; height: 100px; z-index: -1; position: absolute; bottom: -150vh; overflow: scroll;
    `;
    document.body.append(block);
    let scrollWidth = block.offsetWidth - block.clientWidth;
    block.remove();
    return scrollWidth;
}

function createElement(tagName, className, htmlContent) {
    let block = document.createElement(tagName);
    block.className = className || "";
    if (htmlContent) block.insertAdjacentHTML("afterbegin", htmlContent);
    return block;
}

function getTextContent(node) {
    if (node.textContent) return node.textContent.trim();
    else return node.innerText.trim();
}
function setTextContent(node, text) {
    node.textContent
        ? node.textContent = text : node.innerText = text;
}

// найдет ближайший элемент по отношению к node
function findClosest(node, selector) {
    let element = node.querySelector(selector);
    if (!element) {
        do {
            if (!node.parentNode) break;
            element = node.parentNode.querySelector(selector);
            node = node.parentNode;
        } while (!element && node)
    }
    return element;
}

function fromStringToObject(string = "", params =
    {
        objectToAssign: {},
        stringSeparator: "; ",
        propSeparator: ":"
    }
) {
    if (typeof string !== "string") return {};

    const properties = string.split(params.stringSeparator);
    const paramsObj = {};
    properties.forEach(prop => {
        const split = prop.split(params.propSeparator);
        const key = split[0];
        let value = split[1];
        if (!value) return;

        if (value[value.length - 1] === ";") {
            const w = value.split("");
            w[value.length - 1] = "";
            value = w.join("");
        }
        paramsObj[key] = value;
    });

    return Object.assign(params.objectToAssign, paramsObj);
}

function getParams() {
    const params = this.rootElem.dataset.params || "";
    this.params = fromStringToObject(params);
    this.rootElem.removeAttribute("data-params");
}

const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const monthsGenitive = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];

/* ========================================== HEADER ========================================== */
document.querySelector('.header > nav > img').addEventListener('click', e => {
    let headerWrapper = document.querySelector('.header_wrapper');
    headerWrapper.classList.toggle('menu_active');
    headerWrapper.classList.contains('menu_active')
        ? document.body.classList.add('body--locked-scroll')
        : document.body.classList.remove('body--locked-scroll');
});
document.querySelector('.exit_menu').addEventListener('click', e => {
    document.querySelector('.header_wrapper').classList.remove('menu_active');
    document.body.classList.remove('body--locked-scroll');
});

loginList = document.querySelectorAll('.header-nav_wrapper > ul:nth-child(2) > li a');
for (u = 0; u < loginList.length; u++) {
    loginList[u].onclick = function () {
        document.querySelector('.header-nav_wrapper').classList.add('header_log');
    }
}

document.querySelector('.sign_contaiener > a:nth-child(2)').onclick = function () {
    document.querySelector('.header-nav_wrapper').classList.remove('header_log');
}

document.querySelector('.profile-exit').onclick = function () {
    document.querySelector('.profile_container').classList.remove('profile_active');
    document.querySelector('.header-nav_wrapper').classList.remove('header_log');
}

document.querySelector('.sign_contaiener > a:nth-child(1)').onclick = function () {
    document.querySelector('.profile_container').classList.toggle('profile_active');
}

/* ====================================== HEADER (конец) ====================================== */

class FullImagePopup {
    constructor(node) {
        this.onImgClick = this.onImgClick.bind(this);
        this.setImgSize = this.setImgSize.bind(this);
        this.closePopup = this.closePopup.bind(this);

        this.rootElem = node;
        // процент большей стороны от ширины экрана
        this.biggestSidePercent = 80;

        this.rootElem.addEventListener("click", this.onImgClick);
    }
    createPopup() {
        let popupWrapper = createElement("div", "full-image");
        let popupInner = `
        <div class="full-image__body">
            <div class="popup_exit" id="popup_exit1">
                <div>
                    <div></div>
                    <div></div>
                </div>
            </div>
        </div>
        `;
        popupWrapper.insertAdjacentHTML("afterbegin", popupInner);
        popupWrapper.querySelector(".popup_exit").addEventListener("click", this.closePopup)
        this.popupWrapper = popupWrapper;

        let img = new Image();
        img.src = this.src;
        img.onload = () => {
            this.img = img;
            this.iWidth = img.width;
            this.iHeight = img.height;
            let fullImageBody = this.popupWrapper.querySelector(".full-image__body");
            fullImageBody.prepend(img);
            this.setImgSize();
            window.addEventListener("resize", this.setImgSize);
            img.style.transform = "scale(0.9)";
        }
    }
    onImgClick() {
        this.src = this.rootElem.getAttribute("src");
        this.alt = this.rootElem.getAttribute("alt") || "";
        this.createPopup();
        document.body.append(this.popupWrapper);
        document.body.classList.add("body--locked-scroll");
    }
    setImgSize() {
        let windowWidth = document.documentElement.clientWidth;
        let windowHeight = document.documentElement.clientHeight;

        let ratio = this.iWidth / this.iHeight;
        let maxWidth = Math.round(windowWidth * (this.biggestSidePercent / 100));
        let maxHeight = Math.round(windowHeight * (this.biggestSidePercent / 100));
        if (ratio === 1) {
            let size = Math.min(maxWidth, maxHeight);
            if (size > this.iWidth) size = this.iWidth;

            this.img.width = this.img.height = size;
        } else {
            let width, height;

            if (this.iWidth > this.iHeight) {
                height = maxHeight > this.iHeight ? this.iHeight : maxHeight;
                width = ratio * height;
                if (width > maxWidth) {
                    width = maxWidth;
                    height = width / ratio;
                }
            }
            if (this.iHeight > this.iWidth) {
                width = maxWidth > this.iWidth ? this.iWidth : maxWidth;
                height = width / ratio;
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * ratio;
                }
            }

            this.img.width = width;
            this.img.height = height;
        }
    }
    closePopup() {
        this.popupWrapper.remove();
        document.body.classList.remove("body--locked-scroll");
        window.removeEventListener("resize", this.setImgSize);
        this.iWidth = 0;
        this.iHeight = 0;
    }
}

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

class PopupCommEdit {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);
        this.onBtnControlClick = this.onBtnControlClick.bind(this);
        this.onInputEnter = this.onInputEnter.bind(this);

        this.rootElem = node;
        this.maxPageLength = 1500;
        this.popupWrapper = document.querySelector("#comm_popup_wrapper");
        this.commentsContainer = this.popupWrapper.querySelector(".comm_popup_foundation_wrapper");
        this.currentPage = 1;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick(event) {
        let targ = event.target;
        this.currentTable = targ.closest(".table_body");

        this.renderPageControls();
        this.setPageArrowsHandlers();

        let workStatus = this.currentTable.querySelector('[data-worktype]').dataset.worktype;
        let PopupCheck = document.querySelectorAll('.comm_popup-textarea_name input');
        for (let u = 0; u < PopupCheck.length; u++) {
            if (PopupCheck[u].dataset.worktype == workStatus) {
                PopupCheck[u].checked = true;
            }
        }
        let gender = this.currentTable.querySelector("[data-gender]").dataset.gender;
        genderHandler(gender);
        document.querySelector('#comm_popup_wrapper').classList.add('ch_comm');
        document.querySelector('#comm_popup_wrapper').classList.add('popup_active');
        document.body.classList.add("body--locked-scroll");

        ppEx(targ);

        // отобразить редактируемый комментарий
        this.commBlockWrap = targ.closest(".comm_block_wrap");
        let comment = this.commBlockWrap.querySelector(".comm_block_text")
            .textContent.replace(/\s\s/g, "").trim();
        let textarea = document.querySelector(".comm_popup").querySelector("textarea");
        textarea.value = comment;

        let tableItems = Array.from(
            document.querySelector(".table").querySelectorAll(".table_body")
        );
        let tableIndex = tableItems.findIndex(table => table === this.currentTable);
        this.popupWrapper.dataset.tableIndex = tableIndex;

        // сохранить id редактируемого комментария (для обработки последующего нажатия на кнопку сохранения)
        this.popupWrapper.dataset.editCommIndex = this.commBlockWrap.dataset.commIndex;

        // отобразить остальные комментарии в popup'е
        this.renderPopupCommsPages();

        // сменить статус работника по нажатию на "Сохранить"
        let saveBtn = this.popupWrapper.querySelector(".popup_save_new-comm");
        saveBtn.addEventListener("click", onSaveBtnClick);

        function onSaveBtnClick() {
            PopupStatusHandler(targ);
            saveBtn.removeEventListener("click", onSaveBtnClick);
        }
    }
    renderPopupCommsPages() {
        setFoundationBlockHandlers = setFoundationBlockHandlers.bind(this);

        // создать блоки комментариев
        let otherComms = Array.from(this.currentTable.querySelectorAll(".comm_block_wrap"))
            .filter(otherComm => otherComm !== this.commBlockWrap);
        let popupFoundation = this.popupWrapper.querySelector(".comm_popup_foundation_wrapper");
        popupFoundation.innerHTML = "";
        this.popupComms = otherComms.map(comm => {
            let content = comm.querySelector(".comm_block_text").textContent;
            let date = comm.querySelector(".comm_block_text_date").textContent;
            let commIndex = comm.dataset.commIndex;
            let block = createPopupFoundationBlock(content, date, commIndex);
            return block;
        });

        // распределить созданные комментарии по страницам
        this.commsPages = [];
        let popupCommsClone = [...this.popupComms];
        let commSelector = ".comm_popup_foundation-block_text";
        popupCommsClone.forEach((comm, index, array) => {
            if (!comm) return;

            let textBlock = comm.querySelector(commSelector);
            let text = textBlock.textContent;
            if (text.length > this.maxPageLength) this.commsPages.push([comm]);
            else {
                let page = [];
                page.push(comm);
                while (getTotalLength(page) < this.maxPageLength) {
                    let nextComm = array[index + 1];
                    if (!nextComm) break;

                    page.push(nextComm);
                    array.splice(array.indexOf(nextComm), 1);
                }

                this.commsPages.push(page);
            }
        });
        this.setPage(this.currentPage);

        function createPopupFoundationBlock(content, date, commIndex) {
            let blockInner = `
            <div class="comm_popup_foundation-block_date">
                <span>${date}</span>
                <svg style="fill: #0088d2;" class="comm_popup_foundation-block_edit">
                    <use xlink:href="#pencil"></use>
                </svg>
                <svg class="comm_popup_foundation-block_remove">
                    <use xlink:href="#trash"></use>
                </svg>
            </div>
            <div class="comm_popup_foundation-block_text">
                ${content}
            </div>
            `;
            let block = createElement("div", "comm_popup_foundation-block", blockInner);
            block.dataset.popupCommIndex = commIndex;
            setFoundationBlockHandlers.call(this, block);
            return block;
        }
        function setFoundationBlockHandlers(block) {
            let editBtn = block.querySelector(".comm_popup_foundation-block_edit");
            let removeBtn = block.querySelector(".comm_popup_foundation-block_remove");

            editBtn.addEventListener("click", (event) => {
                callFoundationBlockHandler(event, onEditBtnClick);
            });
            removeBtn.addEventListener("click", (event) => {
                callFoundationBlockHandler(event, removeComm);
                this.renderPopupCommsPages();
            });
        }
        function callFoundationBlockHandler(event, handler) {
            let targ = event.target;
            let foundationBlock = targ.closest("[data-popup-comm-index]");
            let commIndex = parseInt(foundationBlock.dataset.popupCommIndex);
            let tableIndex = parseInt(commPopupWrapper.dataset.tableIndex);

            let table = document.querySelectorAll(".table .table_body")[tableIndex];
            let comm = table.querySelectorAll(".comm_block_wrap")[commIndex];

            handler(comm);
        }
        function onEditBtnClick(comm) {
            let otherCommEditBtn = comm.querySelector(".popup_edit");
            otherCommEditBtn.dispatchEvent(new Event("click"));
        }
        function getTotalLength(page) {
            let totalLength = 0;
            page.forEach(comm => {
                let text = comm.querySelector(commSelector).textContent;
                totalLength += text.length;
            });
            return totalLength;
        }
    }
    renderCurrentPage() {
        if (this.commsPages.length < 1) return;

        let page = this.commsPages[this.currentPage - 1];
        this.commentsContainer.innerHTML = "";
        page.forEach(comm => this.commentsContainer.append(comm));
    }
    renderPageControls() {
        let foundation = this.popupWrapper.querySelector(".comm_popup_foundation");
        let existingButtons = foundation.querySelector(".comm_popup_buttons");
        if (existingButtons) existingButtons.remove();

        let newControls = `
        <div class="comm_popup_buttons">
            <div class="comm_popup_buttons_wrapper">
                <div class="comm_popup_buttons_pag">
                    <button class="popup_button_prev">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                    <button class="popup_button_next popup_button_active">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                    <span>
                        <span class="comm_popup_page-start"></span>
                        <span>ИЗ</span>
                        <span class="comm_popup_page-end"></span>
                    </span>
                    <button class="popup_button_last popup_button_active">
                        <svg>
                            <use xlink:href='#arrow'></use>
                        </svg>
                    </button>
                </div>
                <div class="comm_popup_buttons_pag_inp">
                    <span>Перейти на страницу</span>
                    <input class="comm_popup_input" type="number" value="1">
                    <button class="comm_popup_input_enter">OK</button>
                </div>
            </div>
        </div>
        `;
        foundation.insertAdjacentHTML("beforeend", newControls);
    }
    setPageArrowsHandlers() {
        this.controlsBlock = this.popupWrapper.querySelector(".comm_popup_buttons_wrapper");
        this.btnPrev = this.controlsBlock.querySelector(".popup_button_prev");
        this.btnNext = this.controlsBlock.querySelector(".popup_button_next");
        this.btnLast = this.controlsBlock.querySelector(".popup_button_last");
        this.startTxtSpan = this.controlsBlock.querySelector(".comm_popup_page-start");
        this.endTxtSpan = this.controlsBlock.querySelector(".comm_popup_page-end");
        this.pageNumInput = this.controlsBlock.querySelector(".comm_popup_input");
        this.pageNumEnter = this.controlsBlock.querySelector(".comm_popup_input_enter");

        this.btnPrev.addEventListener("click", this.onBtnControlClick);
        this.btnNext.addEventListener("click", this.onBtnControlClick);
        this.btnLast.addEventListener("click", this.onBtnControlClick);

        this.pageNumInput.addEventListener("input", onInput);
        this.pageNumEnter.addEventListener("click", this.onInputEnter);

        function onInput(event) {
            let inp = event.target;
            let val = inp.value;
            inp.value = val.replace(/\D/g, "");
            while (inp.value.length > 2) {
                inp.value = inp.value.slice(-2)
            };
        }
    }
    onBtnControlClick(event) {
        let btn = event.target;
        if (btn.tagName !== "BUTTON") btn = event.target.closest("button");
        if (btn.getAttribute("disabled")) return;

        if (btn === this.btnPrev) this.setPage("prev");
        if (btn === this.btnNext) this.setPage("next");
        if (btn === this.btnLast) this.setPage("last");
    }
    onInputEnter() {
        let number = parseInt(this.pageNumInput.value);
        this.setPage(number || 1);
    }
    setPage(page) {
        let lastPage = this.commsPages.length || 1;

        if (!this.currentPage) this.currentPage = 1;
        if (this.currentPage > lastPage) this.currentPage = lastPage;

        let pageNumber = parseInt(page);
        if (pageNumber && pageNumber <= lastPage && pageNumber > 0) {
            this.currentPage = this.currentPage = pageNumber;
        } else if (typeof page === "string") {
            switch (page) {
                case "prev": this.currentPage--;
                    break;
                case "next": this.currentPage++;
                    break;
                case "last": this.currentPage = lastPage;
                default:
                    break;
            }
        } else this.currentPage = 1;

        if (this.currentPage === 1) {
            this.btnNext.removeAttribute("disabled");
            this.btnPrev.setAttribute("disabled", "");
            this.btnLast.removeAttribute("disabled");
        }
        if (this.currentPage === lastPage) {
            this.btnNext.setAttribute("disabled", "");
            this.btnPrev.removeAttribute("disabled");
            this.btnLast.setAttribute("disabled", "");
        }
        if (this.currentPage > 1 && this.currentPage < lastPage) {
            this.btnNext.removeAttribute("disabled");
            this.btnPrev.removeAttribute("disabled");
            this.btnLast.removeAttribute("disabled");
        }
        if (this.currentPage === 1 && lastPage === 1) {
            this.btnNext.setAttribute("disabled", "");
            this.btnPrev.setAttribute("disabled", "");
            this.btnLast.setAttribute("disabled", "");
        }

        this.startTxtSpan.innerHTML = this.currentPage;
        this.endTxtSpan.innerHTML = lastPage;
        this.renderCurrentPage();
    }
}

class PopupCommAdd {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick(event) {
        let popupWrapper = document.querySelector('#comm_popup_wrapper');
        let currentTable = event.target.closest(".table_body");

        let workStatus = event.target.closest(".table_body")
            .querySelector('[data-worktype]')
            .dataset.worktype;
        let PopupCheck = document.querySelectorAll('.comm_popup-textarea_name input');
        for (let u = 0; u < PopupCheck.length; u++) {
            if (PopupCheck[u].dataset.worktype == workStatus) {
                PopupCheck[u].checked = true;
            }
        }
        let gender = event.target.closest(".table_body").querySelector('[data-gender]').dataset.gender
        genderHandler(gender);
        popupWrapper.classList.add('add_comm');
        popupWrapper.classList.add('popup_active');

        let tableItems = Array.from(
            document.querySelector(".table").querySelectorAll(".table_body")
        );
        let tableIndex = tableItems.findIndex(table => table === currentTable);
        popupWrapper.dataset.tableIndex = tableIndex;
        document.body.classList.add("body--locked-scroll");
        ppEx(event.target);
    }
}

class PopupCommDelete {
    constructor(node) {
        this.onBtnClick = this.onBtnClick.bind(this);

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        let tableIndex = this.rootElem.closest("[data-table-index]").dataset.tableIndex;
        let table = document.querySelectorAll(".table_body")[tableIndex];
        let commIndex = this.rootElem.closest("[data-edit-comm-index]").dataset.editCommIndex;
        let comm = table.querySelector(`[data-comm-index="${commIndex}"]`);

        removeComm(comm);
        closeCommPopup();
    }
}

class PopupConfirm {
    constructor(node, params = {}) {
        // params === { agreeBtnSelector: "", <optional> exitBtnSelector: "", popupInner: `` }
        this.onBtnClick = this.onBtnClick.bind(this);
        this.closePopup = this.closePopup.bind(this);
        this.agreeBtnHandler = this.agreeBtnHandler.bind(this);

        this.rootElem = node;
        this.popupInner = params.popupInner || "";
        this.popupWrapper = createElement("div", "", this.popupInner);
        this.agreeBtn = this.popupWrapper.querySelector(params.agreeBtnSelector);
        this.exitBtn = this.popupWrapper.querySelector(params.exitBtnSelector)
            || this.popupWrapper.querySelector(".popup_exit");

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        this.createPopup();
    }
    createPopup() {
        document.body.append(this.popupWrapper);
        document.body.classList.add("body--locked-scroll");
        this.setPopupHandlers();
    }
    setPopupHandlers() {
        this.exitBtn.addEventListener("click", this.closePopup);
        this.agreeBtn.addEventListener("click", this.agreeBtnHandler);
    }
    closePopup() {
        this.popupWrapper.remove();
        document.body.classList.remove("body--locked-scroll");
    }
    agreeBtnHandler() {
        this.closePopup();
    }
}

class DiedButton extends PopupConfirm {
    constructor(node) {
        super(node, {
            popupInner: `
            <div class="confirm_popup">
                <div class="confirm_popup__body">
                    <div class="confirm_popup__title">
                        Удалить безвозвратно резюме?
                    </div>
                    <div class="confirm_popup__textarea-btns">
                        <button class="confirm_popup__delete-resume">Да</button>
                    </div>
                    <div class="popup_exit">
                        <div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            agreeBtnSelector: ".confirm_popup__delete-resume"
        });

        this.rootElem = node;

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        super.onBtnClick();
        this.resumeTable = this.rootElem.closest(".table_body");
    }
    agreeBtnHandler() {
        super.agreeBtnHandler();
        this.resumeTable.remove();
    }
}

class CommBlockRemove extends PopupConfirm {
    constructor(node) {
        super(node, {
            popupInner: `
            <div class="confirm_popup">
                <div class="confirm_popup__body">
                    <div class="confirm_popup__title">
                        Удалить комментарий?
                    </div>
                    <div class="confirm_popup__comm"></div>
                    <div class="confirm_popup__textarea-btns">
                        <button class="confirm_popup__delete-resume">Да</button>
                    </div>
                    <div class="popup_exit">
                        <div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            agreeBtnSelector: ".confirm_popup__delete-resume"
        });

        this.rootElem = node;
        this.comm = this.rootElem.closest("[data-comm-index]");
        this.popupCommBlock = this.popupWrapper.querySelector(".confirm_popup__comm");

        this.rootElem.addEventListener("click", this.onBtnClick);
    }
    onBtnClick() {
        super.onBtnClick();

        this.commText = this.comm.querySelector(".comm_block_text").textContent;
        this.popupCommBlock.innerHTML = "";
        this.popupCommBlock.insertAdjacentHTML("afterbegin", this.commText);
    }
    agreeBtnHandler() {
        super.agreeBtnHandler();
        removeComm(this.comm);
    }
}

class Spoiler {
    constructor(node) {
        this.toggle = this.toggle.bind(this);

        this.rootElem = node;
        this.spoilerButton = this.rootElem.querySelector(".spoiler__button");
        this.spoilerHideable = this.rootElem.querySelector(".spoiler__hideable");

        this.spoilerButton.addEventListener("click", this.toggle);
        if (this.rootElem.classList.contains("spoiler--shown")) this.show();
        else this.hide();
    }
    toggle() {
        this.rootElem.classList.contains("spoiler--shown")
            ? this.hide()
            : this.show();
    }
    show() {
        let height = this.getHeight();
        this.spoilerHideable.style.cssText = `
            max-height: ${height}px;
            opacity: 1;
        `;
        this.spoilerHideable.style.removeProperty("padding");
        this.spoilerHideable.style.removeProperty("margin");
        this.rootElem.classList.add("spoiler--shown");
    }
    hide() {
        this.spoilerHideable.style.cssText = `
            padding: 0;
            margin: 0;
            opacity: 0;
            max-height: 0px;
        `;
        this.rootElem.classList.remove("spoiler--shown");
    }
    getHeight() {
        let clone = this.spoilerHideable.cloneNode(true);
        clone.style.cssText = "position: absolute; z-index: -99; top: -100vh; left: -100vw;";
        document.body.append(clone);
        let height = clone.offsetHeight;
        clone.remove();
        return height + 10;
    }
}

class EditApplicantResume {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.table = this.rootElem.closest(".table_body");
        this.dataElems = Array.from(this.table.querySelectorAll("[data-edit-resume-value]"));
        this.rootElem.addEventListener("click", this.onClick);
    }
    onClick() {
        const applicantData = this.getApplicantData();
        _localStorage.setItem("vsevn_applicant_data", applicantData);
        const link = createElement("a");
        link.setAttribute("target", "_blank");
        link.href = "/vsevn/new-resume/";
        link.click();
    }
    getApplicantData() {
        const applicantData = this.dataElems.map(el => {
            return { key: el.dataset.editResumeValue, value: el.textContent.trim().replace(/\s\s/g, "") };
        });
        const fullname = applicantData.find(el => el.key === "fullname");
        const name = fullname.value.split(" ")[0];
        const surname = fullname.value.split(" ")[1];
        applicantData.push({ key: "name", value: name });
        applicantData.push({ key: "surname", value: surname });
        return applicantData;
    }
}

class Select {
    constructor(node) {
        this.onValueClick = this.onValueClick.bind(this);
        this.onOptClick = this.onOptClick.bind(this);
        this.setPrev = this.setPrev.bind(this);
        this.setNext = this.setNext.bind(this);
        this.onChange = this.onChange.bind(this);
        onDocumentClick = onDocumentClick.bind(this);
        setDefaultIndex = setDefaultIndex.bind(this);
        setPrevNextHandlers = setPrevNextHandlers.bind(this);

        this.rootElem = node;
        this.selectContainer = this.rootElem.querySelector(".select__container");
        this.optionsContainer = this.rootElem.querySelector(".select__options");
        this.valueBlock = this.rootElem.querySelector(".select__value");
        this.prevBtn = this.rootElem.querySelector(".select__chevron--prev");
        this.nextBtn = this.rootElem.querySelector(".select__chevron--next");
        getParams.call(this);
        this.getOptions();

        this.valueBlock.addEventListener("click", this.onValueClick);
        this.rootElem.addEventListener("change", this.onChange);

        document.addEventListener("click", onDocumentClick);
        setDefaultIndex();
        setPrevNextHandlers();

        function onDocumentClick(event) {
            const exception = event.target === this.selectContainer
                || event.target.closest(".select__container") === this.selectContainer;
            if (exception)
                return;

            this.toggle(true).hide();
        }
        function setDefaultIndex() {
            const defaultIndex = Math.abs(parseInt(this.params.defaultIndex)) || 0;
            if (defaultIndex >= 0) {
                let opt = this.options[defaultIndex];
                if (!opt) opt = this.options[0];
                if (!opt) return;
                opt.node.dispatchEvent(new Event("click"));
            }
        }
        function setPrevNextHandlers() {
            if (this.prevBtn)
                this.prevBtn.addEventListener("click", this.setPrev);
            if (this.nextBtn)
                this.nextBtn.addEventListener("click", this.setNext);
        }
    }
    getOptions() {
        if (!this.options) this.options = [];

        const newOptionNodes = Array.from(this.rootElem.querySelectorAll(".select__option"))
            .map(node => {
                const text = getTextContent(node);
                return { node, text };
            });

        this.options = this.options.concat(newOptionNodes);
        newOptionNodes.forEach(obj => {
            obj.node.addEventListener("click", this.onOptClick);
        });
    }
    onValueClick() {
        this.toggle();
    }
    toggle(returnMethods = false) {
        hide = hide.bind(this);
        show = show.bind(this);
        if (returnMethods) return { hide, show };

        this.rootElem.classList.contains("__shown")
            ? hide() : show();

        function hide() {
            this.rootElem.classList.remove("__shown");
        }
        function show() {
            this.rootElem.classList.add("__shown");
        }
    }
    onOptClick(event) {
        const targ = event.target;
        const obj = this.options.find(o => o.node === targ);
        setTextContent(this.valueBlock, obj.text);
        this.toggle(true).hide();
        this.value = obj.text;
        const detail = { value: this.value };
        if (event.detail) {
            for (let key in event.detail) {
                detail[key] = event.detail[key];
            }
        }
        this.rootElem.dispatchEvent(new CustomEvent("change", { detail }));
    }
    onChange() {
        const currentValueIndex = this.options.findIndex(obj => obj.text === this.value);

        if (this.params.loop === "true") return;

        const prevValue = this.params.reverseOrder
            ? this.options[currentValueIndex + 1]
            : this.options[currentValueIndex - 1];
        const nextValue = this.params.reverseOrder
            ? this.options[currentValueIndex - 1]
            : this.options[currentValueIndex + 1];

        if (!prevValue) this.prevBtn.setAttribute("disabled", "");
        else this.prevBtn.removeAttribute("disabled");

        if (!nextValue) this.nextBtn.setAttribute("disabled", "");
        else this.nextBtn.removeAttribute("disabled");
    }
    setPrev() {
        const currentValueIndex = this.options.findIndex(obj => obj.text === this.value);
        const isReverse = this.params.reverseOrder;
        const prevValueIndex = isReverse
            ? currentValueIndex + 1
            : currentValueIndex - 1;
        let prevValue = this.options[prevValueIndex];
        if (!prevValue) {
            if (this.params.loop === "true") {
                isReverse
                    ? prevValue = this.options[0]
                    : prevValue = this.options[this.options.length - 1];
            }
            else return;
        }

        prevValue.node.dispatchEvent(new CustomEvent("click", { detail: { controlClick: true } }));
    }
    setNext() {
        const currentValueIndex = this.options.findIndex(obj => obj.text === this.value);
        const isReverse = this.params.reverseOrder;
        const nextValueIndex = isReverse
            ? currentValueIndex - 1
            : currentValueIndex + 1;
        let nextValue = this.options[nextValueIndex];
        if (!nextValue) {
            if (this.params.loop === "true") {
                isReverse
                    ? nextValue = this.options[this.options.length - 1]
                    : nextValue = this.options[0];
            }
            else return;
        }

        nextValue.node.dispatchEvent(new CustomEvent("click", { detail: { controlClick: true } }));
    }
    editOptions(optionsArr, params = {}) {
        /* params: 
            removeCurrentValues: false|true
        */

        if (params.removeCurrentValues) {
            this.options.forEach(obj => {
                obj.remove = true;
                if (this.value === obj.text) this.value = null;
            });
            this.options = this.options.filter(obj => {
                const doRemove = obj.remove;
                if (!doRemove) return true;

                obj.node.remove();
                return false;
            });
        }

        optionsArr.forEach(optValue => {
            this.optionsContainer.insertAdjacentHTML("beforeend", createOption(optValue));
        });
        this.getOptions();

        if (!this.value && this.options[0])
            this.options[0].node.dispatchEvent(new Event("click"));

        function createOption(value) {
            return `<li class="select__option">${value}</li>`;
        }
    }
    setOption(params = { index: 0, text: "" }) {
        if (params.index) {
            const optionObj = this.options[params.index];
            if (optionObj) {
                optionObj.node.dispatchEvent(new Event("click"));
                return;
            }
        }
        if (params.text) {
            const optionObj = this.options.find(obj => obj.text === tetx);
            if (optionObj) {
                optionObj.node.dispatchEvent(new Event("click"));
                return;
            }
        }
    }
}

class Calendar {
    constructor(node) {
        findSelectParams = findSelectParams.bind(this);
        this.onAnySelectChange = this.onAnySelectChange.bind(this);
        this.onCellClick = this.onCellClick.bind(this);

        this.rootElem = node;
        this.yearSelect =
            inittedInputs.find(inpParams => findSelectParams(inpParams, "calendar-box__select--year"));
        this.monthSelect =
            inittedInputs.find(inpParams => findSelectParams(inpParams, "calendar-box__select--month"));

        this.yearSelect.rootElem.addEventListener("change", this.onAnySelectChange);
        this.monthSelect.rootElem.addEventListener("change", this.onAnySelectChange);

        this.table = this.rootElem.querySelector(".calendar-box__table");

        getParams.call(this);

        this.maxYear = new Date().getFullYear();

        getYears.call(this);
        this.monthSelect.editOptions(months, { removeCurrentValues: true });

        this.initSelectsBinding();

        function findSelectParams(inpParams, className) {
            if (!inpParams.rootElem) return;
            const isChild = inpParams.rootElem.closest(".calendar-box__part") === this.rootElem;
            return isChild && inpParams.rootElem.classList.contains(className);
        }
        function getYears() {
            setTimeout(() => {
                let minYear = parseInt(this.params.minYear);
                if (minYear < 0) minYear = this.maxYear - Math.abs(minYear);
                if (!minYear || minYear < 1900) minYear = 2000;
                this.minYear = minYear;

                const yearsToSet = [];
                for (let i = this.maxYear; i >= this.minYear; i--) {
                    yearsToSet.push(i);
                }

                this.yearSelect.editOptions(yearsToSet, { removeCurrentValues: true });
                const opts = this.yearSelect.options;
                opts[0].node.dispatchEvent(new Event("click"));
            }, 0);
        }
    }
    onAnySelectChange() {
        preventMonthExcess = preventMonthExcess.bind(this);
        createRow = createRow.bind(this);
        createCell = createCell.bind(this);
        renderMonthDays = renderMonthDays.bind(this);
        unsetLoopInMonthsSelect = unsetLoopInMonthsSelect.bind(this);

        setTimeout(preventMonthExcess, 100);
        renderMonthDays();
        unsetLoopInMonthsSelect();


        function preventMonthExcess() {
            const year = parseInt(this.yearSelect.value);
            if (year < this.maxYear) return;

            const currentMonthIndex = new Date().getMonth();
            const selectedMonth = this.monthSelect.value;
            const selectedMonthIndex = months.findIndex(m => m === selectedMonth);
            if (currentMonthIndex < selectedMonthIndex) {
                this.monthSelect.setOption({ index: currentMonthIndex });
            }
        }
        function renderMonthDays() {
            const rows = this.table.querySelectorAll(".calendar-box__monthdays-row");
            rows.forEach(r => r.remove());
            const year = this.yearSelect.value;
            const monthIndex = months.findIndex(m => m === this.monthSelect.value);
            const month = monthIndex + 1;

            const firstMonthDay = new Date(`${year}-${month}`).getDay();
            let lastMonthDay;
            if ([0, 2, 4, 6, 7, 9, 11].includes(monthIndex)) lastMonthDay = 31;
            else if ([3, 5, 8, 10].includes(monthIndex)) lastMonthDay = 30;
            else {
                if (year % 4 === 0) lastMonthDay = 29;
                else lastMonthDay = 28;
            }
            if (!lastMonthDay || lastMonthDay < 0) return;

            let day = 1;
            const rowsArray = [];
            const firstRow = [];
            if (firstMonthDay === 0) {
                for (let i = 0; i < 6; i++) firstRow.push("");
            }
            else {
                for (let i = 0; i < firstMonthDay - 1; i++) firstRow.push("");
            }

            this.lastMonthDay = lastMonthDay;

            rowsArray.push(fillCellsArray(firstRow));
            while (day <= lastMonthDay) {
                rowsArray.push(fillCellsArray());
            }

            rowsArray.forEach(cellsArray => {
                const rowNode = createRow(cellsArray);
                this.table.append(rowNode);
            });

            function fillCellsArray(array = []) {
                if (array.length >= 7) return array;

                for (let i = array.length; i < 7; i++) {
                    if (day > lastMonthDay) break;
                    array.push(day);
                    day++;
                }
                while (array.length < 7) array.push("");
                return array;
            }
        }
        function unsetLoopInMonthsSelect() {
            const selectYearValue = parseInt(this.yearSelect.value);
            const monthNumber = months.findIndex(m => m === this.monthSelect.value) + 1;
            const currentLastMonth = new Date().getMonth() + 1;
            const isLastMonth = monthNumber >= currentLastMonth;
            const isFirstMonth = monthNumber <= 1;

            if (selectYearValue >= this.maxYear && isLastMonth)
                this.monthSelect.nextBtn.setAttribute("disabled", "");
            else this.monthSelect.nextBtn.removeAttribute("disabled");

            if (selectYearValue <= this.minYear && isFirstMonth)
                this.monthSelect.prevBtn.setAttribute("disabled", "");
            else this.monthSelect.prevBtn.removeAttribute("disabled");
        }
        function createRow(values) {
            const row = createElement("tr", "calendar-box__monthdays-row");
            values.forEach(val => row.append(createCell(val)));
            return row;
        }
        function createCell(value) {
            const cell = createElement("td", "calendar-box__monthday-cell", value);
            cell.addEventListener("click", this.onCellClick);
            return cell;
        }
    }
    initSelectsBinding() {
        onMonthChange = onMonthChange.bind(this);
        let prevMonth = this.monthSelect.value;
        this.monthSelect.rootElem.addEventListener("change", onMonthChange);

        function onMonthChange(event) {
            if (!event.detail.controlClick) return;

            const currentMonth = this.monthSelect.value;
            if (prevMonth === "Январь" && currentMonth === "Декабрь") this.yearSelect.setPrev();
            if (prevMonth === "Декабрь" && currentMonth === "Январь") this.yearSelect.setNext();
            prevMonth = currentMonth;
        }
    }
    onCellClick(event) {
        const cell = event.target;
        const cellValue = parseInt(getTextContent(cell));
        if (!cellValue) return;
        const allCells = this.table.querySelectorAll(".calendar-box__monthday-cell");
        allCells.forEach(c => c.classList.remove("__selected"));
        cell.classList.add("__selected");

        const detail = { cellValue };
        this.rootElem.dispatchEvent(new CustomEvent("change", { detail }));
        this.day = cellValue;
    }
    clear() {
        this.table.querySelectorAll(".calendar-box__monthday-cell")
            .forEach(cell => cell.classList.remove("__selected"));
    }
}

class CalendarBox {
    constructor(node) {
        this.setSelectBoxValue = this.setSelectBoxValue.bind(this);
        this.clearCalendar = this.clearCalendar.bind(this);
        this.apply = this.apply.bind(this);
        this.setCalendarPosition = this.setCalendarPosition.bind(this);
        this.checkCorrect = this.checkCorrect.bind(this);
        getSelectBoxData = getSelectBoxData.bind(this);
        findCalendar = findCalendar.bind(this);

        this.rootElem = node;
        this.wrongValueBlock = this.rootElem.querySelector(".calendar__wrong-value");
        this.calendarBox = this.rootElem.querySelector(".calendar-box");
        this.applyBtn = this.rootElem.querySelector(".calendar-box__apply");
        this.calendarStart =
            inittedInputs.find(inpParams => findCalendar(inpParams, "calendar-box__part--start"));
        this.calendarEnd =
            inittedInputs.find(inpParams => findCalendar(inpParams, "calendar-box__part--end"));
        this.calendars = [this.calendarStart, this.calendarEnd];
        this.selectBoxStart = getSelectBoxData(this.rootElem.querySelector(".calendar__input--start"));
        this.selectBoxEnd = getSelectBoxData(this.rootElem.querySelector(".calendar__input--end"));
        this.selectBoxes = [this.selectBoxStart, this.selectBoxEnd];

        const showCalendarBox = (event) => {
            const exception = event.target.classList.contains("selctexit_btn")
                || event.target.closest(".selctexit_btn");
            if (exception) return;
            this.toggleCalendarBox(true).show();
        };
        const hideCalendarBox = this.toggleCalendarBox(true).hide;

        this.selectBoxes.forEach(obj => {
            obj.selectBox.addEventListener("click", showCalendarBox);
            obj.inputsWrapper.addEventListener("change", this.checkCorrect);
        });
        document.addEventListener("click", (event) => {
            const exception = event.target === this.rootElem
                || event.target.closest(".calendar") === this.rootElem;
            if (exception)
                return;

            hideCalendarBox();
        });

        getParams.call(this);
        setCalendarsPartsParams.call(this);
        setCalendarsHandlers.call(this);
        this.applyBtn.addEventListener("click", this.apply);

        function getSelectBoxData(selectBox) {
            const inputsWrapper = selectBox.querySelector(".calendar__selectBox-inputs");
            const dayInput = selectBox.querySelector(".calendar__selectBox-input--day");
            const monthInput = selectBox.querySelector(".calendar__selectBox-input--month");
            const yearInput = selectBox.querySelector(".calendar__selectBox-input--year");
            const clearBtn = selectBox.querySelector(".selctexit_btn");
            const overlap = createElement("div", "calendar__selectBox-overlap");
            const selectBoxData = {
                selectBox, inputsWrapper, dayInput, monthInput, yearInput, clearBtn, overlap
            };

            selectBox.addEventListener("click", onSelectBoxClick.bind(this));
            document.addEventListener("click", onDocumentClick.bind(this));

            let calendarParams;
            if (selectBox.classList.contains("calendar__input--start"))
                calendarParams = this.calendarStart;
            if (selectBox.classList.contains("calendar__input--end"))
                calendarParams = this.calendarEnd;
            const inputs = [dayInput, monthInput, yearInput];

            inputs.forEach(input => {
                input.addEventListener("change", onChange);
                input.addEventListener("input", onInput);
                input.addEventListener("keydown", onKeydown);
            });
            clearBtn.addEventListener("click", this.clearCalendar);
            selectBox.querySelector(".calendar__selectBox-wrapper").append(overlap);

            return selectBoxData;

            function onSelectBoxClick() {
                this.toggleOverlap(true).hide(selectBoxData);
                const emptyInput = inputs
                    .find(i => i.value.length < parseInt(i.getAttribute("maxlength")))
                    || inputs[inputs.length - 1];
                if (!inputs.includes(document.activeElement)) emptyInput.focus();
            }
            function onDocumentClick(event) {
                if (event.target === selectBox
                    || event.target.closest(".calendar__selectBox") === selectBox) return;
                if (!getTextContent(overlap).trim()) return;

                this.toggleOverlap(true).show(selectBoxData);
            }
            function onChange(event) {
                const input = event.target;
                const maxlength = parseInt(input.getAttribute("maxlength"));
                if (maxlength === 2 && input.value && input.value.length < maxlength)
                    input.value = `0${input.value}`;
                inputsWrapper.dispatchEvent(new Event("change"));
            }
            function onInput(event) {
                const input = event.target;
                const maxlength = parseInt(input.getAttribute("maxlength"));
                input.value = input.value.replace(/\D/g, "");

                const hasNoValue = !inputs.find(inp => inp.value.trim());
                if (hasNoValue) selectBox.classList.remove("selbActive");
                else selectBox.classList.add("selbActive");

                const valueNum = parseInt(input.value);
                if (valueNum < 1 && input.value.length > 1) input.value = "01";
                if (input === dayInput) checkCorrectDay();
                if (input === monthInput) checkCorrectMonth();

                if (input.value.length >= maxlength) goToNext();

                const isFull = inputs.filter(i => {
                    const maxlength = parseInt(i.getAttribute("maxlength"));
                    return i.value.length < maxlength;
                }).length < 1;
                if (isFull) setCalendar();

                function goToNext() {
                    const nextIndex = inputs.findIndex(i => i === input) + 1;
                    const nextInput = inputs[nextIndex];
                    if (!nextInput) return;

                    nextInput.focus();
                }
                function checkCorrectDay() {
                    if (valueNum > calendarParams.lastMonthDay)
                        input.value = calendarParams.lastMonthDay;
                }
                function checkCorrectMonth() {
                    if (valueNum > 12) input.value = 12;
                }
                function setCalendar() {
                    const month = parseInt(monthInput.value);
                    const year = yearInput.value;
                    const day = dayInput.value;

                    const monthText = months[month - 1];

                    const monthSelectValue = calendarParams.monthSelect.options.find(obj => {
                        return obj.text === monthText;
                    });
                    const yearSelectValue = calendarParams.yearSelect.options.find(obj => {
                        return obj.text === year;
                    });

                    if (!monthSelectValue || !yearSelectValue) return;

                    monthSelectValue.node.dispatchEvent(new Event("click"));
                    yearSelectValue.node.dispatchEvent(new Event("click"));
                    setTimeout(() => {
                        const tableCell = Array.from(
                            calendarParams.table.querySelectorAll(".calendar-box__monthday-cell")
                        ).find(cell => parseInt(getTextContent(cell)) === parseInt(day));

                        tableCell.dispatchEvent(new Event("click"));
                    }, 0);
                }
            }
            function onKeydown(event) {
                const input = event.target;
                const index = inputs.findIndex(i => i === input);
                const prevInput = inputs[index - 1];
                const nextInput = inputs[index + 1];

                if (event.key.match(/backspace/i)) {
                    if (input.value.length > 0) return;

                    if (prevInput) prevInput.focus();
                }
                if (event.key.match(/arrowleft/i)) {
                    if (input.selectionStart === 0 && prevInput) prevInput.focus();
                }
                if (event.key.match(/arrowright/i)) {
                    if (input.selectionEnd === input.value.length && nextInput) nextInput.focus();
                }
            }
        }
        function findCalendar(inpParams, className) {
            if (!inpParams.rootElem) return;

            const isInstance = inpParams instanceof Calendar;
            const isChild = inpParams.rootElem.closest(".calendar") === this.rootElem;
            return isInstance
                && isChild
                && inpParams.rootElem.classList.contains(className);
        }
        function setCalendarsPartsParams() {
            for (let key in this.params) {
                const prop = this.params[key];

                this.calendars.forEach(calendarParams => {
                    if (!calendarParams.params[key]) calendarParams.params[key] = prop;
                });
            }
        }
        function setCalendarsHandlers() {
            this.calendarStart.rootElem.addEventListener("change", this.setSelectBoxValue);
            this.calendarEnd.rootElem.addEventListener("change", this.setSelectBoxValue);
        }
    }
    clearAllCalendars() {
        this.selectBoxes.forEach(obj => obj.clearBtn.dispatchEvent(new Event("click")));
        this.apply();
    }
    clearCalendar(event) {
        const btn = event.target;
        const selectBox = btn.closest(".calendar__selectBox");
        const selectBoxData = this.selectBoxes.find(o => o.selectBox === selectBox);
        const calendarIndex = this.selectBoxes.findIndex(o => o.selectBox === selectBox);
        const calendarParams = this.calendars[calendarIndex];

        calendarParams.clear();
        selectBoxData.dayInput.value = "";
        selectBoxData.monthInput.value = "";
        selectBoxData.yearInput.value = "";
        setTextContent(selectBoxData.overlap, "");
        selectBoxData.inputsWrapper.dispatchEvent(new Event("change"));
        this.toggleOverlap(true).hide(selectBoxData);
        this.rootElem.classList.remove("__wrong-value");

        this.rootElem.dispatchEvent(new CustomEvent("clear"));
    }
    setSelectBoxValue(event) {
        let calendarParams, selectBoxData;
        const isStart = event.target === this.calendarStart.rootElem;
        const isEnd = event.target === this.calendarEnd.rootElem;

        if (isStart) calendarParams = this.calendarStart;
        if (isEnd) calendarParams = this.calendarEnd;
        if (!calendarParams) return;

        if (isStart) selectBoxData = this.selectBoxStart;
        if (isEnd) selectBoxData = this.selectBoxEnd;
        if (!selectBoxData) return;

        const day = event.detail.cellValue;
        const month = calendarParams.monthSelect.value;
        const monthGenitive = monthsGenitive[months.findIndex(m => m === month)];
        const year = calendarParams.yearSelect.value;
        const overlapText = `${day} ${monthGenitive} ${year}`;
        setTextContent(selectBoxData.overlap, overlapText);

        let monthNumber = months.findIndex(m => m === month) + 1;
        if (monthNumber.toString().length < 2) monthNumber = `0${monthNumber}`;
        selectBoxData.dayInput.value = day;
        if (selectBoxData.dayInput.value.length < 2) selectBoxData.dayInput.value = `0${day}`;
        // с этими строками сразу преобразует в пропись
        // selectBoxData.monthInput.value = monthNumber;
        // selectBoxData.yearInput.value = year;

        // this.toggleOverlap(true).show(selectBoxData);
    }
    toggleOverlap(returnMethods = false, selectBoxData = null) {
        show = show.bind(this);
        hide = hide.bind(this);

        if (returnMethods) return { show, hide };
        if (!selectBoxData) return;

        selectBoxData.overlap.classList.contains("hidden")
            ? show(selectBoxData) : hide(selectBoxData);

        function show(selectBoxData) {
            selectBoxData.inputsWrapper.classList.add("hidden");
            selectBoxData.overlap.classList.remove("hidden");
            selectBoxData.selectBox.classList.add("selbActive");
        }
        function hide(selectBoxData) {
            selectBoxData.inputsWrapper.classList.remove("hidden");
            selectBoxData.overlap.classList.add("hidden");
            selectBoxData.selectBox.classList.remove("selbActive");
        }
    }
    toggleCalendarBox(returnMethods = false) {
        show = show.bind(this);
        hide = hide.bind(this);

        if (returnMethods) return { show, hide };

        this.calendarBox.classList.contains("__shown")
            ? show()
            : hide();

        function show() {
            this.calendarBox.classList.add("__shown");
            this.setCalendarPosition();
            window.addEventListener("scroll", this.setCalendarPosition);
            window.addEventListener("resize", this.setCalendarPosition);
        }
        function hide() {
            this.calendarBox.classList.remove("__shown");
            window.removeEventListener("scroll", this.setCalendarPosition);
            window.removeEventListener("resize", this.setCalendarPosition);
        }
    }
    setCalendarPosition() {
        const calendarHeight = this.calendarBox.offsetHeight;
        const parent = this.calendarBox.parentNode;
        const isLowerThanWindowBottom = parent.getBoundingClientRect().bottom + calendarHeight > document.documentElement.clientHeight;
        const isHigherThanWindowTop = parent.getBoundingClientRect().top < calendarHeight;

        if (isLowerThanWindowBottom && !isHigherThanWindowTop) {
            this.calendarBox.style.bottom = "0px";
            this.calendarBox.style.top = "auto";
        } else {
            this.calendarBox.style.removeProperty("bottom");
            this.calendarBox.style.removeProperty("top");
        }
    }
    getDates() {
        const startDay = this.calendarStart.day;
        const endDay = this.calendarEnd.day;
        const startMonth = months.findIndex(m => m === this.calendarStart.monthSelect.value) + 1;
        const endMonth = months.findIndex(m => m === this.calendarEnd.monthSelect.value) + 1;
        const startYear = this.calendarStart.yearSelect.value;
        const endYear = this.calendarEnd.yearSelect.value;

        const start = !startDay || !startMonth || !startYear
            ? "" : `${startDay}.${startMonth}.${startYear}`;
        const end = !endDay || !endMonth || !endYear
            ? "" : `${endDay}.${endMonth}.${endYear}`;

        return { start, end };
    }
    apply() {
        this.toggleCalendarBox(true).hide();

        const datesStrs = this.getDates();
        const start = datesStrs.start;
        const end = datesStrs.end;

        this.values = { start, end };

        if (!this.checkCorrect()) return;

        this.rootElem.dispatchEvent(new CustomEvent("apply"));
    }
    checkCorrect() {
        const datesStrs = this.getDates();
        const start = datesStrs.start;
        const end = datesStrs.end;

        const isCorrect = this.isEarlier(start, end);
        if (isCorrect || !start || !end) this.rootElem.classList.remove("__wrong-value");
        else {
            this.rootElem.classList.add("__wrong-value");
            return false;
        }

        return isCorrect;
    }
    isEarlier(dateCheck, dateRelative) {
        if (typeof dateCheck === "string")
            dateCheck = dateCheck.split(".").map(v => parseInt(v));
        if (typeof dateRelative === "string")
            dateRelative = dateRelative.split(".").map(v => parseInt(v));

        if (!Array.isArray(dateCheck) || !Array.isArray(dateRelative)) return;

        if (dateCheck[2] > dateRelative[2]) return false;

        else if (dateCheck[2] === dateRelative[2]) {
            if (dateCheck[1] > dateRelative[1]) return false;
            else if (dateCheck[1] === dateCheck[1]) {
                if (dateCheck[0] > dateRelative[0]) return false;
            }
        }

        return true;
    }
    isOlder(dateCheck, dateRelative) {
        if (typeof dateCheck === "string")
            dateCheck = dateCheck.split(".").map(v => parseInt(v));
        if (typeof dateRelative === "string")
            dateRelative = dateRelative.split(".").map(v => parseInt(v));
        if (!Array.isArray(dateCheck) || !Array.isArray(dateRelative)) return;

        if (dateCheck[2] < dateRelative[2]) return false;

        else if (dateCheck[2] === dateRelative[2]) {
            if (dateCheck[1] < dateRelative[1]) return false;
            else if (dateCheck[1] === dateCheck[1]) {
                if (dateCheck[0] < dateRelative[0]) return false;
            }
        }

        return true;
    }
}

// в отдельных файлах (например, new-resume.js) создаются такие же массивы, которые затем через .concat "сращиваются" с inittingSelectors, что позволяет инициализировать их в inittedInputs
let inittingSelectors = [
    { selector: "[data-popup-fullimage]", classInstance: FullImagePopup },
    { selector: "[data-dynamic-adaptive]", classInstance: DynamicAdaptive },
    { selector: ".popup_edit", classInstance: PopupCommEdit },
    { selector: ".comm_block_text_edit", classInstance: PopupCommEdit },
    { selector: ".popup_add", classInstance: PopupCommAdd },
    { selector: ".popup_delete_comm", classInstance: PopupCommDelete },
    { selector: ".died", classInstance: DiedButton },
    { selector: ".comm_block_remove", classInstance: CommBlockRemove },
    { selector: ".spoiler", classInstance: Spoiler },
    { selector: "[data-edit-resume]", classInstance: EditApplicantResume },
    { selector: ".select", classInstance: Select },
    { selector: ".calendar-box__part", classInstance: Calendar },
    { selector: ".calendar", classInstance: CalendarBox },
];
let inittedInputs = [];
initInputs();
function initInputs() {
    inittingSelectors.forEach(seldata => {
        let nodes = Array.from(document.querySelectorAll(`${seldata.selector}`));
        nodes.forEach(node => {
            let isAlreadyInitted = Boolean(
                inittedInputs.find(inpParams => {
                    return inpParams.rootElem === node
                        && inpParams instanceof seldata.classInstance
                })
            );
            if (isAlreadyInitted) return;

            let inputClass = new seldata.classInstance(node);
            inputClass.instanceFlag = seldata.instanceFlag;
            inittedInputs.push(inputClass);
        });
    });
}

let isInitting = false;
let inputElementsObserver = new MutationObserver(() => {
    if (isInitting) return;

    isInitting = true;
    initInputs();
    setTimeout(() => {
        isInitting = false;
        initInputs();
    }, 0);
});
inputElementsObserver.observe(document.body, { childList: true, subtree: true });

function findInittedInput(selector, isAll = false, instanceFlag = null) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по селектору элемент
    const selectorNodes = Array.from(document.querySelectorAll(selector));
    if (!isAll) {
        const input = inittedInputs.find(arrayHandler);
        return input || null;
    } else {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs || null;
    }

    function arrayHandler(inpClass) {
        let matches = selectorNodes.includes(inpClass.rootElem);
        if (instanceFlag) matches = matches && inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}
function findInittedInputByFlag(instanceFlag, isAll = false) {
    // isAll == true: вернет array, isAll == false: вернет первый найденный по флагу элемент
    if (isAll) {
        const inputs = inittedInputs.filter(arrayHandler);
        return inputs;
    } else {
        const input = inittedInputs.find(arrayHandler);
        return input;
    }

    function arrayHandler(inpClass) {
        let matches = inpClass.instanceFlag === instanceFlag;
        return matches;
    }
}