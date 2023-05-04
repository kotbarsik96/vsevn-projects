MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// common elements
const cover = find('.cover');

// functions
function find(selector) {
    return document.querySelector(selector);
}

function findAll(selector) {
    return document.querySelectorAll(selector);
}

function formatDateDots(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}.${month}.${year}`;
}

// custom select
findAll('.select:not(#adv-filter-region)').forEach(sel => {
    const field = sel.querySelector('.select__body .text');
    const placeholderText = 'Сортировать по';

    sel.querySelector('.cross').addEventListener('click', () => {
        sel.setAttribute('data-empty', true);
        field.innerHTML = placeholderText;
        selectedItem.removeAttribute('data-selected');
    });

    const defaultItem = sel.querySelector('ul li[data-default="true"]');
    let selectedItem;
    if (defaultItem) {
        field.innerHTML = defaultItem.innerHTML;
        selectedItem = defaultItem;
        selectedItem.setAttribute('data-selected', 'true');
        sel.setAttribute('data-empty', false);
    } else {
        field.innerHTML = placeholderText;
    }

    let expanded = false;
    sel.querySelector('.select__body').addEventListener('click', () => {
        expanded = !expanded;
        toggleSelect(sel, expanded);
    });

    sel.querySelectorAll('.select__list li').forEach(li => li.addEventListener('click', e => {
        sel.setAttribute('data-empty', false);
        field.innerHTML = e.target.innerHTML;
        selectedItem?.removeAttribute('data-selected');
        selectedItem = e.target;
        selectedItem.setAttribute('data-selected', 'true');
        expanded = false;
        toggleSelect(sel, expanded);
    }));

    cover.addEventListener('click', () => {
        if (!expanded) {
            return;
        }
        expanded = false;
        toggleSelect(sel, expanded);
    });
});

function toggleSelect(elem, expanded) {
    if (expanded) {
        cover.classList.remove('hidden');
    } else {
        cover.classList.add('hidden');
    }
    elem.setAttribute('aria-expanded', expanded);
}

// handle text overflow
function setFadeEffects(elems) {
    elems.forEach(el => {
        if (el.scrollWidth > el.clientWidth) {
            el.classList.add('ovf-fade');
            el.parentNode.classList.add('hint');
        } else {
            el.classList.remove('ovf-fade');
            el.parentNode.classList.remove('hint');
        }
    });
}

// tab links (most used on filters)
findAll('.tab-links').forEach(parent => {
    const links = Array.from(parent.querySelectorAll('.tab-link'));
    let active = links.find(l => l.classList.contains('active'));
    if (!active) {
        active = links[0];
        active.classList.add('active');
    }

    links.forEach(l => l.addEventListener('click', e => {
        if (e.target === active || !links.includes(e.target)) {
            return;
        }
        active.classList.remove('active');
        active = e.target;
        active.classList.add('active');
    }));
});

// input validation
function initInputValidation() {
    findAll('input[type="number"]').forEach(inp => inp.addEventListener('keydown', e => {
        if ((isNaN(e.key) && e.keyCode !== 8 && e.key.toLowerCase() !== 'backspace') || e.keyCode === 32) {
            e.preventDefault();
        }
    }));
}

// init filter calendar
function initFilterCalendar(target) {
    target.querySelectorAll('.adv-filter-date').forEach(container => {

        const dateFromTextElem = container.querySelector('.filter-date-from');
        const dateToTextElem = container.querySelector('.filter-date-to');

        const dateFromInputField = container.querySelector('.date-input-field.date-from');
        const dateToInputField = container.querySelector('.date-input-field.date-to');

        const wrapperFrom = dateFromInputField.parentNode.parentNode;
        const wrapperTo = dateToInputField.parentNode.parentNode;

        wrapperFrom.setAttribute('data-empty', 'true');
        wrapperTo.setAttribute('data-empty', 'true');

        const btns = container.querySelectorAll('.calendar-open-btn--double');
        btns.forEach(btn => btn.addEventListener('click', () => {
            if (container.querySelector('.calendar') !== null) {
                return;
            }

            const strDateFrom = dateFromTextElem.getAttribute('data-date');
            const strDateTo = dateToTextElem.getAttribute('data-date');
            if (strDateFrom) {
                setDateInputFieldValue(dateFromInputField, new Date(strDateFrom.trim()));
                wrapperFrom.setAttribute('data-empty', 'false');
            } else {
                clearDateInputField(dateFromInputField);
            }
            if (strDateTo) {
                setDateInputFieldValue(dateToInputField, new Date(strDateTo.trim()));
                wrapperTo.setAttribute('data-empty', 'false');
            } else {
                clearDateInputField(dateToInputField);
            }

            container.classList.add('calendar-expanded');

            const calendar = showDoubleCalendar(container, dateFrom => {
                setDateInputFieldValue(dateFromInputField, dateFrom);
                dateFromTextElem.setAttribute('data-date', dateFrom.toLocaleDateString());
                wrapperFrom.setAttribute('data-empty', false);
            }, dateTo => {
                setDateInputFieldValue(dateToInputField, dateTo);
                dateToTextElem.setAttribute('data-date', dateTo.toLocaleDateString());
                wrapperTo.setAttribute('data-empty', false);

            }, (dateFrom, dateTo, err) => {
                if (err) {
                    // console.log(err);
                }

                try {
                    dateFromTextElem.textContent = formatDate(getDateInputFieldValue(dateFromInputField));
                } catch (e) {
                    wrapperFrom.setAttribute('data-empty', 'true');
                    dateFromTextElem.textContent = '';
                }

                try {
                    dateToTextElem.textContent = formatDate(getDateInputFieldValue(dateToInputField));
                } catch (e) {
                    wrapperTo.setAttribute('data-empty', 'true');
                    dateToTextElem.textContent = '';
                }

                container.classList.remove('calendar-expanded');
                calendar.close();
            });

            dateFromInputField.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
                wrapperFrom.setAttribute('data-empty', checkDateInputFieldEmpty(dateFromInputField));
                try {
                    const date = getDateInputFieldValue(dateFromInputField);
                    calendar.first.setDate(date);
                } catch (e) {}
            }));
            dateToInputField.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
                wrapperTo.setAttribute('data-empty', checkDateInputFieldEmpty(dateToInputField));
                try {
                    const date = getDateInputFieldValue(dateToInputField);
                    calendar.second.setDate(date);
                } catch (e) {}
            }));

            window.addEventListener('click', (event) => {
                try {
                    dateFromTextElem.textContent = formatDate(getDateInputFieldValue(dateFromInputField));
                } catch (e) {
                    wrapperFrom.setAttribute('data-empty', 'true');
                    dateFromTextElem.textContent = '';
                }

                try {
                    dateToTextElem.textContent = formatDate(getDateInputFieldValue(dateToInputField));
                } catch (e) {
                    wrapperTo.setAttribute('data-empty', 'true');
                    dateToTextElem.textContent = '';
                }

                if (!event.target.closest('.adv-filter-date') && !event.target.closest('.calendar-wrapper') && document.querySelector('.calendar-wrapper')) {
                    container.classList.toggle('calendar-expanded');
                    calendar.close();
                }

            });

            const [cross1, cross2] = container.querySelectorAll('.cross');
            cross1.addEventListener('click', () => {
                clearDateInputField(dateFromInputField);
                wrapperFrom.setAttribute('data-empty', 'true');
                dateFromTextElem.removeAttribute('data-date');
                calendar.first.clear();
                dateFromTextElem.textContent = '';
            });
            cross2.addEventListener('click', () => {
                clearDateInputField(dateToInputField);
                wrapperTo.setAttribute('data-empty', 'true');
                dateToTextElem.removeAttribute('data-date');
                calendar.second.clear();
                dateToTextElem.textContent = '';
            });
        }));
    });
}

// expanding list with links
function initExpandingLists(target) {
    target.querySelectorAll('.adv-item__links').forEach(list => {

        if (list.querySelectorAll('li').length < 3) {
            return;
        }

        const defaultBtnText = 'Еще';
        const clickedBtnText = 'Свернуть';

        const btn = list.querySelector('.service-item a');
        btn.innerHTML = defaultBtnText;

        toggleExpandingList(list, false);

        btn.addEventListener('click', e => {
            toggleExpandingList(list);
            btn.innerHTML = btn.innerHTML === defaultBtnText ? clickedBtnText : defaultBtnText;
        });
    });
}

function toggleExpandingList(list, expanded = null) {
    if (expanded === null) {
        expanded = !(list.getAttribute('aria-expanded') === 'true');
    }

    if (expanded) {
        list.classList.remove('show-on-adv-item-hover');
    } else {
        list.classList.add('show-on-adv-item-hover');
    }
    list.setAttribute('aria-expanded', expanded);
    const links = list.querySelectorAll('li:not(.service-item)');
    for (let i = 1; i < links.length; i++) {
        if (expanded) {
            links[i].classList.remove('hidden');
        } else {
            links[i].classList.add('hidden');
        }
    }
}

// date input fields
function initDateInputFields(target) {
    target.querySelectorAll('.date-input-field').forEach(field => {
        field.querySelectorAll('input').forEach(f => f.addEventListener('keydown', e => {
            if ((isNaN(e.key) && !(e.keyCode === 8 || e.key.toLowerCase() === 'backspace') && e.keyCode !== 37 && e.keyCode !== 39 && e.keyCode !== 9) || e.keyCode === 32) {
                e.preventDefault();
            }
        }));

        const dayField = field.querySelector('.day');
        const monthField = field.querySelector('.month');
        const yearField = field.querySelector('.year');

        dayField.addEventListener('input', () => {
            const n = +dayField.value;
            if (dayField.value.length === 2 && !(1 <= n && n <= 31)) {
                dayField.value = dayField.value.slice(0, -1);
            }
            if (dayField.value.length === 2) {
                monthField.focus();
            }
        });
        dayField.addEventListener('focusout', () => {
            if (dayField.value.length === 1) {
                dayField.value = String(dayField.value).padStart(2, '0');
            }
        });

        monthField.addEventListener('input', () => {
            const n = +monthField.value;
            if (monthField.value.length === 2 && !(1 <= n && n <= 12)) {
                monthField.value = monthField.value.slice(0, -1);
            }
            if (monthField.value.length === 2) {
                yearField.focus();
            }
        });
        monthField.addEventListener('focusout', () => {
            if (monthField.value.length === 1) {
                monthField.value = String(monthField.value).padStart(2, '0');
            }
        });

        yearField.addEventListener('input', () => {
            if (yearField.value.length > 4) {
                yearField.value = yearField.value.slice(0, -1);
            }
        });
        yearField.addEventListener('focusout', () => {
            if (0 < yearField.value.length && yearField.value.length < 4) {
                yearField.value = String(yearField.value).padStart(4, '0');
            }
        });
    });
}

function clearDateInputField(field) {
    field.querySelectorAll('input').forEach(inp => inp.value = '');
}

function getDateInputFieldValue(field) {
    const day = field.querySelector('.day').value;
    const month = field.querySelector('.month').value;
    const year = field.querySelector('.year').value;
    const dateStr = day + '.' + month + '.' + year;
    if (dateStr.match('[0-9]{2}.[0-9]{2}.[0-9]{4}')) {
        return new Date(`${month}/${day}/${year}`);
    }

    throw new Error('cannot get date from input field: no valid date there');
}

function setDateInputFieldValue(field, date) {
    field.querySelector('.day').value = String(date.getDate()).padStart(2, '0');
    field.querySelector('.month').value = String((+date.getMonth() + 1)).padStart(2, '0');
    field.querySelector('.year').value = String(date.getFullYear()).padStart(4, '0');
}

function checkDateInputFieldEmpty(field) {
    const day = field.querySelector('.day').value;
    const month = field.querySelector('.month').value;
    const year = field.querySelector('.year').value;

    return day === '' && month === '' && year === '';
}



async function fetchData() {
    services = await fetch(SERVICES_URL).then(data => data.json());
    articleTemplate = await fetch(ARTICLE_TEMPLATE_URL).then(data => data.text());

    for (const k of Object.keys(services)) {
        servicesLogos[k] = await fetch(services[k].logoUrl).then(data => data.text());
    }

    const json = await fetch(ARTICLES_URL).then(data => data.json());
    articles = json.map(obj => ({
        el: null, checked: false, data: {
            img: {
                url: obj.logo_url || (obj.type === 'resume' ? DEFAULT_PHOTO_URL : DEFAULT_LOGO_URL),
                className: obj.type === 'resume' ? 'avatar-circle' : 'avatar-square'
            },
            title: obj.title,
            _type: obj.type,
            _state: obj.state,
            _date: obj.date,
            price: obj.price,
            _autoProlong: obj.auto_prolong,
            rating: obj.rating,
            cityList: obj.city_list,
            links: obj.links.map(l => ({
                text: l.text, url: l.url, free: l.free
            })),
            views: obj.views,
            favourites: obj.favourites,
            dialogs: obj.dialogs,
            newMessages: obj.new_messages,
            growth: obj.growth,
            responses: obj.responses,
            matchingVacancies: obj.matching_vacancies,
            daysPublished: obj.days_published,
            servicesCount: obj.services.find(s => s.id === 1) ? obj.services.length : obj.services.length + 1,
            _services: obj.services.reduce((acc, s) => {
                acc[s.id] = {
                    dateFrom: s.date_from, dateTo: s.date_to
                };
                return acc;
            }, {}),
        }
    }));

    return articles;
}

function appendArticle(article) {
    articlesContainer.appendChild(article);
}

async function printArticles(articles) {
    articlesContainer.innerHTML = '';
    for (const a of articles) {
        let setupNeeded = false;
        if (a.el === null) {
            a.el = await renderArticle(a.data);
            setupNeeded = true;
        }

        appendArticle(a.el);

        if (setupNeeded) {
            setupArticle(a);
        }
    }
}

function setupArticle(article) {

    initExpandingLists(article.el);

    initDateInputFields(article.el);
    initArticleCalendar(article);

    initArticleDates(article);

    initProlongCheckbox(article);
}



// setup article functions
function initProlongCheckbox(article) {
    const checkboxEnable = article.el.querySelector('.adv-item__auto-prolong .enable .fancy-radiobutton');
    const labelEnable = checkboxEnable.nextElementSibling;

    const checkboxDisable = article.el.querySelector('.adv-item__auto-prolong .disable .fancy-radiobutton');
    const labelDisable = checkboxDisable.nextElementSibling;

    const id = Date.now();
    checkboxEnable.setAttribute('id', 'auto-prolong-enable-' + id);
    labelEnable.setAttribute('for', 'auto-prolong-enable-' + id);

    checkboxDisable.setAttribute('id', 'auto-prolong-disable' + id);
    labelDisable.setAttribute('for', 'auto-prolong-disable' + id);

    checkboxEnable.setAttribute('name', 'auto-prolong-' + id);
    checkboxDisable.setAttribute('name', 'auto-prolong-' + id);

    if (article.data._autoProlong) {
        checkboxEnable.setAttribute('checked', 'checked');
    } else {
        checkboxDisable.setAttribute('checked', 'checked');
    }
}

function initArticleCalendar(article) {
    const container = article.el.querySelector('.calendar-container');
    const btn = container.querySelector('.calendar-open-btn');
    btn.addEventListener('click', () => {
        if (article.el.querySelector('.calendar') !== null) {
            return;
        }
        container.setAttribute('data-state', 'focused');

        const dateTextElem = container.querySelector('.date-value');

        const dateInputField = container.querySelector('.date-input-field');
        const dateInputFieldDay = dateInputField.querySelector('.day');

        const errorHintText = container.querySelector('.hint__text');

        // clearDateInputField(dateInputField);
        setDateInputFieldValue(dateInputField, new Date(dateTextElem.getAttribute('data-date').trim()));
        dateInputFieldDay.focus();

        const calendar = showSingleCalendar(container, date => {
            setDateInputFieldValue(dateInputField, date);
            container.setAttribute('data-state', 'focused');
        }, (date, err) => {
            if (err) {
                try {
                    const date = getDateInputFieldValue(dateInputField);
                    dateTextElem.textContent = formatDate(date);
                    article.data._date.deactivation = date;
                    initArticleDates(article);
                    container.removeAttribute('data-state');
                    calendar.close();
                } catch (e) {
                    container.setAttribute('data-state', 'error');
                }
                return;
            }
            dateTextElem.textContent = formatDate(date);
            article.data._date.deactivation = date;
            initArticleDates(article);
            container.removeAttribute('data-state');
            calendar.close();
        });

        cover.addEventListener('click', () => {
            try {
                const date = getDateInputFieldValue(dateInputField);
                dateTextElem.textContent = formatDate(date);
                article.data._date.deactivation = date;
                initArticleDates(article);
                container.removeAttribute('data-state');
                calendar.close();
            } catch (e) {
                container.setAttribute('data-state', 'error');
            }
        });

        dateInputField.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => {
            container.setAttribute('data-state', 'focused');
            try {
                const date = getDateInputFieldValue(dateInputField);
                try {
                    calendar.setDate(date);
                } catch (e) {
                    calendar.clear();
                    dateInputFieldDay.focus();
                    clearDateInputField(dateInputField);
                    errorHintText.style.display = 'block';
                    setTimeout(() => {
                        errorHintText.style.display = 'none';
                    }, 2000);
                }
            } catch (e) {
            }
        }));
    });
}

function initArticleDates(article) {
    const deactivationValueElem = article.el.querySelector('.adv-item__state .calendar-container .date-value');
    deactivationValueElem.setAttribute('data-date', article.data._date.deactivation);
    deactivationValueElem.textContent = formatDate(new Date(article.data._date.deactivation));

    article.el.querySelector('.expires .value').textContent = getDayDifference(new Date(article.data._date.activation), new Date(article.data._date.deactivation));

    const updateDateBtn = article.el.querySelector('.adv-item__dates .update-time-btn');
    updateDateBtn.addEventListener('click', () => {
        const date = new Date();
        article.el.querySelector('.adv-item__dates .updated .date-value').textContent = formatDateDots(date);
        article.el.querySelector('.adv-item__dates .updated .time-value').textContent = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        updateDateBtn.classList.add('hidden');
    });
}


initFilterCalendar(document.body);
initDateInputFields(document.body);
initInputValidation();