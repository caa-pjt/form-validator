![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
# Vanilla JS - form validator

A pure Javascript validator form replace [Jquery Validation](https://jqueryvalidation.org).

It allows you to:
- Validate input fields with pre-existing or custom rules
- Retrieve validation errors
- Display validation errors below unvalidated fields
- Support multiple languages for error messages
- Add validation errors under input not validated
    - To consider the language

___

## Getting Started

**Download** the script file clicking [here](https://github.com/caa-pjt/form-validator/tree/main/dist/formValidator.min.js)

### Including in Your Project

Include the following in your HTML:
```html
<link href="./src/style.css" rel="stylesheet">

<form id="form-id">
  <input type="text" name="firstName" placeholder="First name">
  <input type="email" name="email" placeholder="john@doe.com">
  <textarea name="textarea" placeholder="Message" rows="10"></textarea>
  <button type="submit" class="btn btn-primary">Send</button>
</form>

<script src="./src/app.js" type="module" async></script>
```
### Creating an Instance

Create an instance of FormValidator and configure it as follows:
```javascript
import { FormValidator } from "./modules/form-validator.js";

class App {
  constructor() {
    this.form = document.querySelector('#form-id');
    this.validator = new FormValidator({
      form: this.form,
      validationRules: {
        firstName: "required|match:/^[A-z]{1}[a-z]+$/",
        lastName: "required",
        email: 'required|email',
        textarea: 'required|min:2|max:5'
      },
      local: "fr", // Options: "en", "fr"
      observeOnInput: true
    });
  }

  init() {
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.validator.validate(event.target);

      if (this.validator.isValide()) {
        const data = this.validator.getData();
        console.log(data);
        console.log(JSON.stringify(data));
        // Send data to server
      } else {
        this.validator.setErrors();
        const errors = this.validator.getErrors();
        console.log(errors);
      }
    });
  }
}

const myApp = new App();
myApp.init();

```

## Constructor Options

The `FormValidator` constructor accepts an options object with the following properties:

- form: HTMLElement
  The form element to be validated. This is a required option.

- `validationRules`: Object 
 An object defining the validation rules for each form field. Each key corresponds to a field name, and the value is  a string with validation rules separated by pipes (|). Supported rules include:
- `required`: Field must not be empty
- `email`: Field must be a valid email address
- `min:n`: Field must have at least n characters
- `max:n`: Field must have at most n characters
- `match:pattern`: Field value must match the given regular expression pattern
- - `local`: String
    The language for error messages. Supported values are "en" for English and "fr" for French. 
    You can add another language by modifying the local.js file in the modules folder.
  - `en`: English
  - `fr`: French
  - `observeOnInput`: Boolean
    If true, the validator will validate fields on input events. If false, it will only validate on submit events. Default is false.

### Validation rules (required)

Validation rules are defined in the validationRules option, following this format:
```javascript 
validationRules : {
    fieldName : "ruleName|RuleName:option|RuleName:option|...",
    fieldName : "ruleName|ruleName|..."
}
```

Available Validation Rules

| Rule Name       | Rule option          | Description                    |
|-----------------|----------------------|--------------------------------|
| `required`      | -                    | Ensures the field is not empty |
| `email`         | -                    | Validates email forma          |
| `max:int`       | **integer** [number] | Maximum length of characters   |
| `min:int`       | **integer** [number] | Minimum length of characters   |
| `match:pattern` | **string**  [patern] | Costum rule validation         |

#### Validation rules exemple
```javascript
validationRules : {
    firstName : "match:/^[A-z]{1}[a-z]+$/", // match:preg_match
    email :     "required|email", // required and email
    textarea :  "required|min:2|max:5" // required and min:2 character and max:5 characters
    ...
}
```

## Methodes

> Name: **isValide**
>
> After a submit, the **isValide()** method returns true or false if **error** variable is empty or not.
```javascript
    validator.isValide()
```

> Name: **setErrors**
> 
> After a submit, the **setErrors()** method displays the error messages below the unvalidated fields.

![validaed field](/src/images/validated_field.PNG)
![unvalidated field](/src/images/unvalidated_field.PNG)

> Name: **getErrors**
>
> After a submit the **getErrors()** method returns an object with each unvalidated field.


```javascript
validator.getErrors() 

{
    {
        "firstName": {
            "required": "Please enter a message",
            "match": "The value is not valid"
        },
        "email": {
            "required": "Please enter a message",
            "email": "The email is not valid"
        },
        "textarea": {
            "required": "Please enter a message",
            "min": "This field must contain at least 2 characters"
        }
    }
}
```

## Example of Form Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Form Validator</title>
    <link rel="stylesheet" href="./src/style.css">
    <script src="./src/app.js" type="module" async></script>
</head>
<body>

    <form method="GET" action="#" class="form" id="form-id">
        <h1>JavaScript - Form Validator</h1>
        <label for="firstName">First name</label>
        <input type="text" name="firstName" id="firstName" placeholder="First name">
        <label for="lastName">Last name</label>
        <input type="text" name="lastName" id="lastName" placeholder="Last name">
        <label for="email">Email</label>
        <input type="text" name="email" placeholder="john@doe.com" id="email">
        <label for="textarea">Message</label>
        <textarea name="textarea" placeholder="Message" rows="10" id="textarea"></textarea>
        <button type="submit" class="btn btn-primary">Send</button>
    </form>

    <script src="./src/app.js" type="module" async></script>
</body>
</html>
```

## Contributing

Feel free to contribute by submitting issues and pull requests. For more detailed documentation, see the source code or contact the maintainers.

License

This project is licensed under the MIT License - see the [LICENSE](https://fr.wikipedia.org/wiki/Licence_MIT) file for details.
