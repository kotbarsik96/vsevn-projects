data-radio-container:
    Создает внутри элемента анимированную радиокнопку. Если есть input - будет вставлено после него

Cookie: 
    1. Верстка:
    <div class="cookie none">
        <div class="cookie__wrapper">
            <p>
                Файлы cookie помогают нам предоставлять наши услуги. Наша политика использования файлов cookie
                объясняет,
                как мы используем файлы cookie и как их отключить.
            </p>
            <button class="cookie__button cookie__button--ok" type="button">ok</button>
            <a class="cookie__link cookie__link--learn-more" href="#">Узнать больше</a>
        </div>
    </div>
    2. При нажатии на "Ок", результат записывается в localStorage, поэтому повторно появляться не будет, пока не будет очищен кэш/localStorage.

Spoiler: 
    Описание: реализует спойлер. Для инициализации нужно, чтобы присутствовало 3 элемента: 
        <div class="spoiler>
            <button class="spoiler__button" type="button"></button>
            <div class="spoiler__body"></div>
        </div>
    Возможно и присутствие элемента <button class="spoiler__button--back"  type="button"></button>, который, если есть, при открытом спойлере потеряет класс "none", а .spoiler__button его получит до тех пор, пока спойлер не закроется. Однако, если поместить эту вторую кнопку внутрь .spoiler__body, класс "none" на нее навешен не будет.

TextInput:
    Описание: текстовое поле. Может принимать параметры, в обычном случае реализует минимальный функционал: появление кнопки "очистить поле", стилизация поля в зависимости от того, введено ли значение.
    Для input инициализации нужно указать один из вариантов::
    1. 
        <div class="text-input--standard" data-params="...">
            <div class="text-input__wrapper">
                <div class="text-input__input"></div>
                [ОПЦИОНАЛЬНО] <span class="text-input__icon icon-..."></span>
            </div>
        </div>
    2.
        <div class="text-input--standard" data-params="...">
            <div class="text-input--standard__wrapper">
                <div class="text-input--standard__input"></div>
            </div>
        </div>
    Вариант 2. нужен, когда стили не надо указывать, т.е. у text-input--standard итак нет стилей, а у "...__wrapper" и "__input" они есть, поэтому, при добавлении "--standard" перед ними, этих стилей не будет, но они будут инициализированы
    
    1. data-params:
        1. prefix::text, где text будет отображен как префикс при вводе значения в поле. При фокусе на поле префикс пропадает, при расфокусе - возвращается
        2. typeNumbersOnly::true - по умолчанию false, в поле можно будет печатать только цифры
        3. typeExceptions::regexp - если указан typeNumbersOnly::true, regexp будет добавлен к тому, что также можно печатать, помимо цифр

double-input:
    Сам по себе это не компонент, это элемент, использующийся, когда нужно вставить два input как одно поле. Пример: цена от и до, дата от и до.
    Верстка:
    <div class="double-input">
        <div class="double-input__item">
            <div class="text-input"></div>....
        </div>
        <div class="double-input__item">
            <div class="text-input"></div>....
        </div>
    </div>
    Т.е. обязательно поля должны быть внутри либо сами иметь класс dobule-input__item, чтобы стили работали корректно

DateInputs: 
    Верстка:
    <div class="date-inputs text-input--standard__input">
        <input type="text"
            class="date-inputs__input date-inputs__input--date">
        <div class="date-inputs__delimeter">.</div>
        <input type="text"
            class="date-inputs__input date-inputs__input--month">
        <div class="date-inputs__delimeter">.</div>
        <input type="text"
            class="date-inputs__input date-inputs__input--year">
    </div>
    1. data-params:
        1. defaultDate::dd.mm.yyyy - дата, выставляемая по умолчанию

ToggleOnchecked:
    1. Инициализируется атрибутом data-toggle-onchecked="show::selector1, selector2" на input с типом radio или checkbox
    2. При инициализации те селекторы, что указаны в data-toggle-onchecked, используются для поиска элементов на странице, ближайших к input'у. Если элемент не найден, он будет собран при последующих инициализациях, т.е. элемент в селекторе может изначально отсутствовать, но как только он появится, он будет перемещен в список скрываемых/показываемых (show, hide)
    3. При событии change элементы:
        1. show::selector1, selector2 - показываются, если checked === true, либо скрываются, если checked == false;

