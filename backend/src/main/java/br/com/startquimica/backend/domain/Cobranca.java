package br.com.startquimica.backend.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cobrancas")
@Getter
@Setter
public class Cobranca extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transportador_id", nullable = false)
    private Transportador transportador;

    @ManyToOne
    @JoinColumn(name = "tomador_id", nullable = false)
    private Tomador tomador;

    @Column(name = "ordem_carga")
    private Long ordemCarga;

    @Column(name = "tipo_cobranca")
    private String tipoCobranca;

    @Column(name = "tipo_transporte")
    private String tipoTransporte;

    private BigDecimal valor;

    private String status;

    @OneToMany(mappedBy = "cobranca", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentoFiscal> documentosFiscais = new ArrayList<>();

    @Column(name = "data_envio")
    private LocalDateTime dataEnvio;

    @Column(name = "protocolo_sankhya")
    private String protocoloSankhya;

    @Column(name = "data_ultima_alteracao")
    private LocalDateTime dataUltimaAlteracao;

    @PrePersist
    @PreUpdate
    private void atualizarDataUltimaAlteracao() {
        this.dataUltimaAlteracao = LocalDateTime.now();
    }
}
