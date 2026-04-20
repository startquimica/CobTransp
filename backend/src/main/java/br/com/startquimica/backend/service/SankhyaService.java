package br.com.startquimica.backend.service;

import br.com.startquimica.backend.config.SankhyaProperties;
import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.domain.DocumentoFiscal;
import br.com.startquimica.backend.domain.Nota;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SankhyaService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Pattern JSESSIONID_PATTERN =
            Pattern.compile("<jsessionid>([^<]+)</jsessionid>", Pattern.CASE_INSENSITIVE);

    private final SankhyaProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SankhyaService(SankhyaProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(properties.getConnectTimeoutMs());
        factory.setReadTimeout(properties.getReadTimeoutMs());
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Realiza login no Sankhya e envia os documentos fiscais da cobrança via
     * ImportacaoEDIFreteSP.integrarDocTransp.
     *
     * @return protocolo retornado pelo Sankhya
     */
    public String enviarCobranca(Cobranca cobranca) {
        log.info("Iniciando envio da cobrança ID {} ao Sankhya", cobranca.getId());

        String serviceUrl = properties.getServiceUrl();

        if (properties.isAuthEnabled()) {
            String jsessionid = login();
            serviceUrl = serviceUrl + "&mgeSession=" + jsessionid;
        }

        Map<String, Object> data = buildPayload(cobranca);
        log.debug("Payload Sankhya cobrança {}: {}", cobranca.getId(), data);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("serviceName", "ImportacaoEDIFreteSP.integrarDocTransp");
        payload.put("requestBody", data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    serviceUrl,
                    HttpMethod.POST,
                    httpEntity,
                    new ParameterizedTypeReference<>() {
                    });

            return extractProtocolo(response.getBody(), cobranca.getId());

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Erro HTTP ao enviar cobrança {}: {} | {}",
                    cobranca.getId(), e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    "Erro HTTP " + e.getStatusCode() + " ao enviar para o Sankhya: " + e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Erro de conexão ao enviar cobrança {}: {}", cobranca.getId(), e.getMessage());
            throw new RuntimeException(
                    "Não foi possível conectar ao servidor Sankhya: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Login
    // -------------------------------------------------------------------------

    private String login() {
        String loginXml = "<serviceRequest serviceName=\"MobileLoginSP.login\">"
                + "<requestBody>"
                + "<NOMUSU>" + properties.getUsername() + "</NOMUSU>"
                + "<INTERNO>" + properties.getPassword() + "</INTERNO>"
                + "</requestBody>"
                + "</serviceRequest>";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_XML);
        HttpEntity<String> httpEntity = new HttpEntity<>(loginXml, headers);

        log.info("Realizando login no Sankhya: {}", properties.getLoginUrl());
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    properties.getLoginUrl(),
                    HttpMethod.POST,
                    httpEntity,
                    String.class);

            String body = response.getBody();
            if (body == null) {
                throw new RuntimeException("Login no Sankhya retornou resposta vazia");
            }

            Matcher matcher = JSESSIONID_PATTERN.matcher(body);
            if (!matcher.find()) {
                log.error("Login Sankhya falhou — jsessionid não encontrado. Resposta: {}", body);
                throw new RuntimeException("Login no Sankhya falhou: jsessionid não encontrado na resposta");
            }

            log.info("Login Sankhya realizado com sucesso");
            return matcher.group(1);

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("Erro HTTP no login Sankhya: {} | {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Erro HTTP " + e.getStatusCode() + " no login do Sankhya");
        } catch (ResourceAccessException e) {
            log.error("Erro de conexão no login Sankhya: {}", e.getMessage());
            throw new RuntimeException("Não foi possível conectar ao Sankhya para login: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------------------
    // Montagem do payload
    // -------------------------------------------------------------------------

    /**
     * Retorna a URL do serviço Sankhya (sem mgeSession).
     */
    public String getServiceUrl() {
        return properties.getServiceUrl();
    }

    /**
     * Serializa o payload da cobrança para JSON (para fins de log).
     */
    public String serializarPayload(Cobranca cobranca) {
        Map<String, Object> data = buildPayload(cobranca);
        Map<String, Object> fullPayload = new LinkedHashMap<>();
        fullPayload.put("serviceName", "ImportacaoEDIFreteSP.integrarDocTransp");
        fullPayload.put("requestBody", data);
        try {
            return objectMapper.writeValueAsString(fullPayload);
        } catch (JsonProcessingException e) {
            return fullPayload.toString();
        }
    }

    Map<String, Object> buildPayload(Cobranca cobranca) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("cnpjTransportador", cobranca.getTransportador() != null ? cobranca.getTransportador().getCnpj() : "");
        payload.put("cnpjContratante",   cobranca.getTomador()       != null ? cobranca.getTomador().getCnpj()       : "");
        payload.put("ordemCarga",        cobranca.getOrdemCarga());
        payload.put("tipoTransporte",    cobranca.getTipoTransporte() != null ? cobranca.getTipoTransporte() : "");
        payload.put("tipoCobranca",      cobranca.getTipoCobranca()   != null ? cobranca.getTipoCobranca()   : "");
        payload.put("docFisc",           cobranca.getDocumentosFiscais().stream()
                .map(this::buildDocFisc)
                .collect(Collectors.toList()));
        return payload;
    }

    private Map<String, Object> buildDocFisc(DocumentoFiscal doc) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("numDoc",       doc.getNumero());
        m.put("serieDoc",     doc.getSerie()          != null ? doc.getSerie()                              : "");
        m.put("valor",        doc.getValor());
        m.put("emissao",      doc.getDataEmissao()    != null ? doc.getDataEmissao().format(DATE_FMT)    : "");
        m.put("vencimento",   doc.getDataVencimento() != null ? doc.getDataVencimento().format(DATE_FMT) : "");
        m.put("baseCalculo",  doc.getBaseCalculo()    != null ? doc.getBaseCalculo()                       : 0);
        m.put("aliquota",     doc.getAliquota()       != null ? doc.getAliquota()                          : 0);
        m.put("valorImposto", doc.getValorImposto()   != null ? doc.getValorImposto()                      : 0);
        m.put("chave",        doc.getChave()          != null ? doc.getChave()                             : "");
        m.put("TipoDoc",      doc.getTipoDoc()        != null ? doc.getTipoDoc()                           : "");
        m.put("notas",        buildNotas(doc));
        return m;
    }

    private List<Map<String, Object>> buildNotas(DocumentoFiscal doc) {
        if (doc.getNotas() == null || doc.getNotas().isEmpty()) {
            return new ArrayList<>();
        }
        return doc.getNotas().stream().map(this::buildNota).collect(Collectors.toList());
    }

    private Map<String, Object> buildNota(Nota nota) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("numero",      nota.getNumero());
        m.put("serie",       nota.getSerie()       != null ? nota.getSerie()                           : "");
        m.put("dataEntrega", nota.getDataEntrega() != null ? nota.getDataEntrega().format(DATE_FMT) : "");
        return m;
    }

    // -------------------------------------------------------------------------
    // Parse da resposta
    // -------------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private String extractProtocolo(Map<String, Object> response, Long cobrancaId) {
        if (response == null) {
            log.error("Sankhya retornou resposta nula para cobrança {}", cobrancaId);
            throw new RuntimeException("Sankhya retornou resposta vazia");
        }

        Map<String, Object> responseBody = (Map<String, Object>) response.get("responseBody");
        if (responseBody == null) {
            log.error("Sankhya retornou resposta sem responseBody para cobrança {}: {}", cobrancaId, response);
            throw new RuntimeException("Sankhya retornou resposta sem responseBody");
        }

        String codigo = String.valueOf(responseBody.getOrDefault("codigo", ""));
        if (!"200".equals(codigo)) {
            Object mensagem = responseBody.get("mensagem");
            log.error("Sankhya retornou erro para cobrança {}: codigo={} responseBody={}",
                    cobrancaId, codigo, responseBody);
            throw new RuntimeException("Sankhya retornou erro: "
                    + (mensagem != null ? mensagem : "codigo=" + codigo));
        }

        log.info("Cobrança {} integrada com sucesso no Sankhya", cobrancaId);

        Object protocolo = responseBody.get("protocolo");
        return protocolo != null ? String.valueOf(protocolo) : codigo;
    }
}
