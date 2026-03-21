package br.com.startquimica.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CobrancaResumoDTO(
        Long id,
        String transportadorNome,
        String tomadorNome,
        String tipoCobranca,
        BigDecimal valor,
        String status,
        LocalDateTime dataUltimaAlteracao) {
}
