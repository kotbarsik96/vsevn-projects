/*  { selector: ".text-input", classInstance: TextInput }
    1. data-params: 
        1) prefix::text - ставит префикс text перед value
*/
class TextInput {
    constructor(node) {
        this.clear = this.clear.bind(this);

        this.rootElem = node;
        this.inputWrapper = this.rootElem.querySelector(".text-input__wrapper");
        this.input = this.rootElem.querySelector(".text-input__input");

        this.params = getParams.call(this);
        this.initInput();
        this.controls = this.setControls();
        if (!this.params.noCross) this.controls.createCross();
    }
    initInput() {
        const methods = bindMethods.call(this, {
            onInput() {
                if (this.input.value) {
                    this.rootElem.classList.add("__has-value");
                } else {
                    this.rootElem.classList.remove("__has-value");
                    methods.setPrefix();
                }
            },
            onChange() {

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
                if (!this.params.prefix) return;
                this.input.value = `${this.params.prefix} ${this.input.value}`;
            }
        })


        this.input.addEventListener("input", methods.onInput);
        this.input.addEventListener("change", methods.onChange);
        this.input.addEventListener("blur", methods.onBlur);
        this.input.addEventListener("focus", methods.onFocus);

        this.input.dispatchEvent(new Event("input"));
    }
    setControls() {
        const methods = bindMethods.call(this, {
            createCross() {
                const cross = renderMisc.cross();
                this.inputWrapper.insertAdjacentHTML("beforeend", cross);
                const btn = this.inputWrapper.querySelector(".cross");
                btn.addEventListener("click", this.clear);
            }
        });

        return methods;
    }
    clear() {
        this.input.value = "";
        this.input.dispatchEvent(new Event("input"));
        this.input.dispatchEvent(new Event("change"));
    }
}

/* { selector: ".inputs-range", classInstance: InputsRange }
*/
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

        function compareValues() {
            const startValue = parseInt(this.textInputs[0].input.value.replace(/\D/g, "").trim());
            const endValue = parseInt(this.textInputs[1].input.value.replace(/\D/g, "").trim());

            console.log(startValue, endValue);
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