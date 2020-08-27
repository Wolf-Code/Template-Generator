
export class TemplateExistsError extends Error {
	constructor(message: string = 'Template already exists') {
		super(message)

		this.name = 'TemplateExistsError'
	}
}