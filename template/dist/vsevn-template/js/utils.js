// здесь находятся функции общего назначения
let inittedInputs = [];

const months = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

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

const rootPath = "/vsevn-template/";

const browser = getBrowser();
const isMobileBrowser = Boolean(
    navigator.userAgent.match(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i
    )
);

function browsersFix() {
    if (browser !== "firefox" && browser !== "safari") {
        let addFixClass = [];

        addFixClass.forEach(el => {
            el.classList.add("__chromium-fix");
        });
    }
    if (browser === "firefox") {
        let addMozfixClass = [];
        // addMozfixClass = addMozfixClass
        //     .concat(Array.from(document.querySelectorAll("input")))


        addMozfixClass.forEach(el => {
            el.classList.add("__moz-fix");
        });
    }
}
browsersFix();


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

function assignPropertiesToObj(propertiesArray, obj = {}, delimeter = ":") {
    propertiesArray.forEach(str => {
        const property = str.split(delimeter);
        const key = property[0];
        const value = property[1];
        obj[key] = value;
    });

    return obj;
}

class TextContent {
    getContent(node) {
        return node.textContent || node.innerText;
    }
    setContent(node, text) {
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

function findInittedInput(selector, isAll = false) {
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
        return selectorNodes.includes(inpClass.rootElem);
    }
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
    clone.style.cssText = "position: absolute; z-index: -99; top: -100vh; left: -100vw; max-height: none;";
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