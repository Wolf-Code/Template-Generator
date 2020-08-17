import { IComponentFile } from "../component-file.interface"

export default {
	name: "index.ts",
	content: `import { createComponent } from 'utilities/createComponent'
import view from './{name}.view'
import state from './{name}.state'
import styles from './{name}.module.scss'
import { 
	{name}StateProps,
	{name}ViewProps
} from './{name}.types'

export default createComponent<{name}StateProps, {name}ViewProps>(view, {
	state,
	styles
})
`
} as IComponentFile