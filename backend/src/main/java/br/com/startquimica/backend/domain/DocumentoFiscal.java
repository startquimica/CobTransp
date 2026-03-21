package br.com.startquimica.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documentos_fiscais")
@Getter
@Setter
public class DocumentoFiscal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "cobranca_id", nullable = false)
    private Cobranca cobranca;

    private Long numero;

    private String serie;

    private BigDecimal valor;

    @Column(name = "data_emissao")
    private LocalDate dataEmissao;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Column(name = "base_calculo")
    private BigDecimal baseCalculo;

    private BigDecimal aliquota;

    @Column(name = "valor_imposto")
    private BigDecimal valorImposto;

    private String chave;

    @Column(name = "tipo_doc")
    private String tipoDoc;

    @OneToMany(mappedBy = "documentoFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Nota> notas = new ArrayList<>();
}
