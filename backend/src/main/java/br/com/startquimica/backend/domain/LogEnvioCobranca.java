package br.com.startquimica.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_envio_cobranca", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cobranca_id", "hash_registro"})
})
@Getter
@Setter
public class LogEnvioCobranca extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cobranca_id", nullable = false)
    private Cobranca cobranca;

    @Column(name = "data_tentativa", nullable = false)
    private LocalDateTime dataTentativa;

    @Column(nullable = false)
    private boolean sucesso;

    @Column(name = "protocolo_sankhya")
    private String protocoloSankhya;

    @Column(name = "codigo_erro", length = 50)
    private String codigoErro;

    @Column(name = "mensagem_erro", columnDefinition = "TEXT")
    private String mensagemErro;

    @Column(name = "payload_enviado", nullable = false, columnDefinition = "TEXT")
    private String payloadEnviado;

    @Column(name = "resposta_recebida", columnDefinition = "TEXT")
    private String respostaRecebida;

    @Column(name = "url_destino", length = 500)
    private String urlDestino;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 20)
    private String origem;

    @Column(name = "tempo_resposta_ms")
    private Long tempoRespostaMs;

    @Column(name = "hash_registro", nullable = false, length = 64)
    private String hashRegistro;

    /**
     * Calcula SHA-256 a partir de: sucesso, codigoErro, mensagemErro,
     * payloadEnviado, respostaRecebida, urlDestino, origem, cobrancaId.
     */
    public String calcularHash() {
        String input = String.valueOf(sucesso)
                + "|" + (codigoErro != null ? codigoErro : "")
                + "|" + (mensagemErro != null ? mensagemErro : "")
                + "|" + (payloadEnviado != null ? payloadEnviado : "")
                + "|" + (respostaRecebida != null ? respostaRecebida : "")
                + "|" + (urlDestino != null ? urlDestino : "")
                + "|" + (origem != null ? origem : "")
                + "|" + (cobranca != null ? cobranca.getId() : "");

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 não disponível", e);
        }
    }
}
