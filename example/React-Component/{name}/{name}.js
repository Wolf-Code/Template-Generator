import React from 'react'
import styles from './{name}.module.scss'

export default props => {
	return (
		<div className={ styles.{rootClass} }>
			This is the {name} component.
		</div>
	)
}