Select:
    Выглядит как обычный селект <select></select>. Для того, чтобы его инициализировать, нужно прописать:
        <div class="select" data-params="name::name">
            <div class="select__options-list">
                <label class="select__option">
                    <input type="radio" value="value">
                    [OPTIONAL:] <span>otherValueString</span>
                </label>
            </div>
        </div>
    ВАЖНО, что далее создастся блок .select__container, куда поместятся блоки ".select__options" и создаваемый скриптом ".select__value"
    1. data.params: 
        1. name::name. ОБЯЗАТЕЛЬНЫЙ ПАРАМЕТР! Будет выставлен в каждый input;
        2. enablePagination::true - будет включена пагинация, т.е. появятся стрелки слева и справа, при нажатии на которые будет выбрано предыдущее/следующее значение селекта соответственно;
        3. paginationReverse::true - будет перевернут порядок пагинации;
        4. useSpanAsValue::true - при выборе, в блок .select__value вместо значения, находящегося в <input type="radio" value="value">, будет попадать сам span, находящийся в соседстве с этим input'ом;
        5. initialIndex::index - где index может принимать любое значение. Если index < 0, то хначение по умолчанию не будет выставлено; если index >= 0, то будет выставлено значение по индексу, но если значения по индексу нет, будет считаться, что был передан index < 0;
        6. cross::true - при выборе значений появится иконка очистки поля, которой нет по умолчанию
    2. В значение value у каждого <input type="radio" value="value"> передается то, что будет выставлено в селект при выборе этого значения. По умолчанию, span внутри <label class="select__option"> отсутствует, тогда он создастся автоматически и внутрь него будет помещено значение value. Если создать span, то он не будет перезаписан.
    3. Элементу .select можно добавить класс select--styled, тогда селект будет стилизован также, как и текстовое поле

Calendar:
    1. Верстка:
        <div class="calendar" data-params="...">
            <div class="calendar__preview">
                <div class="text-input--standard__input">
                    <div class="calendar__preview-inputs date-inputs">
                        <input type="text"
                            class="date-inputs__input date-inputs__input--date"
                            placeholder="ДД">
                        <div class="date-inputs__delimeter">.</div>
                        <input type="text"
                            class="date-inputs__input date-inputs__input--month"
                            placeholder="ММ">
                        <div class="date-inputs__delimeter">.</div>
                        <input type="text"
                            class="date-inputs__input date-inputs__input--year"
                            placeholder="ГГГГ">
                    </div>
                </div>
            </div>
        </div>
    Верстка не обязательно может быть один в один с этой; главное, чтобы был порядок в расположении ключевых элементов: .calendar->.calendar__preview->.calendar__preview-inputs->[input'ы с днем, месяцем и годом]
    2. data-params:
        1. defaultDate::dd.mm.yyyy - дата, выставляемая по умолчанию при загрузке календаря

CalendarDouble:
    1. Верстка: 
        <div class="calendar-double double-input">
            <div class="double-input__wrapper">
                <div class="calendar double-input__item">
                    <div class="text-input--standard text-input">
                        <div class="text-input__wrapper">
                            <div class="text-input__block-prefix">От</div>
                            <div class="text-input__input calendar__preview">
                                <div class="date-inputs calendar__preview-inputs">
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--date"
                                        placeholder="ДД">
                                    <div class="date-inputs__delimeter">.</div>
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--month"
                                        placeholder="ММ">
                                    <div class="date-inputs__delimeter">.</div>
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--year"
                                        placeholder="ГГГГ">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="calendar double-input__item">
                    <div class="text-input--standard text-input">
                        <div class="text-input__wrapper">
                            <div class="text-input__block-prefix">До</div>
                            <div class="text-input__input calendar__preview">
                                <div class="date-inputs calendar__preview-inputs">
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--date"
                                        placeholder="ДД">
                                    <div class="date-inputs__delimeter">.</div>
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--month"
                                        placeholder="ММ">
                                    <div class="date-inputs__delimeter">.</div>
                                    <input type="text"
                                        class="date-inputs__input date-inputs__input--year"
                                        placeholder="ГГГГ">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    Как и у одиночного календаря, здесь приведен просто пример: главное, чтобы имелся родитель .calendar-double, внутри которого каким-либо* образом расположены .calendar (*в соответствии с порядком, определенным для инициализации Calendar, т.к. двойной CalendarDouble - это два инициализированных Calendar)
    2. data-params указываются отдельно для каждого Calendar (.calendar).

Подгрузка SVG-иконок (RenderSVG):
    1. Если нужно подгрузить иконку в верстку в html файле, нужно создать элемент <div data-svg-placeholder="svgName"></div>, где svgName === svgName в файле svg.html. 
    2. Если нужно подгрузить иконку в верстку, расписанную внутри js, нужно воспользоваться методом renderSVG.getSVG(svgName), где svgName тот же, что в 1.

CheckboxesModal:
    1. Создается через data-create-modal="checkboxesModalDouble"
    2. data-params:
        1. Обязательно передать modalWindowClassname::checkboxes-modal X; , где вместо X может быть:
            1. checkboxes-modal--regions - инициализирует class CheckboxesModalRegions
        2. search::title - где title будет отображать название поля поиска
        3. firstTitle::title - название первого окна
        4. secondTitle::title - название второго окна
    3. data-checkboxes-modal-params - параметры самого CheckboxesModal:
        1. name::value - будет выставлено у чекбоксов и в hiddenInput
        2. requiredListForApply::index - индекс (0, 1) списка, в котором необходимо выбрать хотя бы один чекбокс для того, чтобы кнопка "Выбрать" была активна.
    
CheckboxesModalRegions:
    1. Создает под элементом [data-create-modal] два input[type="hidden"], в первый будет записывать регионы в формате Регион1|Регион2|... и в этом же формате запишет города во второй
    