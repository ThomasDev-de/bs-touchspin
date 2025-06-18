(function ($) {
    "use strict";

    $.bsTouchspin = {
        defaults: {
            size: null, // null | sm | lg
            step: "any",
            min: null,
            max: null,
            prefix: null,
            postfix: null,
            allowInput: true,
            buttons: {
                up: {
                    class: 'btn btn-secondary',
                    icon: 'bi bi-plus-lg',
                    iconSetZero: 'bi bi-trash',
                },
                down: {
                    class: 'btn btn-secondary',
                    icon: 'bi bi-dash-lg',
                    iconSetZero: 'bi bi-trash',
                }
            },
            formatter: function (value, decimals) {
                return formatNumber(value, decimals);
            },
            onStart: function (value) {
            },
            onStop: function (value) {
            }

        },
        config: {
            minSpeed: 1,
            startSpeed: 600,
            delay: 1000
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

    function getSettings($input) {
        return $input.data('touchspin');
    }

    function setSettings($input, settings) {
        $input.data('touchspin', settings);
    }

    const getWrapper = function ($input) {
        return $input.closest('.' + wrapperClass);
    }

    function getDecimalPlaces(num) {
        if (typeof num === "string" && num.includes(".")) {
            return num.split(".")[1].length; // Zähle die Nachkommastellen im String
        } else if (!isNaN(num) && num.toString().includes(".")) {
            return num.toString().split(".")[1].length; // Zähle Nachkommastellen bei Zahl
        }
        return 0; // Keine Dezimalstellen
    }

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

    function changeValueByBtnClick($input) {
        const settings = getSettings($input); // Hole die Einstellungen
        const vars = getVars($input); // Variablen (Richtung etc.)
        let value = parseFloat($input.val()) || 0; // Aktuellen Wert holen

        // Funktion zur Rundung auf eine bestimmte Anzahl von Dezimalstellen
        const roundToDecimals = (num, decimals) => {
            const factor = Math.pow(10, decimals);
            return Math.round(num * factor) / factor;
        };

        if (settings.step === "any") {
            // Dynamische Schrittweite basierend auf vorhandenen Dezimalstellen
            const decimals = getDecimalPlaces(value);
            value += vars.direction * Math.pow(10, -decimals); // Passe den Wert dynamisch an
            value = roundToDecimals(value, decimals).toFixed(decimals); // Runde und erhalte die Null(en)
        } else {
            // Normale Schrittweite verwenden
            const decimals = settings.decimals || 0;
            value = (value + vars.direction * settings.step);
            value = roundToDecimals(value, decimals).toFixed(decimals); // Runde und erhalte die Null(en)
        }

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

    function setVars($input, vars) {
        $input.data('vars', vars);
    }

    /**
     * Starts a repeating increment in a specific direction with decreasing interval time.
     *
     * @param {jQuery} $input - The current input element.
     * @param {number} direction - Direction of the adjustment (+1 or -1).
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
                toggleFormatted(input, false);
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

    function handleInput($currentInput) {
        clearAllTimers($currentInput);
        const vars = getVars($currentInput);

        validateValue($currentInput, true);
        toggleFormatted($currentInput, true);
        vars.isStarted = false;
        setVars($currentInput, vars);
    }

    function clearAllTimers($input) {
        const vars = getVars($input); // Hole die individuellen Timer des Inputs
        if (vars.timeout) {
            clearTimeout(vars.timeout);    // Stop Timeout
            vars.timeout = null;
        }
        if (vars.interval) {
            clearTimeout(vars.interval);   // Stop Intervall
            vars.interval = null;
        }
        if (vars.stopDelay) {
            clearTimeout(vars.stopDelay);  // Verzögertes Stop-Event anhalten
            vars.stopDelay = null;
        }
        setVars($input, vars); // Aktuelle Stati zurücksetzen
    }

    function toggleFormatted($input, show) {
        const wrapper = getWrapper($input);
        const settings = getSettings($input);
        const formatted = wrapper.find('.' + wrapperClassFormatted);
        if (typeof settings.formatter === 'function') {
            formatted.html('<div>' + settings.formatter($input.val(), settings.decimals) + '</div>');
        }
        if (formatted.length) {
            if (show) {
                formatted.addClass('d-flex');
                formatted.show();
                $input.attr('type', 'hidden');
            } else {
                formatted.removeClass('d-flex');
                formatted.hide();
                $input.attr('type', 'text');
                $input.focus();
                $input[0].select();
                $input.trigger('focusin');
            }
        }
    }

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

        if (typeof settings.formatter === 'function') {
            $('<div>', {
                class: 'input-group-text d-flex justify-content-center ' + wrapperClassFormatted,
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
            class: settings.buttons.down.class,
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
            class: settings.buttons.up.class,
            html: `<i class="${settings.buttons.up.icon}"></i>`,
        }).appendTo($inputGroup);
    }

    function calculateStepByUnknown($input) {
        const currentValue = $input.val().replace(',', '.') || 0;
        const decimals = getDecimalPlaces(currentValue);
        return {
            step: Math.pow(10, -decimals),
            decimals: decimals
        }
    }


    $.fn.bsTouchspin = function (options) {
        if ($(this).length > 1) {
            return $(this).each(function (i, el) {
                return $(el).bsTouchspin(options);
            });
        }

        const $input = $(this);

        if (!$input.data('touchspin')) {
            try {
                const settings = $.extend(true, {}, $.bsTouchspin.defaults, $input.data() || {}, options || {});

                if (!settings.step) {
                    settings.step = 'any';
                }

                let stepUnknown = false;

                if (settings.step === 'any') {
                    stepUnknown = true;
                    const data = calculateStepByUnknown($input); // Fehler könnten hier auftreten
                    settings.decimals = data.decimals;
                    settings.step = data.step;
                } else {
                    settings.decimals = getDecimalPlaces(settings.step); // Fehler könnten hier auftreten
                }

                const vars = getVars($input); // Fehler bei der Variablenabfrage möglich
                vars.stepUnknown = stepUnknown;
                setVars($input, vars); // Speicherprobleme möglich
                setSettings($input, settings); // Fehlerhafte Konfigurationsobjekte könnten hier scheitern
                buildTouchspin($input); // Initialisierungsfehler auf Touchspin könnten auftreten
                events($input); // Event-Bindungsprobleme
                const startValue = validateValue($input, false); // Validierungsfehler möglich
                $input.trigger('start.bs.touchspin', [startValue]); // Eventtrigger-Fehler
            } catch (error) {
                console.error("Ein Fehler ist während der Touchspin-Initialisierung aufgetreten:", error);

                // Falls es sinnvoll ist, können hier alternative Aktionen folgen, wie z. B. eine Meldung oder
                // das Setzen eines Fallback-Wertes:
                $input.trigger('error.bs.touchspin', [error]);
            }
        }

        return $input;
    };
}(jQuery))
