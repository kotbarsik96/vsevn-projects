function DateInputField(e){const t=e.fieldElem;let n=e.onInput,u=e.onFocusOut;t.querySelectorAll("input").forEach((e=>e.addEventListener("keydown",(e=>{(isNaN(e.key)&&8!==e.keyCode&&"backspace"!==e.key.toLowerCase()&&37!==e.keyCode&&39!==e.keyCode&&9!==e.keyCode||32===e.keyCode)&&e.preventDefault()}))));const a=t.querySelector(".day"),l=t.querySelector(".month"),r=t.querySelector(".year");function o(){const e=+t.querySelector(".day").value;return 0<e&&e<=31}function c(){const e=+t.querySelector(".month").value;return 0<e&&e<=12}function i(){const e=+t.querySelector(".year").value;return 0<e&&e<(new Date).getFullYear()+1}function s(e){switch(e){case"day":a.value="";break;case"month":l.value="";break;case"year":r.value=""}}function v(){n&&n()}function y(){u&&u()}a.addEventListener("input",(()=>{const e=+a.value;2!==a.value.length||1<=e&&e<=31||(a.value=a.value.slice(0,-1)),2===a.value.length&&l.focus(),v()})),a.addEventListener("focusout",(()=>{1===a.value.length&&(a.value=String(a.value).padStart(2,"0")),o()||s("day"),y()})),l.addEventListener("input",(()=>{const e=+l.value;2!==l.value.length||1<=e&&e<=12||(l.value=l.value.slice(0,-1)),2===l.value.length&&r.focus(),v()})),l.addEventListener("focusout",(()=>{1===l.value.length&&(l.value=String(l.value).padStart(2,"0")),c()||s("month"),y()})),r.addEventListener("input",(()=>{r.value.length>4&&(r.value=r.value.slice(0,-1)),v()})),r.addEventListener("focusout",(()=>{0<r.value.length&&r.value.length<4&&(r.value=String(r.value).padStart(4,"0")),i()||s("year"),y()})),this.clear=function(){s("day"),s("month"),s("year")},this.hasValidDate=function(){return o()&&c()&&i()},this.getDate=function(){const e=t.querySelector(".day").value,n=t.querySelector(".month").value,u=t.querySelector(".year").value;return this.hasValidDate()?new Date(`${n}/${e}/${u}`):null},this.setDate=function(e){t.querySelector(".day").value=String(e.getDate()).padStart(2,"0"),t.querySelector(".month").value=String(+e.getMonth()+1).padStart(2,"0"),t.querySelector(".year").value=String(e.getFullYear()).padStart(4,"0")},this.isEmpty=function(){const e=t.querySelector(".day").value,n=t.querySelector(".month").value,u=t.querySelector(".year").value;return""===e&&""===n&&""===u},this.elem=function(){return t},this.focus=function(){a.focus()},this.onInput=function(e){n=e},this.onFocusOut=function(e){u=e}}