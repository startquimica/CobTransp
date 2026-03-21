package br.com.startquimica.backend.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardTenantDTO(
        long totalCobrancas,
        long totalTransportadores,
        long totalTomadores,
        long totalUsuarios,
        BigDecimal valorTotalPendente,
        BigDecimal valorTotalEnviado,
        Map<String, Long> cobrancasPorStatus,
        Map<String, Long> cobrancasPorTipo,
        List<CobrancaResumoDTO> ultimasCobrancas) {
}
