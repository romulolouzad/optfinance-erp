import { pausarComissoesFuturas } from './comissoes-store'

const _usuariosBase = [
  {
    id: 'USR001',
    nome: 'Ricardo Mantovani',
    email: 'ricardo.m@optsolv.com.br',
    tipo: 'admin',
    perfil: 'diretoria',
    modulos: ['Comercial', 'Financeiro', 'Fiscal', 'Gerencial', 'Metas', 'Relatórios'],
    status: 'ativo',
    ultimoAcesso: 'Hoje, 09:42',
    contratosAtivos: [
      { id: 'CTR-9921', cliente: 'Indústrias Matarazzo SA', valor: 'R$ 45.200,00' },
      { id: 'CTR-8845', cliente: 'Logística Express Ltda', valor: 'R$ 12.890,00' },
      { id: 'CTR-7712', cliente: 'Varejo Global ME', valor: 'R$ 8.440,00' },
    ],
  },
  {
    id: 'USR042',
    nome: 'Juliana Alves',
    email: 'juliana.a@optsolv.com.br',
    tipo: 'usuario',
    perfil: 'operacional',
    modulos: ['Fiscal', 'Caixa', 'Relatórios'],
    status: 'ativo',
    ultimoAcesso: 'Ontem, 16:15',
    contratosAtivos: [],
  },
  {
    id: 'USR128',
    nome: 'Marcos Henrique',
    email: 'marcos.h@optsolv.com.br',
    tipo: 'usuario',
    perfil: 'comercial',
    modulos: ['Comercial', 'Financeiro', 'Metas'],
    status: 'inativo',
    ultimoAcesso: '12 Out, 2023',
    contratosAtivos: [
      { id: 'CTR-5531', cliente: 'TechBridge Sistemas', valor: 'R$ 9.800,00' },
    ],
  },
  {
    id: 'USR055',
    nome: 'Camila Rodrigues',
    email: 'camila.r@optsolv.com.br',
    tipo: 'usuario',
    perfil: 'comercial',
    modulos: ['Comercial', 'Financeiro', 'Metas', 'Caixa', 'Relatórios'],
    status: 'ativo',
    ultimoAcesso: 'Hoje, 08:15',
    contratosAtivos: [
      { id: 'CTR-4401', cliente: 'Pharmavida Distribuidora', valor: 'R$ 22.500,00' },
      { id: 'CTR-4402', cliente: 'Nexus Tech Ltda', valor: 'R$ 18.000,00' },
    ],
  },
  {
    id: 'USR089',
    nome: 'Pedro Lima',
    email: 'pedro.l@optsolv.com.br',
    tipo: 'usuario',
    perfil: 'operacional',
    modulos: ['Financeiro', 'Fiscal', 'Caixa'],
    status: 'ativo',
    ultimoAcesso: 'Ontem, 11:30',
    contratosAtivos: [],
  },
]

let _usuarios = [..._usuariosBase]
let _nextNum = 200

export function getUsuarios() {
  return _usuarios
}

export function addUsuario(dados) {
  const padded = String(_nextNum).padStart(3, '0')
  const id = `USR${padded}`
  _nextNum++
  const entry = {
    ...dados,
    id,
    ultimoAcesso: '—',
    contratosAtivos: [],
  }
  _usuarios = [..._usuarios, entry]
  return entry
}

export function inativarUsuario(id) {
  const usuario = _usuarios.find(u => u.id === id)
  _usuarios = _usuarios.map(u =>
    u.id === id ? { ...u, status: 'inativo' } : u
  )
  if (usuario) {
    pausarComissoesFuturas(usuario.nome)
  }
}
