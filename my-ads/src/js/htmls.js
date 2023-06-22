const rootPath = "/vsevn-projects/my-ads/dist/";

function createElement(tagName, className, insertingHTML, attributes = "") {
    // attributes: "attrName=attrValue; attrName2=attrValue2"
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);

    if (attributes) {
        const attributesList = attributes.split("; ");
        attributesList.forEach(str => {
            const split = str.split("=");
            element.setAttribute(split[0], split[1]);
        });
    }

    return element;
}

class RenderMisc {
    cross() {
        return `
        <button class="cross" type="button" tabindex="-1">
            <span class="icon-cross-thinner"></span>
        </button>
        `;
    }
    warning(params = { text: "" }) {
        return `
        <div class="warning">
            <button class="warning__close" type="button" tabindex="-1">
                <span class="icon-cross-thinner"></span>
            </button>
            <div class="warning__text">
                ${params.text}
            </div>
        </div>
        `;
    }
    hintInner(params = { title: "" }) {
        return `
            <button class="hint__close" type="button">
                <span class="icon-cross-thinner"></span>
            </button>
            <div class="hint__title">${params.title || ""}</div>
            <div class="hint__body"></div>
        `;
    }
    copyLink(params = { link: "", returnInner: false }) {
        let inner = `
            <div class="copy-link-modal__link">${params.link}</div>
            <button class="copy-link-modal__button" type="button">
                <span class="icon-link"></span>
                <span class="copy-link-modal__text">Скопировать ссылку</span>
            </button>
        `;
        const node = createElement("div", "copy-link-modal", inner);
        const button = node.querySelector(".copy-link-modal__button");
        const text = node.querySelector(".copy-link-modal__text");
        return { node, button, text };
    }
    select(params = { selectClassName: "", dataParams: "", values: [] }) {
        const inner = `
            <div class="select__options-list">
                ${createValues()}
            </div>
        `;

        const select = createElement("div", `select ${params.selectClassName || ""}`, inner);
        if (params.dataParams) select.dataset.params = params.dataParams;
        return select;

        function createValues() {
            let str = "";
            params.values.forEach(val => {
                str += `
                <label class="select__option">
                    <input type="radio" value="${val}">
                </label>
                `;
            });
            return str;
        }
    }
    checkboxesModalListContainer(params = { title: "", name: "", itemsHead: [], items: [] }) {
        let itemsHeadString = `<ul class="checkboxes-modal__sublist checkboxes-modal__sublist--head">`;
        if (Array.isArray(params.itemsHead) && params.itemsHead.length > 0) {
            params.itemsHead.forEach(value => {
                itemsHeadString += this.checkboxesModalCheckmark({ value, name: params.name });
            });
        }
        itemsHeadString += "</ul>";

        let itemsString = `<ul class="checkboxes-modal__sublist checkboxes-modal__sublist--standard">`;
        if (Array.isArray(params.items) && params.items.length > 0) {
            params.items.forEach(value => {
                itemsHead += this.checkboxesModalCheckmark({ value, name: params.name })
            });
        }
        itemsString += "</ul>";

        return `
            <div class="checkboxes-modal__list-container">
                <div class="checkboxes-modal__list-texts">
                    <h4 class="text-input__title">${params.title || ""}</h4>
                    <button class="checkboxes-modal__clear-button" type="button">
                        Очистить
                    </button>
                </div>
                <div class="checkboxes-modal__lists">
                    ${itemsHeadString}
                    ${itemsString}
                </div>
            </div>
        `;
    }
    checkboxesModalCheckmark(params = { value: "", name: "", paramsDataset: "", subValues: [] }) {
        let subValuesList = "";
        if (params.subValues) {
            subValuesList = `<ul class="checkboxes-modal__subvalues">`
            params.subValues.forEach(sv => {
                subValuesList += this.checkmarkLabel({
                    value: sv,
                    name: params.name,
                    className: "checkboxes-modal__label"
                });
            });
            subValuesList += "</ul>";
        }

        return `
        <li class="checkboxes-modal__list-item" 
        ${params.paramsDataset ? `data-params="${params.paramsDataset}"` : ""}>
            ${this.checkmarkLabel({ value: params.value, name: params.name })}
            ${subValuesList}
        </li>
        `;
    }
    checkmarkLabel(params = { value: "", name: "", className: "", attrsToLabel: "" }) {
        const inputValue = params.value.replace(/<.*?>/g, "").trim();
        return `
            <label class="checkmark${params.className ? ` ${params.className}` : ""}"${params.attrsToLabel ? params.attrsToLabel : ""}>
                <input type="checkbox" name="${params.name || ""}" value="${inputValue}">
                <span class="checkmark__box"></span>
                <span class="checkmark__text">${params.value || ""}</span>
            </label>
        `;
    }
}

