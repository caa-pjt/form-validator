/**
* @fileOverview Validates a form and returns: List of errors in JSON format || Validation errors directly below fields not validated
* @author Carlos Antunes
* @version 1.0.2
*/

export class FormValidator {
    
    #FormValidatorDebug = false
    
    /* List of fields (inputs) in the form */
    inputs = []
    // Object containing the data of the form
    inputElements = {}
    
    /**
    * Default options
    */
    options = {
        form : null,
        local : "en",
        observeOnInput : false,
    }
    
    /**
     * @property {SubmitEvent} options.form          - form : event (form sent by the event)
     * @property {Object} options.validationRules    - validationRules : { attrInputName : rules separator pipe (|) }
     *                                               - Example: {'email' : 'required|email','textarea' : 'required|min:10|max:255'}
     * @property {string|undefined} options.local    - local : "en"
     *                                               - (two digits lowercase. Default value "en")
     * @param options
     */
    constructor(options = {}) {
        this.options = Object.assign({}, this.options, options);
        this.errors = {};
        this.debounceDelay = 400; // Default debounce delay in milliseconds
    }

    /**
     * Validate the form
     *
     * @param {HTMLFormElement} formElement - The form element to validate
     */
    validate(formElement) {
        this.errors = {};  // Reset errors before each validation
        this.inputs = [];  // Reset inputs before each validation
        this.inputElements = {}; // Reset input elements
        this.#formData(formElement);

        // Add input listeners if observeOnInput is true
        if (this.options.observeOnInput) {
            this.#addInputListeners();
        }
    }

    /**
     * Create formData Object
     *
     * @param {HTMLFormElement} formElement - The form element to extract data from
     * @returns {object[]|error|boolean} - throws an error if no data is retrieved
     */
    #formData(formElement) {
        if (!formElement || !(formElement instanceof HTMLFormElement)) {
            console.error(`The provided element is not a valid HTMLFormElement.`)
            return false;
        }

        const formData = Object.fromEntries(new FormData(formElement).entries())
        this.data = formData;

