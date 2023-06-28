class TextInput {
    constructor(node) {
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.inputWrapper = this.rootElem.querySelector(".text-input__wrapper")
            || this.rootElem.querySelector(".text-input--standard__wrapper");
        this.input = this.rootElem.querySelector(".text-input__input")
            || this.rootElem.querySelector(".text-input--standard__input");
        this.valuesData = this.initValuesBlock();
        this.name = this.input.getAttribute("name");

        this.init();
    }
    init() {
        if (this.input.querySelector(".date-inputs")) initDateInput.call(this);
        initInput.call(this);
        initControls.call(this);

        function initInput() {
            this.inputMethods = this.createInputMethods();
            this.input.addEventListener("input", this.inputMethods.onInput);
            this.input.addEventListener("blur", this.inputMethods.onBlur);
            this.input.addEventListener("focus", this.inputMethods.onFocus);
            setTimeout(() => {
                this.input.dispatchEvent(new Event("input"));
            }, 0);
        }
        function initControls() {
            this.controls = this.createControlsMethods();
            if (!this.params.noCross) this.controls.createCross();
        }
        function initDateInput() {
            if (!this.input.querySelector(".date-inputs")) return;

            this.input = this.input.querySelector(".date-inputs");
            nextInitTick(() => {
                this.inputFieldParams = findInittedInput(this.input);
            });
        }
    }
    createInputMethods() {
        const methods = bindMethods(this, {
            onInput(event = {}) {
                const detail = event.detail || {};
                if (this.params.typeNumbersOnly) methods.typeNumberOnly();

                if (this.input.value || (this.inputFieldParams && this.inputFieldParams.value)) {
                    this.rootElem.classList.add("__has-value");
                } else {
                    this.rootElem.classList.remove("__has-value");
                    methods.setPrefix();
                }

                this.highlightMatches();
                if (!detail.noShow) setTimeout(this.valuesData.show, 100);
            },
            onBlur() {
                if (this.params.prefix) methods.setPrefix();
            },
            onFocus() {
                if (this.params.prefix) replacePrefix.call(this);

                function replacePrefix() {
                    const prefix = this.params.prefix || "";
                    this.input.value = this.input.value.replace(prefix, "").trim();
                }
            },
            setPrefix() {
                if (!this.params.prefix || this.input.value.trim() === this.params.prefix.trim()) return;
                this.input.value = `${this.params.prefix} ${this.input.value}`;
            },
            typeNumberOnly() {
                if (this.params.typeNumbersOnly) {
                    const exceptions = this.params.typeExceptions;
                    const regexp = exceptions
                        ? new RegExp(`[^\\d${exceptions}]`, "g")
                        : /\D/g;

                    this.input.value = this.input.value.replace(regexp, "").trim();;
                }
            }
        });

        return methods;
    }
    createControlsMethods() {
        const methods = bindMethods(this, {
            createCross() {
                const cross = renderMisc.cross();
                this.inputWrapper.insertAdjacentHTML("beforeend", cross);
                const btn = this.inputWrapper.querySelector(".cross");
                btn.addEventListener("click", this.clear);
            }
        });

        return methods;
    }
    initValuesBlock() {
        const data = bindMethods(this, {
            node: this.rootElem.querySelector(".text-input__values")
                || createElement("div", "text-input__values"),
            selectValues: [],
            show() { },
            hide() { },
            getSelectValues() {

            },
            editSelectValues(params = { removeCurrentValues: false, values: [] }) {

            },
        });

        return data;
    }
    highlightMatches() {
        if (!this.valuesData.node || !this.input.tagName.match(/input/i)) return;
        doHighlight = doHighlight.bind(this);

        const value = this.input.value.trim();
        const shieldedValue = value.replace(/\(/g, "\\(")
            .replace(/\)/g, "\\)")
            .replace(/\+/g, "\\+")
            .replace(/\-/g, "\\-")
            .replace(/\./g, "\\.")
            .trim();
        let regexp = new RegExp(shieldedValue, "i");
        if (this.params.searchFromWordStart)
            regexp = new RegExp(`(\\b|[^A-Za-zА-Яа-я0-9])${shieldedValue}`, "i");

        if (this.jsonValues) loadFromJson.call(this);
        doHighlight();

        // если выбраны значения и нажата кнопка "Применить" после последнего события onInput
        const hasFullValue = this.valuesData.selectValues.find(obj => obj.value === value)
            || (this instanceof TextInputCheckbox && value.match(/выбрано/i))
            || !value;
        if (hasFullValue) {
            this.valuesData.selectValues.forEach(obj => {
                obj.node.classList.remove("none");
            });

            if (this.params.maxHighlights) {
                const max = parseInt(this.params.maxHighlights.replace(/\D/g, ""));
                this.valuesData.selectValues.slice(max).forEach(obj => obj.node.remove());
                this.valuesData.getSelectValues();
            }
        }

        setTimeout(() => {
            doSort.call(this);
        }, 100);

        function loadFromJson() {
            let values = this.jsonValues.filter(value => value.match(regexp));

            const maxLoads = parseInt(this.params.maxHighlights) || null;
            if (maxLoads) values = values.slice(0, maxLoads);

            this.editSelectValues({ removeCurrentValues: true, values, noHighlightCall: true });
        }
        function doHighlight() {
            this.valuesData.selectValues.forEach(obj => {
                let match = obj.value.match(regexp);
                // подсветить совпадение
                if (match) {
                    obj.node.classList.remove("none");
                    // если есть primary и secondary span'ы
                    if (obj.primaryValue || obj.secondaryValue) {
                        let primaryMatch = obj.primaryValue.match(regexp);
                        let secondaryMatch = obj.primaryValue.match(regexp);

                        if (primaryMatch) {
                            obj.primary.innerHTML = getHighlighted(obj.primaryValue, primaryMatch);
                        }
                        if (secondaryMatch) {
                            obj.secondary.innerHTML = getHighlighted(obj.secondaryValue, secondaryMatch);
                        }
                    }
                    // если в опции просто текст
                    else {
                        obj.valueContainer.innerHTML = getHighlighted(obj.value, match);
                    }
                    return;
                }
                // убрать опцию, в которой нет совпадения
                else {
                    // если есть primary и secondary span'ы
                    if (obj.primaryValue || obj.secondaryValue) {
                        if (obj.primary) obj.primary.innerHTML = obj.primaryValue;
                        if (obj.secondary) obj.secondary.innerHTML = obj.secondaryValue;
                    }
                    // если в опции просто текст
                    else {
                        obj.valueContainer.innerHTML = obj.value;
                    }
                    obj.node.classList.add("none");
                }

                function getHighlighted(source, match) {
                    if (!match) return source;
                    match = match[0];
                    const index = source.toLowerCase().indexOf(match.toLowerCase());
                    if (index < 0) return source;

                    const start = source.slice(0, index);
                    const mid = source.slice(index, index + match.length);
                    const end = source.slice(index + match.length);
                    return `${start}<span class="fw-700">${mid}</span>${end}`;
                }
            });
        }
        function doSort() {
            if (value && this.params.sortOnInput === "true") {
                sortCallback = sortCallback.bind(this);
                this.sortSelectValues(sortCallback);

                function sortCallback(obj1, obj2) {
                    const firstHasHighlight = obj1.node.querySelector(".fw-700");
                    const secondHasHighlight = obj2.node.querySelector(".fw-700");
                    if (obj1.value === value) return -1;
                    if (obj2.value === value) return 1;

                    if (firstHasHighlight && !secondHasHighlight) return -1;
                    if (!firstHasHighlight && secondHasHighlight) return 1;
                    if (!firstHasHighlight && !secondHasHighlight) return 0;

                    const val1 = obj1.value;
                    const val2 = obj2.value;

                    if (val1.length < val2.length) return -1;
                    if (val1.length > val2.length) return 1;
                    return 0;
                }
            }

            // поставить значение с полным совпадением в самое начало селекта
            if (value) {
                const fullMatches = this.valuesData.selectValues.filter(obj => obj.value === value);
                const others = this.valuesData.selectValues.filter(obj => obj.value !== value);
                fullMatches.forEach(fullMatch => {
                    fullMatch.anchor = createElement("div", "none");
                    fullMatch.node.after(fullMatch.anchor);
                    this.selectsWrapItems.prepend(fullMatch.node);
                });
                others.forEach(obj => {
                    if (obj.anchor) obj.anchor.replaceWith(obj.node);
                    obj.anchor = null;
                });
            } else {
                this.valuesData.selectValues.forEach(obj => {
                    if (!obj.anchor) return;

                    obj.anchor.replaceWith(obj.node);
                    obj.anchor = null;
                });
            }
        }
    }
    clear() {
        if (this.inputFieldParams) {
            if (this.inputFieldParams.clear) {
                this.inputFieldParams.clear();
                return;
            }
        }

        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.input.dispatchEvent(new Event("change"));
    }
}

