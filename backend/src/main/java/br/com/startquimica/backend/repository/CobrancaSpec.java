package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.Cobranca;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class CobrancaSpec {

    private CobrancaSpec() {}

    public static Specification<Cobranca> comFiltros(
            String status,
            String tipoCobranca,
            String tipoTransporte,
            String transportadorNome,
            LocalDate alteracaoDe,
            LocalDate alteracaoAte,
            LocalDate envioDe,
            LocalDate envioAte) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank()) {
                List<String> statusList = Arrays.asList(status.split(","));
                predicates.add(root.get("status").in(statusList));
            }
            if (tipoCobranca != null && !tipoCobranca.isBlank()) {
                predicates.add(cb.equal(root.get("tipoCobranca"), tipoCobranca));
            }
            if (tipoTransporte != null && !tipoTransporte.isBlank()) {
                predicates.add(cb.equal(root.get("tipoTransporte"), tipoTransporte));
            }
            if (transportadorNome != null && !transportadorNome.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.join("transportador").get("nome")),
                        "%" + transportadorNome.toLowerCase() + "%"));
            }
            if (alteracaoDe != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("dataUltimaAlteracao"),
                        alteracaoDe.atStartOfDay()));
            }
            if (alteracaoAte != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("dataUltimaAlteracao"),
                        alteracaoAte.atTime(23, 59, 59)));
            }
            if (envioDe != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("dataEnvio"),
                        (LocalDateTime) envioDe.atStartOfDay()));
            }
            if (envioAte != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("dataEnvio"),
                        envioAte.atTime(23, 59, 59)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
