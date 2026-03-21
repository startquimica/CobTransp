package br.com.startquimica.backend.dto;

import java.math.BigDecimal;

public record TenantStatDTO(
        Long tenantId,
        String tenantNome,
        long totalCobrancas,
        long totalTransportadores,
        long totalTomadores,
        long totalUsuarios,
        BigDecimal valorTotal) {
}
