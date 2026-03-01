import { useParams } from 'react-router-dom'

const titles = {
  travel: 'Travel Manager',
  project: 'Project Planner',
  about: 'About',
  contact: 'Contact',
  privacy: 'Privacy',
  faq: 'FAQ',
}

export function PlaceholderPage() {
  const { page } = useParams()
  const title = titles[page] || page || 'Page'

  return (
    <>
      <div className="background-effects" />
      <main className="container">
        <header className="header">
          <h1 className="title">{title}</h1>
          <p className="subtitle">Content for this page can be added later.</p>
        </header>
      </main>
    </>
  )
}
