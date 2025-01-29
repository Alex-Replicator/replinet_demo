import AppLoader from './AppLoader.vue'
import ConfirmDialog from './ConfirmDialog.vue'
import DataTable from './DataTable.vue'
import EmptyState from './EmptyState.vue'
import FormField from './FormField.vue'
import JsonEditor from './JsonEditor.vue'
import LogViewer from './LogViewer'
import PageHeader from './PageHeader.vue'
import StatusBadge from './StatusBadge.vue'
import UserAvatar from './UserAvatar.vue'

export {
  AppLoader,
  ConfirmDialog,
  DataTable,
  EmptyState,
  FormField,
  JsonEditor,
  LogViewer,
  PageHeader,
  StatusBadge,
  UserAvatar
}

// Re-export types
export type { LogItem, LogViewerProps, LogEntryProps } from './LogViewer'

// Import all components as a plugin
export default {
  install(app: any) {
    app.component('AppLoader', AppLoader)
    app.component('ConfirmDialog', ConfirmDialog)
    app.component('DataTable', DataTable)
    app.component('EmptyState', EmptyState)
    app.component('FormField', FormField)
    app.component('JsonEditor', JsonEditor)
    app.component('LogViewer', LogViewer)
    app.component('PageHeader', PageHeader)
    app.component('StatusBadge', StatusBadge)
    app.component('UserAvatar', UserAvatar)
  }
}