export class FormValidator {

        /* Form */
        form = []

        /* Form imputs list */
        inputs = []
    
        // liste of imputs to validate
        fieldsToValidate = []
    
        /* Default translation errors language  */
        lang
    
        /**
         * Form validation
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

}