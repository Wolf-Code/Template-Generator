
export class ComponentExistsError extends Error {
	constructor(message: string = 'Component already exists') {
		super(message)

		this.name = 'ComponentExistsError'
	}
}