/**
 * @fileOverview Validates a form and returns: List of errors in JSON format || Validation errors directly below fields not validated
 * @author Carlos Antunes
 * @version 1.0.0
 */

export class FormValidator {

    #FormValidatordebug = false

    /* List of fields (inputs) in the form */
    inputs = []

    /**
     * Default options
     */
    options = {
        form : [],
        local : "en"
    }

   /**
    * @param {object} - Options
    * @property {SubmitEvent} options.form          - form : event (form sent by the event)
    * @property {Object} options.validationRules    - validationRules : { attrInputName : rules separator pipe (|) }
    *                                               - Example: {'email' : 'required|email','textarea' : 'required|min:10|max:255'}
    * @property {string|undefined} options.local    - local : "en" 
    *                                               - (two digites lowercase. Default value "en")
    */
    constructor(options = {}) {

        
        this.options = Object.assign({}, this.options, options)

        this.#formData()
        
    }
    
    /**
     * Create formData Objet
     * 
     * @returns {object[]|error} - throws an error if no data is retrieved
    */
    #formData() {
             
       if (this.options.form.length === 0 || this.options.form.target != undefined) {
           const formData = Object.fromEntries(new FormData(this.options.form.target).entries())
           this.data = formData

           if(this.options.form.currentTarget.length === 0){
                console.error(`No FormData imputs detected !? 
                                Please send the form with imputs on the objet options.form`)
           }else{

                /**
                 * Array[] 
                 * Add data imputs in form to the this.inputs variable
                */
                for (let i = 0; i < this.options.form.currentTarget.length; i++) {
                    this.inputs.push(this.options.form.currentTarget[i])
                }


                this.#validate()
           }

        } else {
            console.error(`The objet options.form is empty or undefined. Please insert values in the objetc.`)
        }
    }

    /**
     * Add an error according to the validation rules
     * 
     * @property {object[]} dataAndRules                - Object containing the list of fields and validation rules
     * @property {string<inputAttrName>} object.name    - Name of the name attribute of the input 
     * @property {string} rules                         - Validation rules separated by separator pipe (|)
     *  - Example: {'email' : 'required|email','textarea' : 'required|min:10|max:255'}
     */
    #validate() {

        const dataAndRules = this.options.validationRules

        for (const input in dataAndRules) {

            if(this.data[input] === undefined){
                console.error(`l'imput name: [${input}] n'existe pas`)
            }else{
                const rules = dataAndRules[input].split('|')
                this.#rulesValidator(input, rules)
            }
        }
    }

    /**
     * Receive the name of the input to validate and call the function according to the validation rules
     * 
     * @param {string} input - Input attribute name
     * @param {string} rules - Validation rule and function to call
     */
    #rulesValidator(input, rules) {

        for (let i = 0; i < rules.length; i++) {

            let rule = rules[i].split(':')
            if (rule.length > 1) {
                
                const func = rule[0]
                const param = rule[1]
                this[func](input, param)
                /* try {
                    this[func](input, param)
                }catch (e){
                    console.error(`(${func}) ${e.name} : ${e.message}`)
                } */
            } else {
                this[rule](input)
            }
            if (this.#FormValidatordebug) {
                console.log(input)
            }
        }
    }

    /**
     * 
     * @param {string} AttrName     - Input attribute name
     * @returns {HTMLHtmlElement}   - Input
     */
    #getInput(AttrName){
        return this.inputs.find(input => input.getAttribute('name') == AttrName )
    }

    /**
     * 
     * @returns - errors in JSON format
     */
    getErrors() {
        return this.errors
    }

    /**
     * 
     * @returns - If empty errors return true
    */
    isValide() {
        if (this.errors != null || this.errors != undefined) {
            return false
        } else {
            return true
        }
    }

    /**
     * @returns - validated data [object format]
    */
    getData(){
        return this.data
    }


    /**
     * Add or remove errors from the HTML form (dispatcher)
     * 
     * @returns {HTMLElement} Modify HTML (errors)
     */
    setErrors() {
        /*  for in this.data
            if (this.errors[current]) === unddefined 
                Remove error
            else 
                Add is-invalid to the input
                create span data-id = input.datasetname
                 
        */
        for(const input in this.data) {
            if (this.#FormValidatordebug) {
                console.log(input)
            }
            const current = this.#getInput(input)
            if(this.errors === undefined || this.errors[input] === undefined){
                this.#removeHtmlError(current)
            }else{
                if(Object.values(this.errors[input]).length > 0){
                    this.#setHtmlError(current, Object.values(this.errors[input])[0])
                }
            }
        }
    }

    /**
     * 
     * @param {HTMLElement} input   - Input HTML
     * @param {string} error        - Error text
     */
    #setHtmlError(input, error) {

        if(input.classList.contains('is-invalid')){

            if (input.nextElementSibling.tagName === 'SPAN') {
                input.nextElementSibling.innerText === error ? null : input.nextElementSibling.innerText = error
            }
            return false
        }

        input.classList.contains('was-validated') ? input.classList.remove('was-validated') : null
        input.classList.contains('is-invalid') ? null : input.classList.add('is-invalid')

        if (input.nextElementSibling === null) {
            const span = this.#htmlErro(input, error)
            input.parentElement.appendChild(span)
            
        }else if (input.nextElementSibling.tagName != 'SPAN'){
            const span = this.#htmlErro(input, error)
            input.nextSibling.before(span)
        }

        if (input.nextElementSibling.dataset.inputName ===  input.getAttribute('name')) {
            const span = input.nextElementSibling
            span.innerText = ''
            span.innerText = error
        }

        this.#FormValidatordebug ?  console.log(`Add error from inputName : ${ input.getAttribute('name') }`) : null
    }

    /**
     * 
     * @param {HTMLElement} input 
     * @param {string} meassage 
     * @returns - <span data-input-name="{input.attr.name}" class="help-block">{meassage}</span>
     */
    #htmlErro(input, meassage){
        const span = document.createElement('span')
        span.dataset.inputName = input.getAttribute('name')
        span.classList.add('help-block')
        span.innerText = meassage

        return span
    }

    /**
     * 
     * @param {HTMLElement} input  - Input HTML  
     */
    #removeHtmlError(input) {
       
        if(input.classList.contains('was-validated')){
            return false
        }

        input.classList.contains('is-invalid') ? input.classList.remove('is-invalid') : null
        input.classList.contains('was-validated') ? null : input.classList.add('was-validated')
        input.nextElementSibling.tagName == 'SPAN' ? input.nextElementSibling.remove() : null
        
    }

    /* ========================================

            VALIDATION RULES (FUNCTIONS)

    ========================================== */

    /**
     * @param  {string} name        - attribute name of the field (input)
     * @return {requestCallback}    this.#setError(...) - This field cannot be empty, please enter a message
    */
    required(name) {

        if (this.data[name] === '' || this.data[name] === undefined) {
            const currentInput = this.#getInput(name).tagName.toLowerCase()
            
            if(currentInput === 'select'){

                this.#setError(name, "required", this.textError("select", {name : name}))
            } else {

                this.#setError(name, "required", this.textError('empty', {}))
            }

        }
    }

    /**
     * @param  {string} name    - attribute name of the field (input)  
     * @return {requestCallback} this.#setError(...) - The email is not valid
    */
    email(name) {
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(this.data[name])) {
            this.#setError(name, "email", this.textError('email', {}))
        }else{
            const input = this.#getInput(name)
            this.#removeHtmlError(input)
        }
    }

    /**
     * @param  {string} name - attribute name of the field (input)
     * @param  {number}  min - min length of characters
     * @return {requestCallback} this.#setError(...) - Erreur nombre de caractéres insuffisants
    */
    min(name, min) {
        if (!parseInt(min)){
            console.error(`The parameter min is not a number`)
        }else{
            if (this.data[name].trim().length < min) {
                this.#setError(name, "min", this.textError('min', { min: min }))
            }else{
                const input = this.#getInput(name)
                this.#removeHtmlError(input)
            }
        }
    }

    /**
     * @param  {string} name - attribute name of the field (input)
     * @param  {number}  max - max length of characters
     * @return {requestCallback} this.#setError(...) - Erreur nombre maximum de caractères atteint max : ${max} 
    */
    max(name, max) {
        if (!parseInt(max)){
            console.error(`The parameter max is not a number`)
        }else{
            if (this.data[name].trim().length > max) {
                this.#setError(name, "max", this.textError('max', { max: max }))
            }else{
                const input = this.#getInput(name)
                this.#removeHtmlError(input)
            }
        }
        
    }
    /**
     * 
     * @param  {string} name    - attribute name of the field (input)
     * @param {string} regex
     * @return {requestCallback} this.#setError(...) - Erreur le champ est vide
     */
    match(name, regex) {
        const matches = this.data[name].match(regex.slice(1, -1))
        if (!this.data[name].match(regex.slice(1, -1))) {
            this.#setError(name, "match", this.textError('match', {}))
        }else{
            const input = this.#getInput(name)
            this.#removeHtmlError(input)
        }
        
    }

    /**
     * Adds an error to this.errors object
     * 
     * @param {string} name     - attribute name of the field (input)
     * @param {string} type     - type de l'erreur à ajouter - required|min|max|email etc..
     * @param {string} error    - error text

     */
    #setError(name, type, error) {
        this.#FormValidatordebug ? console.log(`addError - name : ${name} | error : ${error}`) : null
        this.errors === undefined ? this.errors = new Object :  null

        this.errors[name] === undefined ? this.errors[name] = new Object : null

        this.errors[name][type] = error

    }


    /* ========================================

                    LOCALES

    ========================================== */

    /**
     * @param {string} type     - attribute name of the field (input)
     * @param {Object} options  - array of options value to send to the view example : min|max|betewen
     * @returns {string}        - error text
    */
    textError(type, options) {

        this.#FormValidatordebug ? console.log(options) : null

        const locales = {
            fr: {
                undefined : 'Entrée invalide',
                empty:  `Ce champ ne peux pas être vide`,
                email:  `Le champ email n'est pas un email valide`,
                min:    `LE champ doit contenir au minimum ${options.min} caractères`,
                max :   `Le champ ne peut pas contenir plus de ${options.max} caractères`,
                select: `Veuillez sélectionner un ${options.name}`,
                match:  `La valeur indiquée n'est pas valide`
            },
            en: {
                undefined : 'Field invalid',
                empty:  `This field cannot be empty, please enter a message`,
                email:  `The email is not valid`,
                min:    `This field must contain at least ${options.min} characters`,
                max :   `The field cannot contain more than ${options.max} characters`,
                select: `Please select a valid ${options.name}`,
                match:  `The value is not valid`
            }
        }

        const localLowerCase = this.options.local.toLowerCase()

        locales[localLowerCase] === undefined ? this.options.local = 'en' : null
        
        if(locales[localLowerCase][type] === undefined){
            console.error(`No locales.${this.options.local} text found for the error name : ${type}`)
            return locales[localLowerCase][undefined]
        }
        return locales[localLowerCase][type]
    }

}