class TextInputCheckbox extends TextInput {
    constructor(node) {
        super(node);
        this.apply = this.apply.bind(this);
        this.ariaLabel = this.input.getAttribute("aria-label") || null;
    }
    init() {
        initInput.call(this);
        initControls.call(this);

        function initInput() {
            this.inputMethods = this.createInputMethods();
            this.input.addEventListener("input", this.inputMethods.onInput);
            this.input.addEventListener("blur", this.inputMethods.onBlur);
            this.input.addEventListener("focus", this.inputMethods.onFocus);
            this.input.dispatchEvent(new Event("input"));
        }
        function initControls() {
            this.controls = this.createControlsMethods();
            if (!this.params.noCross) this.controls.createCross();
        }
    }
    createInputMethods() {
        const parentMethods = super.createInputMethods();
        let methods = Object.assign({}, parentMethods);

        methods.onFocus = function (event) {
            parentMethods.onFocus(event);
            this.valuesData.show();
        }

        methods = bindMethods(this, methods);
        return methods;
    }
    apply() {
        const methods = bindMethods(this, {
            setValueText() {
                const checked = this.valuesData.selectValues.filter(obj => obj.checkbox.checked);
                const length = checked.length;

                if (length > 1) {
                    this.input.value = this.ariaLabel
                        ? `${capitalize(this.ariaLabel)} (выбрано: ${length})`
                        : `Выбрано: ${length}`;
                } else if (length === 1) {
                    this.input.value = checked[0].value;
                }
            },
        });
        for (let key in methods) {
            if (typeof methods[key] === "function") methods[key]();
        }

        this.valuesData.hide();
        this.rootElem.dispatchEvent(new CustomEvent("apply"));
    }
    initValuesBlock() {
        const data = bindMethods(this, {
            container: this.rootElem.querySelector(".text-input__values"),
            node: this.rootElem.querySelector(".text-input__checkboxes")
                || createElement("div", "text-input__checkboxes"),
            applyButton: null,
            selectValues: [],
            show() {
                this.rootElem.classList.add("__values-shown");
                // если cssMaxHeight::true, будет браться из css
                if (!this.params.cssMaxHeight) {
                    const height = getHeight(data.container);
                    data.container.style.maxHeight = `${height}px`;
                }
                data.node.dispatchEvent(new CustomEvent("show"));
            },
            hide() {
                this.rootElem.classList.remove("__values-shown");
                data.container.style.removeProperty("max-height");
                data.node.dispatchEvent(new CustomEvent("hide"));
            },
            getSelectValues() {
                const newValues = Array.from(data.node.querySelectorAll(".checkmark"))
                    .filter(node => !data.selectValues.find(obj => obj.node === node))
                    .map(node => {
                        const checkbox = node.querySelector("input");
                        checkbox.value = checkbox.value.trim();
                        const value = checkbox.value;
                        const params = assignPropertiesToObj(node.dataset.params || "");
                        const primary = node.querySelector(".text-input__value-primary");
                        const secondary = node.querySelector(".text-input__value-secondary");
                        const primaryValue = primary ? getTextContent(primary).trim() : null;
                        const secondaryValue = secondary ? getTextContent(secondary).trim() : null;

                        return {
                            node,
                            checkbox,
                            valueContainer: node.querySelector(".checkmark__text"),
                            value,
                            params,
                            primary,
                            secondary,
                            primaryValue,
                            secondaryValue
                        };
                    });

                newValues.forEach(obj => {
                    obj.node.removeAttribute("data-params");
                });

                data.selectValues = data.selectValues
                    .filter(obj => obj.node.closest(".text-input__values") === data.container)
                    .concat(newValues);
            },
            editSelectValues(params = { removeCurrentValues: false, values: [] }) {
                // values: ["some-value", { value: "some-value", params: "key1::value; key2::value2" }]
                if (params.removeCurrentValues) {
                    data.selectValues.forEach(obj => {
                        if (obj.params.neverRemove) return;
                        obj.node.remove();
                    });
                    data.getSelectValues();
                }

                if (!Array.isArray(params.values)) return;

                let inner = "";
                params.values.forEach(valueObj => {
                    if (typeof valueObj === "string") valueObj = { value: valueObj };
                    valueObj.value = valueObj.value.trim();
                    const alreadyExists = data.selectValues.find(obj => obj.value === valueObj.value);
                    if (alreadyExists) return;

                    inner += renderMisc.checkmarkLabel({
                        value: valueObj.value,
                        name: this.name,
                        attrsToLabel: valueObj.params || ""
                    });
                });
                data.node.insertAdjacentHTML("beforeend", inner);

                if (!params.noHighlightCall) this.highlightMatches();
            },
            onDocumentClick(event) {
                if (checkIfTargetOrClosest(event.target, [this.inputWrapper])) return;
                data.hide();
            }
        });
        if (!data.container) {
            data.container = createElement("div", "text-input__values");
            this.inputWrapper.append(data.container);
            data.container.append(data.node);
        }
        if (!this.params.noApplyButton) {
            data.applyButton =
                createElement("button", "button text-input__apply", this.params.applyButtonText || "Применить");
            data.applyButton.setAttribute("type", "button");
            data.container.append(data.applyButton);
            // без setTimeout контекст к this.apply не будет вовремя привязан
            setTimeout(() => data.applyButton.addEventListener("click", this.apply), 0);
        }
        document.addEventListener("click", data.onDocumentClick);

        return data;
    }
    clear(params = { fullClear: false }) {
        if (params.fullClear) {
            this.valuesData.selectValues.forEach(obj => {
                obj.checkbox.checked = false;
                obj.checkbox.dispatchEvent(new Event("change"));
            });
        }

        this.input.value = "";
        this.input.dispatchEvent(new CustomEvent("input", { detail: { noShow: true } }));
        this.input.dispatchEvent(new Event("change"));
        this.valuesData.hide();
    }
}

class DateInputs {
    constructor(node) {
        this.onAnyInput = this.onAnyInput.bind(this);
        this.onAnyChange = this.onAnyChange.bind(this);
        this.onAnyKeydown = this.onAnyKeydown.bind(this);

        this.rootElem = node;
        this.inputDate = this.rootElem.querySelector(".date-inputs__input--date");
        this.inputMonth = this.rootElem.querySelector(".date-inputs__input--month");
        this.inputYear = this.rootElem.querySelector(".date-inputs__input--year");
        this.inputs = [this.inputDate, this.inputMonth, this.inputYear];
        this.params = getParams(this);
        this.currentDate = new Date();
        this.inputDataMethods = this.createInputDataMethods();

        this.inputs.forEach(input => {
            input.addEventListener("input", this.onAnyInput);
            input.addEventListener("change", this.onAnyChange);
            input.addEventListener("keydown", this.onAnyKeydown);
        });
        setMaxlengths.call(this);
        setDefaultParams.call(this);

        function setMaxlengths() {
            this.inputDate.setAttribute("maxlength", "2");
            this.inputMonth.setAttribute("maxlength", "2");
            this.inputYear.setAttribute("maxlength", "4");
        }
        function setDefaultParams() {
            if (!this.params.minYear) this.params.minYear = this.currentDate.getFullYear() - 99;
            if (!this.params.maxYear) this.params.maxYear = this.currentDate.getFullYear();
        }
    }
    onAnyInput(event) {
        const methods = bindMethods(this, {
            typeNumberOnly() {
                this.inputs.forEach(input => input.value = input.value.replace(/\D/g, "").trim());
            },
            onFill(event) {
                const input = event.target;
                const maxlength = parseInt(input.getAttribute("maxlength"));
                if (!maxlength) return;

                if (input.value.length >= maxlength) {
                    const nextInput = this.inputDataMethods.getNextInput();
                    if (nextInput) nextInput.focus();
                }
            },
            setValue() {
                const date = this.inputDate.value;
                const month = this.inputMonth.value;
                const year = this.inputYear.value;
                if (!date && !month && !year) {
                    this.value = null;
                    return;
                }

                this.value =
                    `${date.length < 2 ? `0${date}` : date}.${month.length < 2 ? `0${month}` : month}.${year}`;
            }
        });
        for (let key in methods) {
            const method = methods[key];
            method(event);
        }

        this.rootElem.dispatchEvent(new Event("input"));
    }
    onAnyChange(event) {
        const methods = bindMethods(this, {
            setValues() {
                this.date = parseInt(this.inputDate.value) || 0;
                this.month = parseInt(this.inputMonth.value) || 0;
                this.year = parseInt(this.inputYear.value) || 0;
            },
            fixDate(event) {
                const isDeleting = event && event.inputType && event.inputType.match(/deletecontent/i);
                if (this.inputDate.value.length < 1 || isDeleting) return;

                if (this.date < 10) this.inputDate.value = `0${this.date}`;

                let minDate = 1;
                let maxDate = dateMethods.getMaxMonthDay(this.month, this.year);
                if (this.date < minDate) {
                    this.inputDate.value = minDate;
                    methods.fixDate();
                    return;
                }
                if (this.date > maxDate) {
                    this.inputDate.value = maxDate;
                    methods.fixMonth();
                    return;
                }
            },
            fixMonth(event) {
                const isDeleting = event && event.inputType && event.inputType.match(/deletecontent/i);
                if (this.inputMonth.value.length < 1 || isDeleting) return;

                if (this.month < 10) this.inputMonth.value = `0${this.month}`;
                let minMonth = 1;
                let maxMonth = 12;
                if (this.month < minMonth) this.inputMonth.value = minMonth;
                if (this.month > maxMonth) this.inputMonth.value = maxMonth;
            },
        });

        for (let key in methods) {
            const method = methods[key];
            method(event);
        }
        this.rootElem.dispatchEvent(new Event("change"));
    }
    onAnyKeydown(event) {
        const methods = bindMethods(this, {
            onArrowDown(event) {
                if (!event.code.match(/arrow/i) && !event.code.match(/backspace/i)) return;
                const isInStart = this.inputDataMethods.isSelStart(event.target);
                const isInEnd = this.inputDataMethods.isSelEnd(event.target);

                const goNext = isInEnd && event.code.match(/right/i);
                const goPrev = isInStart && (event.code.match(/left/i) || event.code.match(/backspace/i));
                if (goNext) {
                    const nextInput = this.inputDataMethods.getNextInput(event.target);
                    if (nextInput) nextInput.focus();
                } else if (goPrev) {
                    const prevInput = this.inputDataMethods.getPrevInput(event.target);
                    if (prevInput) prevInput.focus();
                }
            },
            moveToLeft(event) {
                if (!event.key) return;

                const input = event.target;
                const inputIndex = this.inputs.findIndex(i => i === input);
                const prevInput = this.inputs[inputIndex - 1];
                let totalValue = this.inputs.map(inp => inp.value).join("");
                const prevInputs = this.inputs.filter((inp, index) => index < inputIndex);

                totalValue += event.key;
                const notFullPrevInput =
                    prevInputs.find(inp => inp.value.length < inp.getAttribute("maxlength"));
                const needToMoveLeft =
                    input.value.length == input.getAttribute("maxlength")
                    && this.inputs.length - 1 === inputIndex
                    && prevInput
                    && notFullPrevInput;

                if (needToMoveLeft && !totalValue.match(/\D/g)) {
                    this.inputs[2].value = totalValue.slice(-4);
                    this.inputs[1].value = totalValue.slice(-6, -4);
                    this.inputs[0].value = totalValue.slice(-8, -6);
                }
            }
        });

        for (let key in methods) {
            methods[key](event);
        }
    }
    createInputDataMethods() {
        const methods = bindMethods(this, {
            getNextInput(currentInput) {
                if (!currentInput) currentInput = document.activeElement;
                const currentIndex = this.inputs.indexOf(currentInput);
                const nextInput = this.inputs[currentIndex + 1] || null;
                return nextInput;
            },
            getPrevInput(currentInput) {
                if (!currentInput) currentInput = document.activeElement;
                const currentIndex = this.inputs.indexOf(currentInput);
                const prevInput = this.inputs[currentIndex - 1] || null;
                return prevInput;
            },
            isSelStart(input) {
                return input.selectionStart === 0 && event.target.selectionEnd === 0;
            },
            isSelEnd(input) {
                const end = input.value.length;
                return input.selectionStart === end && input.selectionEnd === end;
            }
        });

        return methods;
    }
    clear() {
        this.inputs.forEach(inp => inp.value = "");
        const detail = { detail: { clear: true } };
        this.inputs[0].dispatchEvent(new CustomEvent("input", detail));
        this.inputs[0].dispatchEvent(new CustomEvent("change", detail));
    }
}

