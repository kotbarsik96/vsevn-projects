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

Select:
    Выглядит как обычный селект <select></select>. Для того, чтобы его инициализировать, нужно прописать:
        <div class="select" data-params="name::name">
            <div class="select__options-list">
                <label class="select__option">
                    <input type="radio" value="value">
                </label>
            </div>
        </div>
    ВАЖНО, что далее создастся блок .select__container, куда поместятся блоки ".select__options" и создаваемый скриптом ".select__value"
    1. data.params: 
        1. name::name. ОБЯЗАТЕЛЬНЫЙ ПАРАМЕТР! Будет выставлен в каждый inputж
        2. enablePagination::true - будет включена пагинация, т.е. появятся стрелки слева и справа, при нажатии на которые будет выбрано предыдущее/следующее значение селекта соответственно;
        3. paginationReverse::true - будет перевернут порядок пагинации

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

Подгрузка SVG-иконок:
    1. Если нужно подгрузить иконку в верстку в html файле, нужно создать элемент <div data-svg-placeholder="svgName"></div>, где svgName === svgName в файле svg.html. 
    2. Если нужно подгрузить иконку в верстку, расписанную внутри js, нужно воспользоваться методом renderSVG.getSVG(svgName), где svgName тот же, что в 1.

CheckboxesModal:
    1. Создается через data-create-modal="checkboxesModalDouble"
    2. data-params:
        1. Обязательно передать modalWindowClassname::checkboxes-modal X; , где вместо X может быть:
            1. checkboxes-modal--regions - инициализирует class CheckboxesModalRegions

CheckboxesModalRegions:
    