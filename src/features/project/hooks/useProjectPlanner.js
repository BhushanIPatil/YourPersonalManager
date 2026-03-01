import { useState, useCallback } from 'react'

const createSprintId = () => `sprint-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const createTodayId = () => `today-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export function defaultSprintProject() {
  return {
    id: createSprintId(),
    projectTitle: '',
    sprintNumber: '',
    taskId: '',
    branch: '',
    changes: '',
    develop: false,
    qa: false,
    prod: false,
    note: '',
  }
}

export function defaultTodayWork() {
  return {
    id: createTodayId(),
    date: new Date().toISOString().slice(0, 10),
    projectTitle: '',
    taskId: '',
    changes: '',
    status: 'To Do',
    dev: false,
    qa: false,
    prod: false,
    note: '',
  }
}

export function useProjectPlanner() {
  const [sprintProjects, setSprintProjects] = useState([defaultSprintProject()])
  const [todayItems, setTodayItems] = useState([defaultTodayWork()])

  const updateSprintProject = useCallback((id, updates) => {
    setSprintProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }, [])

  const addSprintProject = useCallback(() => {
    setSprintProjects((prev) => [...prev, defaultSprintProject()])
  }, [])

  const removeSprintProject = useCallback((id) => {
    setSprintProjects((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== id)))
  }, [])

  const updateTodayItem = useCallback((id, updates) => {
    setTodayItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    )
  }, [])

  const addTodayItem = useCallback(() => {
    setTodayItems((prev) => [...prev, defaultTodayWork()])
  }, [])

  const removeTodayItem = useCallback((id) => {
    setTodayItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.id !== id)))
  }, [])

  return {
    sprintProjects,
    updateSprintProject,
    addSprintProject,
    removeSprintProject,
    todayItems,
    updateTodayItem,
    addTodayItem,
    removeTodayItem,
  }
}
