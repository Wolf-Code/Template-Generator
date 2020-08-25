export interface TemplateFile {
	name: string
	contents: string
}

export interface TemplateParameter {
	name: string
	description: string
	pattern?: string
}

export interface TemplateConfiguration {
	parameters: TemplateParameter[]
}

export interface Template {
	name: string
	files: TemplateFile[]
	configuration: TemplateConfiguration
}