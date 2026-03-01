import { useState, useCallback } from 'react'
import { generatePDF, extractPlannerFromPDF } from '../../../utils/pdfPlanner'

const defaultActivity = () => ({
  time: '09:00',
  desc: '',
  notes: '',
  done: false,
})

function getDefaultDate() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Encapsulates planner form state and actions.
 * Ready to be backed by API (e.g. save/load plans) when backend is added.
 */
export function usePlannerForm() {
  const [planDate, setPlanDate] = useState(getDefaultDate())
  const [planTitle, setPlanTitle] = useState('')
  const [activities, setActivities] = useState([defaultActivity()])

  const updateActivity = useCallback((index, next) => {
    setActivities((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], ...next }
      return copy
    })
  }, [])

  const addActivity = useCallback(() => {
    setActivities((prev) => [...prev, defaultActivity()])
  }, [])

  const removeActivity = useCallback((index) => {
    setActivities((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleGeneratePDF = useCallback(() => {
    const ok = generatePDF({
      date: planDate,
      title: planTitle,
      activities,
    })
    return ok
  }, [planDate, planTitle, activities])

  const handlePdfUpload = useCallback(async (arrayBuffer) => {
    const parsed = await extractPlannerFromPDF(arrayBuffer)
    if (parsed.date) setPlanDate(parsed.date)
    if (parsed.title) setPlanTitle(parsed.title)
    if (parsed.activities?.length) {
      setActivities(
        parsed.activities.map((a) => ({
          time: a.time || '09:00',
          desc: a.desc || '',
          notes: a.notes || '',
          done: !!a.done,
        }))
      )
    } else {
      setActivities([defaultActivity()])
    }
    return parsed
  }, [])

  return {
    planDate,
    setPlanDate,
    planTitle,
    setPlanTitle,
    activities,
    updateActivity,
    addActivity,
    removeActivity,
    handleGeneratePDF,
    handlePdfUpload,
  }
}
