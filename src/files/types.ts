import { IComponentFile } from "../component-file.interface"

export default {
	name: "{name}.types.ts",
	content: `import { ComponentProps } from "utilities/createComponent";

export interface {name}StateProps extends ComponentProps {

}

export interface {name}ViewProps extends ComponentProps {
	
}
`
} as IComponentFile