# bsTouchspin Plugin

`bsTouchspin` is a lightweight, flexible, and customizable jQuery plugin that provides an easy-to-use spinner interface
for numeric inputs. It allows for smooth increment and decrement of numeric values through up and down buttons, while
supporting custom configurations for appearance and behavior.

![img.png](demo/img.png)
---

## Features

- Increment and decrement buttons for numeric inputs.
- Customizable options:
    - Minimum and maximum values.
    - Step size (fixed or dynamic).
    - Input size (`sm` | `lg`).
    - Prefix and postfix spans.
    - Custom button styles, icons, and behavior.
- Built-in number formatting options:
    - Currency.
    - Percent.
    - Number.
- Locale support for number formatting.
- Customizable events and callbacks, such as `onInit`, `onStart`, and `onStop`.
- Utility methods for formatting and handling decimals.
- Responsiveness and accessibility.
- Support for dynamic and real-time changes.

---

## Installation

### Using a Content Delivery Network (CDN)

Include the following scripts and styles in your HTML file:

```html

<script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
<script src="path/to/bs-touchspin.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css">
```

### Local Installation

1. Download the `bs-touchspin` script file and its dependencies (e.g., Bootstrap CSS/JS, Bootstrap Icons).
2. Include them in your project.

---

## Usage

### Basic Initialization

The simplest use case involves turning a standard text input into a touchspin spinner:

```html
<input id="spinner" type="text">
<script>
    $('#spinner').bsTouchspin();
</script>
```

---

## Options and Configuration

The plugin supports a wide range of customization options, as listed below:

### General Configuration

The following **global configuration** options allow fine-tuning of touchspin behavior:

| Option          | Description                                                                                      | Data Type      | Default          |
|-----------------|--------------------------------------------------------------------------------------------------|----------------|------------------|
| `minSpeed`      | The minimum speed (in ms) for holding the increment or decrement button.                         | `number`       | `1`              |
| `startSpeed`    | The initial speed (in ms) when holding the increment or decrement button.                        | `number`       | `600`            |
| `delay`         | Delay (in ms) before triggering the stop callback after releasing a button or leaving focus.     | `number`       | `1000`           |
| `locale`        | Defines the locale used for number formatting (e.g., `'en-US'`, `'de-DE'`, etc.).                | `string`       | `'en-US'`        |
| `maximumMax`    | The value that is taken for max if max has not been defined.                                     | `number\|null` | `2.147.483.647`  |
| `maximumMin`    | The value that is taken for min if min is not defined.                                           | `number\|null` | `-2.147.483.648` |
| `inputMinWidth` | A minimum width for the input field and formatting output. It can have all CSS values for width. | `number`       | `75`             |

---

#### Changing Global Configuration

You can change the global configuration dynamically at runtime by using the `$.bsTouchspin.setConfig()` method:

```javascript
$.bsTouchspin.setConfig({
    minSpeed: 10,        // Set the minimum holding speed to 10ms
    startSpeed: 500,     // Start speed reduced to 500ms
    delay: 800,          // Delay before onStop callback to 800ms
    locale: 'de-DE'      // Use German locale for number formatting
});
```

This will update the behavior of all future `bsTouchspin` instances created after the configuration is set.

---

### Instance-Specific Configuration

Pass configuration options during initialization:

```javascript
$('#spinner').bsTouchspin({
    size: 'sm',
    step: 0.5,
    min: 10,
    max: 50,
    formatter: 'percent',
    onStart: function (value) {
        console.log('Started with value:', value);
    },
    onStop: function (value, diff) {
        console.log('Stopped with value:', value, 'diff to start: ', diff);
    }
});
```

### Note:
If configurable values such as **`min`**, **`max`**, **`step`**, or other numeric settings are already defined as **HTML attributes** on the `<input>` element (e.g., `min="10"`, `max="50"`), the HTML attributes will typically **take precedence over JavaScript configurations** unless explicitly overridden by the JavaScript options provided during initialization.


---

### Configuration Options

Below is the full list of default options for the `bsTouchspin` plugin:

