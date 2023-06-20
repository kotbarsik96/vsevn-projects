// здесь находятся функции общего назначения
let inittedInputs = [];

class DateMethods {
    constructor() {
        this.months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        this.monthsGenitive = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    }
    getMaxMonthDay(month, year = null) {
        month = parseInt(month);
        year = parseInt(year) || null;
        if (!month) return 31;

        const highest = [1, 3, 5, 7, 8, 10, 12];
        if (highest.includes(month)) return 31;
        else if (month === 2) {
            if (year && year % 4 === 0) return 29;
            return 28;
        }

        return 30;
    }
}
const dateMethods = new DateMethods();

function findInittedInput(rootElem, others = {}) {
    return inittedInputs.find(inpP => {
        const isRootElem = inpP.rootElem === rootElem;
        if (isRootElem) return true;

        if (others.input && inpP.input === others.input) return true;
        return false;
    });
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

const rootPath = "/vsevn-my_ads/";

const browser = getBrowser();
const mobileRegexp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i;
let isMobileBrowser = Boolean(navigator.userAgent.match(mobileRegexp));

window.addEventListener("resize", () => {
    isMobileBrowser = Boolean(navigator.userAgent.match(mobileRegexp));
});

function browsersFix() {
    if (browser === "firefox") {
        document.body.classList.add("__moz-fix");
    }
}
browsersFix();

// работа с вставкой/удалением HTML-элементов, когда нужно применить анимацию
class HtmlElementCustoms {
    remove(element, params = {}) {
        /* params:
            transitionDur: 0 (в мс)
        */
        function setDefaultParams() {
            if (!parseInt(params.transitionDur)) params.transitionDur = 0;
            else params.transitionDur = parseInt(params.transitionDur);
        }
        setDefaultParams();

        return new Promise(resolve => {
            element.style.cssText = `
            opacity: 0; 
            transition: all ${params.transitionDur / 1000}s ease;
        `;
            setTimeout(() => {
                element.remove();
                element.style.removeProperty("transition");
                resolve();
            }, params.transitionDur);
        });
    }
    insert(element, parentNode, params = {}) {
        /* params:
            transitionDur: 0 (в мс)
            insertType: "prepend"|"append"
        */
        function setDefaultParams() {
            if (!parseInt(params.transitionDur))
                params.transitionDur = 0;
            if (params.insertType !== "prepend" && params.insertType !== "append")
                params.insertType = "prepend";
        }
        setDefaultParams();

        return new Promise(resolve => {
            element.style.cssText = `
            opacity: 0; 
            transition: all ${params.transitionDur / 1000}s ease;
        `;
            parentNode[params.insertType](element);

            setTimeout(() => {
                element.style.opacity = "1";
                resolve();
            }, 0);
            setTimeout(() => {
                element.style.removeProperty("transition");
            }, params.transitionDur);
        });
    }
}
const htmlElementMethods = new HtmlElementCustoms();

function capitalize(string) {
    const arr = string.split("");
    arr[0] = arr[0].toUpperCase();
    return arr.join("");
}

let aboveSugsLim = false;

function sugsQuery(
    query,
    optionsBodyArg = {},
    apiType = "sgs"
) {
    return new Promise((resolve, reject) => {
        if (aboveSugsLim) {
            reject("Исчерпан лимит подсказок");
            return;
        }

        let url;
        if (apiType === "sgs")
            url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
        if (apiType === "comps")
            url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";

        let tn = "inserttoken";

        if (!optionsBodyArg.count) optionsBodyArg.count = 20;
        const optionsBody = Object.assign({ query }, optionsBodyArg);

        let options = {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Token " + tn
            },

            body: JSON.stringify(optionsBody)
        }

        fetch(url, options)
            .then(response => response.text())
            .then(result => {
                const json = JSON.parse(result);
                if (json.reason == "Forbidden") {
                    aboveSugsLim = true;
                    reject("Не удалось получить данные");
                }
                resolve(json);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function assignPropertiesToObj(properties, obj = {}, delimeter = "::") {
    if (!Array.isArray(properties)) properties = properties.split("; ");

    const lastItem = properties[properties.length - 1].trim();
    if (lastItem.endsWith(";"))
        properties[properties.length - 1] = lastItem.slice(0, lastItem.length - 1);

    properties.forEach(str => {
        const property = str.split(delimeter);
        const key = property[0];
        let value = property[1];
        if (value === "false") value = false;
        if (value === "true") value = true;
        obj[key] = value;
    });

    return obj;
}

function getParams(ctx, datasetName = "params", obj = {}) {
    const params = ctx.rootElem.dataset[datasetName] || "";
    const assigned = assignPropertiesToObj(params, obj);
    for (let key in assigned) {
        if (!assigned[key]) delete assigned[key];
    }

    ctx.rootElem.removeAttribute(`data-${camelCaseToKebab(datasetName)}`);
    return assigned;
}

function kebabToCamelCase(string) {
    let newStr = "";
    let skipI = -1;
    string.split("").forEach((s, i, arr) => {
        if (skipI === i) return;
        if (i === 0 || s !== "-") {
            newStr += s;
            return;
        }

        skipI = i + 1;
        newStr += arr[skipI].toUpperCase();
    });

    return newStr;
}

function camelCaseToKebab(string) {
    return string.split("")
        .map((s, i) => {
            if (i === 0 || !s.match(/[A-Z]/)) return s;

            return `-${s.toLowerCase()}`;
        })
        .join("");
}

function bindMethods(ctx, methods = {}) {
    for (let key in methods) {
        const f = methods[key];
        if (typeof f !== "function") continue;
        methods[key] = f.bind(ctx);
    }

    return methods;
}

function checkIfTargetOrClosest(eventTarget, array = []) {
    let isTargetOrClosest = false;
    for (let elOrSelector of array) {
        if (typeof elOrSelector === "string") elOrSelector = document.querySelector(elOrSelector);

        if (eventTarget === elOrSelector) {
            isTargetOrClosest = true;
            break;
        }
        const classSelector = elOrSelector.className.split(" ")[0];
        if (eventTarget.closest(`.${classSelector}`) === elOrSelector) {
            isTargetOrClosest = true;
            break;
        }
    }
    return isTargetOrClosest;
}

class TextContent {
    getContent(node) {
        if (!node) return "";
        return node.textContent || node.innerText;
    }
    setContent(node, text) {
        if (!node) return;
        if (node.textContent) node.textContent = text;
        else node.innerText = text;
    }
}
const textContentMethods = new TextContent();

function getCoords(el) {
    const box = el.getBoundingClientRect();
    return {
        top: box.top + window.pageYOffset,
        left: box.left + window.pageXOffset,
        right: box.right + window.pageXOffset,
        bottom: box.bottom + window.pageYOffset
    }
}

function calcSize(bytes) {
    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb < 1) return `${parseInt(kb)} кб`;
    if (mb >= 1) return `${parseInt(mb * 100) / 100} мб`;
}

function isQuerySelectorString(string) {
    const selectorStartSymbols = ["#", ".", "["];
    return selectorStartSymbols.includes(string[0]);
}

function getRandomNumber(maxlength = 7) {
    let num = (Math.random() * 10).toString().replace(".", "");
    num = num.slice(0, maxlength);

    return num;
}

const TimeMethods = {
    // возвращает true, если time1 раньше, чем time2 или такого же значения; возвращает false, если time1 позднее, чем time2
    // time1 и time2 обязательно должны быть в формате "mm:hh"
    compare(time1, time2) {
        time1 = time1.trim();
        time2 = time2.trim();
        const regexp = /\d\d:\d\d/;
        if (!time1.match(regexp) || !time2.match(regexp)) return;

        const split1 = time1.split(":");
        const split2 = time2.split(":");
        const date1 = new Date();
        const date2 = new Date();
        const time1Parsed = date1.setHours(split1[0], split1[1]);
        const time2Parsed = date2.setHours(split2[0], split2[1]);

        if (time1Parsed <= time2Parsed) return 1;
        return 0;
    }
}

const usedIds = [];
function getId() {
    let id = getRandomNumber();
    while (usedIds.includes(id)) {
        id = getRandomNumber();
    }

    usedIds.push(id);
    return id;
}

function getScrollWidth() {
    const block = createElement("div", "", "<div></div>");
    block.style.cssText = "position: absolute; left: -100vw; z-index: -9; overflow: scroll; width: 100px; height: 100px;";
    block.querySelector("div").style.cssText = "height: 250px; width: 100%";
    document.body.append(block);
    const width = block.offsetWidth - block.clientWidth;
    block.remove();
    return width;
}

function getHeight(node) {
    let clone = node.cloneNode(true);
    const width = node.offsetWidth;
    clone.style.cssText = `position: absolute; z-index: -99; top: -100vh; left: -100vw; max-height: none; width: ${width}px;`;
    document.body.append(clone);
    let height = clone.offsetHeight;
    clone.remove();
    return height + 10;
}

function getDateFromString(string) {
    const split = string.split(".");
    let day = split.length === 3 ? split[0] : null;
    let month = split.length === 3 ? split[1] : split[0];
    let year = split.length === 3 ? split[2] : split[1];

    if (split.length < 2) {
        month = null;
        year = split[0];
    }

    if (day) day = parseInt(day.trim());
    if (month) month = parseInt(month.trim());
    if (year) year = parseInt(year.trim());
    return { day, month, year, };
}

// блокировать/разблокировать скролл на странице
class ScrollToggle {
    constructor() {
        // при пропадании скролла им будет задан padding-right
        this.paddingRightSelectors = ["body"];
    }
    lock() {
        const scrollWidth = getScrollWidth();
        document.body.classList.add("__locked-scroll");
        this.paddingRightSelectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.paddingRight = `${scrollWidth}px`;
        });
    }
    unlock() {
        document.body.classList.remove("__locked-scroll");
        this.paddingRightSelectors.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.removeProperty("padding-right");
        });
    }
}
const scrollToggle = new ScrollToggle();

