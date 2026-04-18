package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.LogEnvioCobranca;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface LogEnvioCobrancaRepository
        extends JpaRepository<LogEnvioCobranca, Long>, JpaSpecificationExecutor<LogEnvioCobranca> {

    List<LogEnvioCobranca> findByCobrancaIdOrderByDataTentativaDesc(Long cobrancaId);

    Page<LogEnvioCobranca> findByCobrancaId(Long cobrancaId, Pageable pageable);

    Optional<LogEnvioCobranca> findByCobrancaIdAndHashRegistro(Long cobrancaId, String hashRegistro);
}
