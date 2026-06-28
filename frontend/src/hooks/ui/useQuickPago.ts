import { useState } from 'react'
import { useCreatePago } from '../queries/usePagos'
import { parseApiError } from '../../utils/format'

export function useQuickPago() {
  const [isOpen, setIsOpen]     = useState(false)
  const [apiError, setApiError] = useState('')

  const mutation = useCreatePago({
    onSuccess: () => { setIsOpen(false); setApiError('') },
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const open  = () => { setApiError(''); setIsOpen(true) }
  const close = () => setIsOpen(false)

  return { isOpen, open, close, apiError, mutation }
}
