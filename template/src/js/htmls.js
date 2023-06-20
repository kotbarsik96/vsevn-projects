function createElement(tagName, className, insertingHTML) {
    let element = document.createElement(tagName);
    if (className) element.className = className;
    if (insertingHTML) element.insertAdjacentHTML("afterbegin", insertingHTML);
    return element;
}

class RenderMisc {
    cross() {
        return `
        <span class="cross">
            <svg>
                <use xlink:href="#cross-icon"></use>
            </svg>
        </span>
        <div class="prompt-hover__open">Очистить поле?</div>
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
}

const renderMisc = new RenderMisc();