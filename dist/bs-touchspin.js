/**
 * Bootstrap TouchSpin - Custom input spinner component for Bootstrap
 *
 * @version 1.0.1
 * @releaseDate 2025-06-19
 * @author Thomas Kirsch <t.kirsch@webcito.de>
 * @license MIT
 *
 * A highly customizable jQuery plugin that creates a Bootstrap-styled spinner input
 * with increment/decrement buttons. Features include:
 * - Configurable step sizes and value ranges
 * - Custom formatting options (number, currency, percentage)
 * - Responsive button controls with customizable icons
 * - Support for keyboard input and button press-and-hold
 * - Event callbacks for value changes
 * - Localization support for number formatting
 * - Compatible with Bootstrap 5.x themes
 * - Extensible through custom formatters and callbacks
 */
(function ($) {
        "use strict";

        /**
         * Main plugin namespace containing configuration, utility methods and defaults
         * @namespace
         */
        $.bsTouchspin = {
            setDefaults: function (options) {
                this.defaults = $.extend(true, {}, this.defaults, options || {});
            },
            getDefaults: function () {
                return this.defaults;
            },
            setConfig: function (options) {
                this.config = $.extend(true, {}, this.config, options || {});
            },
            getConfig: function () {
                return this.config;
            },
            defaults: {
                size: null, // null | sm | lg
                step: "any",
                min: null,
                max: null,
                decimals: null,
                prefix: null,
                postfix: null,
                allowInput: true,
                buttons: {
                    up: {
                        class: 'btn-secondary rounded-end-pill fw-bold',
                        icon: 'bi bi-plus-lg',
                        iconSetZero: 'bi bi-trash',
                    },
                    down: {
                        class: 'btn-secondary rounded-start-pill fw-bold',
                        icon: 'bi bi-dash-lg',
                        iconSetZero: 'bi bi-trash',
                    }
                },
                formatter: 'number',
                onInit: function (value) {
                },
                onStart: function (value) {
                },
                onStop: function (value) {
                }
            },
            config: {
                minSpeed: 1,
                startSpeed: 600,
                delay: 1000,
                locale: 'en-US',
                maximumMax: (2 ** 31) - 1, // 2,147,483,647
                maximumMin: -(2 ** 31) // -2,147,483,648
            },
            utils: {
                /**
                 * Determines the number of decimal places in a given number or numeric string.
                 * If the input contains a decimal point, the method calculates the number of digits after the decimal point.
                 *
                 * @param {number|string} num - The input value to evaluate, which can be a number or a string representation of a number.
                 * @return {number} The number of decimal places in the input, or 0 if there are no decimal places or the input is invalid.
                 */
                getDecimalBySteps(num) {
                    if (isNaN(num)) {
                        return 0; // Gibt 0 zurück, wenn der Wert keine gültige Zahl ist
                    }

                    const decimalPart = num.toString().split(".")[1]; // Prüfe auf Dezimalstellen
                    return decimalPart ? decimalPart.length : 0; // Gib die Anzahl der Nachkommastellen zurück
                },
                /**
                 * Formats a given number to a specified number of decimal places and locale.
                 *
                 * @param {number} number - The number to be formatted.
                 * @param {number} [decimalPlaces=2] - The number of decimal places to format the number to. Defaults to 2.
                 * @param {string} [locale='en-US'] - The locale to be used for formatting. Defaults to 'en-US'.
                 * @return {string} The formatted number as a string.
                 */
                formatNumber(number, decimalPlaces = 2, locale = 'en-US') {
                    return new Intl.NumberFormat(locale, {
                        minimumFractionDigits: decimalPlaces,
                        maximumFractionDigits: decimalPlaces
                    }).format(number);
                },
                /**
                 * Formats a given number as a percentage string based on the specified locale and decimal precision.
                 *
                 * @param {number} value - The numerical value to be formatted as a percentage.
                 * @param {number} [decimals=2] - The number of decimal places in the formatted percentage.
                 * @param {string} [locale='en-US'] - The locale to use for formatting the percentage.
                 * @return {string} The formatted percentage string.
                 */
                formatPercent(value, decimals = 2, locale = 'en-US') {
                    return new Intl.NumberFormat(locale, {
                        style: 'percent',
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals
                    }).format(value);
                },
                /**
                 * Formats a given number as a currency string.
                 *
                 * @param {number} value - The numeric value to format as currency.
                 * @param {number} [decimals=2] - The number of decimal places to include in the formatted output.
                 * @param {string} [locale='en-US'] - The locale identifier used to format the currency string.
                 * @return {string} The formatted currency string.
                 */
                formatCurrency(value, decimals = 2, locale = 'en-US') {
                    return new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency: 'EUR',
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals
                    }).format(value);
                }
            }
        };

        const wrapperClass = 'bs-touchspin-wrapper';
        const wrapperClassFormatted = 'bs-touchspin-formatted-wrapper';

        function formatNumber(number, decimalPlaces = 2) {
            return new Intl.NumberFormat('de-DE', {
                minimumFractionDigits: decimalPlaces,
                maximumFractionDigits: decimalPlaces
            }).format(number);
        }

        /**
         * Retrieves the settings associated with the specified input element.
         *
         * @param {Object} $input - A jQuery object representing the input element.
         * @return {Object} The settings object related to the specified input element.
         */
        function getSettings($input) {
            return $input.data('touchspin');
        }

        /**
         * Updates the settings of a given input element with the provided configuration.
         *
         * @param {jQuery} $input - The jQuery-wrapped input element to update settings for.
         * @param {Object} settings - The settings object containing configuration options to apply.
         * @return {void} This method does not return a value.
         */
        function setSettings($input, settings) {
            $input.data('touchspin', settings);
        }

        /**
         * Retrieves the closest parent element with the specified wrapper class.
         *
         * This function takes a jQuery object as input and finds the closest ancestor
         * element matching the CSS class defined by `wrapperClass`. The function is
         * useful for locating specific container elements relative to a child element.
         *
         * @param {jQuery} $input - The jQuery object representing the child element to start the search from.
         * @returns {jQuery} The jQuery object representing the closest ancestor with the wrapper class.
         */
        const getWrapper = function ($input) {
            return $input.closest('.' + wrapperClass);
        }

        /**
         * Updates the states of increment and decrement buttons based on the input value, settings, and other constraints such as min, max, and step.
         *
         * @param {jQuery} $input - The input element for which the button states need to be updated.
         * @return {void} No return value; the function modifies the button states directly.
         */
        function updateButtonStates($input) {
            const wrapper = getWrapper($input);
            const settings = getSettings($input);
            const btnDown = wrapper.find('[data-touchspin-down]');
            const btnUp = wrapper.find('[data-touchspin-up]');
            const step = settings.step; // Schrittweite

            if (step === "any") {
                // Bei "any" keine Deaktivierung der Buttons vornehmen
                btnDown.prop('disabled', false);
                btnUp.prop('disabled', false);
                return;
            }

            const value = parseFloat($input.val()) || 0;
            const decimals = settings.decimals || 0;

            // Rundungsfunktion mit Absicherung
            const roundToDecimals = (val) => {
                const num = parseFloat(val);
                return isNaN(num) ? 0 : Number(num.toFixed(decimals));
            };

            const roundedValue = roundToDecimals(value);
            const stepAboveZero = roundToDecimals(step);
            const stepBelowZero = roundToDecimals(-step);

            const btnUpIcon = btnUp.find('i');
            const btnDownIcon = btnDown.find('i');
            // Symbole für Up-/Down-Button anpassen
            if (roundedValue === stepBelowZero) {
                btnUpIcon
                    .removeClass(settings.buttons.up.icon)
                    .addClass(settings.buttons.up.iconSetZero);
            } else {
                btnUpIcon
                    .removeClass(settings.buttons.up.iconSetZero)
                    .addClass(settings.buttons.up.icon);
            }

            if (roundedValue === stepAboveZero) {
                btnDownIcon
                    .removeClass(settings.buttons.down.icon)
                    .addClass(settings.buttons.down.iconSetZero);
            } else {
                btnDownIcon
                    .removeClass(settings.buttons.down.iconSetZero)
                    .addClass(settings.buttons.down.icon);
            }

            // Aktivieren/Deaktivieren der Buttons basierend auf min/max
            if (settings.min !== null && roundedValue <= roundToDecimals(settings.min)) {
                btnDown.prop('disabled', true);
            } else {
                btnDown.prop('disabled', false);
            }

            if (settings.max !== null && roundedValue >= roundToDecimals(settings.max)) {
                btnUp.prop('disabled', true);
            } else {
                btnUp.prop('disabled', false);
            }
        }

        /**
         * Validates and adjusts the value of the given input field based on its settings and state.
         *
         * @param {jQuery} $input - The input element to validate.
         * @param {boolean} [isFinal=false] - Indicates whether the validation is final (e.g., on user input completion).
         * @return {number} - The validated and adjusted numeric value of the input.
         */
        function validateValue($input, isFinal = false) {
            const wrapper = getWrapper($input);
            const settings = getSettings($input);
            let inputValue = $input.val();
            const vars = getVars($input);

            inputValue = inputValue.replace(',', '.');

            let numericValue = parseFloat(inputValue);
            if (isNaN(numericValue)) {
                numericValue = isFinal ? 0 : null;
            }

            const decimals = settings.decimals || 0;

            if (numericValue !== null) {
                numericValue = Number(numericValue.toFixed(decimals));

                if (settings.min !== null && numericValue < settings.min) {
                    numericValue = settings.min;
                }
                if (settings.max !== null && numericValue > settings.max) {
                    numericValue = settings.max;
                }
            } else {
                numericValue = 0;
            }

            $input.val(numericValue.toFixed(decimals));

            if (isFinal) {
                const startValue = vars.startValue || 0;
                const stopValue = numericValue;
                const diff = parseFloat((stopValue - startValue).toFixed(decimals)); // Auf 2 Nachkommastellen runden
                vars.startValue = null;
                $input.trigger('stop.bs.touchspin', [stopValue, diff]);
                if (typeof settings.onStop === 'function') {
                    settings.onStop(stopValue, diff); // Custom Callback ausführen
                }
                setVars($input, vars);
            }

            updateButtonStates($input);

            return numericValue;
        }

        /**
         * Adjusts the value in an input field by responding to a button click event.
         * The function calculates the new value based on settings, current value, step size, and boundaries (min/max).
         * It also ensures rounding and formatting are handled properly.
         *
         * @param {jQuery} $input - The input field element to be modified. It must contain appropriate data attributes or properties for settings and variables.
         * @return {void} This function does not return a value but updates the value of the input field directly.
         */
        function changeValueByBtnClick($input) {
            const settings = getSettings($input); // Hole die Einstellungen
            const vars = getVars($input); // Variablen (Richtung etc.)
            let value = parseFloat($input.val()) || 0; // Aktuellen Wert holen

            // Funktion zur Rundung auf eine bestimmte Anzahl von Dezimalstellen
            const roundToDecimals = (num, decimals) => {
                const factor = Math.pow(10, decimals);
                return Math.round(num * factor) / factor;
            };

            // Normale Schrittweite verwenden
            const decimals = settings.decimals || 0;
            value = (value + vars.direction * settings.step);
            value = roundToDecimals(value, decimals).toFixed(decimals); // Runde und erhalte die Null(en)


            // Prüfung auf Mindest- und Höchstgrenze
            if (settings.min !== null && parseFloat(value) < settings.min) {
                value = parseFloat(settings.min).toFixed(settings.decimals || 0); // Begrenze auf Mindestwert
            }

            if (settings.max !== null && parseFloat(value) > settings.max) {
                value = parseFloat(settings.max).toFixed(settings.decimals || 0); // Begrenze auf Maximalwert
            }

            // Aktualisiere den Wert im Input-Feld
            $input.val(value); // Setze den Wert mit der korrekten Anzeige
            toggleFormatted($input, true);
            // Aktualisiere den Zustand (Button aktivieren/deaktivieren etc.)
            updateButtonStates($input);
        }

        /**
         * Retrieves or initializes the `vars` data object for the given input.
         * If the `vars` data object does not exist on the input, it initializes it with default properties.
         *
         * @param {jQuery} $input - The input element wrapped in a jQuery object.
         * @return {Object} The `vars` data object associated with the input element.
         */
        function getVars($input) {
            if (!$input.data('vars')) {
                $input.data('vars', {
                    stepUnknown: false,
                    timeout: null,       // Für wiederholende Aktionen
                    interval: null,      // Intervall für wiederholende Funktion
                    stopDelay: null,     // Verzögerung für Stop-Event
                    minSpeed: $.bsTouchspin.config.minSpeed,
                    speed: $.bsTouchspin.config.startSpeed,   // Geschwindigkeit wird aktuallisiert
                    isStarted: false,     // Flag, ob eine Änderung gestartet wurde
                    direction: null,
                    startValue: null,
                });
            }
            return $input.data('vars');
        }

        /**
         * Sets variables into the specified input element's data attribute.
         *
         * @param {jQuery} $input - The input element wrapped in a jQuery object.
         * @param {Object} vars - The variables to set in the input element's data attribute.
         * @return {void} Does not return a value.
         */
        function setVars($input, vars) {
            $input.data('vars', vars);
        }

        /**
         * Initiates an incremental operation triggered by button click with a controlled speed reduction.
         *
         * @param {jQuery} $input - The input element associated with the incremental operation.
         * @return {void} This function does not return a value.
         */
        function startIncrement($input) {
            const vars = getVars($input); // Holen der Instanz-Variablen

            if (vars.speed >= vars.minSpeed) {
                vars.speed *= 0.9; // Geschwindigkeit verringern um 10%
            }

            changeValueByBtnClick($input);

            vars.interval = setTimeout(function () {
                startIncrement($input);
            }, vars.speed);

            setVars($input, vars);
        }

        /**
         * Attaches event handlers to the input and its related elements for managing increment, decrement, and input interactions.
         *
         * @param {jQuery} $input A jQuery object representing the input field to which the events will be attached.
         * @return {void} This function does not return anything.
         */
        function events($input) {
            const wrapper = getWrapper($input);
            const settings = getSettings($input);
            // const btnCheck = wrapper.find('[data-touchspin-man]');
            const btnDown = wrapper.find('[data-touchspin-down]');
            const btnUp = wrapper.find('[data-touchspin-up]');

            wrapper
                .on('click', '.' + wrapperClassFormatted, function (e) {
                    e.preventDefault();
                    const formattedWrapper = $(e.currentTarget);
                    const input = formattedWrapper.closest('.' + wrapperClass).find('input');
                    const settings = getSettings(input);
                    if (settings.allowInput) {
                        toggleFormatted(input, false);
                    }
                })
                .on('mousedown touchstart', '[data-touchspin-down], [data-touchspin-up]', function (e) {
                    e.preventDefault();
                    // toggleFormatted($input, true);
                    const btn = $(e.currentTarget);
                    if (btn.prop('disabled')) {
                        return;
                    }

                    const input = btn.closest('.' + wrapperClass).find('input');

                    // Stoppe alle laufenden Aktionen
                    clearAllTimers(input);

                    const vars = getVars(input);
                    // btnCheck.hide();
                    input.prop('readonly', true);

                    vars.direction = btn.is(btnDown) ? -1 : 1;
                    vars.speed = $.bsTouchspin.config.startSpeed; // Reset Speed

                    if (!vars.isStarted) {
                        // Trigger 'start.bs.touchspin' only on first start
                        const startValue = parseFloat(input.val()) || 0;
                        input.trigger('start.bs.touchspin', [startValue]);
                        vars.startValue = startValue;
                        vars.isStarted = true;

                        if (typeof settings.onStart === 'function') {
                            settings.onStart(startValue); // Execute custom callback
                        }
                        setVars(input, vars);
                    }

                    changeValueByBtnClick(input);

                    // Wiederholende Funktion starten
                    vars.timeout = setTimeout(function () {
                        startIncrement(input);
                    }, 300);

                    // Variablen aktualisieren
                    setVars(input, vars);
                })
                .on('mouseup mouseleave touchend', '[data-touchspin-down], [data-touchspin-up]', function (e) {
                    e.preventDefault();
                    const btn = $(e.currentTarget);
                    if (btn.prop('disabled')) {
                        return;
                    }
                    const input = btn.closest('.' + wrapperClass).find('input');

                    const vars = getVars(input);
                    if (!vars.isStarted) {
                        return;
                    }

                    input.prop('readonly', false);

                    // Stoppe alle laufenden Aktionen
                    clearAllTimers(input);

                    vars.stopDelay = setTimeout(function () {
                        const settings = getSettings(input);
                        const startValue = vars.startValue || 0;
                        const stopValue = parseFloat(input.val()) || 0;
                        const diff = parseFloat((stopValue - startValue).toFixed(settings.decimals));
                        vars.startValue = null;
                        input.trigger('stop.bs.touchspin', [stopValue, diff]);

                        if (typeof settings.onStop === 'function') {
                            settings.onStop(stopValue, diff); // Custom Callback ausführen
                        }
                        vars.isStarted = false; // Status zurücksetzen
                        setVars(input, vars);
                    }, $.bsTouchspin.config.delay);

                    setVars(input, vars);
                });

            $input.on('focusin', function (e) {
                const input = $(e.currentTarget);
                const settings = getSettings($input);
                clearAllTimers(input);
                const vars = getVars(input);
                if (!vars.isStarted) {
                    // Trigger 'start.bs.touchspin' only on first start
                    const startValue = parseFloat(input.val()) || 0;
                    input.trigger('start.bs.touchspin', [startValue]);
                    vars.startValue = startValue;
                    vars.isStarted = true;

                    if (typeof settings.onStart === 'function') {
                        settings.onStart(startValue); // Execute custom callback
                    }
                    setVars(input, vars);
                }
            })

            let inputProcessed = false; // Status definieren

            $input
                .on('keydown', function (e) {
                    if (e.key === "Enter") { // Prüfen, ob die Enter-Taste gedrückt wurde
                        e.preventDefault(); // Standardaktionen stoppen
                        e.stopPropagation(); // Event propagation stoppen

                        const input = $(e.currentTarget);
                        if (!inputProcessed) {
                            handleInput(input); // Funktion nur aufrufen, wenn noch nicht verarbeitet
                            inputProcessed = true;
                        }
                    }
                })
                .on('blur', function (e) {
                    e.stopPropagation(); // Event propagation stoppen

                    const input = $(e.currentTarget);
                    if (!inputProcessed) {
                        handleInput(input); // Funktion nur aufrufen, wenn Enter nicht vorher aufgerufen wurde
                        inputProcessed = true;
                    }
                })
                .on('focus', function () {
                    // Bei Fokus zurücksetzen (neue Eingabe erlaubt)
                    inputProcessed = false;
                })
                .on('keyup', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const input = $(e.currentTarget);
                    const vars = getVars(input);
                    if (vars.stepUnknown) {
                        let settings = getSettings($input);
                        const data = calculateStepByUnknown(input);
                        settings.decimals = data.decimals;
                        settings.step = data.step;
                        setSettings(input, settings);
                    }
                });

            // Initialer Zustand der Buttons
            updateButtonStates($input);
        }

        /**
         * Handles the processing of the given input by performing validation, formatting, and state management.
         *
         * @param {jQuery} $currentInput - The current input object that needs to be processed.
         * @return {void} - No return value.
         */
        function handleInput($currentInput) {
            clearAllTimers($currentInput);
            const vars = getVars($currentInput);

            validateValue($currentInput, true);
            toggleFormatted($currentInput, true);
            vars.isStarted = false;
            setVars($currentInput, vars);
        }

        /**
         * Clears all active timers (timeouts, intervals, delays) associated with the given input.
         *
         * @param {jQuery} $input - The input object from which timers are identified and cleared.
         * @return {void} This function does not return a value.
         */
        function clearAllTimers($input) {
            const vars = getVars($input);
            if (vars.timeout) {
                clearTimeout(vars.timeout);
                vars.timeout = null;
            }
            if (vars.interval) {
                clearTimeout(vars.interval);
                vars.interval = null;
            }
            if (vars.stopDelay) {
                clearTimeout(vars.stopDelay);
                vars.stopDelay = null;
            }
            setVars($input, vars);
        }

        /**
         * Toggles the visibility of a formatted display for the given input element.
         * If a custom formatter function is provided, it formats the input value accordingly.
         * Updates the input element's visibility and focus state based on the `show` parameter.
         *
         * @param {jQuery} $input The jQuery-wrapped input element to be toggled.
         * @param {boolean} show Determines whether to show or hide the formatted display for the input.
         * @return {void}
         */
        function toggleFormatted($input, show) {
            const wrapper = getWrapper($input);
            const settings = getSettings($input);
            const $formattedWrapper = wrapper.find('.' + wrapperClassFormatted);
            if (typeof settings.formatter === 'string') {
                let format;
                switch (settings.formatter) {
                    case 'currency': {
                        format = $.bsTouchspin.utils.formatCurrency($input.val(), settings.decimals, $.bsTouchspin.config.locale);
                    }
                        break;
                    case 'percent': {
                        format = $.bsTouchspin.utils.formatPercent($input.val(), settings.decimals, $.bsTouchspin.config.locale);
                    }
                        break;
                    default: {
                        format = $.bsTouchspin.utils.formatNumber($input.val(), settings.decimals, $.bsTouchspin.config.locale);
                    }
                }
                $formattedWrapper.html('<div>' + format + '</div>');
            } else if (typeof settings.formatter === 'function') {
                settings.formatter($input.val(), settings.decimals, $.bsTouchspin.config.locale)
            }
            if ($formattedWrapper.length) {
                if (show) {
                    $formattedWrapper.addClass('d-flex');
                    $formattedWrapper.show();
                    $input.attr('type', 'hidden');
                } else {
                    $formattedWrapper.removeClass('d-flex');
                    $formattedWrapper.hide();
                    $input.attr('type', 'text');
                    $input.focus();
                    $input[0].select();
                    $input.trigger('focusin');
                }
            }
        }

        /**
         * Builds and initializes a touchspin input with specified settings and appends the necessary HTML elements.
         *
         * @param {jQuery} $input - A jQuery object representing the input element to be converted into a touchspin.
         * @return {void} This function does not return a value, it modifies the DOM by constructing the touchspin UI around the input.
         */
        function buildTouchspin($input) {
            const settings = getSettings($input);
            let $inputGroup = $input.closest('.input-group');
            if (!$inputGroup.length) {
                $inputGroup = $('<div>', {
                    class: 'input-group',
                }).insertAfter($input);
                $input.appendTo($inputGroup);
            }
            $inputGroup.addClass(wrapperClass);
            $inputGroup.addClass('flex-nowrap');
            if ($.inArray(settings.size, ['sm', 'lg']) >= 0) {
                $inputGroup.addClass('input-group-' + settings.size);
            }
            $input
                .addClass('form-control text-center flex-grow-0')
                .css({width: '150px'})
                .attr('type', 'text');

            if (['string', 'function'].includes(typeof settings?.formatter)) {
                $('<div>', {
                    class: 'input-group-text d-flex justify-content-center user-select-none ' + wrapperClassFormatted,
                }).insertAfter($input).css({width: '150px'})
                toggleFormatted($input, true);
            }

            if (!settings.allowInput) {
                $input.prop('disabled', true);
            }

            if (settings.prefix) {
                $('<span>', {
                    class: 'input-group-text',
                    html: settings.prefix,
                }).prependTo($inputGroup);
            }
            $('<button>', {
                type: 'button',
                'data-touchspin-down': '',
                class: 'btn ' + settings.buttons.down.class,
                html: `<i class="${settings.buttons.down.icon}"></i>`,
            }).prependTo($inputGroup);

            if (settings.postfix) {
                $('<span>', {
                    class: 'input-group-text',
                    html: settings.postfix,
                }).appendTo($inputGroup);
            }

            $('<button>', {
                type: 'button',
                'data-touchspin-up': '',
                class: 'btn ' + settings.buttons.up.class,
                html: `<i class="${settings.buttons.up.icon}"></i>`,
            }).appendTo($inputGroup);
        }

        /**
         * Calculates the step size and the number of decimal places required
         * for a given input value.
         *
         * @param {jQuery} $input - The input element from which the value is retrieved.
         *                           It is expected to have a method `.val()` that
         *                           returns the input's value as a string.
         * @return {Object} An object containing the calculated step size and the
         *                  number of decimal places. The object has the following properties:
         *                  - step: The step size based on the input value's decimal places.
         *                  - decimals: The number of decimal places in the input value.
         */
        function calculateStepByUnknown($input) {
            const currentValue = $input.val().replace(',', '.') || 0;
            const decimals = $.bsTouchspin.utils.getDecimalBySteps(currentValue);
            return {
                step: Math.pow(10, -decimals),
                decimals: decimals
            }
        }


        /**
         * Extends jQuery with the bsTouchspin plugin, which provides a user-friendly
         * spinner input component. This component allows users to increment or decrement
         * numerical values using up and down buttons or via keyboard input.
         *
         * The bsTouchspin plugin supports customization options, such as setting minimum
         * and maximum values, defining the step size, configuring button styles, and
         * specifying prefix/suffix text for the input field. It allows interactive
         * number adjustments for inputs while maintaining a responsive and visually appealing interface.
         *
         * Usage involves initializing the plugin on an input element and optionally
         * passing a configuration object containing desired settings.
         *
         * The plugin may also emit events or callbacks, such as on value change,
         * allowing developers to handle interactions dynamically.
         */
        $.fn.bsTouchspin = function (methodOrOption, ...args) {
            if ($(this).length > 1) {
                return $(this).each(function (i, el) {
                    return $(el).bsTouchspin(methodOrOption);
                });
            }

            const $input = $(this);

            if (!$input.data('touchspin')) {
                // Have we received an object?
                const optionsGiven = typeof methodOrOption === 'object';
                const options = optionsGiven ? methodOrOption : {};
                // If we have an input of type number and can determine step min and max from it, these values are preferred.
                const inputNumber = {};
                if ($input.attr('step')) {
                    inputNumber.step = parseFloat($input.attr('step'));
                }
                if ($input.attr('min')) {
                    inputNumber.min = parseFloat($input.attr('min'));
                }
                if ($input.attr('max')) {
                    inputNumber.max = parseFloat($input.attr('max'));
                }
                // Assemble the setup
                // 1. From the standards
                // 2. From the transferred object
                // 3. The data attributes of the input
                // 4. the classic input attributes
                const settings = $.extend(true, {}, $.bsTouchspin.defaults, options, $input.data() || {}, inputNumber);
                // If no step was found, set it to any for now
                if (!settings.step) {
                    settings.step = 'any';
                }

                let stepUnknown = false;

                // Determine how many decimal places the number has
                if (settings.step === 'any') {
                    stepUnknown = true;
                    const data = calculateStepByUnknown($input);
                    settings.decimals = data.decimals;
                    settings.step = data.step;
                } else {
                    settings.decimals = $.bsTouchspin.utils.getDecimalBySteps(settings.step);
                }

                // If max is also not found, set the highest possible number
                if (settings.max === null) {
                    settings.max = $.bsTouchspin.config.maximumMax;
                }

                // The same at min
                if (settings.min === null) {
                    settings.min = $.bsTouchspin.config.maximumMin;
                    ;
                }

                if (typeof settings.formatter === 'string') {
                    if (['number', 'currency', 'percent'].indexOf(settings.formatter) < 0) {
                        settings.formatter = 'number';
                    }
                }

                const vars = getVars($input);
                vars.stepUnknown = stepUnknown;
                setVars($input, vars); // Speicherprobleme möglich
                setSettings($input, settings); // Fehlerhafte Konfigurationsobjekte könnten hier scheitern
                buildTouchspin($input); // Initialisierungsfehler auf Touchspin könnten auftreten
                events($input); // Event-Bindungsprobleme
                const startValue = validateValue($input, false); // Validierungsfehler möglich
                $input.trigger('init.bs.touchspin', [startValue]); // Eventtrigger-Fehler
                if (typeof settings.onInit === 'function') {
                    settings.onInit(startValue);
                }
            }

            const methodGiven = typeof methodOrOption === 'string';
            if (methodGiven) {
                switch (methodOrOption) {
                    case 'val': {
                        const newValue = parseFloat(args.length ? args[0] : 0);
                        $input.val(newValue);
                        validateValue($input, false);
                        toggleFormatted($input, true);
                    }
                }
            }

            return $input;
        };
    }
    (jQuery)
)
