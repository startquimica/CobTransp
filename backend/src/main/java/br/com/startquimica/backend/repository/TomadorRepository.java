package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.Tomador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TomadorRepository extends JpaRepository<Tomador, Long> {
    Optional<Tomador> findByCnpj(String cnpj);

    Optional<Tomador> findByTenantIdAndCnpj(Long tenantId, String cnpj);

    @Query("SELECT t.tenantId, COUNT(t) FROM Tomador t GROUP BY t.tenantId")
    List<Object[]> countGroupByTenant();
}
