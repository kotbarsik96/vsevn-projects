function documentHandlers() {
    document.addEventListener("click", closeMultiselects);
    document.addEventListener("click", closeTextSelects);

    function closeMultiselects(event) {
        let targ = event.target;
        let isMultiselect = targ.classList.contains("multiselect")
            || targ.closest(".multiselect");
        if (isMultiselect) return;

        let multiselects = findInittedInput(".multiselect", true);
        multiselects.forEach(msClass => msClass.hide());
    }
    function closeTextSelects(event) {
        let targ = event.target;
        let isTextSelect = targ.classList.contains("text-field__input");
        if (isTextSelect) return;

        let textSelects = findInittedInput(".text-field--select", true);
        textSelects.forEach(tSelect => tSelect.hideOptions());
    }
}
documentHandlers();

function dispatchCompletionCheckEvent(preventEvent) {
    const completionCheckEvent = new CustomEvent("completion-check");
    if (!preventEvent) this.rootElem.dispatchEvent(completionCheckEvent);
}

// кнопки add-field--education, которым подбирается одинаковая высота
function justifyAddButtonsHeight() {
    doJustify();
    window.addEventListener("resize", doJustify);

    function doJustify() {
        const selectors = [".add-field--education"];
        selectors.forEach(selector => {
            const buttons = Array.from(document.querySelectorAll(selector));
            buttons.forEach(btn => btn.style.removeProperty("min-height"));
            const heights = buttons.map(btn => btn.offsetHeight);
            const maxHeight = Math.max(...heights);
            buttons.forEach(btn => btn.style.minHeight = `${maxHeight}px`);
        });
    }
}
justifyAddButtonsHeight();

// высчитать размер файла и вернуть его либо в килобайтах, либо в мегабайтах
function calcSize(sizeBytes) {
    const kb = sizeBytes / 1024;
    const mb = kb / 1024;
    if (mb < 1) return `${parseInt(kb)} кб`;
    if (mb >= 1) return `${parseInt(mb * 100) / 100} мб`;
}

function getUncompleted(inpClassesArray, preventCompletionEvent = false) {
    return inpClassesArray.filter(inpClass => {
        let exists = inpClass.rootElem.closest("body")
            && !inpClass.rootElem.classList.contains("__removed");
        let hasCompletionMethod = Boolean(inpClass.checkCompletion);

        if (exists && hasCompletionMethod) {
            const isCompleted = inpClass.checkCompletion(preventCompletionEvent);
            return isCompleted ? false : true;
        } return false;
    });
}

// группа полей
class FieldsGroup {
    constructor(node) {
        this.checkCompletion = this.checkCompletion.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");

        setTimeout(() => {
            this.fields = findInittedInputByFlag("new-resume", true)
                .filter(inpClass => {
                    if (inpClass.rootElem === this.rootElem) return;
                    return inpClass.rootElem.closest(".forms__fields-group") === this.rootElem;
                });
            this.createUncompletedMessage();
            this.fields.forEach(inpClass => {
                inpClass.rootElem.addEventListener("completion-check", this.checkCompletion);
            });
        }, 100);
    }
    createUncompletedMessage() {
        let inputsHaveMessage = Boolean(
            this.fields.find(inpClass => {
                return inpClass.rootElem.querySelector(".field__uncompleted");
            })
        );
        let fieldHasMessage = Boolean(this.rootElem.querySelector(".field__uncompleted"));
        if (inputsHaveMessage || fieldHasMessage) return;

        this.uncompletedMessage = createElement("p", "field__uncompleted");
        this.rootElem.append(this.uncompletedMessage);
    }
    renderUncompletedMessage() {
        if (!this.uncompletedMessage) return;

        if (!this.uncompleted) {
            this.checkCompletion();
            return;
        }

        const uncompletedWithLabel = this.uncompleted.filter(inpClass => inpClass.ariaLabel);
        let message = "Пожалуйста, укажите ";
        uncompletedWithLabel.forEach((inpClass, index, arr) => {
            const label = inpClass.ariaLabel.toLowerCase();
            message += label;
            if (arr.length - 1 !== index) message += ", ";
        });
        this.uncompletedMessage.innerHTML = message;
    }
    checkCompletion() {
        this.uncompleted = getUncompleted(this.fields, true);
        if (this.uncompleted.length > 0 && this.isRequired) this.rootElem.classList.add("__uncompleted");
        else this.rootElem.classList.remove("__uncompleted");

        this.renderUncompletedMessage();
    }
}

// ползунок
class Range {
    // все поле
    rootElem;
    // поле с бегунком
    range;
    // подшкалы, в которых указываются границы и шаги для этих границ
    rangeSubscales;
    // шкала
    rangeScale;
    // информация о шкале бегунка
    rangeData;
    // бегунок
    toggler;
    // поле со значением в цифрах
    valueInput;
    // значение
    value;
    // название поля
    name;
    // поле со значением
    valueInput;

    constructor(rangeBlock) {
        if (!rangeBlock.querySelector("[data-range-limits]")) return;
        this.rootElem = rangeBlock;
        this.range = rangeBlock.querySelector(".range");
        this.rangeScale = rangeBlock.querySelector(".range__scale");
        this.toggler = rangeBlock.querySelector(".range__toggler");
        this.valueInput = rangeBlock.querySelector(".range-block__value");
        this.name = this.valueInput.name;
        this.toggler.style.transform = "translate(-50%, 0)";

        this.getData();
        window.addEventListener("resize", this.getData.bind(this));

        this.setTogglerHandlers();
        this.setFocusHandler();
        this.valueInput.addEventListener("change", this.checkInputValue.bind(this));
        this.setValue(this.rangeData.minValue);
    }
    getData() {
        if (!this.rangeData) {
            this.rangeSubscales = Array.from(this.rootElem.querySelectorAll(".range__subscale"))
                .map(subscale => {
                    const limits = subscale.dataset.rangeLimits.split(", ");
                    const step = parseInt(subscale.dataset.rangeStep);

                    if (limits.length < 2)
                        throw new Error("Неверно указаны значения data-range-limits в range");

                    const minValue = parseInt(limits[0]);
                    const maxValue = parseInt(limits[1]);
                    subscale.remove();
                    return { step, minValue, maxValue: maxValue || minValue };
                });
        }

        const width = this.range.offsetWidth - this.toggler.offsetWidth / 1.2;
        const minValue = this.rangeSubscales[0].minValue;
        const maxValue = this.rangeSubscales[this.rangeSubscales.length - 1].maxValue;
        const totalValue = maxValue - minValue;
        this.rangeData = {
            width,
            minValue,
            maxValue,
            totalValue,
            step: totalValue / width
        }
        this.setValue(this.rangeData.minValue);
        this.toggler.style.transform = "translate(-50%, 0)";
        this.moveToggler(0);
    }
    setTogglerHandlers() {
        onMove = onMove.bind(this);
        onUp = onUp.bind(this);

        const toggler = this.toggler;
        const range = this.range;
        const maxRangeWidth = this.rangeData.width;
        let shift = getCoords(this.range).left + toggler.offsetWidth / 2;
        toggler.addEventListener("pointerdown", onDown.bind(this));
        range.addEventListener("pointerdown", onDown.bind(this));
        toggler.ondragstart = () => false;
        range.ondragstart = () => false;
        this.rangeScale.style.width = getComputedStyle(toggler).left;

        function onDown(event) {
            event.preventDefault();
            shift = getCoords(this.range).left + toggler.offsetWidth / 2;

            // курсор на бегунке
            if (event.target === toggler) {
                document.addEventListener("pointermove", onMove);
                document.addEventListener("pointerup", onUp);
                this.range.classList.add("__moving");
            }
            // курсор на шкале
            else {
                const x = event.clientX - shift;
                if (x >= 0 && x <= maxRangeWidth) {
                    this.moveToggler(x);
                    toggler.dispatchEvent(new Event("pointerdown"));
                    onMove(event);
                }
            }
        }
        function onMove(event) {
            let x = event.clientX - shift;
            if (x < 0) x = 0;
            else if (x > maxRangeWidth) x = maxRangeWidth;

            let newValue = Math.round(this.rangeData.step * x) + this.rangeData.minValue;
            const reqStep = this.rangeSubscales.find(sbsc => {
                return newValue >= sbsc.minValue && newValue <= sbsc.maxValue;
            }).step;
            const n = parseInt(newValue / reqStep);
            newValue = (n * reqStep - this.rangeData.minValue);
            x = newValue / this.rangeData.step;


            this.moveToggler(x);
            const value = Math.round(this.rangeData.step * x) + this.rangeData.minValue;
            this.setValue(value);
        }
        function onUp() {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
            this.range.classList.remove("__moving");
        }
    }
    checkInputValue(event) {
        const input = this.valueInput;
        let value = parseInt(input.value.replace(/\D/g, ""));
        if (value > this.rangeData.maxValue) value = this.rangeData.maxValue;
        if (value < this.rangeData.minValue) value = this.rangeData.minValue;
        input.value = value.toLocaleString() + " рублей";

        // при введении пользователем числа
        if (event.isTrusted) {
            const x = (value - this.rangeData.minValue) / this.rangeData.step;
            this.moveToggler(x);
        }
    }
    setValue(val) {
        this.valueInput.value = val;
        this.valueInput.dispatchEvent(new Event("change"));
    }
    moveToggler(x) {
        this.toggler.style.left = `${x}px`;
        this.rangeScale.style.width = `${x}px`;
        this.togglerLeft = x;

        const xtrunc = parseInt(x);
        if (xtrunc === 0) this.toggler.style.cssText += "transform: translate(-50%, 0%)";
        if (xtrunc >= parseInt(this.rangeData.width)) {
            this.toggler.style.cssText += "transform: translate(30%, 0%)";
            this.rangeScale.style.width = `${x + this.toggler.offsetWidth}px`;
        }
        if (xtrunc !== 0 && xtrunc !== parseInt(this.rangeData.width)) {
            this.toggler.style.removeProperty("transform");
        }
    }
    setFocusHandler() {
        this.rootElem.addEventListener("click", () => this.valueInput.focus());
        this.valueInput.addEventListener("focus", () => this.rootElem.classList.add("__focus"));
        this.valueInput.addEventListener("blur", () => this.rootElem.classList.remove("__focus"));
    }
}

// селект
class Multiselect {
    constructor(node) {
        this.toggle = this.toggle.bind(this);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onChange = this.onChange.bind(this);
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");
        this.ariaLabel = this.rootElem.dataset.ariaLabel;
        this.selectBox = this.rootElem.querySelector(".selectBox");
        this.uncompleteMessage = this.rootElem.querySelector(".field__uncompleted");
        this.selectBoxValueText = this.selectBox.querySelector(".selectBox_value-text");
        this.placeholder = this.selectBoxValueText.textContent;
        this.optionLabels = Array.from(this.rootElem.querySelectorAll(".multiselect__label"));
        this.options = this.optionLabels.map(label => label.querySelector("input"));
        this.closeBtn = this.rootElem.querySelector(".selctexit_btn");

        this.selectBox.addEventListener("click", this.toggle);
        this.options.forEach(opt => opt.addEventListener("change", this.onChange));
        this.closeBtn.addEventListener("click", this.clear);
    }
    show() {
        this.rootElem.classList.add("select_active");
    }
    hide() {
        this.rootElem.classList.remove("select_active");
    }
    toggle(event = null) {
        let otherSelects = findInittedInput(".multiselect", true)
            .filter(msClass => msClass.rootElem !== this.rootElem);
        otherSelects.forEach(msClass => msClass.hide());

        if (event) {
            let targ = event.target;
            let isException = targ === this.closeBtn
                || targ.closest(".selctexit_btn") === this.closeBtn;

            if (isException) return;
        };

        this.rootElem.classList.contains("select_active")
            ? this.hide()
            : this.show();
    }
    onChange(event) {
        this.checked = this.options.find(opt => opt.checked);
        this.hide();
        this.checkCompletion();

        if (!this.checked) return;

        this.selectBox.classList.add("selbActive");
        this.selectBoxValueText.innerHTML = this.checked.dataset.mselectValue;
    }
    clear() {
        this.options.forEach(opt => {
            if (opt.checked) {
                opt.checked = false;
                opt.dispatchEvent(new Event("change"));
            }
        });
        this.selectBox.classList.remove("selbActive");
        this.selectBoxValueText.innerHTML = this.placeholder;
    }
    checkCompletion(preventEvent) {
        let checkedInput = this.options.find(opt => opt.checked);
        if (checkedInput) this.rootElem.classList.remove("__uncompleted");
        else if (this.isRequired) this.rootElem.classList.add("__uncompleted");

        let isCompleted = Boolean(checkedInput);
        this.isCompleted = isCompleted;

        dispatchCompletionCheckEvent.call(this, preventEvent);
        return isCompleted;
    }
}