class Select {
    constructor(node) {
        this.getOptions = this.getOptions.bind(this);
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.valueBlock = createElement("div", "select__value icon-chevron-down");
        this.container = createElement("div", "select__container");
        this.list = this.rootElem.querySelector(".select__options-list");
        this.options = [];
        this.params = getParams(this);
        this.placeholder = this.params.placeholder || "";
        this.listMethods = this.createListMethods();
        if (this.params.enablePagination)
            this.paginationData = this.createPagination();
        if (this.params.cross) {
            this.container.insertAdjacentHTML("beforeend", renderMisc.cross());
            this.clearButton = this.container.querySelector(".cross");
            this.clearButton.addEventListener("click", this.clear);
        }

        this.getOptions();
        this.list.before(this.valueBlock);
        this.container.append(this.valueBlock);
        this.container.append(this.list);
        this.rootElem.append(this.container);

        const observer = new MutationObserver(this.getOptions);
        observer.observe(this.list, { childList: true });

        this.valueBlock.addEventListener("click", this.listMethods.toggle);

        if (this.params.initialIndex) {
            const index = parseInt(this.params.initialIndex);
            if (index < 0 || !this.options[index]) {
                this.clear();
                return;
            }

            this.setOption(this.options[index].value);
        }
    }
    getOptions() {
        this.options = this.options.concat(getNewOptions.call(this));

        function getNewOptions() {
            const newOptions = Array.from(this.rootElem.querySelectorAll(".select__option"))
                .filter(node => !this.options.find(obj => obj.node === node))
                .map(node => {
                    const input = node.querySelector("input");
                    if (input.getAttribute("name") !== this.params.name)
                        input.setAttribute("name", this.params.name);
                    const value = input.value.trim();
                    let textSpan = node.querySelector("span");
                    if (!textSpan) {
                        textSpan = createElement("span", "", value);
                        node.append(textSpan);
                    }
                    const insertingValue = this.params.useSpanAsValue
                        ? textSpan.outerHTML : value;

                    return { node, value, input, textSpan, insertingValue };
                });

            newOptions.forEach(obj => {
                obj.node.addEventListener("change", () => this.setOption(obj.value));
            });
            return newOptions;
        }
    }
    setOption(value) {
        if (typeof value !== "string") value = value.toString();

        const optionObj = this.options.find(obj => obj.value === value.trim());
        if (!optionObj) {
            this.editOptions({ values: [value] });
            this.onOptionsEdited(this.setOption.bind(this), [value]);
            return;
        }

        this.valueBlock.innerHTML = optionObj.insertingValue;
        this.value = value;
        this.valueIndex = this.options.findIndex(obj => obj.value === this.value);
        this.listMethods.hide();
        this.rootElem.classList.add("__has-value");
    }
    onOptionsEdited(callback = function () { }, args = []) {
        callCallback = callCallback.bind(this);

        if (typeof callback !== "function") return;
        this.rootElem.addEventListener("options-edited", callCallback);

        function callCallback() {
            this.rootElem.removeEventListener("options-edited", callCallback);
            callback(...args);
        }
    }
    editOptions(params = {}) {
        /* params:
            values: [], removeCurrentValues: false
        */

        if (params.removeCurrentValues) {
            this.list.innerHTML = "";
            this.options = [];
        }

        if (Array.isArray(params.values)) {
            params.values.forEach(value => {
                const opt = `
                    <label class="select__option">
                        <input type="radio" name="${this.params.name || ""}" value="${value}">
                    </label>
                `;
                this.list.insertAdjacentHTML("beforeend", opt);
            });
        }

        setTimeout(() => this.rootElem.dispatchEvent(new CustomEvent("options-edited")), 0);
    }
    createListMethods() {
        const methods = bindMethods(this, {
            toggle() {
                this.rootElem.classList.contains("__shown")
                    ? this.rootElem.classList.remove("__shown")
                    : this.rootElem.classList.add("__shown");
            },
            show() {
                this.rootElem.classList.add("__shown");
            },
            hide() {
                this.rootElem.classList.remove("__shown");
            },
            onDocumentClick(event) {
                if (checkIfTargetOrClosest(event.target, [this.rootElem])) return;
                methods.hide();
            }
        });
        document.addEventListener("click", methods.onDocumentClick);

        return methods;
    }
    createPagination() {
        const prevBtn = createElement("button", "select__chevron select__chevron--prev icon-chevron-left");
        const nextBtn = createElement("button", "select__chevron select__chevron--next icon-chevron-right");
        prevBtn.setAttribute("type", "button");
        nextBtn.setAttribute("type", "button");
        this.rootElem.prepend(prevBtn);
        this.rootElem.append(nextBtn);
        const data = bindMethods(this, {
            prevBtn,
            nextBtn,
            goPrev() {
                // params.restrictedPrev может передаваться извне во время исполнения скрипта, например, если Select используется внутри другого компонента, вроде Calendar
                if (this.params.restrictedPrev) return;
                const prevOption = this.options[this.valueIndex - 1];
                if (!prevOption) return;

                this.setOption(prevOption.value);
            },
            goNext() {
                // params.restrictedNext может передаваться извне во время исполнения скрипта, например, если Select используется внутри другого компонента, вроде Calendar
                if (this.params.restrictedNext) return;
                const nextOption = this.options[this.valueIndex + 1];
                if (!nextOption) return;

                this.setOption(nextOption.value);
            },
        });

        if (this.params.paginationReverse) {
            prevBtn.addEventListener("click", data.goNext);
            nextBtn.addEventListener("click", data.goPrev);
        } else {
            prevBtn.addEventListener("click", data.goPrev);
            nextBtn.addEventListener("click", data.goNext);
        }

        return data;
    }
    clear() {
        this.valueBlock.innerHTML = `<span class="placeholder">${this.placeholder}</span>`;
        this.value = "";
        this.valueIndex = -1;
        this.rootElem.dispatchEvent(new Event("change"));
        this.listMethods.hide();
        this.rootElem.classList.remove("__has-value");
        this.options.forEach(obj => obj.input.checked = false);
    }
}

class InputsRange {
    constructor(node) {
        this.onInputChange = this.onInputChange.bind(this);

        this.rootElem = node;

        createWarning.call(this);
        document.addEventListener("init-inputs", init.bind(this));

        function init() {
            this.textInputs = this.getTextInputs();
            this.textInputs.forEach(inpP => inpP.input.addEventListener("change", this.onInputChange));
        }
        function createWarning() {
            const warning = renderMisc.warning({
                text: "Начало диапазона не должно превышать значение конца диапазона"
            });
            const div = createElement("div", "none", warning);
            this.warning = div.querySelector(".warning");
            const cross = this.warning.querySelector(".warning__close");
            cross.addEventListener("click", () => this.warning.remove());
        }
    }
    getTextInputs() {
        return Array.from(this.rootElem.querySelectorAll(".text-input"))
            .map(rootElem => inittedInputs.find(inpP => inpP.rootElem === rootElem))
            .filter(t => t);
    }
    onInputChange() {
        compareValues.call(this);
        this.rootElem.dispatchEvent(new Event("change"));

        function compareValues() {
            const startValue = parseInt(this.textInputs[0].input.value.replace(/\D/g, "").trim());
            const endValue = parseInt(this.textInputs[1].input.value.replace(/\D/g, "").trim());

            if (!startValue || !endValue) return;

            if (startValue > endValue) {
                const inpWrapper = this.textInputs[0].inputWrapper;
                if (inpWrapper.querySelector(".warning")) return;

                inpWrapper.append(this.warning);
            } else {
                if (this.warning.closest("body")) this.warning.remove();
            }
        }
    }
}

class ToggleOnchecked {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.selectors = assignPropertiesToObj(this.rootElem.dataset.toggleOnchecked || "");
        this.toggleable = {};
        this.transitionDur = 200;
        for (let key in this.selectors) {
            const selectorsList = this.selectors[key];
            this.selectors[key] = selectorsList.split(", ");
            this.toggleable[key] = [];
        }

        this.getToggleable();
        const name = this.rootElem.getAttribute("name");
        const type = this.rootElem.getAttribute("type");
        const inputsOnName = Array.from(document.querySelectorAll(`[name="${name}"]`))
            .filter(node => node.getAttribute("type") === type);
        inputsOnName.forEach(node => node.addEventListener("change", this.onChange));
        this.onChange();

        for (let key in this.toggleable) {
            if (this.toggleable[key].length < this.selectors[key].length) {
                document.addEventListener("init-inputs", onInputsInit);
                break;
            }
        }

        function onInputsInit() {
            this.getToggleable();

            let isAll = true;
            for (let key in this.toggleable) {
                if (this.toggleable[key].length < this.selectors[key].length) {
                    isAll = false;
                    break;
                }
            }
            if (isAll) document.removeEventListener("init-inputs", onInputsInit);
        }
    }
    getToggleable() {
        for (let key in this.selectors) {
            this.selectors[key].forEach((selector, index, thisArr) => {
                const el = findClosest(this.rootElem, selector);
                if (!el) return;

                const anchor = createElement("div", "none");
                const parentNode = el.parentNode;
                this.toggleable[key].push({ el, anchor, parentNode });
                thisArr.splice(index, 1);
            });
        }
    }
    async onChange() {
        const timeout = this.isChanging ? this.transitionDur : 0;
        this.isChanging = true;

        const methods = bindMethods(this, {
            async onChecked() {
                await delay(this.transitionDur);
                this.toggleable.show.forEach(obj => {
                    htmlElementMethods.insert(obj.el, obj.anchor, {
                        transitionDur: this.transitionDur,
                        insertType: "replace"
                    });
                });
            },
            onUnchecked() {
                this.toggleable.show.forEach(obj => {
                    obj.el.after(obj.anchor);
                    htmlElementMethods.remove(obj.el, { transitionDur: this.transitionDur });
                });
            }
        });

        await delay(timeout);

        if (this.rootElem.checked) methods.onChecked();
        else methods.onUnchecked();

        setTimeout(() => this.isChanging = false, 0);
    }
}

