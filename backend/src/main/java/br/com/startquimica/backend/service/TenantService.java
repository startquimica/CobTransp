package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Tenant;
import br.com.startquimica.backend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant findById(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant não encontrado"));
    }

    @Transactional
    public Tenant save(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    @Transactional
    public void deleteById(Long id) {
        tenantRepository.deleteById(id);
    }
}
