package br.com.startquimica.backend.dto;

import java.util.List;

public record ImportacaoArquivoResultDTO(
        Long cobrancaId,
        List<ErroLinhaDTO> erros) {
}