| Option                     | Description                                                                                                                                                                                                                     | Data Type              | Default                                      |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|----------------------------------------------|
| `size`                     | Sets the size of the input. Acceptable values: `null`, `sm`, or `lg`.                                                                                                                                                           | `string` or `null`     | `null`                                       |
| `step`                     | Defines the step size for increments or decrements. Set to `"any"` for dynamic step size.                                                                                                                                       | `number` or `string`   | `"any"`                                      |
| `min`                      | The minimum value allowed for the input.                                                                                                                                                                                        | `number` or `null`     | `null`                                       |
| `max`                      | The maximum value allowed for the input.                                                                                                                                                                                        | `number` or `null`     | `null`                                       |
| `prefix`                   | Prefix text or symbol shown before the input value.                                                                                                                                                                             | `string` or `null`     | `null`                                       |
| `postfix`                  | Postfix text or symbol shown after the input value.                                                                                                                                                                             | `string` or `null`     | `null`                                       |
| `allowInput`               | Allows manual input of a value in the input field.                                                                                                                                                                              | `boolean`              | `true`                                       |
| `buttons.up.class`         | CSS classes for the increment ("up") button.                                                                                                                                                                                    | `string`               | `'btn-secondary rounded-end-pill fw-bold'`   |
| `buttons.up.icon`          | Icon for the increment ("up") button (uses Bootstrap Icons).                                                                                                                                                                    | `string`               | `'bi bi-plus-lg'`                            |
| `buttons.up.iconSetZero`   | Icon for the increment button when the value reaches zero.                                                                                                                                                                      | `string`               | `'bi bi-trash'`                              |
| `buttons.down.class`       | CSS classes for the decrement ("down") button.                                                                                                                                                                                  | `string`               | `'btn-secondary rounded-start-pill fw-bold'` |
| `buttons.down.icon`        | Icon for the decrement ("down") button (uses Bootstrap Icons).                                                                                                                                                                  | `string`               | `'bi bi-dash-lg'`                            |
| `buttons.down.iconSetZero` | Icon for the decrement button when the value reaches zero.                                                                                                                                                                      | `string`               | `'bi bi-trash'`                              |
| `formatter`                | Formatting style for the input value. Acceptable values: `'number'`, `'currency'`, or `'percent'`. You can also specify your own formatting function. The parameters `value`, `decimals` and `locale` are passed into the case. | `string` or `function` | `'number'`                                   |
| `onInit`                   | Callback function, executed during initialization.                                                                                                                                                                              | `function`             | `function (value) {}`                        |
| `onStart`                  | Callback function, executed when incrementing or decrementing starts.                                                                                                                                                           | `function`             | `function (value) {}`                        |
| `onStop`                   | Callback function, executed when incrementing or decrementing stops.                                                                                                                                                            | `function`             | `function (value, diff) {}`                  |

---

## Methods

### `val`

The **`val`** method allows you to set the spinner's value programmatically.

#### **Usage:**

```javascript
$('#example-spinner').bsTouchspin('val', value);
```

- **`value`**: The numeric value you want to set for the spinner.

#### **Examples:**

1. **Set the value of the spinner:**

```javascript
$('#example-spinner').bsTouchspin('val', 42); // Sets the spinner's value to 42.
```

#### **Notes:**

- **Validation:** The provided value is validated against the configured `min`, `max`, and `step` properties. If the
  value exceeds the defined limits, it will be automatically adjusted:

```javascript
$('#example-spinner').bsTouchspin({
    min: 0,
    max: 100
});

$('#example-spinner').bsTouchspin('val', 150); // The value will be set to 100 since it exceeds the `max`.
```

- The applied value respects any configured formatting via options like `formatter` (e.g., currency or percentage).

## Events

The plugin emits the following events that can be listened to:

- **`init.bs.touchspin`:** Triggered on initialization.
- **`start.bs.touchspin`:** Triggered when the spinner interaction starts.
- **`stop.bs.touchspin`:** Triggered when the spinner interaction stops.

### Example Usage:

```javascript
$('#spinner').on('init.bs.touchspin', function (event, startValue) {
    console.log('Touchspin initialized:', startValue);
});

$('#spinner').on('stop.bs.touchspin', function (event, stopValue, diff) {
    console.log('Touchspin stopped. Final value:', stopValue, 'Difference:', diff);
});
```

---

## Utility Functions

The plugin provides useful utility functions for working with numeric values:

### `formatNumber(number, decimalPlaces, locale)`

Formats a number with the desired decimal places and locale.

```javascript
const formatted = $.bsTouchspin.utils.formatNumber(1234.56, 2, 'de-DE');
console.log(formatted); // "1.234,56"
```

### `formatCurrency(value, decimals, locale)`

Formats a value as currency.

```javascript
const currency = $.bsTouchspin.utils.formatCurrency(200, 2, 'en-US');
console.log(currency); // "$200.00"
```

### `formatPercent(value, decimals, locale)`

Formats a value as a percentage.

```javascript
const percent = $.bsTouchspin.utils.formatPercent(0.45, 2, 'de-DE');
console.log(percent); // "45,00%"
```

---

## Example Integration

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <script src="path/to/bs-touchspin.min.js"></script>
</head>
<body>
<div class="container">
    <label for="example-spinner">Example Spinner</label>
    <input id="example-spinner" type="text"/>
</div>

<script>
    $('#example-spinner').bsTouchspin({
        step: 1,
        min: 0,
        max: 100,
        formatter: 'currency'
    });
</script>
</body>
</html>
```

---

## Contributing

Feel free to fork the repository, open issues, or submit pull requests to improve the plugin. Contributions, feedback,
and suggestions are highly welcome!

---

## License

Licensed under the MIT License.

---

### Author

This plugin was developed to enhance user interactions with input fields and provide a modern interface for numeric
controls in web applications.

```
