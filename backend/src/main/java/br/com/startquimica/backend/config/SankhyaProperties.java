package br.com.startquimica.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "sankhya")
@Getter
@Setter
public class SankhyaProperties {

    /** URL de login do Sankhya (MobileLoginSP) */
    private String loginUrl = "http://n-ti-daniel2:8080/mge/service.sbr?serviceName=MobileLoginSP.login&counter=1";

    /** URL base do serviço Sankhya para integração de documentos de transporte (sem mgeSession) */
    private String serviceUrl = "http://n-ti-daniel2:8080/startquimica/service.sbr?serviceName=ImportacaoEDIFreteSP.integrarDocTransp&outputType=json";

    /** Habilita autenticação via sessão Sankhya (login + mgeSession) */
    private boolean authEnabled = true;

    private String username;
    private String password;

    /** Timeout de conexão em milissegundos */
    private int connectTimeoutMs = 10_000;

    /** Timeout de leitura em milissegundos */
    private int readTimeoutMs = 60_000;
}