// нужно вызвать на input, для которого ставится возможность указания только времени
class TypeTime {
    constructor(input, context) {
        this.typeTime = this.typeTime.bind(context);
        input.setAttribute("maxlength", "5");
        input.addEventListener("input", this.typeTime);
        input.addEventListener("change", this.typeTime);
        input.addEventListener("blur", this.typeTime);
    }
    typeTime(event) {
        if (event.detail && event.detail.typeTimeEvent) return;

        const numValue = this.input.value.replace(/\D/g, "").trim();
        let hours = numValue.slice(0, 2);
        let minutes = numValue.slice(2, 4);

        if (event.type === "input") onInput.call(this);
        if (event.type === "change" || event.type === "blur") onChange.call(this);

        function onInput() {
            this.input.value = this.input.value.replace(/[^:0-9]/g, "").trim();
            if (this.input.value.indexOf(":") !== this.input.value.lastIndexOf(":")) {
                const split = this.input.value.split("").filter((s, i, arr) => {
                    if (s !== ":") return true;
                    if (arr.indexOf(s) === i) return true;
                    return false;
                });
                this.input.value = split.join("");
            }
            if (event.inputType && event.inputType.match(/delete/)) return;

            if (this.input.value.length === 2 && !this.input.value.includes(":")) {
                this.input.value = this.input.value + ":";
            }
        }
        function onChange() {
            if (!this.input.value.replace(/\D/g, "").trim()) return;

            if (hours.length < 2) hours = `0${hours}`;
            if (minutes.length < 2) minutes = `0${minutes}`;

            if (parseInt(hours) > 23) hours = "23";
            if (parseInt(minutes) > 59) minutes = "00";
            if (parseInt(hours) <= 0) hours = "00";
            if (parseInt(minutes) <= 0) minutes = "00";

            this.input.value = `${this.params.prefix || ""} ${hours}:${minutes}`.trim();
            this.checkCompletion();
            this.toggleCompletionBg();
        }
    }
}

// найдет ближайший к relative элемент (потомок, сосед, родитель)
function findClosest(relative, selector) {
    let closest = relative.querySelector(selector);
    let parentNode = relative;
    while (!closest && parentNode !== document.body) {
        parentNode = parentNode.parentNode;
        if (!parentNode) break;
        closest = parentNode.querySelector(selector);
    }
    return closest;
}

class _LocalStorage {
    setItem(key, value) {
        const item = JSON.stringify(value);
        localStorage.setItem(key, item);
    }
    getItem(key) {
        const item = localStorage.getItem(key);
        return JSON.parse(item);
    }
}
class _SessionStorage {
    setItem(key, value) {
        const item = JSON.stringify(value);
        sessionStorage.setItem(key, item);
    }
    getItem(key) {
        const item = sessionStorage.getItem(key);
        return JSON.parse(item);
    }
}
const _localStorage = new _LocalStorage();
const _sessionStorage = new _SessionStorage();