// мультиселект, от который может создавать кнопку "Добавить" для добавления новых полей/мультиселектов (класс Add[...])
class MultiselectAddField extends Multiselect {
    constructor(node) {
        super(node);
        this.onAddFieldButtonClick = this.onAddFieldButtonClick.bind(this);
    }
    createAddFieldButton(content, fieldName, range = null) {
        if (this.addFieldButton) return;

        let addFieldButtonInner = `
            <div class="add-field__icon icon-plus"></div>
            <p class="add-field__text">${content}</p>
        `;
        let addFieldButton = createElement("div", "add-field", addFieldButtonInner);
        addFieldButton.dataset.addField = fieldName;
        if (range) addFieldButton.dataset.addFieldsRange = range;
        addFieldButton.addEventListener("click", this.onAddFieldButtonClick);

        return addFieldButton;
    }
    onAddFieldButtonClick(event) {
        const button = event.currentTarget;
        const buttonClass = findInittedInput(".add-field", true)
            .find(inpClass => inpClass.rootElem === button);
        if (buttonClass) {
            this.addedFields = buttonClass.fields;
        }
    }
    removeAdded() {
        if (this.addFieldButton) {
            this.addFieldButton.remove();
            this.addFieldButton = null;
        }
        if (this.addedFields) {
            this.addedFields.forEach(added => {
                added.field.remove();
                added.removeButton.remove();
            });
            this.addedFields = null;
        }
    }
}
class MultiselectChildren extends MultiselectAddField {
    constructor(node) {
        super(node);
    }
    onChange(event) {
        super.onChange(event);
        const val = this.checked ? this.checked.value : null;

        switch (val) {
            case "yes": this.onYesSelect();
                break;
            case "no": this.onNoSelect();
                break;
            default: super.removeAdded();
                break;
        }
        this.checkCompletion();
    }
    onYesSelect() {
        this.addFieldButton = super.createAddFieldButton("Указать возраст ребенка", "children");
        this.rootElem.after(this.addFieldButton);
    }
    onNoSelect() {
        if (this.addFieldButton) {
            this.addFieldButton.remove();
            this.addFieldButton = null;
        }
    }
    checkCompletion(preventEvent) {
        if (!this.checked) {
            this.isCompleted = false;
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
            return this.isCompleted;
        }

        super.checkCompletion(preventEvent);

        if (this.isCompleted) this.rootElem.classList.remove("__uncompleted");
        return this.isCompleted;
    }
}

// поле для ввода текста
class TextField {
    constructor(node) {
        this.onChange = this.onChange.bind(this);
        this.onInput = this.onInput.bind(this);
        this.refresh = this.refresh.bind(this);
        this.typeNumberOnly = this.typeNumberOnly.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");

        this.inputWrapper = this.rootElem.querySelector(".text-field__input-wrapper");

        // если TextFieldMulti - проинициализируется все равно, просто в конструкторе TextFieldMulti
        if (this instanceof TextFieldMulti == false) this.init();
    }
    init() {
        this.input = this.rootElem.querySelector(".text-field__input");
        this.inputRefresh = this.rootElem.querySelector(".text-field__input-close");
        this.ariaLabel = this.input.getAttribute("aria-label");
        this.isNumberOnly = this.input.hasAttribute("data-numbers-only");
        this.createRegexp();
        this.getCompleteConditions();
        this.input.addEventListener("change", this.onChange);
        this.input.addEventListener("focus", () => this.rootElem.classList.remove("__completed"));
        this.input.addEventListener("blur", this.onChange);
        this.input.addEventListener("input", this.onInput);
        if (this.inputRefresh)
            this.inputRefresh.addEventListener("click", this.refresh);
        if (this.isNumberOnly)
            this.input.addEventListener("input", this.typeNumberOnly);
    }
    getCompleteConditions() {
        const completeLength = this.input.dataset.completeLength;
        const hasCompleteMatch = this.input.hasAttribute("data-complete-match");

        if (completeLength) {
            const values = completeLength.split(", ");
            this.completeCondition = { minLength: values[0], maxLength: values[1] };
        } else if (hasCompleteMatch) {
            let completeMatch = this.input.dataset.completeMatch;
            let values = [];
            // если не указаны в атрибуте, искать в .field__options-item элементах
            if (!completeMatch) {
                values = Array.from(document.querySelectorAll(".field__options-item"))
                    .map(item => item.textContent || item.innerText);
            }
            // если указаны в атрибуте в формате Значение1|Значение2, взять оттуда
            else {
                values = completeMatch.split("|");
            }
            this.completeCondition = { match: values };
        }
        // если не указаны никакие условия
        else this.completeCondition = { minLength: 0 };
    }
    onInput() {
        const val = this.input.value;
        if (!val) {
            this.inputWrapper.classList.remove("__active");
            return;
        }

        this.checkCompletion();
        if (this.input.value) this.inputWrapper.classList.add("__active");
        else this.inputWrapper.classList.remove("__active");
    }
    refresh() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.rootElem.classList.remove("__completed");
        if (!this.isRequired) this.rootElem.classList.remove("__uncompleted");
    }
    createRegexp() {
        const regexp = this.input.dataset.regexp;
        if (!regexp) return;

        this.regexp = new RegExp(regexp);
    }
    onChange() {
        this.checkCompletion();
        if (!this.input.value) this.inputWrapper.classList.remove("__active");

        if ((this.regexp) && !this.isCompleted) {
            if (this.input.value || this.isRequired) this.rootElem.classList.add("__uncompleted");
            else this.rootElem.classList.remove("__uncompleted");
        }

        if (this.isCompleted) {
            this.rootElem.classList.remove("__uncompleted");
            this.rootElem.classList.add("__completed");
        }
    }
    checkCompletion(preventEvent = false) {
        const conditions = this.completeCondition;
        let value = this.input.value;
        // проверка на совпадение с data-complete-match
        if (conditions.match) {
            if (conditions.match.includes(value)) this.isCompleted = true;
            else this.isCompleted = false;
        }
        else if (conditions.minLength >= 0) {
            let isRightNumber = false;
            // если указан верхний порог
            if (conditions.maxLength) {
                isRightNumber = value.length >= conditions.minLength && value.length <= conditions.maxLength;
            }
            // если верхнего порога нет
            else isRightNumber = value.length >= conditions.minLength;

            this.isCompleted = isRightNumber;
        }
        // проверка на совпадение с regexp
        if (this.regexp) {
            const isMatch = Boolean(value.match(this.regexp));
            this.isCompleted = isMatch;
        }

        if (this.isCompleted) this.rootElem.classList.remove("__uncompleted");

        dispatchCompletionCheckEvent.call(this, preventEvent);
        return this.isCompleted;
    }
    typeNumberOnly(event) {
        const inputtedValue = event.data;
        if (parseInt(inputtedValue) >= 0 && event.inputType !== "insertFromPaste") return;
        if (event.inputType === "insertFromPaste") {
            setTimeout(() => {
                event.target.value = event.target.value.replace(/\D/g, "");
                if (!event.target.value) {
                    this.inputWrapper.classList.remove("__active");
                    this.rootElem.classList.remove("__uncompleted");
                }
            }, 100);
        }
        event.target.value = event.target.value.replace(inputtedValue, "");
        if (!event.target.value) {
            this.checkCompletion();
        }
    }
}

// поле для ввода текста, содержащее несколько input
class TextFieldMulti extends TextField {
    constructor(node) {
        super(node);
        this.onInputTrapFocus = this.onInputTrapFocus.bind(this);
        this.typeNumberOnly = this.typeNumberOnly.bind(this);
        this.setValue = this.setValue.bind(this);
        this.onKeydown = this.onKeydown.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onFocus = this.onFocus.bind(this);

        this.inputTrap = this.rootElem.querySelector(".text-field__input-trap");
        if (this.inputTrap) {
            this.inputTrap.addEventListener("focus", this.onInputTrapFocus);
            this.isFirstFocus = true;
            return;
        }

        this.init();
    }
    onInputTrapFocus() {
        if (this.isFirstFocus) {
            const layout = this.createLayout();
            this.inputTrap.insertAdjacentHTML("afterend", layout);
            this.inputTrap.remove();
            this.init();
            this.inputs[0].focus();
            this.isFirstFocus = false;
        } else {
            this.removedLayoutElems.forEach(el => el.classList.remove("__removed"));
            this.inputTrap.remove();
            this.inputs[0].focus();
        }
    }
    init() {
        super.init();
        this.inputs = Array.from(this.rootElem.querySelectorAll(".text-field__input-subfield"));
        this.inputs.forEach(input => {
            if (input.hasAttribute("data-numbers-only"))
                input.addEventListener("input", this.typeNumberOnly);
            input.addEventListener("input", this.onInput);
            input.addEventListener("focus", this.onFocus);
            input.addEventListener("change", this.onChange);
            input.addEventListener("blur", this.onChange);
            input.addEventListener("keydown", this.onKeydown);

            let maxlength = input.getAttribute("maxlength");
            if (maxlength) {
                input.style.width = `${maxlength - (maxlength * 0.3)}em`;
            }
        });

        if (this.inputRefresh) this.inputRefresh.addEventListener("click", this.refresh);
    }
    onInput(event) {
        this.setValue(event);
        this.checkCompletion();

        if (this.input.value) this.inputWrapper.classList.add("__active");
        else this.inputWrapper.classList.remove("__active");
    }
    onFocus() {
        this.rootElem.classList.remove("__completed");
        this.rootElem.classList.remove("__uncompleted");
    }
    setTrap() {
        this.removedLayoutElems = [];
        this.rootElem.querySelectorAll(".text-field__input-multi")
            .forEach(el => this.removedLayoutElems.push(el));
        this.removedLayoutElems.push(this.rootElem.querySelector(".text-field__input-close"));

        this.removedLayoutElems.forEach(el => el.classList.add("__removed"));
        this.inputWrapper.append(this.inputTrap);
    }
    onChange(event) {
        super.onChange(event);
        if (!this.isCompleted) {
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
            else if (this.input.value) this.rootElem.classList.add("__uncompleted");
        } else {
            this.rootElem.classList.add("__completed");
        }

        if (this.inputTrap) {
            const hasNotEmptyInput = Boolean(this.inputs.find(inp => inp.value));
            if (!hasNotEmptyInput) this.setTrap();
        }
    }
    setValue(event) {
        const targInput = event.target;

        let value = "";
        const maxlength = targInput.getAttribute("maxlength");
        this.inputs.forEach(inp => value += inp.value);
        this.input.value = value;

        setTimeout(() => {
            if (targInput.value.length >= maxlength && targInput.selectionStart == maxlength) {
                const currentIndex = this.inputs.indexOf(targInput);
                const nextInput = this.inputs[currentIndex + 1];
                if (nextInput) nextInput.focus();
            }
        }, 50);
    }
    onKeydown(event) {
        super.onChange(event);
        const input = event.target;
        const inputIndex = this.inputs.findIndex(i => i === input);
        const nextInput = this.inputs[inputIndex + 1];
        const prevInput = this.inputs[inputIndex - 1];
        if (event.code === "Backspace") {
            if (!input.value && prevInput) prevInput.focus();
        }
        if (event.code.includes("Arrow") && (input.selectionStart === input.selectionEnd)) {
            if (event.code === "ArrowRight" && input.selectionEnd === input.value.length && nextInput) {
                nextInput.focus();
            }
            if (event.code === "ArrowLeft" && input.selectionStart === 0 && prevInput) {
                prevInput.focus();
            }
        }

        this.replaceNextValueSymbol(event);
    }
    replaceNextValueSymbol(event) {
        const input = event.target;
        if (event.key.length > 1 || input.selectionStart !== input.selectionEnd) return;
        const selStart = input.selectionStart;

        const maxlength = input.getAttribute("maxlength");
        if (input.value.length == maxlength) {
            input.value = input.value.slice(0, selStart);
            setTimeout(() => {
                input.selectionStart = input.selectionEnd = selStart + 1;
            }, 0);
        }
    }
    typeNumberOnly(event) {
        event.target.value = event.target.value.replace(/\D/g, "");
        this.input.value = this.input.value.replace(/\D/g, "");
    }
    refresh() {
        this.inputs.forEach(input => {
            input.value = "";
            input.dispatchEvent(new Event("input"));
        });
    }
}

