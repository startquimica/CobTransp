package br.com.startquimica.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contatos")
@Getter
@Setter
public class Contato extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String telefone;

    private String cargo;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "tomador_id")
    private Tomador tomador;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "transportador_id")
    private Transportador transportador;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "tenant_direct_id")
    private Tenant tenantDirect;
}
