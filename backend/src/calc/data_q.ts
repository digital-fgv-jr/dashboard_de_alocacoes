import {base} from "@airtable/blocks"
import { useBase, useRecords } from "@airtable/blocks/ui"
import { get_field, get_count, get_membros } from "./data_t"



// ^^ Imports ^^ //

const dados_h = base.getTableByName("Zapier - Pipefy - Projetos")
const querry_h = await dados_h.selectRecordsAsync()


const macro_pe: string[] = [ "Avaliação Estratégica", "Plano Operacional", "Plano de Negócios", "Sumário Executivo" ]
const macro_sf: string[] = [ "Plano Financeiro", "EVE" ]
const macro_sm: string[] = [ "Plano de Marketing" ]
const macro_em: string[] = [ "Análise Setorial", "Pesquisa de Mercado", "Cliente Oculto" ]

// ^^ Constantes usadas ^^ //

function get_proj() {
    const t_projeto = useRecords(dados_h)

    const projetos = (t_projeto || []).map(proj => ({
        id: proj.id,
        macro: get_field(proj, "Macroetapas") as string,
        equipe: get_field(proj, "Alocações") as string[],
        NPS: get_count(proj, "NPS") as number,
        QAP: get_count(proj, "QAP") as number

    }))
    return projetos

}

// funções usadas //

export function get_info_proj() {
    const membros = get_membros()
    const projeto = get_proj()

    const info_membros_proj = membros.map(mem => {

        let maem_mexp = 0
        let mape_mexp = 0
        let masf_mexp = 0
        let masm_mexp = 0

        let m_nps = 0
        let m_qap = 0

        projeto.forEach(exp => {
            if (exp.equipe.includes(mem.name)) {

                if (macro_em.includes(exp.macro)) {maem_mexp += 1}
                else if (macro_pe.includes(exp.macro)) {mape_mexp += 1}
                else if (macro_sf.includes(exp.macro)) {masf_mexp += 1}
                else if (macro_sm.includes(exp.macro)) {masm_mexp += 1};

                m_nps += exp.NPS
                m_qap += exp.QAP
            }
        })



        return {
            nome: mem.name,
            maem_exp: maem_mexp,
            mape_exp: mape_mexp,
            masf_exp: masf_mexp,
            masm_exp: masm_mexp,
            nps: (m_nps/(maem_mexp + mape_mexp + masf_mexp + masm_mexp))
        }

    })
    return info_membros_proj
}