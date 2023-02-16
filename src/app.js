import { FormValidator } from "./modules/form-validator.js";

document.querySelector('#form-id')
    .addEventListener('submit', (event) => {

    event.preventDefault()

    const validator = new FormValidator({
        form : event,
        validationRules : {
            firstName : "required|match:/^[A-z]{1}[a-z]+$/",
            lastName :  "required",
            email :     'required|email',
            textarea :  'required|min:2|max:5'
        },
        
        local : "en"
    })


    if(!validator.isValide()){
        validator.setErrors()
        const errors = validator.getErrors()
        console.log(errors)
    }else{

        /* 
            If empty of errors
                send data to server
        */
        const data = validator.getData()
        console.log(data)
        console.log(JSON.stringify(data))
        // await fetch(.....)
    }

})