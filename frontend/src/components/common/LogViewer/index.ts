import LogViewer from './index.vue'
import LogEntry from './LogEntry.vue'

export { LogViewer as default, LogEntry }

// Types
export interface LogItem {
  id: string | number
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  details?: Record<string, any>
}

export interface LogViewerProps {
  logs: LogItem[]
  loading?: boolean
  height?: string
  dark?: boolean
  showToolbar?: boolean
  showClear?: boolean
  autoScrollEnabled?: boolean
}

export interface LogEntryProps {
  source: LogItem
  index: number
}