import { useEffect } from 'react'

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title
    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        const [key, val] = selector.replace('meta[', '').replace(']', '').split('=')
        element.setAttribute(key.replace(/"/g, ''), val.replace(/"/g, ''))
        document.head.appendChild(element)
      }
      element.setAttribute(attribute, value)
    }
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
  }, [title, description])
}