class ModalsList {
    constructor() {
        this.onModalsChange = this.onModalsChange.bind(this);
        this.onResize = this.onResize.bind(this);

        this.rootElem = document.querySelector(".modals-list");
        // все модальные окна
        this.modals = [];
        // модальные окна внутри .modals-list
        this.modalsInList = [];

        this.observer = new MutationObserver(this.onModalsChange);
        this.observer.observe(this.rootElem, { childList: true });
        this.onModalsChange();

        window.addEventListener("resize", this.onResize);
    }
    onResize() {
        this.modalsInList.forEach(modalParams => {
            const mw = modalParams.modalWindow;
            const height = mw.offsetHeight;
            const modalPaddingTop =
                parseInt(getComputedStyle(modalParams.modal).paddingTop.replace(/\D/g, ""));
            const modalPaddingBottom =
                parseInt(getComputedStyle(modalParams.modal).paddingBottom.replace(/\D/g, ""));
            const modalsListHeight = this.rootElem.offsetHeight - (modalPaddingBottom + modalPaddingTop);

            if (modalsListHeight > height) modalParams.modal.classList.add("modal--center");
            else modalParams.modal.classList.remove("modal--center");
        });
    }
    onModalsChange() {
        addModalsToArray(this);
        this.modalsInList = this.modals.filter(modalParams => modalParams.modal.closest(".modals-list"));
        if (this.modalsInList.length > 0) {
            this.rootElem.classList.add("modals-list--active");
            scrollToggle.lock();
        }
        else {
            this.rootElem.classList.remove("modals-list--active");
            scrollToggle.unlock();
        }

        setTimeout(() => {
            this.onResize();
        }, 0);

        function addModalsToArray(ctx) {
            ctx.rootElem.querySelectorAll(".modal").forEach(modal => {
                const isInArray = ctx.modals.find(modalParams => modalParams.modal === modal);
                if (isInArray) return;

                ctx.modals.push(new Modal());
            });
        }
    }
}
const modalsListInst = new ModalsList();

// если создать модальное окно напрямую в верстке и поместить внутрь .modals-list, экземлпяр этого класса будет создан автоматически
class Modal {
    // кроме указанных params можно передавать и другие
    constructor(params = { modalName: "", modal: null, modalWindowClassname: "" }) {
        // если нужно создать модальное окно, основываясь на modalName
        if (params.modalName) {
            modalsListInst.modals.push(this);
            this.modal = new RenderModal(params);
        }
        // если модальное окно создано извне (вызывается в ModalsList -> onModalsChange)
        else if (params.modalNode) {
            this.modal = params.modal;
        }

        this.modalWindow = this.modal.querySelector(".modal__window");
        this.closeButton = this.modalWindow.querySelector(".modal__close");

        onPointerdown = onPointerdown.bind(this);
        this.modal.addEventListener("pointerdown", onPointerdown);

        function onPointerdown(event) {
            const notBgOrCross = event.target !== this.modal
                && !checkIfTargetOrClosest(event.target, [this.closeButton]);
            if (notBgOrCross) return;

            onPointerup = onPointerup.bind(this);
            document.addEventListener("pointerup", onPointerup);

            function onPointerup() {
                document.removeEventListener("pointerup", onPointerup);
                this.remove();
            }
        }
    }
    append() {
        const opts = { transitionDur: 200, insertType: "append" };
        htmlElementMethods.insert(this.modal, modalsListInst.rootElem, opts);
        this.modal.dispatchEvent(new CustomEvent("modal-append"));
    }
    remove() {
        htmlElementMethods.remove(this.modal, { transitionDur: 200 });
        this.modal.dispatchEvent(new CustomEvent("modal-remove"));
    }
}

// методы, которые могут быть использованы и в Calendar, и в CalendarDouble
const calendarMethods = {
    async show(ctx, params = { showEl: null }) {
        if (ctx.rootElem.classList.contains("__calendar-shown")) return;

        ctx.rootElem.classList.add("__calendar-shown");
        await htmlElementMethods.insert(params.showEl, ctx.rootElem, {
            transitionDur: 200, insertType: "append"
        });
    },
    hide(ctx, params = { hideEl: null }) {
        ctx.rootElem.classList.remove("__calendar-shown");
        htmlElementMethods.remove(params.hideEl, { transitionDur: 200 });
    },
    createApplyButton(params = { callback: function () { }, appendTo: null }) {
        const obj = renderCalendar.applyContainer();
        params.appendTo.append(obj.container);
        obj.button.addEventListener("click", params.callback);
        return obj.button;
    }
};

class Calendar {
    constructor(node) {
        this.setCalendarBoxPosition = this.setCalendarBoxPosition.bind(this);

        this.rootElem = node;
        this.params = getParams(this);
        this.calendarDouble = { node: this.rootElem.closest(".calendar-double") };
        if (!this.calendarDouble.node) this.calendarDouble = null;
        this.calendarBox = createElement("div", "calendar-box none");

        // если двойной календарь (находится внутри .calendar-double)
        if (this.calendarDouble) {

        }
        // если одиночный календарь
        else {
            window.addEventListener("scroll", this.setCalendarBoxPosition);
            window.addEventListener("resize", this.setCalendarBoxPosition);
        }

        this.previewData = this.initPreviewBlock();
        this.previewData.previewBlock.prepend(this.previewData.textBlock);
        this.previewData.previewBlock.after(this.calendarBox);

        this.selectsData = this.initSelects();
        this.calendarData = this.initCalendar();
        this.errorsData = this.initErrors();

        nextInitTick(() => {
            this.previewData.hideInputs(true);
            this.calendarData.hide();

            if (this.params.defaultDate) {
                setTimeout(() => {
                    this.setDate(this.params.defaultDate);
                }, 100);
            }
            else this.previewData.showInputs({ noFocus: true });

            this.calendarBox.classList.remove("none");
        });
    }
    initPreviewBlock() {
        const data = bindMethods(this, {
            previewBlock: this.rootElem.querySelector(".calendar__preview"),
            textBlock: createElement("div", "calendar__preview-text"),
            inputsBlock: this.rootElem.querySelector(".calendar__preview-inputs"),
            inpParams: null,
            init() {
                const inpParams = findInittedInput(data.inputsBlock);
                data.inpParams = inpParams;
                data.previewBlock.addEventListener("click", data.showInputs);
                inpParams.inputs.forEach(inp => {
                    inp.addEventListener("change", data.onChange);
                    inp.addEventListener("blur", data.onBlur);
                });

                const thisMinYear = parseInt(this.params.minYear);
                const thisMaxYear = parseInt(this.params.maxYear);
                if (this.params.minYear) inpParams.params.minYear = thisMinYear;
                else this.params.minYear = inpParams.params.minYear;
                if (this.params.maxYear) inpParams.params.maxYear = thisMaxYear;
                else this.params.maxYear = inpParams.params.maxYear;

                document.addEventListener("click", data.onDocumentClick);
            },
            showInputs(paramsOrEvent = {}) {
                if (paramsOrEvent.target && checkIfTargetOrClosest(paramsOrEvent.target, [data.inputsBlock]))
                    return;
                data.textBlock.classList.add("none");
                data.inputsBlock.classList.remove("none");

                if (!paramsOrEvent.noFocus) {
                    const lastUnfilled = data.inpParams.inputs.find(input => {
                        const maxlength = parseInt(input.getAttribute("maxlength"));
                        return input.value.length < maxlength;
                    }) || data.inpParams.inputs[2];
                    if (lastUnfilled) lastUnfilled.focus();
                }
            },
            hideInputs(isForced = false) {
                if (!isForced) {
                    if (!data.inpParams.rootElem.closest(".__has-value")) return;
                }

                data.textBlock.classList.remove("none");
                data.inputsBlock.classList.add("none");
            },
            setText() {
                const date = data.inpParams.date;
                const month = data.inpParams.month;
                const year = data.inpParams.year;

                let text = "";
                if (date) text += date;
                if (month) text += ` ${dateMethods.monthsGenitive[month - 1]}`;
                if (year) text += ` ${year}`;
                textContentMethods.setContent(data.textBlock, text);
            },
            onDocumentClick(event) {
                if (checkIfTargetOrClosest(event.target, [this.rootElem])) return;
                data.hideInputs();
                this.calendarData.hide();
            },
            async onBlur() {
                await delay(0);

                if (data.inpParams.inputs.includes(document.activeElement)) return;
                data.hideInputs();
            },
            onChange(event = {}) {
                const eventDetail = event.detail || {};
                data.setText();
                const inputs = data.inpParams.inputs;
                const hasValue = inputs.find(inp => inp.value);
                if (!hasValue) {
                    data.showInputs({ noFocus: true });
                    this.calendarData.tableCells.forEach(obj => obj.td.classList.remove("__selected"));
                }

                this.rootElem.dispatchEvent(new Event("change"));
                this.errorsData.getErrors();

                if (eventDetail.clear) this.calendarData.apply();
                if (eventDetail.setDate) return;

                setTimeout(() => {
                    const date = data.inpParams.value;
                    if (date) this.setDate(date);
                }, 0);
            }
        });

        nextInitTick(data.init);
        return data;
    }
    setDate(date = "01.01.2000") {
        const split = date.split(".");
        if (split.length !== 3) return;
        const monthday = parseInt(split[0]);
        let month = parseInt(split[1]);
        const year = parseInt(split[2]);
        const monthsSelect = this.selectsData.monthsSelect;
        const yearsSelect = this.selectsData.yearsSelect;
        if (!monthday || !month || !year || !monthsSelect || !yearsSelect)
            return;

        month = dateMethods.months[month - 1];

        const invalidMonthOrYear = month < 1
            || month > 12
            || year < this.params.minYear
            || year > this.params.maxYear;
        if (invalidMonthOrYear) return;
        monthsSelect.setOption(month);
        yearsSelect.setOption(year);

        const monthdayCell = this.calendarData.tableCells.find(obj => parseInt(obj.value) === monthday);
        if (monthdayCell) this.calendarData.onTableCellClick({ target: monthdayCell.td });
    }
    getDateStr() {
        const inputs = this.previewData.inpParams;
        const date = inputs.inputDate.value;
        const month = inputs.inputMonth.value;
        const year = inputs.inputYear.value;

        if (!date || !month || !year) return "";
        return `${date}.${month}.${year}`;
    }
    initSelects() {
        const data = bindMethods(this, {
            yearsSelect: null,
            monthsSelect: null,
            createSelects() {
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();

                let minYear = parseInt(this.params.minYear) || currentYear - 19;
                let maxYear = parseInt(this.params.maxYear) || currentYear;
                if (minYear > maxYear) minYear = maxYear;

                let yearValues = [];
                for (let year = maxYear; year >= minYear; year--) yearValues.push(year);
                const yearsSelect = renderMisc.select({
                    dataParams: "enablePagination::true; paginationReverse::true",
                    values: yearValues
                });
                const monthsSelect = renderMisc.select({
                    dataParams: "enablePagination::true",
                    values: dateMethods.months
                });

                const selectContainerYears = createElement("div", "calendar-box__select-container");
                const selectContainerMonths = createElement("div", "calendar-box__select-container");
                selectContainerYears.append(yearsSelect);
                selectContainerMonths.append(monthsSelect);
                this.calendarBox.append(selectContainerYears);
                this.calendarBox.append(selectContainerMonths);

                nextInitTick(() => {
                    data.yearsSelect = findInittedInput(yearsSelect);
                    data.monthsSelect = findInittedInput(monthsSelect);

                    setTimeout(() => {
                        yearsSelect.addEventListener("change", data.onChange);
                        monthsSelect.addEventListener("change", data.onChange);
                    }, 100);
                });
            },
            onChange(event = {}, params = { recursed: false }) {
                if (!this.selectsData.yearsSelect || !this.selectsData.monthsSelect) {
                    if (!params.recursed) setTimeout(() => data.onChange(event, { recursed: true }), 100);
                    return;
                }
                const detail = event.detail || {};
                const pd = this.previewData;
                this.year = parseInt(this.selectsData.yearsSelect.value);
                this.month = dateMethods.months.indexOf(this.selectsData.monthsSelect.value) + 1;
                this.monthday = parseInt(this.previewData.inpParams.inputDate.value);
                this.calendarData.renderTableRows();

                pd.inpParams.inputMonth.value = this.month;
                pd.inpParams.inputYear.value = this.year;
                pd.inpParams.inputs[0].dispatchEvent(new CustomEvent("change", { detail: { setDate: true } }));
                if (this.monthday && !detail.onTableCellClick) {
                    findTd = findTd.bind(this);

                    let tdObj = findTd();
                    if (!tdObj) {
                        this.monthday = 1;
                        tdObj = findTd();
                    }
                    this.calendarData.onTableCellClick({ target: tdObj.td });

                    function findTd() {
                        return this.calendarData.tableCells.find(obj => parseInt(obj.value) === this.monthday);
                    }
                }
            }
        });
        data.createSelects();

        return data;
    }
    initCalendar() {
        const data = bindMethods(this, {
            tableContainer: null,
            cachedTableLayouts: [],
            tableCells: [],
            init() {
                data.createTable();
                data.createApplyButton();
                if (!this.calendarDouble) {
                    this.previewData.previewBlock.addEventListener("click", data.show);
                }
            },
            async show() {
                if (this.calendarDouble) return;

                calendarMethods.show(this, { showEl: this.calendarBox });
                this.setCalendarBoxPosition();
            },
            hide() {
                if (this.calendarDouble) return;
                calendarMethods.hide(this, { hideEl: this.calendarBox });
            },
            createTable() {
                data.tableContainer = renderCalendar.container();
                this.calendarBox.append(data.tableContainer);
                data.renderTableRows();
            },
            createApplyButton() {
                if (this.calendarDouble) return;

                this.applyButton = calendarMethods.createApplyButton({
                    callback: data.apply, appendTo: this.calendarBox
                });
            },
            removeAllMonthDays() {
                data.tableContainer.querySelectorAll(".calendar-table__monthdays")
                    .forEach(node => {
                        node.remove();
                    });
            },
            renderTableRows() {
                if (!this.year) this.year = new Date().getFullYear();
                if (!this.month) this.month = 1;

                if (data.monthOnLastRender === this.month && data.yearOnLastRender === this.year) return;

                data.monthOnLastRender = this.month;
                data.yearOnLastRender = this.year;

                data.removeAllMonthDays();
                const cached = data.cachedTableLayouts
                    .find(obj => obj.year === this.year && obj.month === this.month);
                // если найдена закэшированная html-верстка
                if (cached) {
                    append(cached.tableRows);
                    data.tableCells = cached.tableCells;
                    return;
                }

                // создать, вставить верстку, навесить обработчики и в конце закэшировать
                const tableRows = renderCalendar.allTableRows({ month: this.month, year: this.year });
                append(tableRows);
                data.tableCells = [];
                tableRows.forEach(tr => {
                    const tableCells = tr.querySelectorAll(".calendar-table__cell");
                    tableCells.forEach(td => {
                        const value = textContentMethods.getContent(td);
                        if (!parseInt(value)) {
                            td.classList.add("__inactive");
                            return;
                        }
                        data.tableCells.push({ td, value });
                        td.addEventListener("click", data.onTableCellClick);
                    });
                });

                if (!this.year || !this.month) return;
                data.cachedTableLayouts.push({
                    month: this.month,
                    year: this.year,
                    tableRows,
                    tableCells: data.tableCells
                });

                function append(array) {
                    array.forEach(tr => data.tableContainer.append(tr));
                }
            },
            onTableCellClick(event) {
                if (!event) return;
                const td = event.target;
                const tdData = data.tableCells.find(obj => obj.td === td);
                if (td.classList.contains("__inactive") || tdData.isInactive) return;
                let value = tdData ? tdData.value : textContentMethods.getContent(td);
                if (!parseInt(value)) return;

                data.tableCells.forEach(obj => obj.td.classList.remove("__selected"));
                td.classList.add("__selected");
                const pd = this.previewData;
                pd.inpParams.inputDate.value = value;
                const detail = { detail: { setDate: true, onTableCellClick: true } };
                pd.inpParams.inputs[0].dispatchEvent(new CustomEvent("change", detail));
                pd.inpParams.inputs[0].dispatchEvent(new CustomEvent("input", detail));
                this.selectsData.yearsSelect.rootElem.dispatchEvent(new CustomEvent("change", detail));
            },
            apply() {
                this.rootElem.dispatchEvent(new CustomEvent("apply"));
                if (this.calendarDouble) return;

                data.hide();
                this.previewData.hideInputs();
            }
        });
        data.init();

        return data;
    }
    setCalendarBoxPosition() {
        const calendarBox = this.calendarDouble ? this.calendarDouble.boxes : this.calendarBox;

        const calendarHeight = calendarBox.offsetHeight;
        const windowHeight = document.documentElement.clientHeight || window.innerHeight;
        const bottomBorder = window.scrollY + windowHeight;
        const previewBlockCoords = getCoords(this.previewData.previewBlock);
        const calendarBottom = previewBlockCoords.bottom + calendarHeight + 20;
        const willBeAboveTopBorder = (previewBlockCoords.top - calendarHeight - 20) < 0;

        if (calendarBottom - 50 > bottomBorder && !willBeAboveTopBorder) {
            calendarBox.classList.add("calendar-box--above");
        } else {
            calendarBox.classList.remove("calendar-box--above");
        }
    }
    initErrors() {
        const data = bindMethods(this, {
            errorBlock: null,
            errorMessage: "",
            init() {
                this.rootElem.addEventListener("change", data.getErrors);
                if (this.calendarDouble) return;

                data.errorBlock = createElement("div", "calendar__error error");
                this.rootElem.append(data.errorBlock);
            },
            getErrors() {
                const previewParams = this.previewData.inpParams;
                const year = parseInt(previewParams.inputYear.value);
                setTimeout(() => {
                    this.rootElem.dispatchEvent(new CustomEvent("get-errors"));
                }, 0);

                const invalidYear = year < this.params.minYear || year > this.params.maxYear;
                if (invalidYear) {
                    const message = `Неверно указан год. Минимальный год: ${this.params.minYear}, максимальный год: ${this.params.maxYear}`;
                    data.setErrorMessage(message);
                    return;
                }
                data.setErrorMessage("");
            },
            setErrorMessage(message) {
                if (!message) message = "";
                data.errorMessage = message.trim();
                if (!data.errorBlock) return;

                textContentMethods.setContent(data.errorBlock, data.errorMessage);
                if (data.errorMessage) data.errorBlock.classList.remove("none");
                else data.errorBlock.classList.add("none");
            }
        });
        data.init();

        return data;
    }
}

