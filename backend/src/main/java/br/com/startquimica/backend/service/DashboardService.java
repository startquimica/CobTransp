package br.com.startquimica.backend.service;

import br.com.startquimica.backend.dto.CobrancaResumoDTO;
import br.com.startquimica.backend.dto.DashboardAdminDTO;
import br.com.startquimica.backend.dto.DashboardTenantDTO;
import br.com.startquimica.backend.dto.TenantStatDTO;
import br.com.startquimica.backend.repository.CobrancaRepository;
import br.com.startquimica.backend.repository.TenantRepository;
import br.com.startquimica.backend.repository.TomadorRepository;
import br.com.startquimica.backend.repository.TransportadorRepository;
import br.com.startquimica.backend.repository.UsuarioRepository;
import br.com.startquimica.backend.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CobrancaRepository cobrancaRepository;
    private final TransportadorRepository transportadorRepository;
    private final TomadorRepository tomadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final TenantRepository tenantRepository;

    public Object getDashboard() {
        if (TenantContext.getCurrentTenant() == null) {
            return buildAdminDashboard();
        }
        return buildTenantDashboard();
    }

    private DashboardAdminDTO buildAdminDashboard() {
        var tenants = tenantRepository.findAll();

        Map<Long, Long> cobrancasMap      = toLongCountMap(cobrancaRepository.countGroupByTenant());
        Map<Long, BigDecimal> valorMap    = toValorMap(cobrancaRepository.sumValorGroupByTenant());
        Map<Long, Long> transportadoresMap = toLongCountMap(transportadorRepository.countGroupByTenant());
        Map<Long, Long> tomadoresMap      = toLongCountMap(tomadorRepository.countGroupByTenant());
        Map<Long, Long> usuariosMap       = toLongCountMap(usuarioRepository.countGroupByTenant());

        List<TenantStatDTO> stats = tenants.stream()
                .map(t -> new TenantStatDTO(
                        t.getId(),
                        t.getNome(),
                        cobrancasMap.getOrDefault(t.getId(), 0L),
                        transportadoresMap.getOrDefault(t.getId(), 0L),
                        tomadoresMap.getOrDefault(t.getId(), 0L),
                        usuariosMap.getOrDefault(t.getId(), 0L),
                        valorMap.getOrDefault(t.getId(), BigDecimal.ZERO)))
                .collect(Collectors.toList());

        return new DashboardAdminDTO(tenants.size(), stats);
    }

    private DashboardTenantDTO buildTenantDashboard() {
        long totalCobrancas      = cobrancaRepository.count();
        long totalTransportadores = transportadorRepository.count();
        long totalTomadores      = tomadorRepository.count();
        long totalUsuarios       = usuarioRepository.count();

        BigDecimal valorPendente = cobrancaRepository.sumValorByStatus("P");
        BigDecimal valorEnviado  = cobrancaRepository.sumValorByStatus("E");

        Map<String, Long> porStatus = toStringCountMap(cobrancaRepository.countByStatusGrouped());
        Map<String, Long> porTipo   = toStringCountMap(cobrancaRepository.countByTipoGrouped());

        List<CobrancaResumoDTO> ultimas = cobrancaRepository.findTopForDashboard(PageRequest.of(0, 5));

        return new DashboardTenantDTO(
                totalCobrancas,
                totalTransportadores,
                totalTomadores,
                totalUsuarios,
                valorPendente != null ? valorPendente : BigDecimal.ZERO,
                valorEnviado  != null ? valorEnviado  : BigDecimal.ZERO,
                porStatus,
                porTipo,
                ultimas);
    }

    // --- helpers ---

    private Map<Long, Long> toLongCountMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    private Map<Long, BigDecimal> toValorMap(List<Object[]> rows) {
        Map<Long, BigDecimal> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], (BigDecimal) row[1]);
        }
        return map;
    }

    private Map<String, Long> toStringCountMap(List<Object[]> rows) {
        Map<String, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((String) row[0], (Long) row[1]);
        }
        return map;
    }
}
