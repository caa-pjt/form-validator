import { FormValidator } from "./modules/form-validator.js";

document.querySelector('#form-id').addEventListener('submit', (e) => {

    e.preventDefault()

    const validator = new FormValidator(e)

    validator.validate({
       /*  firstName : "required",
        lastName :  "required",
        email :     'required|email', */
        textarea :  'required|min:2|max:5'
    })

    if(!validator.isValide()){
        validator.setErrors()

        console.log(validator.getErrors())
    }

})