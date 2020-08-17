import { IComponentFile } from "../component-file.interface"

export default {
	name: "{name}.view.tsx",
	content: `import React from 'react'
import { {name}ViewProps } from './{name}.types'

export default (props: {name}ViewProps) => {
	return <div>Placeholder for {name}</div>
}
`
} as IComponentFile