class TextFieldDate extends TextFieldMulti {
    constructor(node) {
        super(node);
        this.onLastInputKeydown = this.onLastInputKeydown.bind(this);
        this.typeNumberOnly = this.typeNumberOnly.bind(this);
        this.onKeydown = this.onKeydown.bind(this);

        this.inputDay = this.inputs[0];
        this.inputMonth = this.inputs[1];
        this.inputYear = this.inputs[2];
        this.fieldsGroup = findInittedInput(".forms__fields-group", true)
            .find(fg => fg.rootElem.querySelector("[class*='text-field--']") === this.rootElem);
        this.inputs.forEach((input, index, arr) => {
            if (index === arr.length - 1) input.addEventListener("keydown", this.onLastInputKeydown);
            input.addEventListener("input", this.typeNumberOnly);
        });
    }
    onLastInputKeydown(event) {
        this.moveToLeft(event);
    }
    checkCompletion(preventEvent = false) {
        this.currentYear = new Date().getFullYear();
        let biggestMonths = [1, 3, 5, 7, 8, 10, 12];

        this.day = parseInt(this.inputDay.value);
        this.month = parseInt(this.inputMonth.value);
        this.year = parseInt(this.inputYear.value);

        let isCorrectDay = this.day >= 1 && this.day <= 31;
        let isCorrectMonth = this.month >= 1 && this.month <= 12;
        let isCorrectYear = this.year >= 1900 && this.year <= this.currentYear;

        if (this.month === 2 && this.year % 4 === 0) {
            if (this.year % 4 === 0) isCorrectDay = this.day >= 1 && this.day <= 29;
            if (this.year % 4 !== 0) isCorrectDay = this.day >= 1 && this.day <= 28;
        } else if (!biggestMonths.includes(this.month)) isCorrectDay = this.day >= 1 && this.day <= 30;

        let isValidDate = isCorrectDay && isCorrectMonth && isCorrectYear;

        if (isValidDate) this.isCompleted = true;
        else this.isCompleted = false;

        dispatchCompletionCheckEvent.call(this, preventEvent);

        const hasNotEmptyInput = Boolean(this.inputs.find(inp => inp.value));
        if (!this.isRequried && !hasNotEmptyInput) {
            this.rootElem.classList.remove("__uncompleted");
        }

        return this.isCompleted;
    }
    onChange(event) {
        super.onChange(event);
        this.inputs.forEach(input => {
            if (input.selectionStart === 0) return;
            if (input.getAttribute("maxlength") == 2 && input.value.length < 2)
                input.value = "0" + input.value;
        });
    }
    toggleUncompleteClass() {
        if (this.isCompleted) this.rootElem.classList.remove("__uncompleted");
        else if (this.isRequired) this.rootElem.classList.add("__uncompleted");
    }
    moveToLeft(event) {
        const input = event.target;
        const inputIndex = this.inputs.findIndex(i => i === input);
        const prevInput = this.inputs[inputIndex - 1];
        let totalValue = this.inputs.map(inp => inp.value).join("");
        const prevInputs = this.inputs.filter((inp, index) => index < inputIndex);

        if (event.key) {
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
    }
}

class TextFieldBirthDate extends TextFieldDate {
    constructor(node) {
        super(node);

        this.getAgeAndZodiacClasses();
        this.zodiacSigngs = [
            { name: "Водолей", startMonth: 1, startDay: 21, endDay: 18, iconName: "aquarius" },
            { name: "Рыбы", startMonth: 2, startDay: 19, endDay: 20, iconName: "pisces" },
            { name: "Овен", startMonth: 3, startDay: 21, endDay: 19, iconName: "aries" },
            { name: "Телец", startMonth: 4, startDay: 20, endDay: 20, iconName: "taurus" },
            { name: "Близнецы", startMonth: 5, startDay: 21, endDay: 20, iconName: "gemini" },
            { name: "Рак", startMonth: 6, startDay: 21, endDay: 22, iconName: "cancer" },
            { name: "Лев", startMonth: 7, startDay: 23, endDay: 22, iconName: "leo" },
            { name: "Дева", startMonth: 8, startDay: 23, endDay: 22, iconName: "virgo" },
            { name: "Весы", startMonth: 9, startDay: 23, endDay: 22, iconName: "libra" },
            { name: "Скорпион", startMonth: 10, startDay: 23, endDay: 21, iconName: "scorpio" },
            { name: "Стрелец", startMonth: 11, startDay: 22, endDay: 21, iconName: "sagittarius" },
            { name: "Козерог", startMonth: 12, startDay: 22, endDay: 20, iconName: "capicorn" },
        ];
        this.uncompletedText = this.rootElem.closest(".forms__fields-group")
            .querySelector(".field__uncompleted");
        this.currentYear = new Date().getFullYear();

        this.minYearSpan = this.uncompletedText.querySelector(".birthdate-min-year");
        this.maxYearSpan = this.uncompletedText.querySelector(".birthdate-max-year");
        this.minYear = this.currentYear - 90;
        this.maxYear = this.currentYear - 14;
        this.minYearSpan.textContent = this.minYear.toString();
        this.maxYearSpan.textContent = this.maxYear.toString();
    }
    getAgeAndZodiacClasses() {
        setTimeout(() => {
            this.ageClass = this.fieldsGroup.fields
                .find(fd => fd.input.getAttribute("name") === "age");
            this.zodiacClass = this.fieldsGroup.fields
                .find(fd => fd.input.getAttribute("name") === "zodiac");
            this.ageInput = this.ageClass.input;
            this.zodiacInput = this.zodiacClass.input;
        }, 150);
    }
    checkCompletion(preventEvent) {
        super.checkCompletion(preventEvent);

        const userYear = parseInt(this.inputs[2].value);
        if (userYear < this.minYear || userYear > this.maxYear) this.isCompleted = false;

        if (!this.isCompleted) {
            this.unsetZodiacAndAge();
            return;
        } else {
            this.rootElem.classList.remove("__uncompleted");
        }

        this.setZodiacAndAge();
        dispatchCompletionCheckEvent.call(this, preventEvent);
        return this.isCompleted;
    }
    setZodiacAndAge() {
        const zodiac = this.zodiacSigngs
            .filter(zs => zs.startMonth == this.month || zs.startMonth + 1 == this.month)
            .find((zs, index, array) => {
                const nextZs = array[index + 1];
                if (nextZs) {
                    if (this.day >= zs.startDay && this.day <= nextZs.endDay) return true;
                    if (this.day < zs.startDay) return true;
                } else return true;
            });
        const zodiacValue = zodiac ? zodiac.name : "";
        const age = new Date().getFullYear() - this.year;

        this.ageClass.checkCompletion(true);
        this.zodiacClass.checkCompletion(true);

        if (this.ageInput) {
            this.ageInput.value = age;
            this.ageClass.rootElem.classList.add("__completed");
        }
        if (this.zodiacInput) {
            const zodiacIconInner = `<svg><use xlink:href="#${zodiac.iconName}"></use></svg>`;
            const zodiacIcon = createElement("span", "zodiac-icon", zodiacIconInner);

            const oldZodiacIcons = this.zodiacInput.parentNode.querySelectorAll(".zodiac-icon");
            oldZodiacIcons.forEach(zi => zi ? zi.remove() : false);
            this.zodiacInput.before(zodiacIcon);
            this.zodiacInput.value = zodiacValue;

            this.zodiacClass.rootElem.classList.add("__completed");
        }
    }
    unsetZodiacAndAge() {
        this.ageInput.value = "";
        this.zodiacInput.value = "";
        let zodiacIcon = findClosest(this.zodiacInput, ".zodiac-icon");
        if (zodiacIcon) zodiacIcon.remove();

        this.ageClass.rootElem.classList.remove("__completed");
        this.zodiacClass.rootElem.classList.remove("__completed");
    }
}

class TextFieldPhone extends TextFieldMulti {
    constructor(node) {
        super(node);
        this.findClosestEmpty = this.findClosestEmpty.bind(this);
    }
    init() {
        super.init();
        this.rootElem.addEventListener("click", this.findClosestEmpty);
        this.inputs.forEach(input => {
            input.addEventListener("input", this.typeNumberOnly);
        });
    }
    findClosestEmpty(event) {
        if (this.inputs.includes(event.target)) {
            if (event.target.value) return;
        };

        const closestEmpty = this.inputs.find(input => {
            return input.value.length < input.getAttribute("maxlength");
        }) || this.inputs[this.inputs.length - 1];
        if (closestEmpty) closestEmpty.focus();
    }
    checkCompletion(preventEvent) {
        if (!this.inputs) return;

        const uncompleted = this.inputs.filter(input => {
            return input.value.length < input.getAttribute("maxlength");
        });
        if (uncompleted.length < 1) {
            this.isCompleted = true;
            this.rootElem.classList.add("__completed");
        } else {
            this.isCompleted = false;
            this.rootElem.classList.remove("__completed");
        }

        const allInputsEmpty = Boolean(
            this.inputs.find(input => input.value.length > 0)
        ) === false;

        if (allInputsEmpty && !this.isRequired) {
            this.rootElem.classList.remove("__uncompleted");
        }

        dispatchCompletionCheckEvent.call(this, preventEvent);

        return this.isCompleted;
    }
    createLayout() {
        return `
            <div class="text-field__input-multi">
                <span class="text-field__input-multi-delimiter">+7</span>
                <span class="text-field__input-multi-delimiter">(</span>
                <input class="text-field__input-subfield" type="text" placeholder="___"
                    maxlength="3">
                <span class="text-field__input-multi-delimiter">)</span>
                <input class="text-field__input-subfield" type="text" placeholder="___"
                    maxlength="3">
                <span class="text-field__input-multi-delimiter">-</span>
                <input class="text-field__input-subfield" type="text" placeholder="__"
                    maxlength="2">
                <span class="text-field__input-multi-delimiter">-</span>
                <input class="text-field__input-subfield"
                    type="text" placeholder="__" maxlength="2">
                <input type="hidden" class="text-field__input" id="phone-number"
                    name="phone-number">
            </div>
            <div class="selctexit_btn text-field__input-close">
                <div class="exitlin_wrapper">
                    <div class="exit_line"></div>
                    <div class="exit_line"></div>
                </div>
                <div class="selctexit_btn_hint">
                    Очистить поле?
                </div>
            </div>
        `;
    }
}

// Комбинированное поле: и текстовое, и селект
class TextFieldSelect {
    constructor(node) {
        this.toggleOptions = this.toggleOptions.bind(this);
        this.hideOptions = this.hideOptions.bind(this);
        this.showOptions = this.showOptions.bind(this);
        this.showMatches = this.showMatches.bind(this);
        this.setValue = this.setValue.bind(this);
        this.onInput = this.onInput.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.refresh = this.refresh.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");
        this.input = this.rootElem.querySelector(".text-field__input");
        this.inputWrapper = this.rootElem.querySelector(".text-field__input-wrapper");
        this.inputRefresh = this.rootElem.querySelector(".text-field__input-close");
        this.input.addEventListener("input", this.onInput);
        this.inputRefresh.addEventListener("click", this.refresh);
        this.valuesRange = this.input.dataset.textSelectRange;
        this.name = this.input.getAttribute("name");
        if (this.valuesRange) {
            this.valuesRange = this.valuesRange.split(", ");
            this.setRange();
        }

        this.getLabelsAndInputs();
        this.input.addEventListener("focus", this.onFocus);
        this.input.addEventListener("blur", this.onChange);
        this.input.addEventListener("input", this.onInput);
        this.input.addEventListener("click", () => {
            let textSelects = findInittedInput(".text-field--select", true);
            textSelects.forEach(tSelect => {
                if (tSelect.rootElem !== this.rootElem) tSelect.hideOptions();
            });
        });
    }
    onInput() {
        this.showMatches();
        this.checkCompletion();

        const val = this.input.value;
        if (!val) {
            this.inputWrapper.classList.remove("__active");
            return;
        }

        this.inputWrapper.classList.add("__active");
    }
    onChange() {
        setTimeout(() => {
            const value = this.input.value;
            if (this.inputs.find(inp => inp.value == value)) {
                this.rootElem.classList.add("__completed");
            }
        }, 100);
    }
    onFocus() {
        this.showOptions();
        this.rootElem.classList.remove("__completed");
    }
    refresh() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
    }
    getLabelsAndInputs() {
        this.labels = Array.from(this.rootElem.querySelectorAll(".multiselect__label"));
        this.inputs = this.labels.map(label => label.querySelector("input"));
        this.labels.forEach(label => {
            label.addEventListener("click", this.setValue);
        });
    }
    toggleOptions() {
        this.rootElem.classList.contains("select_active")
            ? this.hideOptions()
            : this.showOptions();
    }
    showOptions() {
        this.rootElem.classList.add("select_active");
    }
    hideOptions() {
        this.rootElem.classList.remove("select_active");
    }
    showMatches() {
        const val = this.input.value;
        if (!val) {
            this.labels.forEach(label => label.classList.remove("__removed"));
            return;
        }
        const smallestValue = this.inputs.map(inp => inp.value)
            .sort((val_1, val_2) => {
                if (val_1.length < val_2.length) return 1;
                if (val_1.length > val_2.length) return -1;
                return 0;
            })[0];
        if (val.length === smallestValue.length) {
            this.labels.forEach(label => label.classList.remove("__removed"));
            return;
        }


        this.labels.forEach(label => {
            const input = label.querySelector("input");
            if (input.value.includes(val)) label.classList.remove("__removed");
            else label.classList.add("__removed");
        });
    }
    setValue(event) {
        let label = event.target;
        if (!label.classList.contains("multiselect__label")) label = label.closest(".multiselect__label");
        const value = label.querySelector("input").value;
        if (value) this.input.value = value;
        this.input.dispatchEvent(new Event("input"));
        this.hideOptions();
    }
    setRange() {
        this.valuesRange = this.valuesRange.map(val => {
            val = val.toString();
            const currentYear = new Date().getFullYear();
            if (val === "currentYear") val = currentYear;
            if (val.toString().includes("currentYear -")) {
                const minusValue = parseInt(val.split("- ")[1]);
                val = currentYear - minusValue;
            }
            return parseInt(val);
        });

        let rangeStart = this.valuesRange[0];
        let rangeEnd = this.valuesRange[1];
        let name = this.name;

        let checkboxes = this.rootElem.querySelector(".checkboxes");
        if (!checkboxes) {
            checkboxes = createElement("div", "checkboxes");
            this.rootElem.append(checkboxes);
        }
        checkboxes.innerHTML = "";
        let checkboxesInner = createCheckboxesInner();
        checkboxes.insertAdjacentHTML("afterbegin", checkboxesInner);

        this.getLabelsAndInputs();

        function createCheckboxesInner() {
            let inner = "";
            let diff = Math.abs(rangeEnd - rangeStart);
            for (let i = 0; i <= diff; i++) {
                let val = rangeEnd - i;
                inner += `
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="${name}"
                        value="${val}" data-mselect-value="${val}">
                    ${val}
                </label>
                `;
            }
            return inner;
        }
    }
    checkCompletion(preventEvent = false) {
        const value = this.input.value;
        const possibleValues = this.labels.map(label => {
            return label.querySelector("input").value;
        });
        if (possibleValues.includes(value)) {
            this.isCompleted = true;
            this.rootElem.classList.remove("__uncompleted");
        } else {
            this.isCompleted = false;
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
        }
        dispatchCompletionCheckEvent.call(this, preventEvent);
        this.rootElem.classList.remove("__completed");

        return this.isCompleted;
    }
}

