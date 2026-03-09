import { useMembros, useMemMembros, useAloc } from "../back/data_t";
import { get_info_proj, useProjetos } from "../back/data_q";

// ^^ Importações ^^ //

const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Estudo de Bairros" ]

type Experiencia = {
  nome: string,
  xp_pe: number,
  xp_sf: number,
  xp_sm: number,
  xp_em: number,
};

type Projeto = {
  id: string;
  nome_p: string;
  macro: string;
  equipe: string[];
  NPS: number;
  QAP: number;
  cliente: string;
  status: string;
  escopo: number;
};

export function useXp(selproj: Projeto | null): Experiencia[] {
    const membros = useMemMembros()
    const aloca = useAloc()
    const projetos = useProjetos()

    return membros.map(mem => {

        var exp_em = 0
        var exp_pe = 0
        var exp_sf = 0
        var exp_sm = 0

        projetos.forEach(exp => {
            const macro = exp.macro;

            var xp_em = 0
            var xp_pe = 0
            var xp_sf = 0
            var xp_sm = 0
            

            const status = String(exp.status ?? "").trim().toLowerCase();
            const finalizado = status.includes("finaliz");

            let grupo = aloca.filter(p => mem.id === p.nome[0])
            let papel = grupo.find(p => exp.id === p.proj[0])

            if (exp.equipe.some(eq => mem.alocacoes.includes(eq))) {
                const escopo = exp.escopo;
                
                if (macro_em.includes(macro) && papel?.papel !== "Padrinho" && finalizado && papel?.papel !== "Coordenador") xp_em = escopo;
                else if (macro_pe.includes(macro) && papel?.papel !== "Padrinho" && finalizado && papel?.papel !== "Coordenador") xp_pe = escopo;
                else if (macro_sf.includes(macro) && papel?.papel !== "Padrinho" && finalizado && papel?.papel !== "Coordenador") xp_sf = escopo;
                else if (macro_sm.includes(macro) && papel?.papel !== "Padrinho" && finalizado && papel?.papel !== "Coordenador") xp_sm = escopo;

                if(selproj){
                if (macro === selproj.macro && macro_em.includes(macro)) xp_em *= 2
                else if (macro === selproj.macro && macro_sf.includes(macro)) xp_sf *= 2
                else if (macro === selproj.macro && macro_pe.includes(macro)) xp_pe *= 2
                else if (macro === selproj.macro && macro_sm.includes(macro)) xp_sm *= 2
                }

                exp_em += xp_em
                exp_pe += xp_pe
                exp_sf += xp_sf
                exp_sm += xp_sm

            }
        })

        return {
            nome: mem.nome,
            xp_em: exp_em,
            xp_pe: exp_pe,
            xp_sf: exp_sf,
            xp_sm: exp_sm,
        }
    })

}