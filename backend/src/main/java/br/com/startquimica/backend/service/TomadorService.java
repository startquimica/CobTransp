package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Tomador;
import br.com.startquimica.backend.repository.TomadorRepository;
import br.com.startquimica.backend.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TomadorService {

    private final TomadorRepository tomadorRepository;

    public List<Tomador> findAll() {
        return tomadorRepository.findAll();
    }

    public Tomador findById(Long id) {
        return tomadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tomador não encontrado"));
    }

    @Transactional
    public Tomador save(Tomador tomador) {
        if (tomador.getTenantId() == null) {
            tomador.setTenantId(TenantContext.getCurrentTenant());
        }
        return tomadorRepository.save(tomador);
    }

    @Transactional
    public void deleteById(Long id) {
        tomadorRepository.deleteById(id);
    }
}
