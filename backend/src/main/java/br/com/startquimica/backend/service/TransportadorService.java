package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Transportador;
import br.com.startquimica.backend.repository.TransportadorRepository;
import br.com.startquimica.backend.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportadorService {

    private final TransportadorRepository transportadorRepository;

    public List<Transportador> findAll() {
        return transportadorRepository.findAll();
    }

    public Transportador findById(Long id) {
        return transportadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transportador não encontrado"));
    }

    @Transactional
    public Transportador save(Transportador transportador) {
        if (transportador.getTenantId() == null) {
            transportador.setTenantId(TenantContext.getCurrentTenant());
        }
        return transportadorRepository.save(transportador);
    }

    @Transactional
    public void deleteById(Long id) {
        transportadorRepository.deleteById(id);
    }
}
