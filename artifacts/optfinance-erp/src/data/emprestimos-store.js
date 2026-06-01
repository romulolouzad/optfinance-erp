import { useState, useEffect } from 'react'
import emprestimosBase from './emprestimos.json'

let _emprestimos = [...emprestimosBase]
let _listeners = []

function notify() { _listeners.forEach(fn => fn()) }

export function useEmprestimos() {
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const fn = () => forceUpdate(n => n + 1)
    _listeners.push(fn)
    return () => { _listeners = _listeners.filter(l => l !== fn) }
  }, [])
  return _emprestimos
}

export function addEmprestimo(dados) {
  if (!dados.centroCustoId) throw new Error('centroCustoId é obrigatório para registrar um empréstimo')
  const id = `EMP-${Date.now()}`
  const entry = {
    id,
    ...dados,
    situacao: 'ativo',
    valorPago: 0,
    saldoDevedor: parseFloat(dados.valorOriginal) || 0,
  }
  _emprestimos = [entry, ..._emprestimos]
  notify()
  return entry
}