        if (formElement.elements.length === 0) {
            console.error(`No FormData inputs detected! Please ensure the form contains inputs.`)
        } else {
            for (let i = 0; i < formElement.elements.length; i++) {
                const input = formElement.elements[i];
                this.inputs.push(input);
                const inputName = input.getAttribute('name');
                if (inputName) {
                    this.inputElements[inputName] = input; // Add input element to inputElements object
                }
            }
            this.#validateData();
        }
    }

    /**
     * Add input listeners to the form inputs
     * @returns {void} - Add event listeners to the form inputs
     */
    #addInputListeners() {
        this.inputs.forEach(input => {
            input.addEventListener('input', this.#debounce(() => {
                this.#updateData(input);
                this.#validateSingleInput(input);
            }, this.debounceDelay));
           /* input.addEventListener('blur', () => {
                this.#validateSingleInput(input);
            });

            */
        });
    }

    /**
     * Debounce function to limit the number of times a function is called
     * @param callback - The function to call
     * @param delay - The delay in milliseconds
     * @returns {(function(): void)|*} - The debounced function
     */
    #debounce(callback, delay) {
        let timer;
        return function() {
            const args = arguments;
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(function() {
                callback.apply(context, args);
            }, delay);
        }
    }

    /**
     * Update the data object with the input value
     *
     * @param input - The input element to update
     */
    #updateData(input) {
        const inputName = input.getAttribute('name');
        if (input.type === 'checkbox') {
            this.data[inputName] = input.checked ? input.value : '';
        } else {
            this.data[inputName] = input.value;
        }
    }

    /**
     * Validate a single input field based on the validation rules
     *
     * @param input - The input element to validate
     * @returns {void}
     */
    #validateSingleInput(input) {
        const inputName = input.getAttribute('name');
        const rules = this.options.validationRules[inputName]?.split('|') || [];

        this.errors[inputName] = {};  // Reset errors for this input

        this.#rulesValidator(inputName, rules);
        this.setErrors();
    }

    /**
     * Add an error according to the validation rules
     *
     * @property {object[]} dataAndRules                - Object containing the list of fields and validation rules
     * @property {string<inputAttrName>} object.name    - Name of the name attribute of the input
     * @property {string} rules                         - Validation rules separated by separator pipe (|)
     *  - Example: {'email' : 'required|email','textarea' : 'required|min:10|max:255'}
     */
    #validateData() {
        const dataAndRules = this.options.validationRules
        
        for (const input in dataAndRules) {
            if (this.data[input] === undefined) {
                console.error(`Input name: [${input}] does not exist`)
            } else {
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
            } else {
                this[rule](input)
            }
            if (this.#FormValidatorDebug) {
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
        return this.inputElements[AttrName];
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
        return !(this.errors && Object.keys(this.errors).length > 0);
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
        for(const input in this.data) {
            if (this.#FormValidatorDebug) {
                console.log(input)
            }
            const current = this.#getInput(input)
            if(this.errors === undefined || this.errors[input] === undefined){
                this.#removeHtmlError(current)
            }else{
                if(Object.values(this.errors[input]).length > 0){
                    this.#setHtmlError(current, Object.values(this.errors[input])[0])
                } else {
                    this.#removeHtmlError(current);
                }
            }
        }
    }
    
    /**
    * Add or remove errors from the HTML form (dispatcher)
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
            const span = this.#htmlError(input, error)
            input.parentElement.appendChild(span)
            
        }else if (input.nextElementSibling.tagName !== 'SPAN'){
            const span = this.#htmlError(input, error)
            input.nextSibling.before(span)
        }
        
        if (input.nextElementSibling.dataset.inputName === input.getAttribute('name')) {
            const span = input.nextElementSibling
            span.innerText = ''
            span.innerText = error
        }

        this.#FormValidatorDebug ? console.log(`Add error from inputName : ${input.getAttribute('name')}`) : null
    }
    
    /**
    * 
    * @param {HTMLElement} input 
    * @param {string} message
    * @returns - <span data-input-name="{input.attr.name}" class="help-block">{message}</span>
    */
    #htmlError(input, message){
        const span = document.createElement('span')
        span.dataset.inputName = input.getAttribute('name')
        span.classList.add('help-block')
        span.innerText = message
        
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
        input.nextElementSibling?.tagName === 'SPAN' ? input.nextElementSibling.remove() : null

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
            if (currentInput === 'select') {
                this.#setError(name, "required", this.textError("select", {name : name}))
            } else {
                this.#setError(name, "required", this.textError('empty', {}))
            }
        } else {
            const input = this.#getInput(name)
            this.#removeHtmlError(input)
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
        this.#FormValidatorDebug ? console.log(`addError - name : ${name} | error : ${error}`) : null
        this.errors === undefined ? this.errors = {} : null

        this.errors[name] === undefined ? this.errors[name] = {} : null

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

        this.#FormValidatorDebug ? console.log(options) : null
        
        const locales = {
            fr: {
                undefined: 'Entrée invalide',
                empty: `Ce champ ne peut pas être vide`,
                email: `Le champ email n'est pas un email valide`,
                min: `Le champ doit contenir au minimum ${options.min} caractères`,
                max: `Le champ ne peut pas contenir plus de ${options.max} caractères`,
                select: `Veuillez sélectionner un ${options.name}`,
                match: `La valeur indiquée n'est pas valide`
            },
            en: {
                undefined: 'Field invalid',
                empty: `This field cannot be empty, please enter a message`,
                email: `The email is not valid`,
                min: `This field must contain at least ${options.min} characters`,
                max: `The field cannot contain more than ${options.max} characters`,
                select: `Please select a valid ${options.name}`,
                match: `The value is not valid`
            }
        };

        const localLowerCase = this.options.local.toLowerCase()
        
        locales[localLowerCase] === undefined ? this.options.local = 'en' : null

        if (locales[localLowerCase][type] === undefined) {
            console.error(`No locales.${this.options.local} text found for the error name: ${type}`)
            return locales[localLowerCase][undefined]
        }
        return locales[localLowerCase][type]
    }
    
}