// поле, создающее теги
class TextFieldTags extends TextField {
    constructor(node) {
        super(node);

        this.addTag = this.addTag.bind(this);
        this.removeTag = this.removeTag.bind(this);
        this.addedTags = [];
        this.counter = 0;

        this.addButton = this.rootElem.querySelector(".text-field__add-button");

        this.addButton.addEventListener("click", this.addTag);
        this.input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") this.addTag(event);
        });
    }
    addTag(event) {
        event.preventDefault();
        const value = this.input.value;
        if (!value) return;
        const alreadyExists = this.addedTags.find(tagData => tagData.value === value);
        if (alreadyExists) return;

        if (!this.tagsListBlock) this.createTagsListBlock();

        const tagInner = `
            <span class="tags-list__item-text" data-title="${value}">${value}</span>
            <input name="responsibilities_1" type="hidden" disabled="" value="${value}">
            <button class="tags-list__item-remove icon-close"></button>
        `;
        const tag = createElement("li", "tags-list__item", tagInner);
        this.tagsListBlock.append(tag);
        this.counter++;
        tag.dataset.tagId = this.counter;
        tag.querySelector(".tags-list__item-remove").addEventListener("click", this.removeTag);
        this.addedTags.push({ tag, value, id: this.counter });
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.checkCompletion();
    }
    removeTag(event) {
        const tag = event.target.closest(".tags-list__item");
        const tagId = parseInt(tag.dataset.tagId);
        this.addedTags = this.addedTags
            .filter(tagData => tagData.id !== tagId);
        tag.remove();
        if (!this.addedTags.length) {
            this.tagsListBlock.remove();
            this.tagsListBlock = null;
        }
        this.checkCompletion();
    }
    createTagsListBlock() {
        this.tagsListBlock = createElement("ul", "tags-list");
        this.rootElem.append(this.tagsListBlock);
    }
    onChange(event) {
        super.onChange(event);
        this.rootElem.classList.remove("__completed");
    }
    checkCompletion() {
        if (this.addedTags.length > 0) {
            this.isCompleted = true;
            this.rootElem.classList.remove("__uncompleted");
        } else {
            this.isCompleted = false;
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
        }

        this.rootElem.classList.remove("__completed");

        return this.isCompleted;
    }
}

