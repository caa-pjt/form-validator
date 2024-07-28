import { FormValidator } from "./modules/form-validator.js";

class App {

    constructor(){
        this.form = document.querySelector('#form-id')
        this.validator = new FormValidator({
            form : this.form,
            validationRules : {
                firstName : "required|match:/^[A-z]{1}[a-z]+$/",
                lastName :  "required",
                email :     'required|email',
                textarea :  'required|min:2|max:5'
            },
            local : "fr",
            observeOnInput : true
        })
    }

    init(){
        this.form.addEventListener('submit', (event) => {
            event.preventDefault()
            this.validator.validate(event.target);

            if(this.validator.isValide()){
                const data = this.validator.getData()
                console.log(data)
                console.log(JSON.stringify(data))
                // Envoi des données au serveur
            }else{
                this.validator.setErrors()
                const errors = this.validator.getErrors()
                console.log(errors)
            }
        });
    }

}

const myApp = new App()
myApp.init()