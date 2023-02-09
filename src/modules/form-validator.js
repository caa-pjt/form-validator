export class FormValidator {

    #FormValidatordebug = false

    /* Form */
    form = []

    /* Liste des champs (inputs) du formulaire */
    inputs = []


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
        /*  for in this.data
            if (this.errors[current]) === unddefined 
                Suppression de l'erreur
            else 
                ajout is-invalid à l'input
                création span data-id = input.datasetname
                 
        */
        for(const input in this.data) {
            console.log(input)
            const current = this.getInput(input)
            if(this.errors === undefined || this.errors[input] === undefined){
                this.removeHtmlError(current)
            }else{
                if(Object.values(this.errors[input]).length > 0){
                    this.setHtmlError(current, Object.values(this.errors[input])[0])
                }
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
     * @param  {string} name - nom de l'attribut de l'imput
     * @returns {Object} - Erreur le champ est vide
    */
    required(name) {

        if (this.data[name] === '' || this.data[name] === undefined) {
            const currentInput = this.getInput(name).tagName.toLowerCase()
            
            if(currentInput === 'select'){

                this.setError(name, "required", this.textError("select", {name : name}))
            } else {

                this.setError(name, "required", this.textError('empty', {}))
            }

        }
    }

    /**
     * @param  {string} name - nom de l'imput  
     * @returns {Object} - Erreur email invalide
    */
    email(name) {
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(this.data[name])) {
            this.setError(name, "email", this.textError('email', {}))
        }
    }

    /**
     * @param  {string} name - nom de l'imput 
     * @param  {number}  min - nombre de caractères minimum
     * @returns {Object} - Erreur nombre de caractéres insuffisants
    */
    min(name, min) {
        if (this.data[name].trim().length < min) {
            this.setError(name, "min", this.textError('min', { min: min }))
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
            this.setError(name, "max", this.textError('max', { max: max }))
        }
    }

    /**
     * Ajoute une erreur à l'objet this.errors
     * 
     * @param {string} name - nom de l'attribut de l'imput 
     * @param {string} type - type de l'erreur à ajouter - required|min|max|email etc..
     * @param {string} error - texte de l'erreure 

     */
    setError(name, type, error) {
        this.#FormValidatordebug ? console.log(`addError - name : ${name} | error : ${error}`) : null
        this.errors === undefined ? this.errors = new Object :  null

        this.errors[name] === undefined ? this.errors[name] = new Object : null

        this.errors[name][type] = error

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