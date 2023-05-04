const monthDefault=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],monthsGenitive=["Января","Февраля","Марта","Апреля","Мая","Июня","Июля","Августа","Сентября","Октября","Ноября","Декабря"],MAX_YEAR=(new Date).getFullYear()+1,MIN_YEAR=MAX_YEAR-20,row=document.createElement("div");row.classList.add("row");const calendarWrapper=document.createElement("div");let submitBtn;function recreateSubmitBtn(){submitBtn?.remove();const e=document.createElement("a");return e.textContent="Применить",e.setAttribute("href",""),e.classList.add("calendar__submit-btn"),calendarWrapper.appendChild(e),e.addEventListener("click",(e=>e.preventDefault())),e}calendarWrapper.classList.add("calendar-wrapper"),calendarWrapper.appendChild(row);const availableDates=[[new Date("2/20/2023"),new Date("3/15/2023")]];function formatDate(e){return`${e.getDate()} ${monthsGenitive[e.getMonth()]} ${e.getFullYear()}`}let calendarTemplate;function getDayDifference(e,t){return Math.floor((t-e)/1e3/60/60/24)}function CalendarPopup(e,t=!0){cover.classList.remove("hidden"),row.innerHTML="",submitBtn=recreateSubmitBtn(),e.appendChild(calendarWrapper);const a=e.getBoundingClientRect();let n="below";t&&a.top>window.innerHeight/2&&(n="above"),e.setAttribute("data-placement",n),this.close=function(){calendarWrapper.remove(),cover.classList.add("hidden"),e.removeAttribute("data-placement")}}function SingleCalendar(e){CalendarPopup.call(this,e.container);const t=new Calendar(e);row.appendChild(t.element),submitBtn.addEventListener("click",(()=>{let t,a;try{t=this.getDate()}catch(e){a=e}e.submitCallback(t,a)})),this.getDate=t.getDate,this.setDate=t.setDate,this.clear=t.clear}function DoubleCalendar(e){CalendarPopup.call(this,e.container,e.adjustPosition);const t=new Calendar({selectedDate:e.selectedDate1,limitDays:e.limitDays,selectCallback:e.selectCallback1}),a=new Calendar({selectedDate:e.selectedDate2,limitDays:e.limitDays,selectCallback:e.selectCallback2});row.appendChild(t.element),row.appendChild(a.element),submitBtn.addEventListener("click",(()=>{let n,l,r;try{n=t.getDate()}catch(e){r=e}try{l=a.getDate()}catch(e){r=e}e.submitCallback(n,l,r)})),this.setDate=function(e,n){1===e?t.setDate(n):a.setDate(n)},this.getDate=function(e){return 1===e?t.getDate():a.getDate},this.clear=function(e){1===e?t.clear():a.clear()}}function checkDateAvailable(e){let t=!1;for([startDate,finishDate]of availableDates)if(startDate<=e&&e<=finishDate){t=!0;break}return t}function Calendar(e){let t=e.selectedDate;const a=calendarTemplate.cloneNode(!0),n=new Select({container:a.querySelector(".calendar__year .select-container"),values:Array.from(Array(20).keys()).map((e=>MAX_YEAR-e))}),l=new Select({container:a.querySelector(".calendar__month .select-container"),values:monthDefault}),r=a.querySelector(".calendar__year-prev"),c=a.querySelector(".calendar__year-next"),i=a.querySelector(".calendar__month-prev"),s=a.querySelector(".calendar__month-next"),o=a.querySelector(".calendar__days");let d=(new Date).getFullYear(),u=(new Date).getMonth();function h(){return d===MAX_YEAR}function m(){return d===MIN_YEAR}function D(){return 11===u}function p(){return 0===u}function f(e,t){t?e.removeAttribute("data-disabled"):e.setAttribute("data-disabled","true")}function v(e){if(e<0||e>MAX_YEAR)throw new Error(`Invalid year: ${e}`);d=e,n.selectByIndex(MAX_YEAR-e,!1)}function b(e){if(e<0||e>11)throw new Error(`Invalid month: ${e}`);u=e,l.selectByIndex(e,!1)}function w(){v(d+1)}function y(){v(d-1)}function g(){f(c,!h()),f(r,!m()),f(s,!D()||!h()),f(i,!p()||!m())}function C(){o.innerHTML="";const a=new Date(d,u+1,0);let n,l=new Date(d,u,1).getDay()-1;l<0&&(l=6);for(let e=0;e<l;e++)o.innerHTML+="<div></div>";for(let l=1;l<=a.getDate();l++){const a=document.createElement("div");t&&t.getTime()===new Date(d,u,l).getTime()&&(n=a,n.classList.add("selected")),a.innerHTML=`<span class="value">${l}</span><span class="hint__text hint__text--center">Эту дату нельзя выбрать</span>`;const r=!e.limitDays||checkDateAvailable(new Date(d,u,l));a.classList.add(r?"available":"hint"),a.addEventListener("click",(()=>{if(!a.classList.contains("available"))return;n?.classList.remove("selected"),n=a,n.classList.add("selected");const l=+n.querySelector(".value").textContent;t=new Date(d,u,l),e.selectCallback(t)})),o.appendChild(a)}let r=a.getDay()-1;r<0&&(r=6);for(let e=0;e<6-r;e++)o.appendChild(document.createElement("div"))}t&&(d=t.getFullYear(),u=t.getMonth()),v(d),b(u),C(),this.setDate=function(a){if(e.limitDays&&!checkDateAvailable(a))throw new Error("Cannot set unavailable date");!function(e){v(e.getFullYear()),b(e.getMonth()),t=e}(a),C()},this.getDate=function(){if(!t)throw new Error("No date selected");return t},this.clear=function(){a.querySelector(".selected")?.classList.remove("selected")},this.element=a,c.addEventListener("click",(()=>{w(),g(),C()})),r.addEventListener("click",(()=>{y(),g(),C()})),s.addEventListener("click",(()=>{D()?h()||(w(),b(0)):b(u+1),g(),C()})),i.addEventListener("click",(()=>{p()?m()||(y(),b(11)):b(u-1),g(),C()})),n.setOnSelect(((e,t)=>{v(+e),g(),C()})),l.setOnSelect(((e,t)=>{b(+t),g(),C()}))}fetch("calendar.html").then((e=>e.text())).then((e=>calendarTemplate=(new DOMParser).parseFromString(e,"text/html").querySelector(".calendar")));