// Добавить новую группу полей
class AddField {
    constructor(node) {
        this.addField = this.addField.bind(this);
        this.removeField = this.removeField.bind(this);

        this.rootElem = node;
        this.fieldTitle = this.rootElem.dataset.addField;
        this.insertTo = this.rootElem.parentNode;
        this.fields = [];
        this.counter = 0;
        this.titleBlock =
            this.rootElem.parentNode.querySelector(`[data-add-field-title="${this.fieldTitle}"]`);
        if (this.titleBlock) this.titleBlock.classList.add("__removed");

        this.rootElem.addEventListener("click", this.addField);
        setTimeout(() => this.setRange(), 0);
    }
    addField() {
        if (this.fields.length >= this.maxFieldsAmount) return;

        this.counter++;
        const fieldInner = this.getFieldInner();
        const field = createElement("div", "add-field__container bordered-field", fieldInner);
        this.insertTo.append(field);
        field.dataset.addFieldId = this.counter;
        const removeButton = this.createRemoveButton(field);
        field.before(removeButton);
        field.after(this.rootElem);
        this.fields.push({ field, removeButton, id: this.counter });

        if (this.titleBlock) this.titleBlock.classList.remove("__removed");
        if (this.fields.length >= this.maxFieldsAmount) this.rootElem.classList.add("__removed");

        return field;
    }
    createRemoveButton(field) {
        const removeButton = createElement("div", "add-field__remove-button icon-bin", "Удалить блок");
        removeButton.addEventListener("click", () => {
            this.removeField({ field, removeButton, id: this.counter });
        });
        return removeButton;
    }
    removeField(fieldData) {
        new ConfrimPopup({
            title: "Удалить блок?",
            body: ["Будет удален выбранный блок"],
            confirm: { text: "Удалить", callback: doRemove.bind(this) },
            decline: { text: "Не удалять" }
        });

        function doRemove() {
            fieldData.field.remove();
            fieldData.removeButton.remove();
            this.fields = this.fields.filter(fd => fd.field.closest("body"));
            this.rootElem.classList.remove("__removed");
            if (this.fields.length < 1
                && this.titleBlock
            ) this.titleBlock.classList.add("__removed");
        }
    }
    setRange() {
        let addFieldsRange = this.rootElem.dataset.addFieldsRange;
        if (!addFieldsRange) return;

        addFieldsRange = addFieldsRange.split(", ");
        this.minFieldsAmount = parseInt(addFieldsRange[0]);
        this.maxFieldsAmount = parseInt(addFieldsRange[1]);

        if (this.minFieldsAmount > 0) this.setMinFieldsAmount();
    }
    setMinFieldsAmount() {
        for (let i = 0; i < this.minFieldsAmount; i++) {
            this.addField();
            this.fields[i].removeButton.remove();
            delete this.fields[i].removeButton;
        }
    }
}
class AddFieldSchool extends AddField {
    constructor(node) {
        super(node);
    }
    getFieldInner() {
        return `
        <div class="forms__fields-group">
            <div
                class="text-field text-field--standard forms__fields-item forms__fields-item--full">
                <label for="education-school_city-${this.counter}" class="field-label">Город</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-school_city-${this.counter}" name="education-school_city" placeholder="Город" data-complete-length="1, 25" aria-label="Город">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите город</p>
            </div>
        </div>
        <div class="forms__fields-group forms__fields-group-margin">
            <p class="field__name">Период обучения</p>
            <div class="forms__fields-item field forms__fields-item--dates">
                <div class="text-field--date forms__fields-item">
                    <label for="school-start-day-${this.counter}" class="field-label">Начало обучения</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="school-start-day-${this.counter}" id="school-start-day-${this.counter}" placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="school-start-month-${this.counter}" id="school-start-month-${this.counter}" placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="school-start-year-${this.counter}" id="school-start-year-${this.counter}" placeholder="гггг">
                        </div>
                    </div>
                    <input type="hidden" class="text-field__input" id="school-start-date-${this.counter}"
                        name="school-start-date-${this.counter}" data-complete-length="1, 25" aria-label="Начало обучения">
                </div>
                <div class="text-field--date forms__fields-item">
                    <label for="school-end-day-${this.counter}" class="field-label">Окончание</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="school-end-day-${this.counter}" id="school-end-day-${this.counter}" placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="school-end-month-${this.counter}" id="school-end-month-${this.counter}" placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="school-end-year-${this.counter}" id="school-end-year-${this.counter}" placeholder="гггг">
                        </div>
                    </div>
                    <input type="hidden" class="text-field__input" id="school-end-date-${this.counter}"
                        name="school-end-date-${this.counter}" data-complete-length="1, 25" aria-label="Дата окончания обучения">
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите период обучения.</p>
        </div>
        <div class="forms__fields-group">
            <div class="text-field text-field--standard forms__fields-item">
                <label for="school-number_title-${this.counter}" class="field-label">Номер и название
                    школы</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="school-number_title-${this.counter}"
                        name="school-number_title-${this.counter}" placeholder="Например: ООШ №20"
                        data-complete-length="1, 25" aria-label="Номер и название школы">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
            </div>
            <div class="forms__fields-item field">
                <div class="multiselect multiselect--standard forms__fields-item forms__fields-item--full" data-aria-label="Наличие медали">
                    <label class="field-label">
                        Наличие медали
                    </label>
                    <div class="selectBox">
                        <div class="selectBox_wrapper">
                            <div class="selectBox_value-text">Наличие медали</div>
                            <div class="overSelect"></div>
                        </div>
                        <div class="selctexit_btn">
                            <div class="exitlin_wrapper">
                                <div class="exit_line"></div>
                                <div class="exit_line"></div>
                            </div>
                            <div class="selctexit_btn_hint">
                                Очистить поле?
                            </div>
                        </div>
                    </div>
                    <div class="checkboxes">
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="school-medal-${this.counter}"
                                value="no" data-mselect-value="Нет">
                            Нет
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="school-medal-${this.counter}"
                                value="gold" data-mselect-value="Золотая">
                            Золотая
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="school-medal-${this.counter}"
                                value="silver" data-mselect-value="Серебряная">
                            Серебряная
                        </label>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}
class AddFieldEducationSec extends AddField {
    constructor(node) {
        super(node);
    }
    getFieldInner() {
        return `
        <div class="forms__fields-group">
            <div
                class="text-field text-field--standard forms__fields-item">
                <label for="education-sec-title-${this.counter}" class="field-label">Название учебного
                    заведения</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-sec-title-${this.counter}"
                    name="education-sec-title-${this.counter}" placeholder="Название учебного заведения"
                    data-complete-length="1, 25" aria-label="Название учебного заведения">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите название учебного заведения
                </p>
            </div>
            <div
                class="text-field text-field--standard forms__fields-item">
                <label for="education-sec-speciality-${this.counter}" class="field-label">Специальность</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-sec-speciality-${this.counter}"
                    name="education-sec-speciality-${this.counter}" placeholder="Специальность"
                    data-complete-length="1, 25" aria-label="Специальность">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">
                    Пожалуйста, укажите специальность
                </p>
            </div>
        </div>
        <div class="forms__fields-group forms__fields-group-margin">
            <p class="field__name">Период обучения</p>
            <div class="forms__fields-item field forms__fields-item--dates">
                <div class="text-field--date forms__fields-item">
                    <label for="school-start-day-${this.counter}" class="field-label">Начало обучения</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-sec-start-day-${this.counter}" id="education-sec-start-day-${this.counter}"
                                placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-sec-start-month-${this.counter}" id="education-sec-start-month-${this.counter}"
                                placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="education-sec-start-year-${this.counter}" id="education-sec-start-year-${this.counter}"
                                placeholder="гггг">
                        </div>
                    </div>
                    <input type="hidden" class="text-field__input" id="birthdate-${this.counter}"
                        name="birthdate-${this.counter}" placeholder="Дата рождения"
                        data-complete-length="1, 25" aria-label="Дата рождения">
                </div>
                <div class="text-field--date forms__fields-item">
                    <label for="education-sec-end-day-${this.counter}" class="field-label">Окончание</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-sec-end-day-${this.counter}" id="education-sec-end-day-${this.counter}"
                                placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-sec-end-month-${this.counter}" id="education-sec-end-month-${this.counter}"
                                placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="education-sec-end-year-${this.counter}" id="education-sec-end-year-${this.counter}"
                                placeholder="гггг">
                        </div>
                    </div>
                    <input type="hidden" class="text-field__input" id="birthdate-${this.counter}"
                        name="birthdate-${this.counter}" placeholder="Дата рождения"
                        data-complete-length="1, 25" aria-label="Дата рождения">
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите период обучения.</p>
        </div>
        <div class="forms__fields-group">
            <div class="multiselect multiselect--standard forms__fields-item">
                <label class="field-label">
                    Форма обучения
                </label>
                <div class="selectBox">
                    <div class="selectBox_wrapper">
                        <div class="selectBox_value-text">Форма обучения</div>
                        <div class="overSelect"></div>
                    </div>
                    <div class="selctexit_btn">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <div class="checkboxes">
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="education-sec-form-${this.counter}"
                            value="full-time" data-mselect-value="Очная">
                        Очная
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="education-sec-form-${this.counter}"
                            value="extramural" data-mselect-value="Заочная">
                        Заочная
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="education-sec-form-${this.counter}"
                            value="combined" data-mselect-value="Очно-заочная">
                        Очно-заочная
                    </label>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите форму обучения.</p>
            </div>
            <div class="multiselect multiselect--standard forms__fields-item">
                <label class="field-label">
                    Наличие красного диплома
                </label>
                <div class="selectBox">
                    <div class="selectBox_wrapper">
                        <div class="selectBox_value-text">Наличие красного диплома</div>
                        <div class="overSelect"></div>
                    </div>
                    <div class="selctexit_btn">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <div class="checkboxes">
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="red diploma-${this.counter}"
                            value="yes" data-mselect-value="Есть">
                        Есть
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="red diploma-${this.counter}"
                            value="no" data-mselect-value="Нет">
                        Нет
                    </label>
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите наличие красного диплома.</p>
        </div>
        <div class="forms__fields-group">
            <div
                class="text-field text-field--standard forms__fields-item forms__fields-item--full">
                <label for="education-sec-qualification-${this.counter}" class="field-label">Квалификация,
                    профессия</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-sec-qualification-${this.counter}"
                    name="education-sec-qualification-${this.counter}" placeholder="Квалификация, профессия"
                    data-complete-length="1, 25" aria-label="Квалификация,
                    профессия">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">
                    Пожалуйста, укажите квалификацию, профессию
                </p>
            </div>
        </div>
        `;
    }
}
class AddFieldEducationHigher extends AddField {
    constructor(node) {
        super(node);
    }
    getFieldInner() {
        return `
        <div class="forms__fields-group">
            <div
                class="text-field text-field--standard forms__fields-item forms__fields-item--full">
                <label for="education-higher-title-${this.counter}" class="field-label">Название учебного
                    заведения</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-higher-title-${this.counter}"
                    name="education-higher-title-${this.counter}" placeholder="Название учебного заведения"
                    data-complete-length="1, 25" aria-label="Название учебного заведения">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите название учебного заведения
                </p>
            </div>
        </div>
        <div class="forms__fields-group">
            <div
                class="text-field text-field--standard forms__fields-item forms__fields-item--full">
                <label for="education-higher-speciality-${this.counter}"
                    class="field-label">Специальность</label>
                <div class="text-field__input-wrapper">
                    <input type="text" class="text-field__input" id="education-higher-speciality-${this.counter}"
                    name="education-higher-speciality-${this.counter}" placeholder="Специальность"
                    data-complete-length="1, 25" aria-label="Специальность">
                    <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <p class="field__uncompleted">
                    Пожалуйста, укажите специальность
                </p>
            </div>
        </div>
        <div class="forms__fields-group forms__fields-group-margin">
            <p class="field__name">Период обучения</p>
            <div class="forms__fields-item field forms__fields-item--dates">
                <div class="text-field--date forms__fields-item">
                    <label for="school-start-day-${this.counter}" class="field-label">Начало обучения</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-higher-start-day-${this.counter}" id="education-higher-start-day-${this.counter}"
                                placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-higher-start-month-${this.counter}"
                                id="education-higher-start-month-${this.counter}" placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="education-higher-start-year-${this.counter}" id="education-higher-start-year-${this.counter}"
                                placeholder="гггг">
                        </div>
                    </div>
                     <input type="hidden" class="text-field__input" id="birthdate-${this.counter}"
                        name="birthdate-${this.counter}" placeholder="Начало обучения"
                        data-complete-length="1, 25" aria-label="Начало обучения">
                </div>
                <div class="text-field--date forms__fields-item">
                    <label for="education-higher-end-day-${this.counter}" class="field-label">Окончание</label>
                    <div class="text-field__input-wrapper text-field__input-wrapper--multi">
                        <div class="text-field__input-multi">
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-higher-end-day-${this.counter}" id="education-higher-end-day-${this.counter}"
                                placeholder="дд">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="2" type="text"
                                name="education-higher-end-month-${this.counter}" id="education-higher-end-month-${this.counter}"
                                placeholder="мм">
                            <span class="text-field__input-multi-delimiter">.</span>
                            <input class="text-field__input-subfield" maxlength="4" type="text"
                                name="education-higher-end-year-${this.counter}" id="education-higher-end-year-${this.counter}"
                                placeholder="гггг">
                        </div>
                    </div>
                    <input type="hidden" class="text-field__input" id="education-higher-${this.counter}"
                        name="education-higher-${this.counter}" placeholder="Окончание обучения"
                        data-complete-length="1, 25" aria-label="Окончание обучения">
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите период обучения.</p>
        </div>
        <div class="forms__fields-group">
            <div class="multiselect multiselect--standard forms__fields-item">
                <label class="field-label">
                    Форма обучения
                </label>
                <div class="selectBox">
                    <div class="selectBox_wrapper">
                        <div class="selectBox_value-text">Форма обучения</div>
                        <div class="overSelect"></div>
                    </div>
                    <div class="selctexit_btn">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <div class="checkboxes">
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-form-${this.counter}" value="full-time"
                            data-mselect-value="Очная">
                        Очная
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-form-${this.counter}" value="extramural"
                            data-mselect-value="Заочная">
                        Заочная
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-form-${this.counter}" value="combined"
                            data-mselect-value="Очно-заочная">
                        Очно-заочная
                    </label>
                </div>
            </div>
            <div class="multiselect multiselect--standard forms__fields-item">
                <label class="field-label">
                    Квалификация высшего образования
                </label>
                <div class="selectBox">
                    <div class="selectBox_wrapper">
                        <div class="selectBox_value-text">Квалификация высшего образования</div>
                        <div class="overSelect"></div>
                    </div>
                    <div class="selctexit_btn">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <div class="checkboxes">
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-qualification-${this.counter}" value="full-time"
                            data-mselect-value="Бакалавр">
                        Бакалавр
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-qualification-${this.counter}" value="extramural"
                            data-mselect-value="Специалист">
                        Специалист
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio"
                            name="education-highest-qualification-${this.counter}" value="combined"
                            data-mselect-value="Магистр">
                        Магистр
                    </label>
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите квалификацию.</p>
        </div>
        <div class="forms__fields-group">
            <div class="multiselect multiselect--standard forms__fields-item multiselect--standard forms__fields-item--full">
                <label class="field-label">
                    Наличие красного диплома
                </label>
                <div class="selectBox">
                    <div class="selectBox_wrapper">
                        <div class="selectBox_value-text">Наличие красного диплома</div>
                        <div class="overSelect"></div>
                    </div>
                    <div class="selctexit_btn">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                </div>
                <div class="checkboxes">
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="red diploma-${this.counter}"
                            value="yes" data-mselect-value="Есть">
                        Есть
                    </label>
                    <label class="multiselect__label">
                        <input class="checrkradio_hidden" type="radio" name="red diploma-${this.counter}"
                            value="no" data-mselect-value="Нет">
                        Нет
                    </label>
                </div>
            </div>
            <p class="field__uncompleted">Пожалуйста, укажите наличие красного диплома.</p>
        </div>
        `;
    }
}
class AddFieldWorkplace extends AddField {
    constructor(node) {
        super(node);
    }
    getFieldInner() {
        return `
            <div class="forms__fields-group">
                <div
                    class="text-field text-field--standard forms__fields-item">
                    <label for="company-title" class="field-label">Название компании</label>
                    <div class="text-field__input-wrapper">
                        <input type="text" class="text-field__input" id="company-title" name="company-title"
                        placeholder="Название компании" data-complete-length="1, 25"
                        aria-label="Название компании">
                        <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                    </div>
                    <p class="field__uncompleted">
                        Пожалуйста, укажите название компании.
                    </p>
                </div>
                <div
                    class="text-field text-field--standard forms__fields-item">
                    <label for="company-post" class="field-label">Должность</label>
                    <div class="text-field__input-wrapper">
                        <input type="text" class="text-field__input" id="company-post" name="company-post"
                        placeholder="Должность" data-complete-length="1, 25" aria-label="Должность">
                        <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                    </div>
                    <p class="field__uncompleted">
                        Пожалуйста, укажите должность.
                    </p>
                </div>
            </div>
            <div class="forms__fields-group forms__fields-group--flex">
                <p class="field__name">Начало работы</p>
                <div class="multiselect multiselect--standard forms__fields-item">
                    <div class="selectBox">
                        <div class="selectBox_wrapper">
                            <div class="selectBox_value-text">Месяц</div>
                            <div class="overSelect"></div>
                        </div>
                        <div class="selctexit_btn">
                            <div class="exitlin_wrapper">
                                <div class="exit_line"></div>
                                <div class="exit_line"></div>
                            </div>
                            <div class="selctexit_btn_hint">
                                Очистить поле?
                            </div>
                        </div>
                    </div>
                    <div class="checkboxes">
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="january" data-mselect-value="Январь">
                            Январь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="february" data-mselect-value="Февраль">
                            Февраль
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="march" data-mselect-value="Март">
                            Март
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="april" data-mselect-value="Апрель">
                            Апрель
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="may" data-mselect-value="Май">
                            Май
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="june" data-mselect-value="Июнь">
                            Июнь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="july" data-mselect-value="Июль">
                            Июль
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="august" data-mselect-value="Август">
                            Август
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="september" data-mselect-value="Сентябрь">
                            Сентябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="october" data-mselect-value="Октябрь">
                            Октябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="november" data-mselect-value="Ноябрь">
                            Ноябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-start-month-${this.counter}"
                                value="december" data-mselect-value="Декабрь">
                            Декабрь
                        </label>
                    </div>
                </div>
                <div class="text-field--select forms__fields-item">
                    <div class="text-field__input-wrapper">
                        <input type="text" class="text-field__input" id="work-start-year-${this.counter}"
                        name="work-start-year-${this.counter}" placeholder="Год" data-complete-length="1, 25"
                        aria-label="Год начала работы" data-text-select-range="1990, currentYear">
                        <div class="selctexit_btn text-field__input-close">
                        <div class="exitlin_wrapper">
                            <div class="exit_line"></div>
                            <div class="exit_line"></div>
                        </div>
                        <div class="selctexit_btn_hint">
                            Очистить поле?
                        </div>
                    </div>
                    </div>
                    <div class="checkboxes">
        
                    </div>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите начало работы.</p>
            </div>
            <div class="forms__fields-group forms__fields-group--flex">
                <p class="field__name">Конец работы</p>
                <div class="checkbox">
                    <input type="checkbox" name="work-end-period_now-${this.counter}" id="work-end-period_now-${this.counter}" data-optional-checkbox="hide, work-end-period-${this.counter}">
                    <label for="work-end-period_now-${this.counter}" class="checkbox__value">
                        <span class="checkbox__icon"></span>
                        По настоящее время
                    </label>
                </div>
                <div class="multiselect multiselect--standard forms__fields-item" data-optional="work-end-period-${this.counter}">
                    <div class="selectBox">
                        <div class="selectBox_wrapper">
                            <div class="selectBox_value-text">Месяц</div>
                            <div class="overSelect"></div>
                        </div>
                        <div class="selctexit_btn">
                            <div class="exitlin_wrapper">
                                <div class="exit_line"></div>
                                <div class="exit_line"></div>
                            </div>
                            <div class="selctexit_btn_hint">
                                Очистить поле?
                            </div>
                        </div>
                    </div>
                    <div class="checkboxes">
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="january" data-mselect-value="Январь">
                            Январь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="february" data-mselect-value="Февраль">
                            Февраль
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="march" data-mselect-value="Март">
                            Март
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="april" data-mselect-value="Апрель">
                            Апрель
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="may" data-mselect-value="Май">
                            Май
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="june" data-mselect-value="Июнь">
                            Июнь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="july" data-mselect-value="Июль">
                            Июль
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="august" data-mselect-value="Август">
                            Август
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="september" data-mselect-value="Сентябрь">
                            Сентябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="october" data-mselect-value="Октябрь">
                            Октябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="november" data-mselect-value="Ноябрь">
                            Ноябрь
                        </label>
                        <label class="multiselect__label">
                            <input class="checrkradio_hidden" type="radio" name="work-end-month-${this.counter}"
                                value="december" data-mselect-value="Декабрь">
                            Декабрь
                        </label>
                    </div>
                </div>
                <div class="text-field--select forms__fields-item" data-optional="work-end-period-${this.counter}">
                    <div class="text-field__input-wrapper">
                        <input type="text" class="text-field__input" id="work-end-year-${this.counter}"
                        name="work-end-year-${this.counter}" placeholder="Год" data-complete-length="1, 25"
                        aria-label="Год начала работы" data-text-select-range="1990, currentYear">
                        <div class="selctexit_btn text-field__input-close">
                            <div class="exitlin_wrapper">
                                <div class="exit_line"></div>
                                <div class="exit_line"></div>
                            </div>
                            <div class="selctexit_btn_hint">
                                Очистить поле?
                            </div>
                        </div>
                    </div>
                    <div class="checkboxes"></div>
                </div>
                <p class="field__uncompleted">Пожалуйста, укажите конец работы.</p>
            </div>
            <div class="forms__fields-group">
                <div class="text-field text-field--tags forms__fields-item forms__fields-item--full">
                    <label for="responsibilities-${this.counter}" class="field-label">Обязанности</label>
                    <div class="text-field__input-wrapper">
                        <input type="text" class="text-field__input" id="responsibilities"
                            name="responsibilities" placeholder="Введите обязанности"
                            data-complete-length="1, 25" aria-label="Обязанности">
                        <div class="selctexit_btn text-field__input-close">
                            <div class="exitlin_wrapper">
                                <div class="exit_line"></div>
                                <div class="exit_line"></div>
                            </div>
                            <div class="selctexit_btn_hint">
                                Очистить поле?
                            </div>
                        </div>
                    </div>
                    <button class="text-field__add-button icon-plus"></button>
                    <p class="field__uncompleted">Пожалуйста, укажите обязанности</p>
                </div>
            </div>
        `;
    }
}
class AddFieldChildren extends AddField {
    constructor(node) {
        super(node);
    }
    addField() {
        let field = super.addField();
        field.classList.remove("bordered-field");
    }
    getFieldInner() {
        return `
        <div class="multiselect multiselect--standard forms__fields-item forms__fields-item--full">
            <label class="field-label">
                Возраст ребенка
            </label>
            <div class="selectBox">
                <div class="selectBox_wrapper">
                    <div class="selectBox_value-text">Возраст ребенка</div>
                    <div class="overSelect"></div>
                </div>
                <div class="selctexit_btn">
                    <div class="exitlin_wrapper">
                        <div class="exit_line"></div>
                        <div class="exit_line"></div>
                    </div>
                    <div class="selctexit_btn_hint">
                        Очистить поле?
                    </div>
                </div>
            </div>
            <div class="checkboxes">
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="less-year" data-mselect-value="Меньше года">
                    Меньше года
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="1" data-mselect-value="1">
                    1
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="2" data-mselect-value="2">
                    2
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="3" data-mselect-value="3">
                    3
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="4" data-mselect-value="4">
                    4
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="5" data-mselect-value="5">
                    5
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="6" data-mselect-value="6">
                    6
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="7" data-mselect-value="7">
                    7
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="8" data-mselect-value="8">
                    8
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="9" data-mselect-value="9">
                    9
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="10" data-mselect-value="10">
                    10
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="11" data-mselect-value="11">
                    11
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="12" data-mselect-value="12">
                    12
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="13" data-mselect-value="13">
                    13
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="14" data-mselect-value="14">
                    14
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="15" data-mselect-value="15">
                    15
                </label>
                <label class="multiselect__label">
                    <input class="checrkradio_hidden" type="radio" name="children-age-${this.counter}"
                        value="16" data-mselect-value="16">
                    16
                </label>
            </div>
        </div>
        <p class="field__uncompleted">Пожалуйста, укажите возраст ребенка.</p>
        `;
    }
}

// группа чекбоксов
class CheckboxesGroup {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");
        this.checkboxContainers = this.rootElem.querySelectorAll(".checkboxes-group__item");
        this.checkboxInputs = Array.from(this.rootElem.querySelectorAll(".checkboxes-group__checkbox"));

        this.getChecked();
        this.checkboxInputs.forEach(checkbox => {
            checkbox.addEventListener("change", this.onChange);
        });
    }
    onChange() {
        this.checkCompletion();
    }
    getChecked() {
        this.checked = this.checkboxInputs.filter(checkbox => checkbox.checked);
    }
    checkCompletion(preventEvent) {
        this.getChecked();
        if (this.checked.length > 0) {
            this.isCompleted = true;
            this.rootElem.classList.remove("__uncompleted");
        }
        else {
            this.isCompleted = false;
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
        }
        dispatchCompletionCheckEvent.call(this, preventEvent);

        return this.isCompleted;
    }
}

// в зависимости от состояния удаляет или добавляет поля
class CheckboxOptional {
    constructor(node) {
        this.onChange = this.onChange.bind(this);

        this.rootElem = node;
        this.data = this.rootElem.dataset.optionalCheckbox.split(", ");
        this.action = this.data[0];
        this.actionTargets = Array.from(document.querySelectorAll(`[data-optional="${this.data[1]}"]`))
            .map(target => {
                let anchor = createElement("div", "__removed");
                return { target, anchor };
            });

        this.rootElem.addEventListener("change", this.onChange);
        this.onChange();
    }
    onChange() {
        if (this.rootElem.checked) {
            this.action === "show" ? this.show() : this.hide();
        } else {
            this.action === "show" ? this.hide() : this.show();
        }
    }
    hide() {
        this.actionTargets.forEach(targetData => {
            targetData.target.replaceWith(targetData.anchor);
        });
    }
    show() {
        this.actionTargets.forEach(targetData => {
            targetData.anchor.replaceWith(targetData.target);
        });
    }
}

// аналог атрибута "title"
class Title {
    constructor(node) {
        this.showTitle = this.showTitle.bind(this);
        this.hideTitle = this.hideTitle.bind(this);

        this.rootElem = node;
        this.showingDur = 300;

        this.rootElem.addEventListener("pointerover", this.showTitle);
    }
    showTitle(event) {
        const node = event.target;
        let titleString = node.dataset.title;
        if (!titleString) titleString = node.textContent || node.innerText;

        const titleNode = createElement("div", "hover-title", titleString);
        const fontSize = getComputedStyle(this.rootElem).fontSize;
        titleNode.style.cssText = `
            transition: all ${this.showingDur / 1000}s; 
            opacity: 0; 
            font-size: ${fontSize}
        `;
        const alreadyHasTitleNode = node.querySelector(".hover-title");
        if (!alreadyHasTitleNode) node.append(titleNode);
        setTimeout(() => titleNode.style.opacity = "1", 0);
        node.addEventListener("pointerout", this.hideTitle);
    }
    hideTitle(event) {
        const node = event.target;
        const titleNode = node.querySelector(".hover-title");
        if (titleNode) {
            titleNode.style.opacity = "0";
            node.removeEventListener("pointerout", this.hideTitle);

            setTimeout(() => {
                titleNode.remove();
                this.hideTitle(event);
            }, this.showingDur);
        }
    }
}

// загрузка фото
class LoadImage {
    constructor(block) {
        this.rootElem = block;
        this.isRequired = this.rootElem.hasAttribute("data-completion-required");
        this.input = block.querySelector("input[type='file']");
        this.loadButton = block.querySelector(".load-image__button");
        this.contentBlock = block.querySelector(".load-image__content");
        this.img = block.querySelector("#load-image__preview");
        this.cutSquare = block.querySelector(".cut-square");
        this.cutCircle = block.querySelector(".cut-circle");
        this.closeButton = block.querySelector(".load-image__close");
        this.format = block.querySelector("#load-image__format");
        this.size = block.querySelector("#load-image__size");
        this.resolution = block.querySelector("#load-image__resolution");
        this.info = block.querySelector(".load-image__info");

        this.format.addEventListener("change", this.onInputChange.bind(this));
        this.size.addEventListener("change", this.onInputChange.bind(this));
        this.resolution.addEventListener("change", this.onInputChange.bind(this));

        this.cutSquareParams = new CutImage(this.cutSquare, 85);
        this.cutCircleParams = new CutImage(this.cutCircle, 85, true);

        this.info.classList.add("__removed");
        this.input.addEventListener("change", this.loadImage.bind(this));
        this.closeButton.addEventListener("click", this.remove.bind(this));

        this.hideContent();
    }
    onInputChange(event) {
        const input = event.target;
        const value = input.value;
        input.style.width = `${value.length / 1.5}em`;
    }
    loadImage() {
        const file = this.input.files[0];
        const reader = new FileReader();

        if (file) {
            reader.readAsDataURL(file);
            reader.onload = () => {
                const src = reader.result;
                this.img.src = src;
                const image = new Image();
                image.src = src;
                image.onload = () => {
                    this.setImgDataValues(file, image);
                    this.origSizes = { width: image.width, height: image.height };
                    this.checkCompletion();
                    this.showContent();
                    this.cutSquareParams.init(image);
                    this.cutCircleParams.init(image);
                }
            }
        }
    }
    hideContent() {
        this.contentBlock.classList.add("__removed");
        this.loadButton.classList.remove("__removed");
        this.info.classList.add("__removed");
    }
    showContent() {
        this.contentBlock.classList.remove("__removed");
        this.loadButton.classList.add("__removed");
        this.info.classList.remove("__removed");
    }
    remove() {
        this.input.value = "";
        this.hideContent();
        this.checkCompletion();
    }
    setImgDataValues(file, image) {
        const changeEvent = new Event("change");
        const splitName = file.name.split(".");
        this.format.value = splitName[splitName.length - 1];
        this.format.dispatchEvent(changeEvent);

        this.size.value = calcSize(file.size);
        this.size.dispatchEvent(changeEvent);

        this.resolution.value = image.naturalWidth.toString() + "x" + image.naturalHeight.toString();
        this.resolution.dispatchEvent(changeEvent);
    }
    checkCompletion() {
        if (this.input.files[0]) {
            this.isCompleted = true;
            this.rootElem.classList.remove("__uncompleted");
        }
        else {
            this.isCompleted = false;
            if (this.isRequired) this.rootElem.classList.add("__uncompleted");
        }

        return this.isCompleted;
    }
}
// обрезка фото
class CutImage {
    constructor(block, previewSize, isCircle = false) {
        this.block = block;
        // !при изменении this.previewSize менять размеры в стилях .load-image__circle, .load-image__square!
        this.isCircle = isCircle;
        this.previewSize = previewSize;
        this.img = block.querySelector(".load-image__small-img");
        this.scalePopupCoef = 5;
        this.cutButton = block.querySelector(".load-image__apply-edit");
        this.refreshButton = block.querySelector(".load-image__refresh-edit");
        this.downloadButton = block.querySelector(".load-image__download-edit");
        this.moveXButtonsBlock = block.querySelector(".load-image__move-x-buttons");
        this.moveYButtonsBlock = block.querySelector(".load-image__move-y-buttons");
        this.scaleButtonsBlock = block.querySelector(".load-image__scale-buttons");
        this.initDataTexts();

        this.img.ondragstart = () => false;
        this.img.addEventListener("pointerdown", (event) => {
            const onUp = (upEvent) => {
                if (upEvent.clientX === x && upEvent.clientY === y) this.createFullSize(true);
                this.img.removeEventListener("pointerup", onUp);
            }

            this.onPointerdown(event);
            const x = event.clientX;
            const y = event.clientY;
            this.img.addEventListener("pointerup", onUp);
        });

        this.cutButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.cut();
        });
        this.refreshButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.refresh();
        });
        this.downloadButton.addEventListener("click", (event) => {
            event.preventDefault();
            this.downloadCut();
        });

        this.downloadButton.classList.add("__removed");

        if (this.scaleButtonsBlock && this.moveYButtonsBlock && this.moveXButtonsBlock)
            this.initControlsButtons();
    }
    initDataTexts(format = null, size = null, resolution = null) {
        this.datablock = this.block.querySelector(".load-image__small-data");

        if (this.datablock) {
            this.format = this.datablock.querySelector(".load-image__small-data-format");
            this.size = this.datablock.querySelector(".load-image__small-data-size");
            this.resolution = this.datablock.querySelector(".load-image__small-data-resolution");

            if (!format && !size && !resolution) this.toggleDetails("hide");
            else {
                this.toggleDetails("show");
                this.format.textContent = format;
                this.size.textContent = size;
                this.resolution.textContent = resolution;
            }
        }
    }
    toggleDetails(action = "hide") {
        if (this.datablock) {
            if (action === "hide") this.datablock.classList.add("__removed");
            if (action === "show") this.datablock.classList.remove("__removed");
        }
    }
    downloadCut() {
        download = download.bind(this);
        downloadByRadio = downloadByRadio.bind(this);

        const popupBody = [
            `<div class="checkbox">
                <input type="radio" name="popup-window_download-type" id="download-original" value="origin">
                <label class="checkbox__value" for="download-original">
                    <span class="checkbox__icon"></span>
                    Скачать оригинальный размер
                </label>
            </div>
            <div class="checkbox">
                <input type="radio" name="popup-window_download-type" id="download-cut" value="cut">
                <label class="checkbox__value" for="download-cut">
                    <span class="checkbox__icon"></span>
                    Скачать уменьшенный размер
                </label>
            </div>
            `
        ];
        let confPopup = new ConfrimPopup({
            title: "Скачать изображение",
            body: popupBody,
            confirm: { callback: downloadByRadio, text: "Скачать" },
            decline: { text: "Отмена" }
        });
        let popupNode = confPopup.getPopup();

        function downloadByRadio() {
            const buttons = Array.from(popupNode.querySelectorAll("input[name='popup-window_download-type']"));
            const checked = buttons.find(btn => btn.checked) || { value: "cut" };
            const fullSizeData = this.createFullSize();
            const origFullSizeData = { width: this.origSizes.width, height: this.origSizes.height };

            let origImg;
            if (checked.value === "origin" || checked.value === "both")
                origImg = createOrigImg.call(this);

            switch (checked.value) {
                case "origin": download(origImg, origFullSizeData);
                    break;
                case "cut": download(fullSizeData.src, fullSizeData);
                    break;
            }
        }

        function createOrigImg() {
            const canvas = createElement("canvas");
            canvas.width = this.origSizes.width;
            canvas.height = this.origSizes.height;
            canvas.style.cssText = "position: absolute; z-index: -999;";

            const ctx = canvas.getContext("2d");
            ctx.drawImage(this.origImg, 0, 0);

            return canvas.toDataURL("image/png");
        }
        function download(src, fullSizeData = this.createFullSize()) {
            let downloadsData = JSON.parse(localStorage.getItem("vsevn_users_downloads"));
            if (!downloadsData) {
                localStorage.setItem("vsevn_users_downloads", "{}");
                downloadsData = JSON.parse(localStorage.getItem("vsevn_users_downloads"));
            }
            const userFullName = getFullUserName();
            const downloadsNumber = downloadsData[userFullName] || 1;
            const name = `
                ${userFullName}_${fullSizeData.width}x${fullSizeData.height}_000000000${downloadsNumber}
            `.trim();

            const link = createElement("a");
            link.download = name;
            link.href = src;
            link.click();

            downloadsData[userFullName] = downloadsNumber + 1;
            localStorage.setItem("vsevn_users_downloads", JSON.stringify(downloadsData));
        }
        function getFullUserName() {
            const userName = document.querySelector("input[name='name']").value || "Имя";
            const userSurname = document.querySelector("input[name='surname']").value || "Фамилия";
            const userPatronymic = document.querySelector("input[name='patronymic']").value || "";

            if (userPatronymic) return `${userName}-${userSurname}-${userPatronymic}`;
            else return `${userName}-${userSurname}`;
        }
    }
    init(origImg) {
        this.origImg = origImg;
        this.origSizes = { width: origImg.width, height: origImg.height };
        this.img.src = origImg.src;
        this.setImg(origImg.width, origImg.height);
        this.cutButton.classList.add("__removed");
        this.refresh();
    }
    setImg(imageWidth, imageHeight) {
        const coef = imageWidth / imageHeight;
        if (imageWidth !== imageHeight) {
            let width = coef * this.previewSize;
            let height = this.previewSize;
            if (width < 85) {
                const scaleVal = this.previewSize / width;
                width = width * scaleVal;
                height = height * scaleVal;
            }
            if (height < 85) {
                const scaleVal = this.previewSize / height;
                width = width * scaleVal;
                height = height * scaleVal;
            }
            this.img.width = width;
            this.img.height = height;
        }
        else if (imageWidth === imageHeight) {
            this.img.width = this.img.height = this.previewSize;
        }

        this.origSizesScaled = { width: this.img.width, height: this.img.height };

        this.movedX = 0;
        this.movedY = 0;
        this.scaled = 1;
        this.setTransform();
    }
    setTransform() {
        this.cutButton.classList.remove("__removed");
        this.img.style.transform =
            `translate(${this.movedX || 0}px, ${this.movedY || 0}px)`;
        this.img.width = this.origSizesScaled.width * this.scaled;
        this.img.height = this.origSizesScaled.height * this.scaled;
    }
    cut() {
        this.cutButton.classList.add("__removed");
        this.scaleMin = this.scaled;
        this.lastCutWidth = this.img.width;
        this.lastCutHeight = this.img.height;
        this.fixatedX = Math.abs(this.movedX);
        this.fixatedY = Math.abs(this.movedY);
        this.downloadButton.classList.remove("__removed");

        const canvasData = this.createFullSize(false);
        const size = calcSize(canvasData.src.length);
        const resolution = `${canvasData.width}x${canvasData.height}`;
        this.initDataTexts(canvasData.format, size, resolution);
    }
    refresh() {
        this.scaleMin = 1;
        this.scaled = 1;
        this.movedY = 0;
        this.movedX = 0;
        this.setTransform();
        this.lastCutWidth = 0;
        this.lastCutHeight = 0;
        this.fixatedX = 100;
        this.fixatedY = 100;
        this.scalePopup = this.scalePopupCoef / this.scaled;
        this.downloadButton.classList.add("__removed");
        this.toggleDetails("hide");
    }
    initControlsButtons() {
        const moveXButtons = this.moveXButtonsBlock.querySelectorAll("[class*='move-x-']");
        const moveYButtons = this.moveYButtonsBlock.querySelectorAll("[class*='move-y-']");
        const scaleButtons = this.scaleButtonsBlock.querySelectorAll("[class*='scale-']");

        moveXButtons.forEach(btn => btn.addEventListener("click", this.moveX.bind(this)));
        moveYButtons.forEach(btn => btn.addEventListener("click", this.moveY.bind(this)));
        scaleButtons.forEach(btn => btn.addEventListener("click", this.scale.bind(this)));
    }
    moveX(event) {
        const btn = event.target;
        if (btn.classList.contains("move-x-right")) this.moveTo("X", "-", 5);
        if (btn.classList.contains("move-x-left")) this.moveTo("X", "+", 5);
    }
    moveY(event) {
        const btn = event.target;
        if (btn.classList.contains("move-y-bottom")) this.moveTo("Y", "-", 5);
        if (btn.classList.contains("move-y-top")) this.moveTo("Y", "+", 5);
    }
    scale(event) {
        const btn = event.target;
        if (!this.scaleMin) this.scaleMin = 1;

        if (btn.classList.contains("scale-minus")) {
            if (this.scaled - 0.1 >= this.scaleMin) this.scaled -= 0.1;
            else return;
            this.movedY = this.movedX = 0;
            this.fixatedX = 100;
            this.fixatedY = 100;
            this.lastCutWidth = 0;
            this.lastCutHeight = 0;
        }
        if (btn.classList.contains("scale-plus")) {
            if (this.scaled + 0.1 <= 5) this.scaled += 0.1;
        }
        this.scalePopup = this.scalePopupCoef / this.scaled;
        this.setTransform();
    }
    onPointerdown(event) {
        let xOld = event.clientX;
        let yOld = event.clientY;

        const onMove = (moveEvent) => {
            let x = moveEvent.clientX;
            let y = moveEvent.clientY;

            if (x > xOld) this.moveTo("X", "+");
            if (x < xOld) this.moveTo("X", "-");

            if (y > yOld) this.moveTo("Y", "+");
            if (y < yOld) this.moveTo("Y", "-");

            xOld = x;
            yOld = y;
        }
        const onUp = () => {
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
        }

        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    }
    moveTo(coord, sign, step = 1) {
        const imgCoords = getCoords(this.img);
        const wrapperCoords = getCoords(this.img.parentNode);
        let nextMoved = this[`moved${coord}`]; // this[movedX,movedY]

        const widthCoef = this.img.width - this.lastCutWidth;
        const heightCoef = this.img.height - this.lastCutHeight;

        switch (sign) {
            case "+": nextMoved += step;
                break;
            case "-": nextMoved -= step;
                break;
        }
        if (sign === "-") step = step * (-1);

        if (coord === "Y") {
            const isInWrapper =
                imgCoords.top + step <= wrapperCoords.top
                && imgCoords.bottom + step >= wrapperCoords.bottom;
            const isInCutBorders =
                nextMoved <= this.fixatedY + heightCoef
                && nextMoved >= this.fixatedY - heightCoef;
            if (isInWrapper && isInCutBorders) this[`moved${coord}`] = nextMoved;
        }
        if (coord === "X") {
            const isInWrapper =
                imgCoords.left + step <= wrapperCoords.left
                && imgCoords.right + step >= wrapperCoords.right;
            const isInCutBorders =
                nextMoved <= this.fixatedX + widthCoef
                && nextMoved >= this.fixatedX - widthCoef;
            if (isInWrapper && isInCutBorders) this[`moved${coord}`] = nextMoved;
        }

        this.setTransform();
    }
    createFullSize(doShow = false) {
        const imgCoords = getCoords(this.img);
        const imgWrapperCoords = getCoords(this.img.parentNode);

        // нарисовать все изображение
        const canvasOrig = createElement("canvas");
        canvasOrig.width = this.origSizes.width * 2;
        canvasOrig.height = this.origSizes.height * 2;
        canvasOrig.style.cssText = "position: absolute; z-index: -99; opacity: 0";
        document.body.append(canvasOrig);
        const ctxOrig = canvasOrig.getContext("2d");
        ctxOrig.drawImage(this.origImg, 0, 0, this.origImg.width, this.origImg.height);

        // из всего изображения найти только выделенный квадрат/круг
        const previewCoefX = this.img.width / this.previewSize;

        const fullimageSize = this.origImg.width / previewCoefX;
        const ctxSize = fullimageSize;
        const canvasCut = createElement("canvas");
        canvasCut.width = ctxSize;
        canvasCut.height = ctxSize;
        canvasCut.style.cssText = "position: absolute; z-index: -99; opacity: 0";
        document.body.append(canvasCut);
        const ctxCut = canvasCut.getContext("2d");

        const previewDiffX = imgWrapperCoords.left - imgCoords.left;
        const previewDiffY = imgWrapperCoords.top - imgCoords.top;
        const sx = previewDiffX * (this.origImg.width / this.img.width);
        const sy = previewDiffY * (this.origImg.height / this.img.height);

        if (this.isCircle) {
            const x = canvasCut.width / 2;
            const y = canvasCut.height / 2;
            const radius = Math.min(x, y);

            ctxCut.beginPath();
            ctxCut.arc(x, y, radius, 0, 2 * Math.PI);
            ctxCut.closePath();
            ctxCut.fill();
            ctxCut.globalCompositeOperation = "source-in";
            ctxCut.drawImage(canvasOrig, sx, sy, ctxSize, ctxSize, 0, 0, ctxSize, ctxSize);
        } else {
            ctxCut.drawImage(canvasOrig, sx, sy, ctxSize, ctxSize, 0, 0, ctxSize, ctxSize);
        }

        const src = canvasCut.toDataURL("image/png");
        if (doShow) {
            let modalImage = new Image();
            modalImage.onload = () => {
                modalImage.dataset.popupFullimage = "";
                new FullImagePopup(modalImage).onImgClick();
            }
            modalImage.src = src;
        }

        canvasOrig.remove();
        canvasCut.remove();
        return { src, width: canvasCut.width, height: canvasCut.height, format: "PNG" };
    }
}

class Forms {
    constructor(node) {
        this.onSubmit = this.onSubmit.bind(this);

        this.rootElem = node;
        this.inputs = findInittedInputByFlag("new-resume", true);
        this.pageTitle = document.querySelector("h1.page-title");

        this.setEditResume();
        this.rootElem.addEventListener("submit", this.onSubmit);
    }
    onSubmit(event) {
        event.preventDefault();
        this.checkCompletion();
    }
    checkCompletion() {
        const inputs = findInittedInputByFlag("new-resume", true);
        const uncompleted = getUncompleted(inputs)
            .filter(inpClass => {
                let hasCompletionMethod = inpClass.checkCompletion;
                let isFieldsGroup = inpClass instanceof FieldsGroup;
                let isRequired = inpClass.isRequired;
                return hasCompletionMethod && !isFieldsGroup && isRequired;
            })
            .filter(inpClass => {
                let isCompleted = inpClass.checkCompletion(false);
                return isCompleted ? false : true;
            });
        if (uncompleted.length === 0) {
            const hrefTo = this.rootElem.dataset.formsHref;
            window.location.href = window.location.origin + hrefTo;
        }
    }
    setEditResume() {
        this.editingData = _localStorage.getItem("vsevn_applicant_data");
        let wasInSessionStorage = false;
        if (!this.editingData) {
            this.editingData = _sessionStorage.getItem("vsevn_applicant_data");
            wasInSessionStorage = true;
        }
        if (!this.editingData) return;

        this.pageTitle.innerHTML = "Редактировать резюме";
        setInputs.call(this);

        if (!wasInSessionStorage) {
            _sessionStorage.setItem("vsevn_applicant_data", this.editingData);
            _localStorage.removeItem("vsevn_applicant_data");
        }

        function setInputs() {
            this.editingData.forEach(data => {
                switch (data.key) {
                    case "birthdate":
                        setTimeout(() => {
                            const inputData = findInittedInput(".text-field--birthdate");
                            if (!inputData) return;
                            const inputs = inputData.inputs;
                            const value = data.value.replace(/\D/g, "");
                            if (inputs) {
                                spreadToInputs(inputs, value);
                                inputData.onChange();
                            }
                        }, 300);
                        break;
                    case "phone":
                        const inputData = findInittedInput(".text-field--phone");
                        if (!inputData) return;
                        const value = data.value.replace("+7", "").replace(/\s/g, "");
                        inputData.onInputTrapFocus();
                        const inputs = inputData.inputs;
                        if (inputs) {
                            spreadToInputs(inputs, value);
                            inputData.onChange();
                            inputs.forEach(inp => inp.blur());
                        }
                        break;
                    case "workstatus":
                        let workRadio;
                        if (data.value.includes("Безработ"))
                            workRadio = document.querySelector("#workstatus_no-work");
                        if (data.value.includes("Работаю"))
                            workRadio = document.querySelector("#workstatus_work");
                        if(workRadio) workRadio.checked = true;
                        break;
                    default: setInput(data);
                        break;
                }
            });
            function spreadToInputs(inputs, value) {
                inputs.forEach(inp => {
                    const length = parseInt(inp.getAttribute("maxlength"));
                    inp.value = value.slice(0, length);
                    value = value.slice(length);
                });
            }
        }
        function setInput(data) {
            const input = document.querySelector(`[name="${data.key}"]`);
            if (!input) return;

            let value = data.value;
            const lastIndex = value.length - 1;
            if (value[lastIndex].match(/[,.]/)) value = value.slice(0, lastIndex);
            input.value = value;
            input.dispatchEvent(new Event("input"));
            input.dispatchEvent(new Event("change"));
        }
    }
}

class Popup {
    constructor() {
        this.removePopup = this.removePopup.bind(this);
        document.body.classList.add("body--locked-scroll");
    }
    setCloseHandler() {
        this.popupClose = this.popup.querySelector(".popup__close");
        this.popupClose.addEventListener("click", this.removePopup);
    }
    removePopup() {
        this.popup.remove();
        document.body.classList.remove("body--locked-scroll");
    }
    getPopup() {
        return this.popup;
    }
}

class ConfrimPopup extends Popup {
    constructor(data = { title: "", body: [], confirm: {}, decline: {} }) {
        super();
        /*
            data == { 
                title: "string", 
                body: ["array", "with", "strings"], 
                confirm: { callback: function, text: "string" },  
                decline: { callback: function, text: "string" }
            }
        */
        if (!data.body) data.body = [];
        if (!data.confirm) data.confirm = {};
        if (!data.decline) data.decline = {};
        this.data = data;

        const popupInner = `
        <div class="popup__body">
            <div class="popup__close">
                <span class="popup__close-line"></span>
                <span class="popup__close-line"></span>
            </div>
            <div class="popup__content">
                <h4 class="popup__title">${data.title}</h4>
                <div class="popup__text">
                    ${this.drawTexts()}
                </div>
                <div class="popup__buttons">
                    <button class="button popup__button popup__confirm">
                        ${data.confirm.text || "Подтердить"}
                    </button>
                    <button class="button popup__button popup__decline">
                        ${data.decline.text || "Отменить"}
                    </button>
                </div>
            </div>
        </div>
        `;
        this.popup = createElement("div", "popup", popupInner);
        document.body.append(this.popup);

        super.setCloseHandler();
        this.setButtonsHandlers();
    }
    drawTexts() {
        let inner = "";
        this.data.body.forEach(text => {
            inner += `
            <p class="popup__text-item">${text}</p>
            `;
        });
        return inner;
    }
    setButtonsHandlers() {
        const confirmBtn = this.popup.querySelector(".popup__confirm");
        const declineBtn = this.popup.querySelector(".popup__decline");
        const data = this.data;

        confirmBtn.addEventListener("click", () => {
            super.removePopup();
            if (data.confirm.callback) this.data.confirm.callback();
        });
        declineBtn.addEventListener("click", () => {
            super.removePopup();
            if (data.decline.callback) this.data.decline.callback();
        });
    }
}

let inittingNewResumeSelectors = [
    { selector: ".forms__fields-group", classInstance: FieldsGroup, instanceFlag: "new-resume" },
    { selector: ".range-block", classInstance: Range },
    { selector: ".multiselect--standard", classInstance: Multiselect, instanceFlag: "new-resume" },
    { selector: ".multiselect--children", classInstance: MultiselectChildren, instanceFlag: "new-resume" },
    { selector: ".text-field--standard", classInstance: TextField, instanceFlag: "new-resume" },
    { selector: ".text-field--multi", classInstance: TextFieldMulti, instanceFlag: "new-resume" },
    { selector: ".text-field--phone", classInstance: TextFieldPhone, instanceFlag: "new-resume" },
    { selector: ".text-field--date", classInstance: TextFieldDate, instanceFlag: "new-resume" },
    { selector: ".text-field--birthdate", classInstance: TextFieldBirthDate, instanceFlag: "new-resume" },
    { selector: ".text-field--select", classInstance: TextFieldSelect, instanceFlag: "new-resume" },
    { selector: ".text-field--tags", classInstance: TextFieldTags, instanceFlag: "new-resume" },
    { selector: "[data-add-field='school']", classInstance: AddFieldSchool, instanceFlag: "new-resume" },
    { selector: "[data-add-field='education-sec']", classInstance: AddFieldEducationSec, instanceFlag: "new-resume" },
    { selector: "[data-add-field='children']", classInstance: AddFieldChildren, instanceFlag: "new-resume" },
    { selector: "[data-add-field='education-higher']", classInstance: AddFieldEducationHigher, instanceFlag: "new-resume" },
    { selector: "[data-add-field='workplace']", classInstance: AddFieldWorkplace, instanceFlag: "new-resume" },
    { selector: ".checkboxes-group", classInstance: CheckboxesGroup, instanceFlag: "new-resume" },
    { selector: "[data-optional-checkbox]", classInstance: CheckboxOptional, instanceFlag: "new-resume" },
    { selector: ".load-image", classInstance: LoadImage, instanceFlag: "new-resume" },
    { selector: "[data-title]", classInstance: Title },
    { selector: ".forms", classInstance: Forms },
];

inittingSelectors = inittingSelectors.concat(inittingNewResumeSelectors);