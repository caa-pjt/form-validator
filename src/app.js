import { FormValidator } from "./modules/form-validator.js";

document.querySelector('#form-id').addEventListener('submit', (event) => {

    event.preventDefault()

    const validator = new FormValidator({
        form : event,
        validationRules : {
            firstName : "required",
            lastName :  "required",
            email :     'required|email',
            textarea :  'required|min:2|max:5'
        },
        
        local : "en"
    })


    if(!validator.isValide()){
        validator.setErrors()

        console.log(validator.getErrors())
    }

})