package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.domain.DocumentoFiscal;
import br.com.startquimica.backend.domain.Nota;
import br.com.startquimica.backend.domain.Tomador;
import br.com.startquimica.backend.domain.Transportador;
import br.com.startquimica.backend.dto.ErroLinhaDTO;
import br.com.startquimica.backend.dto.ImportacaoArquivoResultDTO;
import br.com.startquimica.backend.importacao.ArquivoParser;
import br.com.startquimica.backend.importacao.FormatoArquivo;
import br.com.startquimica.backend.importacao.LinhaArquivo;
import br.com.startquimica.backend.repository.CobrancaRepository;
import br.com.startquimica.backend.repository.CobrancaSpec;
import br.com.startquimica.backend.repository.TomadorRepository;
import br.com.startquimica.backend.repository.TransportadorRepository;
import br.com.startquimica.backend.security.TenantContext;
import br.com.startquimica.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CobrancaService {

    private final CobrancaRepository cobrancaRepository;
    private final SankhyaService sankhyaService;
    private final LogEnvioCobrancaService logEnvioCobrancaService;
    private final TransportadorRepository transportadorRepository;
    private final TomadorRepository tomadorRepository;
    private final List<ArquivoParser> arquivoParsers;

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
        return enviarParaSankhya(id, "MANUAL", getUsuarioIdFromContext());
    }

    @Transactional
    public Cobranca enviarParaSankhya(Long id, String origem, Long usuarioId) {
        Cobranca cobranca = cobrancaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cobrança não encontrada"));

        if ("E".equals(cobranca.getStatus())) {
            throw new RuntimeException("Cobrança já foi enviada ao sistema externo");
        }
        if ("C".equals(cobranca.getStatus())) {
            throw new RuntimeException("Cobrança cancelada não pode ser enviada");
        }

        String payloadJson = sankhyaService.serializarPayload(cobranca);
        String urlDestino = sankhyaService.getServiceUrl();

        long inicio = System.currentTimeMillis();
        try {
            String protocolo = sankhyaService.enviarCobranca(cobranca);
            long tempoMs = System.currentTimeMillis() - inicio;

            logEnvioCobrancaService.registrar(
                    cobranca, payloadJson, urlDestino, origem, usuarioId,
                    true, protocolo, null, null, protocolo, tempoMs);

            cobranca.setStatus("E");
            cobranca.setDataEnvio(LocalDateTime.now());
            cobranca.setProtocoloSankhya(protocolo);

            return cobrancaRepository.save(cobranca);
        } catch (Exception e) {
            long tempoMs = System.currentTimeMillis() - inicio;

            String codigoErro = null;
            String mensagemErro = e.getMessage();
            if (mensagemErro != null && mensagemErro.startsWith("Erro HTTP ")) {
                codigoErro = mensagemErro.length() > 13
                        ? mensagemErro.substring(10, Math.min(mensagemErro.indexOf(' ', 10) > 0 ? mensagemErro.indexOf(' ', 10) : 13, mensagemErro.length()))
                        : mensagemErro.substring(10);
            }

            logEnvioCobrancaService.registrar(
                    cobranca, payloadJson, urlDestino, origem, usuarioId,
                    false, null, codigoErro, mensagemErro, null, tempoMs);

            throw e;
        }
    }

    private Long getUsuarioIdFromContext() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
                return ((UserPrincipal) auth.getPrincipal()).getId();
            }
        } catch (Exception e) {
            log.debug("Não foi possível obter usuário do contexto de segurança", e);
        }
        return null;
    }

    @Transactional
    public void deleteById(Long id) {
        cobrancaRepository.deleteById(id);
    }

    @Transactional
    public ImportacaoArquivoResultDTO importarArquivo(
            MultipartFile file,
            FormatoArquivo formato,
            String tipoCobranca,
            String tipoTransporte,
            String tipoDocumento) throws IOException {

        ArquivoParser parser = arquivoParsers.stream()
                .filter(p -> p.getFormato() == formato)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Formato não suportado: " + formato));

        List<LinhaArquivo> linhas = parser.parse(file.getInputStream());

        if (linhas.isEmpty()) {
            return new ImportacaoArquivoResultDTO(null, List.of(
                    new ErroLinhaDTO(0, "", "", "Arquivo vazio ou sem linhas válidas")));
        }

        Long tenantId = TenantContext.getCurrentTenant();
        LinhaArquivo primeiraLinha = linhas.get(0);

        // Lookup transportador
        String cnpjTransportador = primeiraLinha.cnpjTransportador();
        Transportador transportador = transportadorRepository
                .findByTenantIdAndCnpj(tenantId, cnpjTransportador)
                .orElse(null);
        if (transportador == null) {
            return new ImportacaoArquivoResultDTO(null, List.of(
                    new ErroLinhaDTO(primeiraLinha.numeroLinha(), "", "",
                            "Transportador com CNPJ " + cnpjTransportador + " não encontrado")));
        }

        // Lookup tomador
        String cnpjTomador = primeiraLinha.cnpjTomador();
        Tomador tomador = tomadorRepository
                .findByTenantIdAndCnpj(tenantId, cnpjTomador)
                .orElse(null);
        if (tomador == null) {
            return new ImportacaoArquivoResultDTO(null, List.of(
                    new ErroLinhaDTO(primeiraLinha.numeroLinha(), cnpjTomador, "",
                            "Tomador com CNPJ " + cnpjTomador + " não encontrado")));
        }

        // Agrupar por (ctrc + serie), preservando ordem de inserção
        Map<String, List<LinhaArquivo>> grupos = new LinkedHashMap<>();
        for (LinhaArquivo linha : linhas) {
            String chaveGrupo = linha.ctrc() + "|" + linha.serie();
            grupos.computeIfAbsent(chaveGrupo, k -> new ArrayList<>()).add(linha);
        }

        // Construir documentos fiscais
        List<DocumentoFiscal> documentos = new ArrayList<>();
        BigDecimal valorTotal = BigDecimal.ZERO;

        for (List<LinhaArquivo> grupo : grupos.values()) {
            LinhaArquivo primeira = grupo.get(0);

            DocumentoFiscal doc = new DocumentoFiscal();
            try {
                doc.setNumero(Long.parseLong(primeira.ctrc()));
            } catch (NumberFormatException e) {
                doc.setNumero(0L);
            }
            doc.setSerie(primeira.serie());
            doc.setValor(primeira.valor() != null ? primeira.valor() : BigDecimal.ZERO);
            doc.setDataEmissao(primeira.dataEmissao());
            doc.setDataVencimento(primeira.dataVencimento());
            doc.setBaseCalculo(primeira.baseCalculoIcms());
            doc.setAliquota(primeira.aliquotaIcms());
            doc.setValorImposto(primeira.valorIcms());
            doc.setChave(primeira.chaveCte());
            doc.setTipoDoc(tipoDocumento);

            List<Nota> notas = new ArrayList<>();
            for (LinhaArquivo linhaGrupo : grupo) {
                Nota nota = new Nota();
                try {
                    nota.setNumero(Long.parseLong(linhaGrupo.nrNf()));
                } catch (NumberFormatException e) {
                    nota.setNumero(0L);
                }
                nota.setSerie(linhaGrupo.serieNf());
                nota.setDataEntrega(linhaGrupo.dataEntrega());
                notas.add(nota);
            }
            doc.setNotas(notas);
            documentos.add(doc);

            valorTotal = valorTotal.add(doc.getValor());
        }

        // Construir ordem de carga
        Long ordemCarga = null;
        try {
            ordemCarga = Long.parseLong(primeiraLinha.ordemCarga());
        } catch (NumberFormatException ignored) {
        }

        Cobranca cobranca = new Cobranca();
        cobranca.setTransportador(transportador);
        cobranca.setTomador(tomador);
        cobranca.setOrdemCarga(ordemCarga);
        cobranca.setTipoCobranca(tipoCobranca);
        cobranca.setTipoTransporte(tipoTransporte);
        cobranca.setValor(valorTotal);
        cobranca.setStatus("R");
        cobranca.setDocumentosFiscais(documentos);

        Cobranca salva = this.save(cobranca);
        return new ImportacaoArquivoResultDTO(salva.getId(), List.of());
    }
}

