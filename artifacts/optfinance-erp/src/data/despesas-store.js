import { useState, useEffect } from 'react'
import despesasBase from './despesas.json'

let _despesas = [...despesasBase]
let _listeners = []

function notify() { _listeners.forEach(fn => fn()) }

export function useDespesas() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1)
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  }, [])
  return _despesas
}

export function addDespesa(dados) {
  if (!dados.centroCustoId) throw new Error('centroCustoId é obrigatório para registrar uma despesa')
  const id = `DSP-${Date.now()}`
  const entry = { id, ...dados, situacao: 'prevista' }
  _despesas = [..._despesas, entry]
  notify()
  return entry
}
