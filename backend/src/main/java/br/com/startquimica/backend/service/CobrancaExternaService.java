package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.domain.DocumentoFiscal;
import br.com.startquimica.backend.domain.Nota;
import br.com.startquimica.backend.domain.Tenant;
import br.com.startquimica.backend.domain.Transportador;
import br.com.startquimica.backend.domain.Tomador;
import br.com.startquimica.backend.dto.CobrancaExternaRequestDTO;
import br.com.startquimica.backend.dto.CobrancaExternaResponseDTO;
import br.com.startquimica.backend.repository.TenantRepository;
import br.com.startquimica.backend.repository.TomadorRepository;
import br.com.startquimica.backend.repository.TransportadorRepository;
import br.com.startquimica.backend.security.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CobrancaExternaService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TenantRepository tenantRepository;
    private final TransportadorRepository transportadorRepository;
    private final TomadorRepository tomadorRepository;
    private final CobrancaService cobrancaService;

    public CobrancaExternaResponseDTO processar(String apiKey, CobrancaExternaRequestDTO request) {
        Tenant tenant = tenantRepository.findByApiKey(apiKey).orElse(null);
        if (tenant == null) {
            return CobrancaExternaResponseDTO.error("API key inválida");
        }

        TenantContext.setCurrentTenant(tenant.getId());
        try {
            return processarInterno(tenant, request);
        } finally {
            TenantContext.clear();
        }
    }

    private CobrancaExternaResponseDTO processarInterno(Tenant tenant, CobrancaExternaRequestDTO request) {
        Transportador transportador = transportadorRepository.findByCnpj(request.getCnpjTransportador())
                .orElse(null);
        if (transportador == null) {
            return CobrancaExternaResponseDTO.error(
                    "Transportador não encontrado para o CNPJ: " + request.getCnpjTransportador());
        }

        Tomador tomador = tomadorRepository.findByCnpj(request.getCnpjContratante()).orElse(null);
        if (tomador == null) {
            return CobrancaExternaResponseDTO.error(
                    "Tomador não encontrado para o CNPJ: " + request.getCnpjContratante());
        }

        Cobranca cobranca = mapToCobranca(request, transportador, tomador, tenant.getId());
        Cobranca saved = cobrancaService.save(cobranca);

        try {
            Cobranca enviada = cobrancaService.enviarParaSankhya(saved.getId(), "API_EXTERNA", null);
            return CobrancaExternaResponseDTO.success(enviada.getProtocoloSankhya(), enviada.getId());
        } catch (Exception e) {
            log.error("Erro ao enviar cobrança {} ao Sankhya, realizando rollback", saved.getId(), e);
            cobrancaService.deleteById(saved.getId());
            return CobrancaExternaResponseDTO.error("Erro ao enviar ao Sankhya: " + e.getMessage());
        }
    }

    private Cobranca mapToCobranca(CobrancaExternaRequestDTO request, Transportador transportador,
            Tomador tomador, Long tenantId) {
        Cobranca cobranca = new Cobranca();
        cobranca.setTransportador(transportador);
        cobranca.setTomador(tomador);
        cobranca.setOrdemCarga(request.getOrdemCarga());
        cobranca.setTipoCobranca(request.getTipoCobranca());
        cobranca.setTipoTransporte(request.getTipoTransporte());
        cobranca.setStatus("P");
        cobranca.setTenantId(tenantId);

        List<DocumentoFiscal> docs = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        if (request.getDocFisc() != null) {
            for (CobrancaExternaRequestDTO.DocFisc d : request.getDocFisc()) {
                DocumentoFiscal doc = new DocumentoFiscal();
                doc.setNumero(d.getNumDoc());
                doc.setSerie(d.getSerieDoc());
                doc.setValor(d.getValor());
                doc.setDataEmissao(parseDate(d.getEmissao()));
                doc.setDataVencimento(parseDate(d.getVencimento()));
                doc.setBaseCalculo(d.getBaseCalculo());
                doc.setAliquota(d.getAliquota());
                doc.setValorImposto(d.getValorImposto());
                doc.setChave(d.getChave());
                doc.setTipoDoc(d.getTipoDoc());

                List<Nota> notas = new ArrayList<>();
                if (d.getNotas() != null) {
                    for (CobrancaExternaRequestDTO.Nota n : d.getNotas()) {
                        Nota nota = new Nota();
                        nota.setNumero(n.getNumero());
                        nota.setSerie(n.getSerie());
                        nota.setDataEntrega(parseDate(n.getDataEntrega()));
                        notas.add(nota);
                    }
                }
                doc.setNotas(notas);
                docs.add(doc);

                if (d.getValor() != null) {
                    valorTotal = valorTotal.add(d.getValor());
                }
            }
        }

        cobranca.setDocumentosFiscais(docs);
        cobranca.setValor(valorTotal);
        return cobranca;
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        return LocalDate.parse(dateStr, DATE_FMT);
    }
}
