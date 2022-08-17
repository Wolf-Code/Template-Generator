export interface TemplateFile {
	name: string
	path: string
	contents: string
	openAfterGeneration: boolean
}

export interface TemplateParameter {
	name: string
	description: string
	pattern?: string
	variable: string
	value?: string
}

export interface TemplateConfiguration {
	parameters: TemplateParameter[]
	openAfterGeneration?: string[]
}

export interface Template {
	name: string
	files: TemplateFile[]
	configuration: TemplateConfiguration
}