class CalendarDouble {
    constructor(node) {
        this.init = this.init.bind(this);
        this.rootElem = node;

        nextInitTick(this.init);
    }
    init() {
        this.calendars = Array.from(this.rootElem.querySelectorAll(".calendar"))
            .map(node => findInittedInput(node));
        this.calendarStart = this.calendars[0];
        this.calendarEnd = this.calendars[1];

        this.calendarBoxes = createElement("div", "calendar-double__boxes none");
        this.rootElem.append(this.calendarBoxes);
        this.calendarBoxes.append(this.calendarStart.calendarBox);
        this.calendarBoxes.append(this.calendarEnd.calendarBox);
        this.calendarDoubleData = this.initCalendarDouble();
        this.errorsData = this.initErrors();

        this.calendars.forEach(inpP => {
            inpP.previewData.previewBlock.addEventListener("click", this.calendarDoubleData.show);
        });
    }
    initCalendarDouble() {
        const data = bindMethods(this, {
            init() {
                document.addEventListener("click", data.onDocumentClick);
                this.calendars.forEach(cParams => {
                    cParams.rootElem.addEventListener("apply", data.apply);
                });
                this.applyButton = calendarMethods.createApplyButton({
                    callback: data.apply, appendTo: this.calendarBoxes
                });
                this.calendars.forEach(cParams => {
                    cParams.rootElem.addEventListener("change", data.onAnyChange);
                    cParams.previewData.inpParams.rootElem.addEventListener("change", data.onAnyChange);
                });
            },
            hide() {
                calendarMethods.hide(this, { hideEl: this.calendarBoxes });
            },
            show() {
                this.calendarBoxes.classList.remove("none");
                calendarMethods.show(this, { showEl: this.calendarBoxes });
            },
            onAnyChange() {
                data.checkDateRange();
            },
            onDocumentClick(event) {
                if (checkIfTargetOrClosest(event.target, [this.rootElem])) return;

                data.hide();
            },
            apply() {
                data.hide();
                this.rootElem.dispatchEvent(new CustomEvent("apply"));
            },
            checkDateRange() {
                const dateStart = this.calendarStart.getDateStr();
                const dateEnd = this.calendarEnd.getDateStr();

                const compareData = dateMethods.compare(dateStart, dateEnd);

                this.isCorrectRange = compareData.isCorrectRange && !compareData.hasIncorrectDate;
            },
        });
        data.init();

        return data;
    }
    initErrors() {
        const data = bindMethods(this, {
            errorBlock: null,
            errorMessage: "",
            init() {
                this.calendars
                    .forEach(cParams => cParams.rootElem.addEventListener("get-errors", data.onGetErrors));
                data.errorBlock = createElement("div", "calendar__error error");
                this.rootElem.append(data.errorBlock);
            },
            checkCorrectRange() {
                const cStart = this.calendarStart.previewData.inpParams;
                const cEnd = this.calendarEnd.previewData.inpParams;
                const startDate = `${cStart.inputDate.value}.${cStart.inputMonth.value}.${cStart.inputYear.value}`;
                const endDate = `${cEnd.inputDate.value}.${cEnd.inputMonth.value}.${cEnd.inputYear.value}`;

                return dateMethods.compare(startDate, endDate);
            },
            onGetErrors() {
                const singleCalendar = this.calendars.find(cParams => cParams.errorsData.errorMessage);
                if (singleCalendar) {
                    const errorMessage = singleCalendar.errorsData.errorMessage;
                    data.setErrorMessage(errorMessage);
                    return;
                }

                const compareData = data.checkCorrectRange();
                const incorrectRange = !compareData.isCorrectRange && !compareData.hasIncorrectDate;
                if (incorrectRange) {
                    data.setErrorMessage("Дата начала диапазона не может быть позднее даты конца диапазона");
                    return;
                }

                data.setErrorMessage("");
            },
            setErrorMessage(message) {
                if (!message) message = "";
                data.errorMessage = message.trim();

                textContentMethods.setContent(data.errorBlock, data.errorMessage);
                if (data.errorMessage) data.errorBlock.classList.remove("none");
                else data.errorBlock.classList.add("none");
            }
        });
        data.init();

        return data;
    }
}

