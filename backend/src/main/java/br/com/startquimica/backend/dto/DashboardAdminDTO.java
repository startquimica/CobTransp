package br.com.startquimica.backend.dto;

import java.util.List;

public record DashboardAdminDTO(
        long totalTenants,
        List<TenantStatDTO> tenants) {
}
