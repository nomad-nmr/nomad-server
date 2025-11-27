import React from 'react'
import styles from './SampleDataModal.module.css'

const SampleDataModal = ({ data }) => {
  if (!data) return <div>No data available</div>

  const isEmptyValue = value => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') {
      const trimmed = value.trim()
      return trimmed === '' || trimmed === '-' || trimmed === '%w/v'
    }
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  }

  const formatTimestamp = timestamp => {
    if (!timestamp) return null
    try {
      const date = new Date(timestamp)
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch (e) {
      return String(timestamp)
    }
  }

  const getMetadataKeyLabel = key => {
    const keyMap = {
      created_timestamp: 'Created',
      modified_timestamp: 'Modified',
      ejected_timestamp: 'Ejected'
    }
    return keyMap[key] || key
  }

  const renderValue = (value, parentKey) => {
    if (isEmptyValue(value)) return null
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    // Format timestamps in Metadata section
    if (parentKey === 'Metadata' && typeof value === 'string' && value.includes('T')) {
      const formatted = formatTimestamp(value)
      if (formatted) return formatted
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return (
          <ul className={styles.list}>
            {value.map((item, idx) => (
              <li key={idx}>{renderValue(item, parentKey)}</li>
            ))}
          </ul>
        )
      }
      return <div className={styles.nested}>{renderDetails(value, parentKey)}</div>
    }
    return String(value)
  }

  const renderDetails = (obj, parentKey) => {
    const entries = Object.entries(obj)
      .filter(([key]) => key !== 'schema_version')
      .filter(([, value]) => !isEmptyValue(value))
    if (entries.length === 0) return null

    return entries.map(([key, value]) => {
      const renderedValue = renderValue(value, parentKey)
      const displayLabel = parentKey === 'Metadata' ? getMetadataKeyLabel(key) : key
      return renderedValue === null ? null : (
        <div key={key} className={styles.detailRow}>
          <div className={styles.detailLabel}>{displayLabel}</div>
          <div className={styles.detailContent}>{renderedValue}</div>
        </div>
      )
    })
  }

  const renderSection = (title, content) => {
    if (!content || (typeof content === 'object' && Object.keys(content).length === 0)) return null

    const details = renderDetails(content, title)
    if (!details || details.filter(Boolean).length === 0) return null

    return (
      <div key={title} className={styles.section}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <div className={styles.sectionContent}>{details}</div>
      </div>
    )
  }

  // Special handling for arrays like Users
  const renderArraySection = (title, items) => {
    if (!items || items.length === 0) return null

    const filteredItems = items.filter(item => {
      if (typeof item === 'object') {
        const entries = Object.entries(item).filter(([, value]) => !isEmptyValue(value))
        return entries.length > 0
      }
      return !isEmptyValue(item)
    })

    if (filteredItems.length === 0) return null

    return (
      <div key={title} className={styles.section}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <div className={styles.arrayContainer}>
          {filteredItems.map((item, idx) => (
            <div key={idx} className={styles.arrayItem}>
              {typeof item === 'object' ? renderDetails(item, title) : item}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {data.Users && renderArraySection('Users', data.Users)}
        {data.Sample && renderSection('Sample', data.Sample)}
        {data.Buffer && renderSection('Buffer', data.Buffer)}
        {data['NMR Tube'] && renderSection('NMR Tube', data['NMR Tube'])}
        {data['Sample Position'] && renderSection('Sample Position', data['Sample Position'])}
        {data['Laboratory Reference'] &&
          renderSection('Laboratory Reference', data['Laboratory Reference'])}
        {data.Notes && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Notes</h4>
            <div className={styles.notes}>{data.Notes}</div>
          </div>
        )}
        {data.Metadata && renderSection('Metadata', data.Metadata)}
      </div>
    </div>
  )
}

export default SampleDataModal
