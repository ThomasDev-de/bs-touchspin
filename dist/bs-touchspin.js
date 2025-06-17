(function ($) {
    "use strict";
    const wrapperClass = 'bs-touchspin-wrapper';

    $.bsTouchspin = {
        defaults: {
            step: 1,
            min: null,
            max: null,
            prefix: null,
            postfix: null
        }
    };

    function getSettings($input) {
        return $input.data('touchspin');
    }

    const getWrapper = function ($input) {
        return $input.closest('.' + wrapperClass);
    }

    function getDecimalPlaces(num) {
        if (!isNaN(num) && num.toString().indexOf('.') !== -1) {
            return num.toString().split('.')[1].length;
        }
        return 0; // Keine Dezimalstellen
    }


    function events($input) {
        const wrapper = getWrapper($input);
        const settings = getSettings($input);
        const btnCheck = wrapper.find('[data-touchspin-man]');
        const btnDown = wrapper.find('[data-touchspin-down]');
        const btnUp = wrapper.find('[data-touchspin-up]');
        let directionText;
        let timeout = null; // Verzögerung vor der wiederholenden Aktion
        let interval = null; // Für wiederholende Funktion
        let stopDelay = null; // Verzögerung für das Stop-Event
        let speed = 500; // Startgeschwindigkeit in Millisekunden
        const minSpeed = 1; // Minimal erlaubte Geschwindigkeit (höchste Geschwindigkeit)
        const stopEventDelay = 600; // Verzögerung für das Stop-Event in Millisekunden

        // Funktion zur Prüfung und Aktivierung/Deaktivierung der Buttons
        // Funktion zur Prüfung und Aktivierung/Deaktivierung der Buttons
        function updateButtonStates() {
            const value = parseFloat($input.val()) || 0; // Aktueller Wert im Input
            const step = settings.step || 1; // Schrittweite (Standardwert: 1)
            const decimals = settings.decimals || 0; // Anzahl der Rundungsstellen (Standard: 0 Dezimalstellen)

            // Rundungsfunktion mit Absicherung
            const roundToDecimals = (val) => {
                const num = parseFloat(val); // String zu Zahl konvertieren
                return isNaN(num) ? 0 : Number(num.toFixed(decimals)); // Fallback für ungültige Werte
            };

            // Rundung des aktuellen Werts
            const roundedValue = roundToDecimals(value);

            console.log({ value, roundedValue, step });

            // **Logik für Trash-Icon**
            // Schritt ausgehend von 0 überprüfen
            const stepAboveZero = roundToDecimals(step); // Ein Schritt über 0
            const stepBelowZero = roundToDecimals(-step); // Ein Schritt unter 0

            // Up-Button → Trash-Icon, wenn genau ein Schritt unterhalb von 0
            if (roundedValue === stepBelowZero) {
                btnUp.find('i').removeClass('bi-plus-lg').addClass('bi-trash3');
            } else {
                btnUp.find('i').removeClass('bi-trash3').addClass('bi-plus-lg'); // Standard-Symbol wiederherstellen
            }

            // Down-Button → Trash-Icon, wenn genau ein Schritt oberhalb von 0
            if (roundedValue === stepAboveZero) {
                btnDown.find('i').removeClass('bi-dash-lg').addClass('bi-trash3');
            } else {
                btnDown.find('i').removeClass('bi-trash3').addClass('bi-dash-lg'); // Standard-Symbol wiederherstellen
            }

            // **Deaktivierung der Buttons**
            // Down-Button deaktivieren, wenn `value` kleiner oder gleich 0
            if (roundedValue <= 0) {
                btnDown.prop('disabled', true);
            } else {
                btnDown.prop('disabled', false);
            }

            // Up-Button deaktivieren, wenn der Wert größer oder gleich einer logischen Obergrenze ist
            if (settings.max !== null && roundedValue >= roundToDecimals(settings.max)) {
                btnUp.prop('disabled', true);
            } else {
                btnUp.prop('disabled', false);
            }
        }

        // Funktion zur Überprüfung und Anpassung von Werten
        function validateValue(isFinal = false) {
            let inputValue = $input.val(); // Rohwert aus dem Input-Feld (String)

            // Unterstützung für Dezimaltrennzeichen (z. B. Komma in Deutschland)
            const decimals = settings.decimals || 0; // Anzahl der erlaubten Dezimalstellen
            // const localizedValue = inputValue.replace(',', '.'); // Ersetze ',' durch '.' für parseFloat()

            // Versuche, den Wert in eine Zahl zu konvertieren
            let numericValue = parseFloat(inputValue);

            // Ungültige oder unvollständige Werte während der finalen Eingabe
            if (isNaN(numericValue)) {
                numericValue = isFinal ? 0 : null; // Bei finalen Eingaben ungültige Werte auf 0 setzen
            }

            // Runden nach der definierten Anzahl von Dezimalstellen
            if (numericValue !== null) {
                numericValue = Number(numericValue.toFixed(decimals));
            }

            // Prüfung auf Mindest- und Höchstgrenze
            if (numericValue !== null) {
                if (settings.min !== null && numericValue < settings.min) {
                    numericValue = settings.min; // Auf Mindestwert setzen
                }
                if (settings.max !== null && numericValue > settings.max) {
                    numericValue = settings.max; // Auf Maximalwert setzen
                }
            }

            // Update des Eingabefeldes (immer, auch während der Eingabe!)
            if (numericValue !== null) {
                $input.val(numericValue.toFixed(decimals)); // Aktualisiere den Input auf den gültigen Wert
            }

            // Trigger Events nur bei finalem Abschluss
            if (isFinal) {
                btnCheck.hide(); // Verstecke das Prüfungs-Icon (falls vorhanden)
                $input.trigger('stop.bs.touchspin', numericValue); // Custom Event
            }

            // Aktualisiere den Status der Buttons
            updateButtonStates();
        }

        // Funktion für das schrittweise Ändern des Wertes
        function changeValue(direction) {
            let value = parseFloat($input.val()) || 0; // Aktuellen Wert holen
            const decimals = settings.decimals || 0; // Dezimalstellen
            value = (value + direction * settings.step).toFixed(decimals); // Wert berechnen und runden

            // Prüfung auf Mindest- und Höchstgrenze
            if (settings.min !== null && parseFloat(value) < settings.min) {
                value = settings.min.toFixed(decimals); // Auf `min` setzen und formatieren
            }
            if (settings.max !== null && parseFloat(value) > settings.max) {
                value = settings.max.toFixed(decimals); // Auf `max` setzen und formatieren
            }

            $input.val(value); // Gerundeten und formatierten Wert ins Feld schreiben

            // Aktualisiere den Status der Buttons
            updateButtonStates();
        }

        // Funktion, welche Geschwindigkeit erhöht und Wert ändert
        function startIncrement(direction) {
            if (speed > minSpeed) {
                speed *= 0.9; // Geschwindigkeit schrittweise erhöhen (10% schneller)
            }

            changeValue(direction);

            // Rekursive Verzögerung, um Geschwindigkeit anzupassen
            interval = setTimeout(function () {
                startIncrement(direction);
            }, speed);
        }

        // Events für das Down- und Up-Button-Handling
        wrapper
            .on('mousedown touchstart', '[data-touchspin-man]', function (e) {
                e.preventDefault();
                btnCheck.hide();
                validateValue(true);
            })
            .on('mousedown touchstart', '[data-touchspin-down]', function (e) {
                e.preventDefault();
                btnCheck.hide();
                $input.prop('readonly', true);
                let direction = -1; // Runterzählen
                directionText = 'down';
                speed = 500; // Geschwindigkeit zurücksetzen

                let startValue = parseFloat($input.val()) || 0;
                // Start-Event auslösen
                $input.trigger('start.bs.touchspin', [startValue]);

                // Sofortiger Anfangswert ändern
                changeValue(direction);

                // Verzögerter Start für Wiederholung
                timeout = setTimeout(function () {
                    startIncrement(direction); // Wiederholende Funktion starten
                }, 300); // Nach 300ms beginnen
            })
            .on('mousedown touchstart', '[data-touchspin-up]', function (e) {
                e.preventDefault();
                btnCheck.hide();
                $input.prop('readonly', true);
                let direction = 1; // Hochzählen
                directionText = 'up';
                speed = 500; // Geschwindigkeit zurücksetzen

                let startValue = parseFloat($input.val()) || 0;

                // Start-Event auslösen
                $input.trigger('start.bs.touchspin', [startValue]);

                // Sofortiger Anfangswert ändern
                changeValue(direction);

                // Verzögerter Start für Wiederholung
                timeout = setTimeout(function () {
                    startIncrement(direction); // Wiederholende Funktion starten
                }, 300); // Nach 300ms beginnen
            })
            .on('mouseup mouseleave touchend', '[data-touchspin-down], [data-touchspin-up]', function (e) {
                e.preventDefault();
                $input.prop('readonly', false);
                // Stopp aller laufenden Aktionen
                clearTimeout(timeout);
                clearTimeout(interval);

                // Verzögertes Auslösen des Stop-Events
                clearTimeout(stopDelay); // Eventuell laufendes Delay abbrechen
                stopDelay = setTimeout(function () {
                    let stopValue = parseFloat($input.val()) || 0;
                    $input.trigger('stop.bs.touchspin', [stopValue]);
                }, stopEventDelay);
            });

        // Neue Events für Eingaben und Validierung
        $input
            .on('input', function (e) {
                btnCheck.show();
                updateButtonStates(); // Aktualisiere die Buttons bei manueller Eingabe
            });

        // Initialer Zustand der Buttons festlegen
        updateButtonStates();
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
        $input.addClass('form-control text-center').attr('type', 'text');
        $('<button>', {
            'data-touchspin-down': '',
            class: 'btn btn-secondary',
            html: '<i class="bi bi-dash-lg"></i>',
        }).prependTo($inputGroup);

        $('<button>', {
            'data-touchspin-man': '',
            css: {
                display: 'none'
            },
            class: 'btn btn-success',
            html: '<i class="bi bi-check-lg"></i>',
        }).appendTo($inputGroup);

        $('<button>', {
            'data-touchspin-up': '',
            class: 'btn btn-secondary',
            html: '<i class="bi bi-plus-lg"></i>',
        }).appendTo($inputGroup);

    }

    $.fn.bsTouchspin = function (options) {
        if ($(this).length > 1) {
            return $(this).each(function (i, el) {
                return $(el).bsTouchspin(options);
            });
        }

        const $input = $(this);

        if (!$input.data('touchspin')) {
            const settings = $.extend(true, {}, $.bsTouchspin.defaults, $input.data() || {}, options || {});
            settings.decimals = getDecimalPlaces(settings.step);
            $input.val(parseFloat($input.val()).toFixed(settings.decimals));
            $input.data('touchspin', settings);
            buildTouchspin($input);
            events($input);
        }

        return $input;
    };
}(jQuery))