class RenderCalendar {
    container() {
        const inner = `
            <table class="calendar-table">
                <tbody class="calendar-table__weekdays">
                    <th class="calendar-table__cell">
                        ПН
                    </th>
                    <th class="calendar-table__cell">
                        ВТ
                    </th>
                    <th class="calendar-table__cell">
                        СР
                    </th>
                    <th class="calendar-table__cell">
                        ЧТ
                    </th>
                    <th class="calendar-table__cell">
                        ПТ
                    </th>
                    <th class="calendar-table__cell">
                        СБ
                    </th>
                    <th class="calendar-table__cell">
                        ВС
                    </th>
                </tbody>
            </table>
        `;
        const container = createElement("div", "calendar-box__table-container", inner);

        return container;
    }
    allTableRows(params = { month: 1, year: 2020 }) {
        const date = new Date(`${params.month}-01-${params.year}`);
        let day = date.getDay() - 1;
        if (day === -1) day = 6;
        const lastMonthDay = dateMethods.getMaxMonthDay(params.month, params.year);

        const tableRows = [];
        let firstValues = [];
        let pushingDay = 1;
        for (let i = 0; i < day; i++) firstValues.push("");
        while (firstValues.length < 7) {
            firstValues.push(pushingDay);
            pushingDay++;
        }
        tableRows.push(this.tableRow({ values: firstValues }));

        while (pushingDay <= lastMonthDay) {
            const values = [];
            for (let i = 0; i < 7; i++) {
                if (pushingDay > lastMonthDay) break;
                values.push(pushingDay);
                pushingDay++;
            }
            tableRows.push(this.tableRow({ values }));
        }

        return tableRows;
    }
    tableRow(params = { values: [] }) {
        let tdList = "";
        for (let i = 0; i < 7; i++) {
            const value = params.values[i] || "";
            tdList += `<td class="calendar-table__cell">${value}</td>`;
        }
        return createElement("tr", "calendar-table__monthdays", tdList);
    }
    applyContainer() {
        const inner = `
            <button class="calendar-box__apply apply-button" type="button">
                Применить
            </button>
        `;
        const container = createElement("div", "calendar-box__apply-container", inner);
        const button = container.querySelector(".apply-button");
        return { container, button };
    }
}

