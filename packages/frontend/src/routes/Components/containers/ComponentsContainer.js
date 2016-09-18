import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { fetchComponents, postComponent, updateComponent } from '../modules/components'
import ComponentDialog from 'components/ComponentDialog'
import classnames from 'classnames'
import classes from './ComponentsContainer.scss'
import { getColor } from 'utils/colors'

const dialogType = {
  none: 0,
  add: 1,
  edit: 2,
  delete: 3
}

class Components extends React.Component {
  constructor () {
    super()
    this.state = { dialogType: dialogType.none, selectedComponent: null }

    this.handleShowDialog = this.handleShowDialog.bind(this)
    this.handleHideDialog = this.handleHideDialog.bind(this)
    this.handleAdd = this.handleAdd.bind(this)
    this.handleEdit = this.handleEdit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.renderListItem = this.renderListItem.bind(this)
  }

  componentDidMount () {
    let jsElem = ReactDOM.findDOMNode(this.refs.add_component_button)
    componentHandler.upgradeElement(jsElem)

    this.props.dispatch(fetchComponents)
  }

  componentDidUpdate () {
    let dialog = ReactDOM.findDOMNode(this.refs.componentDialog)
    if (dialog) {
      if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog)
      }
      try {
        dialog.showModal()

        // workaround https://github.com/GoogleChrome/dialog-polyfill/issues/105
        let overlay = document.querySelector('._dialog_overlay')
        if (overlay) {
          overlay.parentNode.removeChild(overlay)
        }
      } catch (ex) {
        console.warn('Failed to show dialog')
      }
    }
  }

  handleShowDialog (type, component) {
    this.setState({ component: component, dialogType: type })
  }

  handleHideDialog () {
    let dialog = ReactDOM.findDOMNode(this.refs.componentDialog)
    dialog.close()
    this.setState({ component: null, dialogType: dialogType.none })
  }

  handleAdd (id, name, description, status) {
    this.props.dispatch(postComponent(name, description, status))
    this.handleHideDialog()
  }

  handleEdit (id, name, description, status) {
    // this.props.dispatch(updateComponent(id, name, description, status))
    this.handleHideDialog()
  }

  handleDelete (id, name, description, status) {
    this.handleHideDialog()
  }

  renderListItem (component) {
    let statusColor = getColor(component.status)
    return (
      <li key={component.id} className='mdl-list__item mdl-list__item--two-line mdl-shadow--2dp'>
        <span className='mdl-list__item-primary-content'>
          <i className={classnames(classes.icon, 'material-icons', 'mdl-list__item-avatar')}
            style={{color: statusColor}}>web</i>
          <span>{component.name}</span>
          <span className='mdl-list__item-sub-title'>{component.description}</span>
        </span>
        <span className='mdl-list__item-secondary-content'>
          <div className='mdl-grid'>
            <div className='mdl-cell mdl-cell--6-col'>
              <button className={classnames(classes.editButton, 'mdl-button', 'mdl-js-button')}
                onClick={() => this.handleShowDialog(dialogType.edit, component)}>
                Edit
              </button>
            </div>
            <div className='mdl-cell mdl-cell--6-col'>
              <button className={classnames(classes.deleteButton, 'mdl-button', 'mdl-js-button')}
                onClick={() => this.handleShowDialog(dialogType.delete, component)}>
                Delete
              </button>
            </div>
          </div>
        </span>
      </li>
    )
  }

  renderDialog () {
    let dialog
    switch (this.state.dialogType) {
      case dialogType.none:
        dialog = null
        break
      case dialogType.add:
        let component = {
          id: '',
          name: '',
          description: '',
          status: 'Operational'
        }
        dialog = <ComponentDialog ref='componentDialog' onCompleted={this.handleAdd}
          onCanceled={this.handleHideDialog} component={component} actionName='Add' />
        break
      case dialogType.edit:
        dialog = <ComponentDialog ref='componentDialog' onCompleted={this.handleEdit}
          onCanceled={this.handleHideDialog} component={this.state.component} actionName='Edit' />
        break
      case dialogType.delete:
        dialog = null
        break
      default:
        console.warn('unknown dialog type: ', this.state.dialogType)
    }
    return dialog
  }

  render () {
    const { serviceComponents, isFetching } = this.props
    const componentItems = serviceComponents.map(this.renderListItem)
    const dialog = this.renderDialog()

    return (<div className={classnames(classes.layout, 'mdl-grid')} style={{ opacity: isFetching ? 0.5 : 1 }}>
      <div className='mdl-cell mdl-cell--9-col mdl-cell--middle'>
        <h4>Components</h4>
      </div>
      <div className={classnames(classes.showDialogButton, 'mdl-cell mdl-cell--3-col mdl-cell--middle')}>
        <button className='mdl-button mdl-js-button mdl-button--raised mdl-button--accent'
          onClick={() => this.handleShowDialog(dialogType.add)} ref='add_component_button'>
          <i className='material-icons'>add</i>
          Component
        </button>
      </div>
      <ul className='mdl-cell mdl-cell--12-col mdl-list'>
        {componentItems}
      </ul>
      {dialog}
    </div>)
  }
}

Components.propTypes = {
  serviceComponents: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired).isRequired,
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    isFetching: state.components.isFetching,
    serviceComponents: state.components.serviceComponents
  }
}

export default connect(mapStateToProps)(Components)
