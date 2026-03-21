package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.dto.CobrancaResumoDTO;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CobrancaRepository extends JpaRepository<Cobranca, Long>, JpaSpecificationExecutor<Cobranca> {

    /** Carrega cobrança com documentos fiscais e notas em uma única query (evita lazy-load issues) */
    @Query("SELECT c FROM Cobranca c " +
           "LEFT JOIN FETCH c.documentosFiscais d " +
           "LEFT JOIN FETCH d.notas " +
           "WHERE c.id = :id")
    Optional<Cobranca> findByIdComDocumentos(@Param("id") Long id);

    // --- Dashboard: admin (sem filtro de tenant) ---
    @Query("SELECT c.tenantId, COUNT(c) FROM Cobranca c GROUP BY c.tenantId")
    List<Object[]> countGroupByTenant();

    @Query("SELECT c.tenantId, COALESCE(SUM(c.valor), 0) FROM Cobranca c GROUP BY c.tenantId")
    List<Object[]> sumValorGroupByTenant();

    // --- Dashboard: tenant (filtro Hibernate aplicado automaticamente) ---
    @Query("SELECT c.status, COUNT(c) FROM Cobranca c GROUP BY c.status")
    List<Object[]> countByStatusGrouped();

    @Query("SELECT c.tipoCobranca, COUNT(c) FROM Cobranca c GROUP BY c.tipoCobranca")
    List<Object[]> countByTipoGrouped();

    @Query("SELECT COALESCE(SUM(c.valor), 0) FROM Cobranca c WHERE c.status = :status")
    BigDecimal sumValorByStatus(@Param("status") String status);

    @Query("SELECT new br.com.startquimica.backend.dto.CobrancaResumoDTO(" +
           "c.id, c.transportador.nome, c.tomador.nome, c.tipoCobranca, c.valor, c.status, c.dataUltimaAlteracao) " +
           "FROM Cobranca c ORDER BY c.id DESC")
    List<CobrancaResumoDTO> findTopForDashboard(Pageable pageable);
}
