package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.Transportador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransportadorRepository extends JpaRepository<Transportador, Long> {
    Optional<Transportador> findByCnpj(String cnpj);

    @Query("SELECT t.tenantId, COUNT(t) FROM Transportador t GROUP BY t.tenantId")
    List<Object[]> countGroupByTenant();
}
