import { IComponentFile } from "../component-file.interface"

export default {
	name: "{name}.state.ts",
	content: `import { 
	{name}StateProps,
	{name}ViewProps
} from './{name}.types'

export default (props: {name}StateProps): {name}ViewProps => {
	return props
}
`
} as IComponentFile