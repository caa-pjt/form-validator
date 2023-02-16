![Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)
# Vanilla JS - form validator

A pure Javascript validator form replace [Jquery Validation](https://jqueryvalidation.org).

It allows to:
- validate an input with preexisting rules or custom rules
- Get validation errors
- Add validation errors under input not validated
    - To consider the language

___

## Getting Started

**Download** the script file clicking [here](https://github.com/caa-pjt/form-validator/tree/main/dist/formValidator.min.js)

## Creating instance
```html

<link rel="stylesheet" href="./src/style.css">

<form id="form-id">
    <input type="text" name="firstName"placeholder="First name">
    <input type="email" name="email" placeholder="john@doe.com">
    <button type="submit" class="btn btn-primary">Send</button>
</form>

 <script src="./js/formValidatos.min.js"></script>

<script type="text/javascript">

    document.querySelector('#form-id').addEventListener('submit', (event) => {

        event.preventDefault()
        const validator = new FormValidator({
            form : event,
            validationRules : {
                firstName : "required|match:/^[A-z]{1}[a-z]+$/",
                email :     'required|email',
                textarea :  'required|min:2|max:5'
            },
            local : "en"
        })
        if(!validator.isValide()){
            validator.setErrors() // return erros to the view
            console.log(validator.getErrors()) // return Object with errors
        }else{
            // Empty errors => send data to server
            console.log(validator.getData())
            console.log(JSON.stringify(data))
            // await fetch(.....)
        }
    })
</script>
```

### Validation rules (required)

The rules should be an object passed by in **options** at the follow format:
```javascript 
validationRules : {
    fieldName : "ruleName|RuleName:option|RuleName:option|...",
    fieldName : "ruleName|ruleName|..."
}
```
#### Validation rules exemple:
```javascript
validationRules : {
    firstName : "match:/^[A-z]{1}[a-z]+$/", // match:preg_match
    email :     "required|email", // required and email
    textarea :  "required|min:2|max:5" // required and min:2 character and max:5 characters
    ...
}
```

The default rules avaiable are:

|Rule Name       |Rule option              |Description              |
|----------------|-------------------------|-------------------------|
|`required`      | -                       | Not empty value         |
|`email`         | -                       | Verify email format     |
|`max:int`       | **integer** [number]    | Max value length        |
|`min:int`       | **integer** [number]    | Min value length        |
|`match:pattern` | **string**  [patern]    | Costum rule validation  |


## Methodes

> Name: **isValide**
>
> After a submit, the **isValide()** method returns true or false if **error** variable is empty or not.
```javascript
    validator.isValide()
```

> Name: **setErrors**
>
> After a submission, the **getErrors()** method returns validation errors under unvalidated fields.

```javascript
    validator.setErrors()
```
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