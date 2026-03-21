package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.domain.Tenant;
import br.com.startquimica.backend.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN_TENANT')")
public class TenantController {

    private final TenantService tenantService;

    @GetMapping
    public List<Tenant> getAll() {
        return tenantService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tenantService.findById(id));
    }

    @PostMapping
    public Tenant create(@RequestBody Tenant tenant) {
        return tenantService.save(tenant);
    }

    @PutMapping("/{id}")
    public Tenant update(@PathVariable Long id, @RequestBody Tenant tenant) {
        tenant.setId(id);
        return tenantService.save(tenant);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tenantService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