class CreateModal {
    constructor(node) {
        this.onClick = this.onClick.bind(this);

        this.rootElem = node;
        this.inputWrapper = this.rootElem.querySelector(".input-like__wrapper");
        this.textBlock = this.rootElem.querySelector(".input-like__text");
        this.defaultText = textContentMethods.getContent(this.textBlock).trim();
        this.params = getParams(this);
        this.modalName = this.rootElem.dataset.createModal;

        let modalName = this.modalName;
        const options = Object.assign(this.params, { modalName });
        this.modalParams = new Modal(options);

        this.rootElem.removeAttribute("data-create-modal");
        this.rootElem.addEventListener("click", this.onClick);

        // если создает CheckboxesModal, инициализирует компонент напрямую, без функции initInputs()
        if (this.modalName.match(/checkboxesmodal/i)) {
            const cmRootElem = this.modalParams.modal.querySelector(".checkboxes-modal");
            const isAlreadyInitted = inittedInputs.find(inpP => {
                return inpP.rootElem === cmRootElem && inpP instanceof CheckboxesModal;
            });
            if (isAlreadyInitted) return;

            let inst = getClassInstance();

            this.checkboxesModal = new inst(cmRootElem);
            inittedInputs.push(this.checkboxesModal);
            this.checkboxesModal.createModal = this;
            this.checkboxesModal.modalParams = this.modalParams;
            const params = this.rootElem.dataset.checkboxesModalParams || "";
            this.checkboxesModal.params = assignPropertiesToObj(params);
            this.rootElem.removeAttribute("data-checkboxes-modal-params");
            setCross.call(this);
            setHoverTitle.call(this);
            initHiddenInput.call(this);

            function getClassInstance() {
                if (cmRootElem.className.match(/checkboxes-modal--regions/)) return CheckboxesModalRegions;
                return CheckboxesModal;
            }
            function setCross() {
                if (!this.inputWrapper) return;

                this.inputWrapper.insertAdjacentHTML("beforeend", renderMisc.cross());
                this.clearButton = this.inputWrapper.querySelector(".cross");
                this.clearButton.addEventListener("click", this.checkboxesModal.fullClear);
            }
            function setHoverTitle() {
                this.inputWrapper.setAttribute("data-hover-title", this.defaultText);
                const observer = new MutationObserver(() => {
                    const text = textContentMethods.getContent(this.textBlock);
                    this.inputWrapper.setAttribute("data-hover-title", text);
                });
                observer.observe(this.textBlock, { childList: true, subtree: true });
            }
            // hiddenInput может быть переинициализирован в дочерних классах CheckboxesModal, как следствие, this.hiddenInput может быть перезаписан
            function initHiddenInput() {
                this.hiddenInput = this.rootElem.querySelector("input[type='hidden']");
                if (!this.hiddenInput) {
                    this.hiddenInput = createElement("input");
                    this.hiddenInput.setAttribute("type", "hidden");
                    this.rootElem.append(this.hiddenInput);
                }
                if (!this.hiddenInput.getAttribute("name"))
                    this.hiddenInput.setAttribute("name", this.checkboxesModal.params.name);
            }
        }
    }
    onClick(event) {
        if (this.clearButton && checkIfTargetOrClosest(event.target, [this.clearButton])) return;
        // не забыть убрать, т.к. возможно, что в будущем, бэкенд будет привязываться к этой ссылке с помощью GET-запроса
        event.preventDefault();
        this.create();
    }
    create() {
        this.modalParams.append();
    }
}

class CheckboxesModal {
    createModal = null;
    modalParams = null;