class RenderModal {
    // кроме указанного, в params можно передавать и другие параметры, которые будут полезны в вызываемом методе по params.modalName. Эти params будут доступны в this.params внутри экземпляра RenderModal
    constructor(params = { modalName: "", title: "", modalWindowClassname: "" }) {
        // modalName - название метода из этого класса для рендера тела

        this.params = params;
        const callbackMethod = this[params.modalName].bind(this);
        // данные строки не могут быть переданы в modalName
        const methodExceptions = ["renderClose", "renderStandardWindowInner"];

        // тег <div> в inner закрывается позднее
        let inner = `
            <div class="modal__window ${params.modalWindowClassname || ""}">
                <button class="modal__close" type="button"></button>
        `;
        const correctModalName = !methodExceptions.includes(this.params.modalName)
            && typeof callbackMethod === "function";
        if (correctModalName) {
            const body = callbackMethod();
            inner += body;
        }

        inner += "</div>";
        this.modal = createElement("div", "modal", inner);
        return this.modal;
    }
    renderStandardWindowInner(params = { title: "", inner: "" }) {
        return `
            <h4 class="modal__title">${params.title}</h4>
            <div class="modal__body">
                ${params.inner}
            </div>
        `;
    }
    checkboxesModalDouble() {
        const params = this.params;

        const search = params.search
            ? `
                <div class="text-input text-input--checkboxes text-input--gray checkboxes-modal__search">
                    <h4 class="text-input__title">${params.search || ""}</h4>
                    <div class="text-input__wrapper">
                        <div class="text-input__icon icon-search"></div>
                        <input class="text-input__input" type="text" placeholder="${params.placeholder || ""}">
                    </div>
                </div>
            `
            : "";
        const firstList = renderMisc.checkboxesModalListContainer({
            title: params.firstTitle
        });
        const secondList = renderMisc.checkboxesModalListContainer({
            title: params.secondTitle
        });

        return `
            <div class="modal__body">
                ${search}
                <div class="checkboxes-modal__container">
                    ${firstList}
                    ${secondList}
                </div>
                <div class="checkboxes-modal__apply-container">
                    <button class="button checkboxes-modal__apply" type="button">
                        Выбрать
                    </button>
                </div>
            </div>
        `;
    }
    // методы ниже — то, что должно прилетать с бэкэнда. Тут используются пока для визуала
    servicesList1() {
        const title = "Услуги продвижения";
        const inner = `
            <ul>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("paid_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">Платное размещение</div>
                        <div class="service-item__period">Период: 11.05.2022 - 11.06.2022</div>
                        <div class="service-item__until">Услуга АКТИВНА до 11.06.2022</div>
                    </div>
                </li>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("vip_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">VIP - объявление</div>
                        <div class="service-item__period">Период: 11.05.2022 - 11.06.2022</div>
                        <div class="service-item__until">Услуга АКТИВНА до 11.06.2022</div>
                    </div>
                </li>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("premium_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">Премиум объявление</div>
                        <div class="service-item__period">
                            Услуга неактивна,
                            <a class="link link--red" href="#">активировать</a>
                            ?
                        </div>
                    </div>
                </li>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("xxl_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">Сделать XXL объявлением</div>
                        <div class="service-item__period">
                            Услуга неактивна,
                            <a class="link link--red" href="#">активировать</a>
                            ?
                        </div>
                    </div>
                </li>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("colored_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">Выделить объявление цветом</div>
                        <div class="service-item__period">
                            Услуга неактивна,
                            <a class="link link--red" href="#">активировать</a>
                            ?
                        </div>
                    </div>
                </li>
                <li class="service-item">
                    <div class="service-item__image">
                        ${renderSVG.getSVG("up_service")}
                    </div>
                    <div class="service-item__info">
                        <div class="service-item__title">Поднять объявление в поиске</div>
                        <div class="service-item__period">
                            Услуга неактивна,
                            <a class="link link--red" href="#">активировать</a>
                            ?
                        </div>
                    </div>
                </li>
            </ul>
        `;
        return this.renderStandardWindowInner({ title, inner });
    }
    servicesList2() {
        const title = "Услуги продвижения";
        const inner = `

        `;
        return this.renderStandardWindowInner({ title, inner });
    }
}

class RenderSVG {
    constructor() {
        this.replacePlaceholders = this.replacePlaceholders.bind(this);

        fetch(`${rootPath}svg.html`)
            .then(res => res.text())
            .then(data => {
                this.container = createElement("div", "", data);

                const observer = new MutationObserver(this.replacePlaceholders);
                observer.observe(document.body, { childList: true, subtree: true });

                setTimeout(() => {
                    document.dispatchEvent(new Event("svg-file-loaded"));
                }, 0);
            });
    }
    getSVG(svgName) {
        if (this.container) {
            const el = this.container.querySelector(`[data-svg-name="${svgName}"]`);
            const layout = el.innerHTML;
            return layout;
        }

        this.onload(() => {
            this.replacePlaceholders();
        });

        return `<div data-svg-placeholder="${svgName}"></div>`;
    }
    onload(callback) {
        onSvgFileLoaded = onSvgFileLoaded.bind(this);

        document.addEventListener("svg-file-loaded", onSvgFileLoaded);

        function onSvgFileLoaded() {
            document.removeEventListener("svg-file-loaded", onSvgFileLoaded);
            callback();
        }
    }
    replacePlaceholders() {
        setTimeout(() => {
            if (!this.container) return;

            const placeholders = document.querySelectorAll(`[data-svg-placeholder]`);
            placeholders.forEach(div => {
                const svgName = div.dataset.svgPlaceholder;
                const el = this.container.querySelector(`[data-svg-name="${svgName}"]`);
                if (!el) return;

                const layout = el.innerHTML;
                div.insertAdjacentHTML("afterend", layout);
                div.remove();
            });
        }, 0);
    }
}

const renderMisc = new RenderMisc();
const renderCalendar = new RenderCalendar();
const renderSVG = new RenderSVG();