package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.repository.CobrancaRepository;
import br.com.startquimica.backend.repository.CobrancaSpec;
import br.com.startquimica.backend.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CobrancaService {

    private final CobrancaRepository cobrancaRepository;
    private final SankhyaService sankhyaService;

    public Page<Cobranca> findAll(
            Pageable pageable,
            String status,
            String tipoCobranca,
            String tipoTransporte,
            String transportadorNome,
            LocalDate alteracaoDe,
            LocalDate alteracaoAte,
            LocalDate envioDe,
            LocalDate envioAte) {
        return cobrancaRepository.findAll(
                CobrancaSpec.comFiltros(status, tipoCobranca, tipoTransporte, transportadorNome,
                        alteracaoDe, alteracaoAte, envioDe, envioAte),
                pageable);
    }

    public Cobranca findById(Long id) {
        return cobrancaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrança não encontrada"));
    }

    @Transactional
    public Cobranca save(Cobranca cobranca) {
        if (cobranca.getTenantId() == null) {
            cobranca.setTenantId(TenantContext.getCurrentTenant());
        }

        if (cobranca.getDocumentosFiscais() != null) {
            cobranca.getDocumentosFiscais().forEach(doc -> {
                doc.setCobranca(cobranca);
                doc.setTenantId(cobranca.getTenantId());
                if (doc.getNotas() != null) {
                    doc.getNotas().forEach(nota -> {
                        nota.setDocumentoFiscal(doc);
                        nota.setTenantId(cobranca.getTenantId());
                    });
                }
            });
        }

        return cobrancaRepository.save(cobranca);
    }

    @Transactional
    public Cobranca enviarParaSankhya(Long id) {
        Cobranca cobranca = cobrancaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrança não encontrada"));

        if ("E".equals(cobranca.getStatus())) {
            throw new RuntimeException("Cobrança já foi enviada ao sistema externo");
        }
        if ("C".equals(cobranca.getStatus())) {
            throw new RuntimeException("Cobrança cancelada não pode ser enviada");
        }

        String protocolo = sankhyaService.enviarCobranca(cobranca);

        cobranca.setStatus("E");
        cobranca.setDataEnvio(LocalDateTime.now());
        cobranca.setProtocoloSankhya(protocolo);

        return cobrancaRepository.save(cobranca);
    }

    @Transactional
    public void deleteById(Long id) {
        cobrancaRepository.deleteById(id);
    }
}