    constructor(node) {
        // когда на чекбоксе происходит событие change, оно дублируется на listContainer (.checkboxes-modal__list-container)
        onModalRemove = onModalRemove.bind(this);
        onModalAppend = onModalAppend.bind(this);
        this.onListContainerChange = this.onListContainerChange.bind(this);
        this.apply = this.apply.bind(this);
        this.fullClear = this.fullClear.bind(this);
        this.onCheckboxChange = this.onCheckboxChange.bind(this);

        this.rootElem = node;
        this.container = this.rootElem.querySelector(".checkboxes-modal__container");
        this.listsData = [];
        this.initSearch();

        this.applyButton = this.initApplyButton();
        this.applyButton.enable();

        initLists.call(this);

        nextInitTick(() => {
            this.modalParams.modal.addEventListener("modal-append", onModalAppend);
            this.modalParams.modal.addEventListener("modal-remove", onModalRemove);
        });

        function initLists() {
            const lists = Array.from(this.rootElem.querySelectorAll(".checkboxes-modal__list-container"));
            lists.forEach((listContainer, index) => {
                function onHeadListMutation() {
                    if (headList.querySelector(".checkboxes-modal__list-item")) {
                        headList.classList.remove("none");
                    } else {
                        headList.classList.add("none");
                    }
                }

                const clearButton = listContainer.querySelector(".checkboxes-modal__clear-button");
                const headList = listContainer.querySelector(".checkboxes-modal__sublist--head");
                const list = listContainer.querySelector(".checkboxes-modal__sublist--standard");

                listContainer.addEventListener("change", this.onListContainerChange);
                clearButton.addEventListener("click", () => this.clear(index));
                const headListObserver = new MutationObserver(onHeadListMutation);
                headListObserver.observe(headList, { childList: true });
                onHeadListMutation();

                this.listsData.push({
                    listContainer,
                    clearButton,
                    valuesHead: [],
                    values: [],
                    allValues: [],
                    headList,
                    list
                });
            });
        }
        function onModalAppend() {
            this.listsData[0].listContainer.dispatchEvent(new Event("change"));
        }
        function onModalRemove() {
            this.returnStatesOnLastApply();
        }
    }
    // onListContainerChange выполняет функционал без привязки к конкретному чекбоксу
    onListContainerChange(event) {
        return new Promise(async (resolve) => {
            // сначала выполнить весь callstack, в который попадают обработчики onChange на каждый отдельный чекбокс
            await delay(0);

            // далее, уже после обработки отдельных чекбоксов, выполняется код ниже. Сначала проверки, нужно ли запускать данный обработчик
            let listContainer = event.target;
            if (!listContainer) return resolve(null);

            if (!listContainer.classList.contains("checkboxes-modal__list-container"))
                listContainer = event.target.closest(".checkboxes-modal__list-container");
            const listData = this.listsData.find(obj => obj.listContainer === listContainer);

            if (listData.handlingOnChange) return resolve(null);
            listData.handlingOnChange = true;

            // "полезная нагрузка" ("полезный код", выполняется, если все проверки сверху пройдены)
            const hasAnyValueChecked = listData.allValues.find(obj => {
                const isCheckedItself = obj.checkbox.checked;
                if (isCheckedItself) return true;

                if (Array.isArray(obj.subValues)) {
                    return obj.subValues.find(subCheckbox => subCheckbox.checked);
                }
                return false;
            });
            const checked = listData.values.filter(obj => obj.checkbox.checked);
            const isAllChecked = checked.length === listData.values.length;

            if (hasAnyValueChecked) listData.clearButton.classList.add("__shown");
            else listData.clearButton.classList.remove("__shown");

            if (isAllChecked) {
                const bindAllCheckbox = listData.allValues.find(obj => obj.params.bindAllStandards);
                if (bindAllCheckbox) bindAllCheckbox.checkbox.checked = true;
            }

            if (this.params.requiredListForApply) {
                const matchCondition = this.listsData[this.params.requiredListForApply].values
                    .find(obj => {
                        const checked = obj.checkbox.checked;
                        if (checked) return true;
                        if (!checked && Array.isArray(obj.subValues)) {
                            return obj.subValues.find(subCheckbox => subCheckbox.checked);
                        }
                        return false;
                    });

                if (matchCondition) this.applyButton.enable();
                else this.applyButton.disable();
            }

            setTimeout(() => listData.handlingOnChange = false, 0);
            // передастся в метод дочернего класса
            resolve(listData);
        });
    }
    initApplyButton() {
        const data = bindMethods(this, {
            container: this.rootElem.querySelector(".checkboxes-modal__apply-container"),
            button: this.rootElem.querySelector(".checkboxes-modal__apply"),
            enable() {
                data.button.removeAttribute("disabled");
                data.button.addEventListener("click", this.apply);
            },
            disable() {
                data.button.setAttribute("disabled", true);
                data.button.removeEventListener("click", this.apply);
            }
        });

        return data;
    }
    apply(returnMethods = false) {
        this.isApplying = true;

        const methods = bindMethods(this, {
            handleListsData() {
                this.listsData.forEach(listData => {
                    listData.allValues.forEach(obj => obj.checkedState = obj.checkbox.checked);
                });
            },
            toggleHasValue() {
                if (hasChecked) {
                    this.createModal.rootElem.classList.add("__has-value");
                } else {
                    this.createModal.rootElem.classList.remove("__has-value");
                }
            },
            setValues() {
                this.values = this.listsData[0].values
                    .filter(obj => obj.checkbox.checked)
                    .map(obj => obj.value)
                    .join("|");
                this.hiddenInput.value = this.values;
            },
            finalMethod() {
                this.modalParams.remove();
                setTimeout(() => {
                    this.isApplying = false;
                    this.rootElem.dispatchEvent(new CustomEvent("apply"));
                    this.createModal.rootElem.dispatchEvent(new CustomEvent("apply"));
                }, 0);
            }
        });

        const hasChecked = this.listsData.find(listData => {
            const checkedValue = listData.values.find(obj => obj.checkbox.checked);
            if (checkedValue) return true;

            const checkedSubvalue = listData.values.find(obj => {
                if (!Array.isArray(obj.subValues)) return;
                return obj.subValues.find(subCheckbox => subCheckbox.checked);
            });
            return checkedSubvalue;
        });
        if (returnMethods) {
            return methods;
        } else {
            for (let key in methods) {
                if (typeof methods[key] === "function") methods[key]();
            }
        }
    }
    fullClear() {
        this.listsData.forEach(listData => {
            listData.clearButton.dispatchEvent(new Event("click"));
            listData.clearButton.classList.remove("__shown");
        });
        this.apply();
    }
    returnStatesOnLastApply() {
        if (this.isApplying) return;

        this.listsData.forEach(listData => {
            listData.allValues.forEach(obj => {
                obj.checkbox.checked = obj.checkedState;
                setTimeout(() => listData.listContainer.dispatchEvent(new Event("change")), 0);
            });
        });
    }
    clear(listIndex) {
        const listData = this.listsData[listIndex];
        listData.valuesHead.forEach(doForEach);
        listData.values.forEach(doForEach);
        listData.listContainer.dispatchEvent(new Event("change"));

        function doForEach(obj) {
            obj.checkbox.checked = false;
            if (Array.isArray(obj.subValues)) {
                obj.subValues.forEach(subCheckbox => subCheckbox.checked = false);
            }
        }
    }
    // ВАЖНО: нужно вызывать этот метод, когда удаляется какой-либо чекбокс
    getListsData() {
        this.listsData.forEach(listObj => {
            doHandle = doHandle.bind(this);

            const newValuesHead = doHandle(
                ".checkboxes-modal__sublist--head .checkboxes-modal__list-item",
                listObj.valuesHead
            );
            const newValues = doHandle(
                ".checkboxes-modal__sublist--standard .checkboxes-modal__list-item",
                listObj.values
            );
            listObj.valuesHead = listObj.valuesHead
                .concat(newValuesHead)
                .filter(filterFunc);
            listObj.values = listObj.values
                .concat(newValues)
                .filter(filterFunc);

            listObj.allValues = listObj.valuesHead.concat(listObj.values);

            function doHandle(selector, arrayToCompare) {
                return Array.from(listObj.listContainer.querySelectorAll(selector))
                    .filter(node => !arrayToCompare.find(vObj => vObj.node === node))
                    .map(node => {
                        const cached = this.cachedValueObjects.find(cObj => cObj.cachedObj.node === node);
                        if (cached) {
                            return cached.cachedObj;
                        }

                        onSubValueChange = onSubValueChange.bind(this);
                        function onSubValueChange() {
                            const checked = subValues.filter(subCheckbox => subCheckbox.checked);
                            if (checked.length === subValues.length) {
                                checkbox.checked = true;
                            } else {
                                checkbox.checked = false;
                            }
                            const detail = { detail: { fromSubValue: true } };
                            checkbox.dispatchEvent(new CustomEvent("change", detail));
                        }

                        const checkbox = node.querySelector("input[type='checkbox']");
                        const value = checkbox.value.trim();
                        const paramsStr = node.dataset.params || "";
                        const params = assignPropertiesToObj(paramsStr.split("; "));
                        const subValues = Array.from(
                            node.querySelectorAll(".checkboxes-modal__subvalues .checkboxes-modal__label input")
                        );
                        subValues.forEach(subCheckbox => {
                            subCheckbox.addEventListener("change", onSubValueChange);
                        });
                        node.removeAttribute("data-params");
                        checkbox.addEventListener("change", this.onCheckboxChange);

                        return {
                            node,
                            checkbox,
                            value,
                            subValues,
                            params,
                            checkedState: checkbox.checked
                        };
                    });
            }
            function filterFunc(obj) {
                return obj.node.closest(".checkboxes-modal__list-container") === listObj.listContainer;
            }
        });
    }
    onCheckboxChange(event = {}) {
        const eventDetail = event.detail || {};
        const checkbox = event.target;
        // получить информацию о списке, в котором находится чекбокс, и о самом чекбоксе (itemObj)
        let itemObj;
        const listObj = this.listsData.find(listData => {
            const iObj = listData.allValues.find(obj => obj.checkbox === checkbox);
            if (iObj) {
                itemObj = iObj;
                return true;
            }
            return false;
        });
        if (!listObj) return;

        if (itemObj.subValues && !eventDetail.fromSubValue) {
            itemObj.subValues.forEach(subCheckbox => {
                subCheckbox.checked = itemObj.checkbox.checked;
            });
        }

        // обработать параметры чекбокса
        if (itemObj.params.bindAllStandards) {
            listObj.values.forEach(obj => {
                obj.checkbox.checked = itemObj.checkbox.checked;
                obj.checkbox.dispatchEvent(new Event("change"));
            });
        }
        if (!itemObj.checkbox.checked) {
            const bindAllCheckbox = listObj.allValues.find(obj => obj.params.bindAllStandards);
            if (bindAllCheckbox) bindAllCheckbox.checkbox.checked = false;
        }
        listObj.listContainer.dispatchEvent(new Event("change"));

        // вернуть полученные данные о списке и чекбоксе, что пригодится в методе дочернего класса
        return { listObj, itemObj }
    }
    initSearch(noInitCallback = false) {
        const data = bindMethods(this, {
            node: this.rootElem.querySelector(".checkboxes-modal__search"),
            searchParams: null,
            init() {
                if (!this.searchData.searchParams) {
                    this.searchData.searchParams = new TextInputCheckbox(this.searchData.node);
                    inittedInputs.push(this.searchData.searchParams);
                }
                this.searchData.searchParams.rootElem.addEventListener("apply", this.searchData.onApply);
                this.searchData.searchParams.input.addEventListener("input", this.searchData.onInput);
                this.searchData.searchParams.valuesData.node.addEventListener("show", this.searchData.onShow);
                this.searchData.searchParams.valuesData.node.addEventListener("hide", this.searchData.onHide);
            },
            onInput() {
                const sParams = this.searchData.searchParams;
                const input = sParams.input;
                const value = input.value.trim();
                if (!value) {
                    removeAll();
                    return;
                }
                const regexp = new RegExp(value, "i");
                removeExtras.call(this);
                addNew.call(this);

                function removeAll() {
                    sParams.valuesData.selectValues.forEach(obj => {
                        obj.node.remove();
                    });
                    sParams.valuesData.getSelectValues();
                }
                function removeExtras() {
                    sParams.valuesData.selectValues.forEach(obj => {
                        const objValue = obj.value.replace(/\(.+\)/g, "").trim();
                        if (objValue.match(regexp)) return;
                        obj.node.remove();
                    });
                    sParams.valuesData.getSelectValues();
                }
                function addNew() {
                    let matchCities = [];
                    this.json.forEach(obj => {
                        const captialValue = obj.capital.replace(/\(.+\)/g, "").trim();
                        if (captialValue.match(regexp))
                            matchCities.push(`${obj.capital} (${obj.region})`);
                        obj.cities.forEach(city => {
                            const cityValue = city.replace(/\(.+\)/g, "").trim();
                            if (cityValue.match(regexp))
                                matchCities.push(`${city} (${obj.region})`);
                        });
                    });
                    sParams.valuesData.editSelectValues({
                        values: matchCities,
                        // чтобы не вызывался лишний раз (т.к. уже вызовется на input)
                        noHighlightCall: true
                    });
                }
            },
            onApply() {
            },
            onShow() {
                this.applyButton.container.classList.add("__hidden");
                this.container.classList.add("__hidden");
            },
            onHide() {
                this.applyButton.container.classList.remove("__hidden");
                this.container.classList.remove("__hidden");
            }
        });
        this.searchData = data;
        if (!noInitCallback) data.init();

        return data;
    }
    // метод создаст новые чекбоксы, исходя из того, что передано в values и valuesHead. Идентичные значения НЕ будут перезаписаны, если removeCurrent(Head?)Values == false. Данный метод просто отрисует новые чекбоксы, а их инициализацией займется метод getListsData()
    editValues(params = {
        removeCurrentValues: false,
        removeCurrentHeadValues: false,
        valuesHead: [],
        values: [],
    }, listIndex = 0) {
        // listIndex - индекс списка, в который вносятся изменения
        /* params:
            removeCurrentValues: true - удалит текущие значения (удалит только обычные values, valuesHead НЕ затронет)
            removeCurrentHeadValues: true - удалит текущие значения в верхнем списке (valuesHead)
            valuesHead: [{ value:"string", params: "key::value; key2::value2" }] - значения чекбоксов, которые идут сверху списка (отделены границей снизу). Важно заметить, что в отличие от обычных values, здесь обязательно передается и само значение, и параметры к нему
            values: ["value", { value:"string", params: "key::value; key2::value2", subValues: [] }]. Важно заметить, что можно передать как обычное значение, так и объект, где указывается и значение, и параметры, а также возможно указать subValues - это подзначения, появляющиеся под текущим значением.
            value можно передавать как в теге ("<span>value</span> value", так и вне тега, все отрендерится, как нужно)
        */
        doForEachValue = doForEachValue.bind(this);
        const listData = this.listsData[listIndex];
        if (!listData) return;

        if (params.removeCurrentHeadValues || params.removeCurrentValues) {
            if (params.removeCurrentHeadValues) listData.valuesHead.forEach(doForEach);
            if (params.removeCurrentValues) listData.values.forEach(doForEach);
            this.getListsData();

            function doForEach(obj) {
                obj.node.remove();
            }
        }
        if (Array.isArray(params.valuesHead)) {
            let innerhtml = "";
            params.valuesHead
                .forEach(obj => innerhtml += doForEachValue(obj, listData.valuesHead));
            listData.headList.insertAdjacentHTML("beforeend", innerhtml);
        }
        if (Array.isArray(params.values)) {
            let innerhtml = "";
            params.values
                .forEach(obj => innerhtml += doForEachValue(obj, listData.values));
            listData.list.insertAdjacentHTML("beforeend", innerhtml);
        }

        this.getListsData();

        function doForEachValue(valueOrObj, existingArray) {
            let value = valueOrObj.value;
            if (typeof valueOrObj === "string") {
                if (existingArray === params.valuesHead) return;
                value = valueOrObj;
            }
            const untaggedValue = value.replace(/<.*?>/g, "").trim();
            const alreadyExists = existingArray.find(obj => obj.value === untaggedValue);
            if (alreadyExists) return "";

            return renderMisc.checkboxesModalCheckmark({
                value,
                name: this.params.name,
                paramsDataset: valueOrObj.params,
                subValues: valueOrObj.subValues,
            });
        }
    }
}

