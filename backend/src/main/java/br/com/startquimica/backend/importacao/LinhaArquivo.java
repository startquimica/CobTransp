package br.com.startquimica.backend.importacao;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LinhaArquivo(
        int numeroLinha,
        String cnpjTransportador,
        String ctrc,
        String serie,
        LocalDate dataEmissao,
        LocalDate dataVencimento,
        BigDecimal valor,
        BigDecimal baseCalculoIcms,
        BigDecimal aliquotaIcms,
        BigDecimal valorIcms,
        String chaveCte,
        String cnpjTomador,
        String nrNf,
        String serieNf,
        LocalDate dataEntrega,
        String ordemCarga) {
}
