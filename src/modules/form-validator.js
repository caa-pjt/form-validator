export class FormValidator {

    #FormValidatordebug = false

    /* Form */
    form = []

    /* Liste des champs (inputs) du formulaire */
    inputs = []

    // liste des champs à valider
    fieldsToValidate = []

    /* Langue des erreurs à injecter dans la vue  */
    lang

    /**
     * Validation de formulaires
     * @param {HTMLFormControlsCollection} form - formulaire envoyé par l'évenement
     * @param {string} lang - Langue des erreurs en deux caractères ex : en|fr|pt
    */
    constructor(form, lang = 'fr') {

        this.form = form
        this.lang = lang

        this.formData()

    }

    /**
     * Création de l'objet form data
     * @returns {object[]|error} - renvoie une exception si aucune donée n'est récupèrée
     */
    formData() {
        if (this.form.target != undefined) {
            const formData = Object.fromEntries(new FormData(this.form.target).entries())
            this.data = formData

            /**
             * Tableau des champs contenus dans le formulaire
            */
            for (let i = 0; i < this.form.currentTarget.length; i++) {
                this.inputs.push(this.form.currentTarget[i])
            }

        } else {
            throw new Error(`Aucun imput trouvé dans le formulaire !`)
        }
    }

    /**
     * Ajoute une erreur selon les règles de validation
     * @param {object[]} dataAndRules                   - Objet contenant les les champs ainsi que les règles de validation
     * @property {string<inputAttrName>} object.name    - nom de l'attribut name de l'imput 
     * @property {string} rules                         - règles de validation séparées par Séparateur pipe |
     *  - exemple: {'email' : 'required|email','textarea' : 'required|min:10|max:255'}
     */
    validate(dataAndRules) {
        for (const input in dataAndRules) {

            if(this.data[input] === undefined){
                console.error(`l'imput name: [${input}] n'existe pas`)
            }else{
                this.fieldsToValidate.push(input)
                const rules = dataAndRules[input].split('|')
                this.rulesValidator(input, rules)
            }
        }
    }

    /**
     * Reçois le nom de l'imput à valider et appel la fonction selon les règles de validation
     * 
     * @param {string} input - nom de l'attibut de l'imput
     * @param {string} rules - règle de validation, fonction à appeler
     */
    rulesValidator(input, rules) {

        for (let i = 0; i < rules.length; i++) {

            let rule = rules[i].split(':')
            if (rule.length > 1) {

                const func = rule[0]
                const param = parseInt(rule[1])

                try {
                    this[func](input, param)
                }catch (e){
                    console.error(`(${func}) ${e.name} : ${e.message}`)
                }
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
     * @param {string} AttrName - nom de l'attribut de l'imput
     * @returns {HTMLHtmlElement}
     */
    getInput(AttrName){
        return this.inputs.find(input => input.getAttribute('name') == AttrName )
    }

    /**
     * 
     * @returns - erreurs au format json
     */
    getErrors() {
        return this.errors
    }

    /**
     * 
     * @returns - Si empty erreur return true
    */
    isValide() {
        if (this.errors != null || this.errors != undefined) {
            return false
        } else {
            this.setErrors()
            return true
        }
    }


    /**
     * @returns {HTMLElement} Modifie HTML (erreurs)
     */
    setErrors() {
        /*  for in fieldsToValidate
            if !Object.keys(this.errors).includes(fieldsToValidate)
                ajout is-invalid à l'input
                création span data-id = input.datasetname
            else 
                Suppression de l'erreur
                 
        */
       /*console.log(`this.fieldsToValidate : `, this.fieldsToValidate)*/
         for (const key in this.fieldsToValidate) {
            if (Object.hasOwnProperty.call(this.fieldsToValidate, key)) {
                
                const errorKey = this.fieldsToValidate[key];
                const input = this.getInput(errorKey)

                if (this.errors != null || this.errors != undefined) {
                    if (Object.keys(this.errors).includes(errorKey)) {
                        this.setHtmlError(input, this.errors[errorKey])
                    } else {
                        this.removeHtmlError(input)
                    }
                }

            } else {
                throw Error(`Il semble que l'imput name: [${key}] ne corrsponde pas !`)
            }
        } 
    }

    /**
     * 
     * @param {HTMLElement} input  - Imput HTML
     * @param {string} error - texte de l'erreur
     */
    setHtmlError(input, error) {

        if(input.classList.contains('is-invalid')){
            //const span = document.createElement('span')
            if (input.nextElementSibling.tagName === 'SPAN') {
                input.nextElementSibling.innerText === error ? null : input.nextElementSibling.innerText = error
            }
            return false
        }

        input.classList.contains('was-validated') ? input.classList.remove('was-validated') : null
        input.classList.contains('is-invalid') ? null : input.classList.add('is-invalid')

        if (input.nextElementSibling.tagName != 'SPAN') {

            const span = document.createElement('span')
            span.dataset.inputName = input.getAttribute('name')
            span.classList.add('help-block')
            span.innerText = error
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
     * @param {HTMLElement} input  - Imput HTML  
     */
    removeHtmlError(input) {
       
        if(input.classList.contains('was-validated')){
            return false
        }

        input.classList.contains('is-invalid') ? input.classList.remove('is-invalid') : null
        input.classList.contains('was-validated') ? null : input.classList.add('was-validated')
        input.nextElementSibling.tagName == 'SPAN' ? input.nextElementSibling.remove() : null
        
    }

    /**
     * Supprime une entrée d'un tableau lorsque elle ne doit plus être vérifiée.
     * 
     * @param {HTMLDataElement} attrName - attribut name of the html element
     */
    splice(attrName){

        if(!this.errors.hasOwnProperty(attrName)){
            return false
        }

        let index = this.fieldsToValidate.indexOf(attrName)

        if(index != -1){

            const input = this.getInput(attrName)

            this.fieldsToValidate.splice(index)

            this.removeHtmlError(input)
        }

    }



    /**
     * @param  {string} name - nom de l'attribut de l'imput
     * @returns {Object} - Erreur le champ est vide
    */
    required(name) {

        if (this.data[name] === '' || this.data[name] === undefined) {
            const currentInput = this.getInput(name).tagName.toLowerCase()
            
            if(currentInput === 'select'){

                this.addError(name, this.textError("select", {name : name}))
            } else {

                this.addError(name, this.textError('empty', {}))
            }

        }else {
            this.splice(name)
        }
    }

    /**
     * @param  {string} name - nom de l'imput  
     * @returns {Object} - Erreur email invalide
    */
    email(name) {
        debugger
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(this.data[name])) {
            this.addError(name, this.textError('email', {}))
        }else {
            this.splice(name)
        }
    }

    /**
     * @param  {string} name - nom de l'imput 
     * @param  {number}  min - nombre de caractères minimum
     * @returns {Object} - Erreur nombre de caractéres insuffisants
    */
    min(name, min) {
        if (this.data[name].trim().length < min) {
            this.addError(name, this.textError('min', { min: min }))
        }else {
            this.splice(name)
        }
    }

    /**
     * @param  {string} name - nom de l'imput 
     * @param  {number}  max - nombre de caractères minimum
     * @returns {Object} - Erreur nombre maximum de caractères atteint max : ${max} 
    */
    max(name, max) {
        if (this.data[name].trim().length > max) {
            console.log(name)
            this.addError(name, this.textError('max', { max: max }))
        }else {
            this.splice(name)
        }
    }

    /**
     * @param {string} name - nom de l'attribut de l'imput 
     * @param {string} error - texte de l'erreure 
     */
    addError(name, error) {
        this.#FormValidatordebug ? console.log(`addError - name : ${name} | error : ${error}`) : null
        this.errors === undefined ? this.errors = {} :  null
        this.fieldsToValidate.includes(name) === false ? this.fieldsToValidate.push(name) : null
        this.errors[name] === undefined ? this.errors[name] = error : null
    }


    /**
     * @param {string} type - nom de l'imput 
     * @param {Object} options - tableau d'options valeur à envoyer à la vue exemple : min|max|betewen
     * @returns {string} - texte de l'erreure
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
                select: `Veuillez sélectionner un ${options.name}`
            },
            en: {
                undefined : 'Field invalid',
                empty:  `Please enter a message`,
                email:  `The email is not valid`,
                min:    `This field must contain at least ${options.min} characters`,
                max :   `The field cannot contain more than ${options.max} characters`,
                select: `Please select a valid ${options.name}`
            }
        }
        if(locales[this.lang][type] === undefined){
            console.error(`Aucun texte ${this.lang} n'a été trouver pour l'erreur ${type}`)
            return locales[this.lang][undefined]
        }
        return locales[this.lang][type]
    }

}