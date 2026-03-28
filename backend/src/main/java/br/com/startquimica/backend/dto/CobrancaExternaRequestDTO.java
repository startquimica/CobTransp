package br.com.startquimica.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class CobrancaExternaRequestDTO {

    private String cnpjTransportador;
    private String cnpjContratante;
    private Long ordemCarga;
    private String tipoTransporte;
    private String tipoCobranca;
    private List<DocFisc> docFisc;

    @Getter
    @Setter
    public static class DocFisc {
        private Long numDoc;
        private String serieDoc;
        private BigDecimal valor;
        private String emissao;
        private String vencimento;
        private BigDecimal baseCalculo;
        private BigDecimal aliquota;
        private BigDecimal valorImposto;
        private String chave;
        private String TipoDoc;
        private List<Nota> notas;
    }

    @Getter
    @Setter
    public static class Nota {
        private Long numero;
        private String serie;
        private String dataEntrega;
    }
}