class CheckboxesModalRegions extends CheckboxesModal {
    constructor(node) {
        super(node);

        this.cachedValueObjects = [];
        this.secondListData = this.initSecondList();
        fetch(`${rootPath}json/regions-cities.json`)
            .then(res => res.json())
            .then(json => {
                this.json = json;
                const regions = [];
                this.json.forEach(obj => {
                    obj.region = obj.region.trim();
                    obj.capital = obj.capital.trim();
                    obj.cities = obj.cities.map(c => c.trim()).sort((city1, city2) => {
                        if (city1 < city2) return -1;
                        if (city1 > city2) return 1;
                        return 0;
                    });

                    regions.push({ value: obj.region });
                });
                this.editValues({
                    valuesHead: [{
                        value: `<span class="fw-700">Вся Россия</span>`,
                        params: "bindAllStandards::true"
                    }],
                    values: regions
                }, 0);
            });

        nextInitTick(() => {
            initHiddenInputs.call(this);
        });

        function initHiddenInputs() {
            this.regionsInput = this.createModal.hiddenInput;
            this.citiesInput = createElement("input");
            this.citiesInput.setAttribute("type", "hidden");
            this.createModal.rootElem.append(this.citiesInput);
            const thisName = this.params.name || "";
            this.regionsInput.setAttribute("name", `${thisName}-regions`);
            this.citiesInput.setAttribute("name", `${thisName}-cities`);
            this.createModal.hiddenInput = { regionsInput: this.regionsInput, citiesInput: this.citiesInput };
        }
    }
    initSecondList() {
        const data = bindMethods(this, {
            addCapital(objFromJson) {
                const regionTitle = objFromJson.region;
                const alreadyExists = this.listsData[1].values.find(obj => obj.params.region === regionTitle);
                if (alreadyExists) return;

                // ищем закэшированую столицу
                const cached = this.cachedValueObjects.find(obj => {
                    return obj.region === regionTitle && obj.cachedObj.params.isCapital;
                });
                if (cached) {
                    this.listsData[1].list.append(cached.cachedObj.node);
                    setTimeout(() => this.getListsData(), 100);
                    return;
                }

                // если не закэширована, добавить и закэшировать
                const value = `<span class="fw-700">${objFromJson.capital}</span> (${regionTitle})`;
                const values = [
                    { value, params: `isCapital::true; region::${regionTitle}` }
                ];
                this.editValues({ values }, 1);

                let cachingObj = this.listsData[1].values.find(obj => {
                    return obj.region === regionTitle && obj.cachedObj.params.isCapital;
                });
                if (cachingObj) {
                    this.cachedValueObjects.push({
                        region: regionTitle,
                        cachedObj: cachingObj
                    });
                }
            },
            addRegion(objFromJson) {
                const regionTitle = objFromJson.region;
                const alreadyExists = this.listsData[1].values.find(obj => obj.value === regionTitle);
                if (alreadyExists) return;

                // ищем закэшированый регион с городами
                const cached = this.cachedValueObjects.find(obj => {
                    return obj.region === regionTitle && !obj.cachedObj.params.isCapital;
                });
                if (cached) {
                    this.listsData[1].list.append(cached.cachedObj.node);
                    setTimeout(() => this.getListsData(), 100);
                    return;
                }

                // если не закэшировано, добавить и закэшировать
                const value = `<span class="fw-700">${regionTitle}</span>`;
                const values = [
                    { value, subValues: objFromJson.cities, params: `region::${regionTitle}` }
                ];
                this.editValues({ values }, 1);

                let cachingObj = this.listsData[1].values.find(obj => obj.value === regionTitle);
                if (cachingObj) {
                    this.cachedValueObjects.push({
                        region: regionTitle,
                        cachedObj: cachingObj
                    });
                }
            }
        });

        return data;
    }
    async onListContainerChange(event) {
        updateValues = updateValues.bind(this);
        function updateValues() {
            this.listsData[0].values.forEach(itemObj => {
                const regionTitle = itemObj.value;
                const jsonObj = this.json.find(obj => obj.region === regionTitle);
                // добавить столицу и регион со списком городов, если не добавлены
                if (itemObj.checkbox.checked) {
                    this.secondListData.addCapital(jsonObj);
                    this.secondListData.addRegion(jsonObj);
                }
                // убрать регионы с городами, которые НЕ checked в списке слева
                else {
                    const existingRegion = this.listsData[1].values.find(obj => obj.value === regionTitle);
                    if (!existingRegion) return;

                    existingRegion.node.remove();
                    this.getListsData();
                }
            });

            // добавить опцию "Все нас.пункты"
            if (this.listsData[1].values.length > 0) {
                const value = `<span class="fw-700">Все населенные пункты</span>`
                this.editValues({
                    valuesHead: [{ value, params: "bindAllStandards::true" }]
                }, 1);
            }
            // убрать опцию "Все нас.пункты"
            else {
                this.editValues({
                    removeCurrentHeadValues: true
                }, 1);
            }
        }

        const listData = await super.onListContainerChange(event);
        if (!listData) return;

        if (listData === this.listsData[0]) {
            updateValues();
        }
    }
    getListsData() {
        super.getListsData();
        const methods = bindMethods(this, {
            getCities() {
                this.listsData[0].values.forEach(obj => {
                    if (Array.isArray(obj.cities)) return;

                    const regionData = this.json.find(o => o.region === obj.value);
                    if (!regionData) return;

                    obj.capital = regionData.capital;
                    obj.cities = [...regionData.cities];
                });
            },
            sort() {
                const ld = this.listsData[1];
                const capitals = ld.values
                    .filter(obj => obj.params.isCapital)
                    .sort(sortCallback);
                const regions = ld.values
                    .filter(obj => !obj.params.isCapital)
                    .sort(sortCallback);

                capitals.forEach(appendCallback);
                regions.forEach(appendCallback);

                function sortCallback(obj1, obj2) {
                    if (obj1.value < obj2.value) return -1;
                    if (obj1.value > obj2.value) return 1;
                    return 0;
                }
                function appendCallback(obj) {
                    ld.list.append(obj.node);
                }
            }
        });

        for (let key in methods) {
            if (typeof methods[key] === "function") methods[key]();
        }
    }
    onCheckboxChange(event) {
        const data = super.onCheckboxChange(event);
        if (!data) return;
        const listObj = data.listObj;
        const itemObj = data.itemObj;


    }
    apply() {
        const parentMethods = super.apply(true);
        let methods = Object.assign(parentMethods, {
            async setCreateModalText() {
                if (!createModalPars.rootElem.classList.contains("__has-value")) {
                    textContentMethods.setContent(createModalPars.textBlock, createModalPars.defaultText);
                    return;
                }

                // ждет, пока выполнится methods.setValues()
                await delay(0);

                const checkedRegionsAmount = this.values.regions.split("|").length;
                const checkedCitiesAmount = this.values.cities.split("|").length;
                const text = `Регионов: ${checkedRegionsAmount}, Населенных пунктов: ${checkedCitiesAmount}`;
                textContentMethods.setContent(createModalPars.textBlock, text);
            },
        })
        methods.setValues = function () {
            let regions = this.listsData[0].values
                .filter(obj => obj.checkbox.checked)
                .map(obj => obj.value);
            let cities = "";
            const capitalRegions = [];
            this.listsData[1].values.forEach(obj => {
                if (obj.params.isCapital) {
                    if (obj.checkbox.checked) cities += obj.value.replace(/\(.+\)/g, "").trim() + "|";
                    capitalRegions.push(obj.params.region);
                    return;
                }

                obj.subValues.forEach(subCheckbox => {
                    if (subCheckbox.checked) cities += subCheckbox.value.trim() + "|";
                });
            });

            capitalRegions.forEach(reg => {
                if (!regions.includes(reg)) regions.push(reg);
            });
            regions = regions.join("|");
            cities = cities.slice(0, cities.length - 1);
            this.values = { regions, cities };
            this.regionsInput.value = regions;
            this.citiesInput.value = cities;
        }
        methods = bindMethods(this, methods);

        const createModalPars = this.createModal;
        const checkedRegionsAmount = this.listsData[0].values.filter(obj => obj.checkbox.checked).length;
        let checkedCitiesAmount = 0;
        for (let key in methods) {
            if (typeof methods[key] === "function") methods[key]();
        }
    }
    clear(listIndex) {
        super.clear(listIndex);

        if (listIndex === 1) {
            this.listsData[1].allValues.forEach(obj => {
                obj.node.remove();
                const regionCheckboxObj = this.listsData[0].values.find(o => o.value === obj.params.region);
                if (regionCheckboxObj) {
                    setTimeout(() => {
                        regionCheckboxObj.checkbox.checked = false;
                        regionCheckboxObj.checkbox.dispatchEvent(new Event("change"));
                    }, 0);
                }
                this.getListsData();
            });
        }
    }
    initSearch() {
        const parentData = super.initSearch(true);
        let data = Object.assign({}, parentData);
        data.onApply = function () {
            parentData.onApply();
            const selectValues = data.searchParams.valuesData.selectValues;
            const checked = selectValues.filter(obj => obj.checkbox.checked).map(obj => obj.value);

            let capitals = new Set();
            let regionCities = new Set();
            const checkingValues = [];
            checked.forEach(cityTitle => {
                let regionTitle = cityTitle.match(/\(.+\)/);
                if (!regionTitle) return;

                regionTitle = regionTitle[0].replace(/\(|\)/g, "").trim();
                const regionData = this.json.find(obj => obj.region === regionTitle);
                if (!regionData) return;

                const isCapital = cityTitle.replace(/\(.+\)/g, "").trim() === regionData.capital;
                if (isCapital) {
                    capitals.add(regionData);
                    checkingValues.push({ value: cityTitle });
                }
                else {
                    regionCities.add(regionData);
                    checkingValues.push({ value: cityTitle, regionTitle });
                }
            });

            if (capitals.size > 0) capitals.forEach(jsonObj => this.secondListData.addCapital(jsonObj));
            if (regionCities.size > 0)
                regionCities.forEach(jsonObj => this.secondListData.addRegion(jsonObj));

            data.searchParams.clear({ fullClear: true });
            setTimeout(() => {
                data.searchParams.valuesData.hide();
                // после того, как регионы и города были добавлены в список, нужно выставить им checked
                checkingValues.forEach(valObj => {
                    if (valObj.regionTitle) {
                        const cityTitleWithoutRegion = valObj.value.replace(/\(.+\)/g, "").trim();

                        const cbObj = this.listsData[1].values.find(obj => {
                            return obj.value === valObj.regionTitle;
                        });
                        if (!cbObj) return;

                        const subCb = cbObj.subValues.find(subCheckbox => {
                            return subCheckbox.value === cityTitleWithoutRegion;
                        });
                        if (subCb) {
                            subCb.checked = true;
                            subCb.dispatchEvent(new Event("change"));
                        }
                    } else {
                        const cbObj = this.listsData[1].values.find(obj => obj.value === valObj.value);
                        if (!cbObj) return;

                        cbObj.checkbox.checked = true;
                        cbObj.checkbox.dispatchEvent(new Event("change"));
                    }
                });
            }, 0);
        }

        data = bindMethods(this, data);
        this.searchData = data;
        data.init();

        return data;
    }
}

const inputsSelectors = [
    { selector: ".text-input--standard", classInstance: TextInput },
    { selector: ".text-input--checkboxes", classInstance: TextInputCheckbox },
    { selector: ".date-inputs", classInstance: DateInputs },
    { selector: ".select", classInstance: Select },
    { selector: ".inputs-range", classInstance: InputsRange },
    { selector: "[data-toggle-onchecked]", classInstance: ToggleOnchecked },
    { selector: "[data-create-modal]", classInstance: CreateModal },
    { selector: ".calendar", classInstance: Calendar },
    { selector: ".calendar-double", classInstance: CalendarDouble },
    { selector: ".checkboxes-modal--standard", classInstance: CheckboxesModal },
];
inittingSelectors = inittingSelectors.concat(inputsSelectors);