/**
 * Autor: Matheus Augusto Alves
 * Validacao de perfil - Sistema de Acompanhamento de Demandas
 * Projeto Integrador 2
 *
 * Responsabilidade deste arquivo:
 * Identificar QUEM é o usuário dentro do sistema, ou seja, qual é o perfil
 * dele (Administrador, Líder de Projeto ou Membro da Equipe) e se ele está
 * vinculado a um determinado projeto.
 *
 * Este arquivo NÃO decide o que o usuário pode fazer com as demandas.
 * Ele apenas responde "o que o usuário é". A validação das ações sobre as
 * demandas (ver, criar, editar, alterar status) deve usar estas funções.
 *
 * Regras seguidas (Documento de Visão PI II, item 2.1):
 * - Administrador: acesso a todos os projetos.
 * - Líder de Projeto: acesso apenas aos projetos aos quais está vinculado.
 * - Membro da Equipe: acesso apenas aos projetos aos quais está vinculado.
 */

/**
 * Perfis de usuário previstos no escopo do sistema (item 2.1).
 * Escritos exatamente como estão na coluna "perfil" da tabela usuario.
 */
export type Perfil = 'Administrador' | 'Lider de Projeto' | 'Membro da Equipe';

/**
 * Resultado da identificação do usuário dentro de um projeto específico.
 * 'SEM_VINCULO' indica que o usuário não tem nenhuma relação com o projeto
 * e, portanto, não deve acessar nada dele.
 */
export type PerfilNoProjeto = Perfil | 'SEM_VINCULO';

/**
 * Lista com todos os perfis válidos.
 * Usada para conferir se o perfil cadastrado no usuário é um valor permitido.
 */
export const PERFIS_VALIDOS: readonly Perfil[] = ['Administrador', 'Lider de Projeto', 'Membro da Equipe'];

/**
 * Dados mínimos que o usuário precisa ter para que o perfil seja identificado.
 * O tipo de usuário da equipe pode ter outros campos (nome, e-mail, senha...),
 * basta possuir também estes três.
 */
export interface UsuarioComPerfil {
  id_usuario: number;
  perfil: string;
  projetosVinculados: number[]; // ids dos projetos aos quais o usuário está vinculado
}

/**
 * Confere se um valor é um perfil válido do sistema.
 * Evita que um perfil digitado errado nos dados (ex.: "lider" ou "ADM")
 * seja tratado como se fosse válido.
 */
export function ehPerfilValido(valor: unknown): valor is Perfil {
  return typeof valor === 'string' && (PERFIS_VALIDOS as readonly string[]).includes(valor);
}

/**
 * Procura um usuário pelo id dentro da lista de usuários.
 * Retorna undefined quando o usuário não existe.
 */
export function buscarUsuarioPorId<T extends UsuarioComPerfil>(
  usuarios: T[],
  usuarioId: number
): T | undefined {
  return usuarios.find((usuario) => usuario.id_usuario === usuarioId);
}

/**
 * Identifica o perfil geral do usuário no sistema.
 * Retorna null quando o perfil cadastrado não é um dos perfis válidos,
 * para que quem chamar a função possa negar o acesso.
 */
export function identificarPerfil(usuario: UsuarioComPerfil): Perfil | null {
  if (!ehPerfilValido(usuario.perfil)) {
    return null;
  }
  return usuario.perfil;
}

/**
 * Verifica se o usuário está vinculado ao projeto informado.
 */
export function estaVinculadoAoProjeto(usuario: UsuarioComPerfil, projetoId: number): boolean {
  // Se a lista de projetos não existir nos dados, considera que não há vínculo.
  if (!Array.isArray(usuario.projetosVinculados)) {
    return false;
  }
  return usuario.projetosVinculados.includes(projetoId);
}

/**
 * Identifica o que o usuário é DENTRO de um projeto específico.
 *
 * - Administrador: é sempre Administrador, em qualquer projeto.
 * - Líder ou Membro: só tem o perfil no projeto se estiver vinculado a ele.
 *   Se não estiver vinculado, o resultado é SEM_VINCULO.
 * - Perfil inválido nos dados: também retorna SEM_VINCULO (nega o acesso).
 */
export function perfilNoProjeto(usuario: UsuarioComPerfil, projetoId: number): PerfilNoProjeto {
  const perfil = identificarPerfil(usuario);

  // Perfil inválido: por segurança, o usuário não recebe acesso ao projeto.
  if (perfil === null) {
    return 'SEM_VINCULO';
  }

  // O Administrador enxerga todos os projetos, então não precisa de vínculo.
  if (perfil === 'Administrador') {
    return 'Administrador';
  }

  // Líder e Membro só valem para os projetos aos quais estão vinculados.
  if (!estaVinculadoAoProjeto(usuario, projetoId)) {
    return 'SEM_VINCULO';
  }

  return perfil;
}

/**
 * Atalho: o usuário é Administrador?
 */
export function ehAdministrador(usuario: UsuarioComPerfil): boolean {
  return identificarPerfil(usuario) === 'Administrador';
}

/**
 * Atalho: o usuário é Líder DESTE projeto?
 * (Perfil Líder e vinculado ao projeto informado.)
 */
export function ehLiderDoProjeto(usuario: UsuarioComPerfil, projetoId: number): boolean {
  return perfilNoProjeto(usuario, projetoId) === 'Lider de Projeto';
}

/**
 * Atalho: o usuário é Membro da Equipe DESTE projeto?
 * (Perfil Membro e vinculado ao projeto informado.)
 */
export function ehMembroDoProjeto(usuario: UsuarioComPerfil, projetoId: number): boolean {
  return perfilNoProjeto(usuario, projetoId) === 'Membro da Equipe';
}
