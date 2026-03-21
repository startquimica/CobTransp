package br.com.startquimica.backend.repository;

import br.com.startquimica.backend.domain.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    @Query("SELECT u.tenantId, COUNT(u) FROM Usuario u WHERE u.tenantId IS NOT NULL GROUP BY u.tenantId")
    List<Object[]> countGroupByTenant();
}
