MutationObserver=window.MutationObserver||window.WebKitMutationObserver;const cover=find(".cover");function find(t){return document.querySelector(t)}function findAll(t){return document.querySelectorAll(t)}function formatDateDots(t){return`${String(t.getDate()).padStart(2,"0")}.${String(t.getMonth()+1).padStart(2,"0")}.${String(t.getFullYear())}`}function initLinkPreventReload(t){t.querySelectorAll('a[href=""]').forEach((t=>{t.addEventListener("click",(t=>t.preventDefault()))}))}function toggleSelect(t,e){e?cover.classList.remove("hidden"):cover.classList.add("hidden"),t.setAttribute("aria-expanded",e)}function setFadeEffects(t){t.forEach((t=>{t.scrollWidth>t.clientWidth?(t.classList.add("ovf-fade"),t.parentNode.classList.add("hint")):(t.classList.remove("ovf-fade"),t.parentNode.classList.remove("hint"))}))}function initFadeEffects(t){setFadeEffects([].concat(...t.querySelectorAll(".adv-item__title span.text"),...t.querySelectorAll(".adv-item__city-list > li > div"))),window.addEventListener("resize",(()=>{}))}function initInputValidation(){findAll('input[type="number"]').forEach((t=>t.addEventListener("keydown",(t=>{(isNaN(t.key)&&8!==t.keyCode&&"backspace"!==t.key.toLowerCase()||32===t.keyCode)&&t.preventDefault()}))))}function initClearFieldBtns(t){t.querySelectorAll(".cross").forEach((t=>{const e=find("#"+t.getAttribute("aria-controls"));if("input"!==e.tagName.toLowerCase())return;const a=t.parentNode;a.setAttribute("data-empty",""===e.value),e.addEventListener("input",(()=>""!==e.value?a.setAttribute("data-empty","false"):a.setAttribute("data-empty","true"))),t.addEventListener("click",(()=>{e.value="",a.setAttribute("data-empty","true")}))}))}function initFilterCalendar(t){const e=document.querySelector(".adv-input-filters .double-calendar-error");t.querySelectorAll(".adv-filter-date.calendar-container").forEach((a=>{const i=a.querySelector("#adv-filter-date-from"),n=a.querySelector("#adv-filter-date-to"),r=new DateInputField({fieldElem:t.querySelector(".adv-filter-date .date-input-field.date-from")}),s=new DateInputField({fieldElem:t.querySelector(".adv-filter-date .date-input-field.date-to")});r.clear(),s.clear();const c=r.elem().parentNode.parentNode,l=s.elem().parentNode.parentNode;c.setAttribute("data-empty","true"),c.setAttribute("data-type","input"),l.setAttribute("data-empty","true"),l.setAttribute("data-type","input");a.querySelectorAll(".calendar-open-btn--double").forEach((t=>t.addEventListener("click",(()=>{if(null!==a.querySelector(".calendar"))return void t.parentNode.setAttribute("data-type","input");const o=i.getAttribute("data-date"),d=n.getAttribute("data-date");function u(){const t=r.getDate(),i=s.getDate();t&&i&&getDayDifference(t,i)<0?(e.classList.remove("hidden"),a.classList.add("shiftY")):(e.classList.add("hidden"),a.classList.remove("shiftY"))}a.classList.add("calendar-expanded");const f=new DoubleCalendar({container:a,adjustPosition:!1,selectedDate1:o?new Date(o.trim()):null,selectCallback1(t){r.setDate(t),i.setAttribute("data-date",t.toLocaleDateString()),c.setAttribute("data-empty",!1),i.textContent=formatDate(r.getDate()),c.setAttribute("data-type","date"),u()},selectCallback2(t){s.setDate(t),n.setAttribute("data-date",t.toLocaleDateString()),l.setAttribute("data-empty",!1),n.textContent=formatDate(s.getDate()),l.setAttribute("data-type","date"),u()},selectedDate2:d?new Date(d.trim()):null,submitCallback(t,e,o){try{i.textContent=formatDate(r.getDate()),c.setAttribute("data-type","date")}catch(t){c.setAttribute("data-empty","true"),c.setAttribute("data-type","input"),i.textContent=""}try{n.textContent=formatDate(s.getDate()),l.setAttribute("data-type","date")}catch(t){l.setAttribute("data-empty","true"),l.setAttribute("data-type","input"),n.textContent=""}performFiltering(),a.classList.toggle("calendar-expanded"),f.close()}});r.onInput((()=>{c.setAttribute("data-empty",r.isEmpty()),r.hasValidDate()&&f.setDate(1,r.getDate()),u()})),s.onInput((()=>{l.setAttribute("data-empty",s.isEmpty()),s.hasValidDate()&&f.setDate(2,s.getDate()),u()})),cover.addEventListener("click",(()=>{r.hasValidDate()?(i.textContent=formatDate(r.getDate()),c.setAttribute("data-type","date")):(c.setAttribute("data-empty","true"),c.setAttribute("data-type","input"),r.clear(),i.textContent=""),s.hasValidDate()?(n.textContent=formatDate(s.getDate()),l.setAttribute("data-type","date")):(l.setAttribute("data-empty","true"),l.setAttribute("data-type","input"),s.clear(),n.textContent=""),a.classList.remove("calendar-expanded"),f.close(),u(),performFiltering()}));const[p,v]=a.querySelectorAll(".cross");p.addEventListener("click",(()=>{r.clear(),c.setAttribute("data-empty","true"),c.setAttribute("data-type","input"),i.removeAttribute("data-date"),f.clear(1),i.textContent="",a.querySelector(".calendar")||performFiltering(),u()})),v.addEventListener("click",(()=>{s.clear(),l.setAttribute("data-empty","true"),l.setAttribute("data-type","input"),n.removeAttribute("data-date"),f.clear(2),n.textContent="",a.querySelector(".calendar")||performFiltering(),u()}))}))))}))}function initExpandingLists(t){t.querySelectorAll(".adv-item__links").forEach((t=>{if(t.querySelectorAll("li").length<3)return;const e="Еще",a=t.querySelector(".service-item a");a.innerHTML=e,toggleExpandingList(t,!1),a.addEventListener("click",(i=>{toggleExpandingList(t),a.innerHTML=a.innerHTML===e?"Свернуть":e}))}))}function toggleExpandingList(t,e=null){null===e&&(e=!("true"===t.getAttribute("aria-expanded"))),e?t.classList.remove("show-on-adv-item-hover"):t.classList.add("show-on-adv-item-hover"),t.setAttribute("aria-expanded",e);const a=t.querySelectorAll("li:not(.service-item)");for(let t=1;t<a.length;t++)e?a[t].classList.remove("hidden"):a[t].classList.add("hidden")}function updateScrollValue(){localStorage.setItem("scrollTop",String(find("html").scrollTop))}function getScrollValue(){return localStorage.getItem("scrollTop")}function initFilterRegions(t){const e=t.querySelector(".adv-filter-region .text");e.scrollWidth>e.clientWidth&&(e.classList.add("ovf-fade"),e.parentNode.classList.add("hint")),e.addEventListener("click",(()=>{showChooseRegionPopup(((t,a)=>{let i;i=t.length+a.length===0?"Регион / Населенный пункт":`Регионов: ${t.length}, Населенных пунктов: ${a.length}`,e.textContent=i,e.scrollWidth>e.clientWidth?(e.classList.add("ovf-fade"),e.parentNode.classList.add("hint"),e.nextElementSibling.textContent=i):e.parentNode.classList.remove("hint")}))}))}findAll(".select:not(#adv-filter-region)").forEach((t=>{const e=t.querySelector(".select__body .text"),a="Сортировать по";t.querySelector(".cross").addEventListener("click",(()=>{t.setAttribute("data-empty",!0),e.innerHTML=a,n.removeAttribute("data-selected")}));const i=t.querySelector('ul li[data-default="true"]');let n;i?(e.innerHTML=i.innerHTML,n=i,n.setAttribute("data-selected","true"),t.setAttribute("data-empty",!1)):e.innerHTML=a;let r=!1;t.querySelector(".select__body").addEventListener("click",(()=>{r=!r,toggleSelect(t,r)})),t.querySelectorAll(".select__list li").forEach((a=>a.addEventListener("click",(a=>{t.setAttribute("data-empty",!1),e.innerHTML=a.target.innerHTML,n?.removeAttribute("data-selected"),n=a.target,n.setAttribute("data-selected","true"),r=!1,toggleSelect(t,r)})))),cover.addEventListener("click",(()=>{r&&(r=!1,toggleSelect(t,r))}))})),findAll(".tab-links").forEach((t=>{const e=Array.from(t.querySelectorAll(".tab-link"));let a=e.find((t=>t.classList.contains("active")));a||(a=e[0],a.classList.add("active")),e.forEach((t=>t.addEventListener("click",(t=>{t.target!==a&&e.includes(t.target)&&(a.classList.remove("active"),a=t.target,a.classList.add("active"))}))))}));const modal=find(".modal"),modalContent=modal.querySelector(".modal__content"),modalBody=modal.querySelector(".modal__body"),modalHeader=modal.querySelector(".modal__header"),modalFooter=modal.querySelector(".modal__footer");function clearModal(){modalHeader.innerHTML="",modalBody.innerHTML="",modalFooter.innerHTML="",modalContent.classList.remove("confirm")}function showModal(t,e=""){modalBody.innerHTML=t;const a=document.createElement("span");if(a.classList.add("icon-cross-svgrepo-com","modal__close-btn"),modalBody.appendChild(a),document.body.classList.add("lock"),modal.classList.add("modal--visible"),a.addEventListener("click",(()=>{modal.classList.remove("modal--visible"),document.body.classList.remove("lock"),clearModal()})),e){const t=document.createElement("h4");t.classList.add("modal__title"),t.innerHTML=e,modal.querySelector(".modal__header").appendChild(t)}modal.addEventListener("click",(t=>{t.target===modal&&(modal.classList.remove("modal--visible"),document.body.classList.remove("lock"),clearModal())}))}function showConfirmModal(t,e,a){modalContent.classList.add("confirm"),modalBody.innerHTML=e;const i=document.createElement("h4");i.innerHTML=t,modalHeader.appendChild(i);const n=document.createElement("span");return n.classList.add("icon-cross-svgrepo-com","modal__close-btn","modal__close-btn--inner"),modalHeader.appendChild(n),document.body.classList.add("lock"),new Promise(((t,e)=>{if(a)for(const i of a){const a=document.createElement("a");a.setAttribute("href",""),a.textContent=i.text,a.classList.add("action-btn"),i.className&&a.classList.add(i.className),modalFooter.appendChild(a),a.addEventListener("click",(a=>{a.preventDefault(),"submit"===i.type?t():"cancel"===i.type&&e(),modal.classList.remove("modal--visible"),document.body.classList.remove("lock"),clearModal()}))}modal.classList.add("modal--visible"),n.addEventListener("click",(()=>{modal.classList.remove("modal--visible"),document.body.classList.remove("lock"),clearModal(),e()})),modal.addEventListener("click",(t=>{t.target===modal&&(modal.classList.remove("modal--visible"),document.body.classList.remove("lock"),clearModal(),e())}))}))}const DEFAULT_LOGO_URL="img/profile-icons/default-logo.svg",DEFAULT_PHOTO_URL="img/profile-icons/default-photo.svg",ARTICLES_URL="data.json",ARTICLE_TEMPLATE_URL="article-template.html",SERVICES_URL="services.json",articlesContainer=find(".ads__items");let services,articleTemplate,articles,filteredArticles,servicesLogos=[];const selectors={img:".adv-item__img",title:".adv-item__title",price:".adv-item__price > span:first-child",rating:".adv-item__rating",links:".adv-item__links",views:".adv-item__stats .views",favourites:".adv-item__stats .favourites",dialogs:".adv-item__stats .dialogs",newMessages:".adv-item__stats .new-messages",growth:".adv-item__stats .growth",responses:".adv-item__stats .responses",matchingVacancies:".adv-item__stats .matching-vacancies",daysPublished:".adv-item__stats .days-published",servicesCount:".adv-item__services"};async function renderElement(t,e=null){switch(t){case"title":return`\n                <span class="hint__text">${e}</span>\n                <span class="text">${e}</span>\n            `;case"city":return`\n                <span class="hint__text">${e}</span>\n                <div>\n                    <span class="icon icon-cross hint">\n                        <span class="hint__text hint__text--center">Удалить данный населенный пункт</span>\n                    </span>\n                    <span class="text">${e}</span>\n                </div>\n            `;case"cityList":let t="";for(const a of e)t+=`<li>${await renderElement("city",a)}</li>`;return t;case"newMessages":return`${+e?e:""}`;case"growth":return`+${e}`;case"rating":return`<p>Объявление на ${e} месте в поиске.</p><p><a href="">Поднять на 1 (первое) место в поиске?</a></p>`;case"servicesCount":return`\n                <p>Активно: ${e}</p>\n                <a href="">Показать</a>\n            `;case"services":const a="1"in e.services?0:1;return console.log(e),`\n                ${(await Promise.all(Object.keys(services).map((async(t,i)=>{if(i!==a&&("active"===e.state||services[t].free||i in e.services)){const a=i in e.services;return await renderElement("service",{logo:servicesLogos[t],title:services[t].title,free:services[t].free,active:a,dateFrom:a?e.services[t].dateFrom:null,dateTo:a?e.services[t].dateTo:null})}return""})))).join("")}   \n            `;case"service":return`\n                <article class="service">\n                    <div class="service__img">${e.logo}</div>\n                    <div class="service__info">\n                        <h4 class="service__title">${e.title}</h4>\n                        ${e.free?"":e.active?`\n                                <p>\n                                    <span>Период:</span>\n                                    <span class="from">${e.dateFrom}</span>\n                                    <span class="dash">-</span>\n                                    <span class="to">${e.dateTo}</span>\n                                </p>\n                                <p>\n                                    Услуга АКТИВНА до ${e.dateTo}\n                                </p>\n                            `:'\n                                <p>\n                                    Услуга не активна, <a href="">активировать</a>?\n                                </p>\n                            '}\n                    </div>\n                </article>\n            `;case"img":if(e.url.endsWith(".html")){const t=await fetch(e.url).then((t=>t.text()));return`<div class="${e.className}">${t}</div>`}return`\n                <div class="${e.className}" style="background-image: url(${e.url})"></div>\n            `;case"links":return`\n                ${e.map((t=>`\n                    <li>\n                        <span class="icon icon-link"></span>\n                        <a href="">${t.text}</a>\n                        \n                        <div class="copy-link-modal">\n                        <span class="copy-link-modal__url">${t.url}</span>\n                        <span class="copy-link-modal__btn">\n                            <span class="icon icon-link"></span>\n                            <span class="text">Скопировать ссылку</span>\n                        </span>\n                    </div>\n                    </li>\n                `)).join("")}   \n                <li class="service-item"><a href=""></a></li>\n            `;default:return e}}async function renderArticle(t){const e=document.createElement("article");e.innerHTML=articleTemplate,e.classList.add("adv-item","grid","underline");for(const[a,i]of Object.entries(t))a.startsWith("_")||(e.querySelector(selectors[a]).innerHTML=await renderElement(a,i));return e}async function fetchData(){services=await fetch(SERVICES_URL).then((t=>t.json())),articleTemplate=await fetch(ARTICLE_TEMPLATE_URL).then((t=>t.text()));for(const t of Object.keys(services))servicesLogos[t]=await fetch(services[t].logoUrl).then((t=>t.text()));const t=await fetch(ARTICLES_URL).then((t=>t.json()));return articles=t.map((t=>({el:null,checked:!1,data:{img:{url:t.logo_url||("resume"===t.type?DEFAULT_PHOTO_URL:DEFAULT_LOGO_URL),className:"resume"===t.type?"avatar-circle":"avatar-square"},title:t.title,_type:t.type,_state:t.state,_date:t.date,price:t.price,_autoProlong:t.auto_prolong,rating:t.rating,_cityList:t.city_list,links:t.links.map((t=>({text:t.text,url:t.url,free:t.free}))),views:t.views,favourites:t.favourites,dialogs:t.dialogs,newMessages:t.new_messages,growth:t.growth,responses:t.responses,matchingVacancies:t.matching_vacancies,daysPublished:t.days_published,servicesCount:t.services.find((t=>1===t.id))?t.services.length:t.services.length+1,_services:t.services.reduce(((t,e)=>(t[e.id]={dateFrom:e.date_from,dateTo:e.date_to},t)),{})}}))),articles}function appendArticle(t){articlesContainer.appendChild(t)}async function printArticles(t){articlesContainer.innerHTML="";for(const e of t){let t=!1;null===e.el&&(e.el=await renderArticle(e.data),e.citiesPopup=new Popup({title:"Регионы / Населенные пункты",container:e.el.querySelector(".adv-item__cities-popup-container")}),t=!0),appendArticle(e.el),t&&await setupArticle(e)}}async function setupArticle(t){if(initLinkPreventReload(t.el),initExpandingLists(t.el),initDeactivationField(t),initArticleCalendar(t),initCopyLinkModals(t),initArticleServices(t),await initCityList(t),initShowCitiesBtn(t),initFadeEffects(t.el),initArticleDates(t),initArticleStateBackground(t),initProlongCheckbox(t),"closed"===t.data._state){const e=document.createElement("div");e.classList.add("info-closed"),e.innerHTML=`Перенесена в архив <span>${formatDate(new Date(t.data._date.deactivation))}</span>`,t.el.querySelector(".adv-item__state").appendChild(e)}window.innerWidth<1100&&t.el.querySelector(".calendar-container").classList.add("calendar-container--left"),t.el.querySelector(".checkbox").addEventListener("click",(()=>{t.checked?setArticleCheckState(t,!1):setArticleCheckState(t,!0)})),t.el.querySelector(".adv-item__cities-btn").addEventListener("click",(()=>{t.data._cityList.length>3&&t.citiesPopup.open()}))}function updateArticle(t,e={}){t.data={...t.data,...e},t.el=null}async function performFiltering(){filteredArticles=filterArticles(articles);for(let t=0;t<filteredArticles.length;t++)filteredArticles[t].id=t;await printArticles(filteredArticles).then(updateActionBar)}async function initArticles(t){articles=t,await performFiltering()}function initProlongCheckbox(t){const e=t.el.querySelector(".adv-item__auto-prolong .enable .fancy-radiobutton"),a=e.nextElementSibling,i=t.el.querySelector(".adv-item__auto-prolong .disable .fancy-radiobutton"),n=i.nextElementSibling,r=Date.now();e.setAttribute("id","auto-prolong-enable-"+r),a.setAttribute("for","auto-prolong-enable-"+r),i.setAttribute("id","auto-prolong-disable"+r),n.setAttribute("for","auto-prolong-disable"+r),e.setAttribute("name","auto-prolong-"+r),i.setAttribute("name","auto-prolong-"+r),t.data._autoProlong?e.setAttribute("checked","checked"):i.setAttribute("checked","checked")}function initDeactivationField(t){const e=t.el.querySelector(".adv-item__state .date-input-field");t.deactivationField=new DateInputField({fieldElem:e})}function initArticleCalendar(t){const e=t.el.querySelector(".calendar-container"),a=e.querySelector(".date-value"),i=t.deactivationField,n=e.querySelector(".hint__text"),r=e.querySelector(".calendar-open-btn");r.setAttribute("data-type","date"),r.addEventListener("click",(()=>{if(null!==t.el.querySelector(".calendar"))return r.setAttribute("data-type","input"),void i.focus();e.setAttribute("data-state","focused");let s=new Date(a.getAttribute("data-date").trim());i.setDate(s),r.setAttribute("data-type","input"),i.focus();const c=new SingleCalendar({container:e,selectedDate:s,limitDays:!0,selectCallback(t){i.setDate(t),a.textContent=formatDate(t),r.setAttribute("data-type","date")},submitCallback(n,s){if(s){const n=i.getDate();n?(a.textContent=formatDate(n),t.data._date.deactivation=n,initArticleDates(t),e.removeAttribute("data-state"),r.setAttribute("data-type","date"),c.close()):e.setAttribute("data-state","error")}else a.textContent=formatDate(n),t.data._date.deactivation=n,initArticleDates(t),e.removeAttribute("data-state"),r.setAttribute("data-type","date"),c.close()}});cover.addEventListener("click",(()=>{const n=i.getDate();n?(a.textContent=formatDate(n),t.data._date.deactivation=n,initArticleDates(t),e.removeAttribute("data-state"),r.setAttribute("data-type","date"),c.close()):e.setAttribute("data-state","error")})),i.onInput((()=>{e.setAttribute("data-state","focused");const t=i.getDate();if(t)try{c.setDate(t)}catch(t){c.clear(),i.focus(),i.clear(),n.style.display="block",setTimeout((()=>{n.style.display="none"}),2e3)}}))}))}function initArticleDates(t){const e=t.el.querySelector(".adv-item__state .calendar-container .date-value");e.setAttribute("data-date",t.data._date.deactivation),e.textContent=formatDate(new Date(t.data._date.deactivation)),t.el.querySelector(".expires .value").textContent=getDayDifference(new Date,new Date(t.data._date.deactivation));const a=t.el.querySelector(".adv-item__dates .update-time-btn");a.addEventListener("click",(()=>{const e=new Date;t.el.querySelector(".adv-item__dates .updated .date-value").textContent=formatDateDots(e),t.el.querySelector(".adv-item__dates .updated .time-value").textContent=`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`,a.classList.add("hidden")}))}function initArticleServices(t){t.el.querySelector(".adv-item__services a").addEventListener("click",(async()=>{showModal(await renderElement("services",{services:t.data._services,state:t.data._state}),"Услуги продвижения")})),t.el.querySelector(".adv-item__get-more-responses").addEventListener("click",(async()=>{const e=[];for(let a=4;a<=6;a++){const i=a.toString()in t.data._services;e.push(await renderElement("service",{logo:servicesLogos[a],title:services[a].title,free:services[a].free,active:i,dateFrom:i?t.data._services[a].dateFrom:null,dateTo:i?t.data._services[a].dateTo:null}))}showModal(e.join(""),"Платные услуги продвижения")}))}function initArticleStateBackground(t){t.el.setAttribute("data-state",t.data._state)}async function initCityList(t){const e=t.el.querySelector(".adv-item__city-list");e.innerHTML="";const a=t.data._cityList,i=t.el.querySelector(".adv-item__cities-btn");let n=0;for(const i of a){if(n>2)break;const a=document.createElement("li");a.innerHTML=await renderElement("city",i),a.querySelector(".icon").addEventListener("click",(async()=>{t.data._cityList=t.data._cityList.filter((t=>t!==i)),await initCityList(t)})),e.appendChild(a),n++}if(a.length<4)return i.textContent="Добавить",void(t.citiesPopup.isOpen()&&t.citiesPopup.close());i.textContent="Еще "+(a.length-3);const r=document.createElement("ul");r.classList.add("city-list"),r.innerHTML=await renderElement("cityList",a),t.citiesPopup.setContent(r),initDeleteCityBtns(t,r)}function initDeleteCityBtns(t,e){e.querySelectorAll("li").forEach((e=>{const a=e.querySelector("span.text").textContent;e.querySelector(".icon").addEventListener("click",(async()=>{t.data._cityList=t.data._cityList.filter((t=>t!==a)),await initCityList(t),performFiltering()}))}))}function initShowCitiesBtn(t){t.el.querySelector(".adv-item__city-list a.cities-show-btn")?.addEventListener("click",(()=>{showModal(`\n            <ul>\n                ${t.data.cityList.map((t=>`<li>${t}</li>`)).join("")}\n            </ul>\n        `)}))}function initCopyLinkModals(t){t.el.querySelectorAll(".adv-item__links > li:not(.service-item)").forEach((t=>{const e="Ссылка скопирована",a=t.querySelector(".copy-link-modal__url"),i=t.querySelector(".copy-link-modal__btn");if(window.innerWidth<=1100)return void t.querySelector("a").addEventListener("click",(()=>{navigator.clipboard.writeText(a.textContent).then((()=>{showHint({container:t,message:e})}),console.error)}));i.addEventListener("click",(()=>{navigator.clipboard.writeText(a.textContent).then((()=>{i.querySelector("span.text").textContent=e}),console.error)})),i.parentNode.addEventListener("mouseleave",(()=>{i.querySelector("span.text").textContent="Скопировать ссылку"}));let n=null;t.addEventListener("mouseenter",(()=>{if(!(n||a.scrollWidth<=a.clientWidth)){for(n=a.textContent;a.scrollWidth>a.clientWidth;)n=n.slice(0,-1),a.textContent=n;n=n.slice(0,-2),a.textContent=n,a.classList.add("ovf")}}))}))}let checkedArticlesCount=0;const mainCheckbox=find(".actions .checkbox");function switchMainCheckBoxVisibility(t){t?mainCheckbox.classList.remove("hidden"):mainCheckbox.classList.add("hidden")}function switchCheckbox(t,e=null){return null===e?t.classList.contains("active")?(t.classList.remove("active"),!1):(t.classList.add("active"),!0):(e?t.classList.add("active"):t.classList.remove("active"),e)}function setArticleCheckState(t,e,a=!0){t.checked!==e&&(t.checked=e,e?(checkedArticlesCount++,t.el.querySelector(".checkbox").classList.add("active")):(checkedArticlesCount--,t.el.querySelector(".checkbox").classList.remove("active")),a&&updateActionBar())}function updateActionBar(){updateMainCheckbox(),switchActionsBtns(checkedArticlesCount>0)}function updateMainCheckbox(){switchCheckbox(mainCheckbox,checkedArticlesCount===filteredArticles.length&&checkedArticlesCount>0)}mainCheckbox.addEventListener("click",(()=>{const t=switchCheckbox(mainCheckbox);filteredArticles.forEach((e=>{setArticleCheckState(e,t)}))}));const deactivationMessage='Обратите внимание, что при снятии вакансии тариф израсходуется. Не распространяется на тарифы "Подписка"',actionBtnsContainer=find(".actions .actions__container");let checkSensitiveBtns;const defaultActionBtns=[{elem:null,text:"Подать объявление",action:function(){console.log("подать объяление")}}],actionBtns={delete:{text:"Удалить",action:function(t){setArticleCheckState(t,!1,!1),updateArticle(t,{_state:"deleted"})}},activate:{text:"Активировать",action:function(t){setArticleCheckState(t,!1,!1),updateArticle(t,{_state:"active"})}},unpublish:{text:"Снять с публикации",action:function(t){setArticleCheckState(t,!1,!1),updateArticle(t,{_state:"closed"})},beforeAction:()=>showConfirmModal(`Снять с публикации вакансию(и): ${articles.filter((t=>t.checked)).reduce(((t,e)=>(t.push(`«${e.data.title}»`),t)),[]).join(", ")} ?`,deactivationMessage,[{text:"Все равно снять",className:"action-btn--red",type:"submit"},{text:"Отменить",type:"cancel"}])},emptyTrash:{text:"Очистить корзину",action:function(t){articles=articles.filter((e=>t!==e))}}};function switchActionsBtns(t=null){t?actionBtnsContainer.querySelectorAll("a:not(.action-btn--red)").forEach((t=>{t.classList.remove("disabled")})):actionBtnsContainer.querySelectorAll("a:not(.action-btn--red)").forEach((t=>{t.classList.add("disabled")}))}function initDefaultActionBtns(){defaultActionBtns.forEach((t=>{const e=document.createElement("a");e.setAttribute("href",""),e.classList.add("action-btn","action-btn--red"),e.textContent=t.text,e.addEventListener("click",(e=>{e.preventDefault(),t.action()})),t.elem=e}))}function clearActionBtns(){actionBtnsContainer.querySelectorAll(".action-btn").forEach((t=>t.remove())),checkSensitiveBtns=[]}function initActionBar(t){switch(clearActionBtns(),switchMainCheckBoxVisibility(!0),t){case"active":addActionBtn(actionBtns.unpublish);break;case"closed":addActionBtn(actionBtns.activate),addActionBtn(actionBtns.delete);break;case"blocked":case"rejected":case"pending":switchMainCheckBoxVisibility(!1);break;case"draft":addActionBtn(actionBtns.delete);break;case"deleted":addActionBtn(actionBtns.emptyTrash)}defaultActionBtns.forEach((t=>{actionBtnsContainer.appendChild(t.elem)}))}function addActionBtn({text:t,action:e,beforeAction:a=null}){const i=document.createElement("a");i.setAttribute("href",""),i.textContent=t,i.classList.add("action-btn","disabled"),i.addEventListener("click",(t=>{t.preventDefault(),a&&"function"==typeof a?a().then((()=>performAction(e))).catch((()=>{})):performAction(e)})),actionBtnsContainer.appendChild(i)}function performAction(t){articles.forEach((e=>{e.checked&&t(e)})),updateActionBar(),performFiltering(),updateStateFiltersNumbers()}const stateFiltersBtns=Array.from(findAll(".adv-filter-state .tab-link"));function initStateFiltersBtns(){stateFiltersBtns.forEach((t=>{const e=t.getAttribute("id").split("-").pop();t.classList.contains("active")&&initActionBar(e),t.addEventListener("click",(()=>initActionBar(e)))}))}function updateStateFiltersNumbers(){stateFiltersBtns.forEach((t=>{t.querySelector("span:last-child").textContent=0})),articles.forEach((t=>{const e=find(`#adv-filter-state-${t.data._state} span:last-child`);e.textContent=++e.textContent}))}const filters=[function(t){const e=find("#adv-filter-title").value.trim().split(" ");let a=!1;for(let i=0;i<e.length;i++)if(t.data.title.toLowerCase().includes(e[i])&&e[i].length>2||""===e[i]){a=!0;break}return a},function(t){const e=find(".adv-filter-type .tab-link.active").getAttribute("id").toLowerCase();return!!e.endsWith("all")||(e.endsWith("resume")?"resume"===t.data._type.toLowerCase():e.endsWith("vacancy")?"vacancy"===t.data._type.toLowerCase():void 0)},function(t){const e=+find("#adv-filter-price-from").value,a=+find("#adv-filter-price-to").value||Number.POSITIVE_INFINITY,i=+t.data.price;return i>=e&&i<=a},function(t){const e=find(".adv-filter-region .select span");if("true"===e.getAttribute("data-empty"))return!0;const a=e.textContent.toLowerCase();let i=!1;for(let e=0;e<t.data.cityList.length;e++)if(t.data.cityList[e].toLowerCase()===a){i=!0;break}return i},function(t){const e=find(".adv-filter-state .tab-link.active").getAttribute("id").split("-").pop();return t.data._state===e},function(t){const e="draft"===t.data._state?new Date(t.data._date.created):new Date(t.data._date.activation),a=find("#adv-filter-date-from").getAttribute("data-date"),i=find("#adv-filter-date-to").getAttribute("data-date");return!(a&&e<new Date(a))&&!(i&&e>new Date(i))}],listeners=[{selector:["#adv-filter-title"],event:"input"},{selector:[".adv-filter-type .tab-link"],event:"click"},{selector:["#adv-filter-price-from","#adv-filter-price-to"],event:"input"},{selector:[".adv-filter-region .select ul li"],event:"click"},{selector:[".adv-filter-state .tab-link"],event:"click"},{selector:[".adv-filter-price .cross",".adv-filter-title .cross"],event:"click"},{selector:[".adv-filter-date .cross"],event:"click",checker:function(t){return!find(".adv-filter-date .calendar")}}];function filterArticles(t){return t.filter((t=>{let e=!0;for(let a=0;a<filters.length;a++)if(!filters[a](t)){e=!1,setArticleCheckState(t,!1);break}return e}))}function initFilters(){listeners.forEach((t=>{Array.from(findAll(t.selector)).forEach((e=>{e.addEventListener(t.event,(e=>{(void 0===t.checker||t.checker(e))&&performFiltering()}))}))}))}function performSorting(t){const e=filteredArticles;e.sort(t),printArticles(e)}const sorts={default:function(t,e){return t.id-e.id},date:function(t,e){return"draft"===t.data._state?new Date(t.data._date.created)-new Date(e.data._date.created):new Date(t.data._date.activation)-new Date(e.data._date.activation)},"date-rev":function(t,e){return"draft"===t.data._state?new Date(e.data._date.created)-new Date(t.data._date.created):new Date(e.data._date.activation)-new Date(t.data._date.activation)},title:function(t,e){return t.data.title.localeCompare(e.data.title)},"title-rev":function(t,e){return e.data.title.localeCompare(t.data.title)},price:function(t,e){return t.data.price-e.data.price},"price-rev":function(t,e){return e.data.price-t.data.price}};function initSorts(){findAll(".action-sort .select__list > li").forEach((t=>t.addEventListener("click",(t=>{const e=t.target.getAttribute("id").split("-").splice(3).join("-");performSorting(sorts[e])})))),find(".action-sort .cross").addEventListener("click",(()=>{performSorting(sorts.default)}))}let globalTestData;initLinkPreventReload(document.body),initClearFieldBtns(document.body),initFilterCalendar(document.body),initFilterRegions(document.body),initInputValidation(),initSorts(),fetchData().then((t=>{initDefaultActionBtns(),initStateFiltersBtns(),updateStateFiltersNumbers(),initFilters(t),initArticles(t).then((()=>{const t=getScrollValue();t&&window.scrollTo(0,+t),window.addEventListener("beforeunload",(()=>{updateScrollValue()}))})),globalTestData=t}));const testInputs=findAll(".test-form input");find(".test-form .add").addEventListener("click",(()=>{const t=find('input[name="type"]:checked').value;globalTestData=[...globalTestData,{el:null,data:{title:testInputs[0].value,price:testInputs[1].value,_type:t,img:{url:testInputs[3].value||DEFAULT_LOGO_URL,className:"resume"===t?"avatar-circle":"avatar-square"},cityList:testInputs[2].value.split(" "),views:testInputs[4].value,favourites:testInputs[5].value,dialogs:testInputs[6].value,responses:testInputs[7].value,matchingVacancies:testInputs[8].value,daysPublished:testInputs[9].value,services:Array(+testInputs[10].value).fill().map(((t,e)=>({id:e,dateFrom:"10.05.2022",dateTo:"10.06.2022"})))}}],initArticles(globalTestData),initFilters(globalTestData)})),find(".test-form .delete").addEventListener("click",(()=>{articlesContainer.innerHTML=""}));